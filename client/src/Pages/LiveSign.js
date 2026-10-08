import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  STANDARD_SIGN_CATALOG,
  SignTemporalFilter,
  ALPHABETS_LIST
} from '../Utils/standardSignRecognizer';
import {
  classifyRealtimeSign,
  RealtimeSignStream
} from '../Utils/realtimeSignTracker';
import {
  SUPPORTED_LANGUAGES,
  translateWithGoogle,
  speakInLanguage
} from '../Utils/googleTranslator';

// ---------- Hand Skeleton Connections ----------
const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm Base connections
  [5, 9], [9, 13], [13, 17]
];

// ---------- Motion clip settings ----------
const CLIP_DURATION_MS = 1200; // 1.2s window of motion for gesture matching
const CLIP_FRAMES = 8;         // resampled keyframes per clip
const MIN_FRAMES_REQUIRED = 3; // guard against empty clips
const RECOGNIZE_EVERY_MS = 180;// continuous recognition throttle
const VECTOR_SIZE = 136;       // 66 (hand 1) + 66 (hand 2) + 4 (inter-hand relation)
const RECORD_MS_TRAINING = 1500;
const THRESHOLD = 1.15;

function singleHandFeature(landmarks) {
  if (!landmarks || landmarks.length === 0) {
    return new Array(66).fill(0);
  }
  const wrist = landmarks[0];
  const vec = [1.0];
  for (const p of landmarks) {
    vec.push(p.x - wrist.x, p.y - wrist.y, p.z - wrist.z);
  }
  vec.push(wrist.x, wrist.y);
  return vec;
}

function extractDualHandFeature(allLandmarks, handednesses) {
  let leftLandmarks = null;
  let rightLandmarks = null;

  if (allLandmarks && allLandmarks.length > 0) {
    if (allLandmarks.length === 1) {
      const handLabel = handednesses?.[0]?.[0]?.categoryName;
      if (handLabel === 'Left') {
        leftLandmarks = allLandmarks[0];
      } else if (handLabel === 'Right') {
        rightLandmarks = allLandmarks[0];
      } else {
        if (allLandmarks[0][0].x < 0.5) {
          leftLandmarks = allLandmarks[0];
        } else {
          rightLandmarks = allLandmarks[0];
        }
      }
    } else if (allLandmarks.length >= 2) {
      const h0 = handednesses?.[0]?.[0]?.categoryName;
      const h1 = handednesses?.[1]?.[0]?.categoryName;

      if (h0 === 'Left' && h1 === 'Right') {
        leftLandmarks = allLandmarks[0];
        rightLandmarks = allLandmarks[1];
      } else if (h0 === 'Right' && h1 === 'Left') {
        leftLandmarks = allLandmarks[1];
        rightLandmarks = allLandmarks[0];
      } else {
        if (allLandmarks[0][0].x <= allLandmarks[1][0].x) {
          leftLandmarks = allLandmarks[0];
          rightLandmarks = allLandmarks[1];
        } else {
          leftLandmarks = allLandmarks[1];
          rightLandmarks = allLandmarks[0];
        }
      }
    }
  }

  const leftVec = singleHandFeature(leftLandmarks);
  const rightVec = singleHandFeature(rightLandmarks);

  let interRel = [0.0, 0.0, 0.0, 0.0];
  if (leftLandmarks && rightLandmarks) {
    const wL = leftLandmarks[0];
    const wR = rightLandmarks[0];
    interRel = [1.0, wR.x - wL.x, wR.y - wL.y, wR.z - wL.z];
  }

  return [...leftVec, ...rightVec, ...interRel];
}

function frameDistance(a, b) {
  let dist = 0;

  const aL_present = a[0] > 0.5;
  const bL_present = b[0] > 0.5;
  if (aL_present !== bL_present) {
    dist += 3.0;
  } else if (aL_present && bL_present) {
    let sumL = 0;
    for (let i = 1; i < 66; i++) {
      const diff = a[i] - b[i];
      sumL += diff * diff;
    }
    dist += Math.sqrt(sumL);
  }

  const aR_present = a[66] > 0.5;
  const bR_present = b[66] > 0.5;
  if (aR_present !== bR_present) {
    dist += 3.0;
  } else if (aR_present && bR_present) {
    let sumR = 0;
    for (let i = 67; i < 132; i++) {
      const diff = a[i] - b[i];
      sumR += diff * diff;
    }
    dist += Math.sqrt(sumR);
  }

  const aBoth = a[132] > 0.5;
  const bBoth = b[132] > 0.5;
  if (aBoth && bBoth) {
    let sumInter = 0;
    for (let i = 133; i < 136; i++) {
      const diff = a[i] - b[i];
      sumInter += diff * diff;
    }
    dist += Math.sqrt(sumInter) * 1.5;
  }

  return dist;
}

function resampleClip(rawFrames) {
  if (!rawFrames || rawFrames.length === 0) return null;
  if (rawFrames.length === 1) return Array(CLIP_FRAMES).fill(rawFrames[0]);
  const out = [];
  for (let i = 0; i < CLIP_FRAMES; i++) {
    const idx = Math.round((i * (rawFrames.length - 1)) / (CLIP_FRAMES - 1));
    out.push(rawFrames[idx]);
  }
  return out;
}

function clipDistance(clipA, clipB) {
  let sum = 0;
  for (let i = 0; i < CLIP_FRAMES; i++) {
    sum += frameDistance(clipA[i], clipB[i]);
  }
  return sum / CLIP_FRAMES;
}

export default function LiveSign() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const reviewVideoRef = useRef(null);

  const [modelStatus, setModelStatus] = useState('Loading hand model…');
  const [handsBadgeText, setHandsBadgeText] = useState('No hands detected');
  const [handsBadgeClass, setHandsBadgeClass] = useState('hands-badge');

  // ---------- Recognition Mode & Multilingual Settings ----------
  const [recognitionMode, setRecognitionMode] = useState('hybrid'); // 'hybrid' | 'standard' | 'personalized'
  const recognitionModeRef = useRef('hybrid');
  useEffect(() => {
    recognitionModeRef.current = recognitionMode;
  }, [recognitionMode]);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('hearaid_lang') || 'en-US';
  });
  const selectedLanguageRef = useRef(selectedLanguage);
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
    localStorage.setItem('hearaid_lang', selectedLanguage);
  }, [selectedLanguage]);

  const [speechRate, setSpeechRate] = useState(0.95);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideCategory, setGuideCategory] = useState('All');
  const [guideSearch, setGuideSearch] = useState('');

  const sanitizeExamples = (list) => {
    if (!Array.isArray(list)) return [];
    const banned = ['fuck', 'fuck off', 'f**k', 'bitch', 'shit'];
    return list.filter((item) => {
      const l = ((item && item.label) || '').toLowerCase().trim();
      return l && !banned.some((b) => l.includes(b));
    });
  };

  const [examples, setExamples] = useState(() => {
    try {
      const saved = localStorage.getItem('signbridge_examples');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          Array.isArray(parsed[0].frames) &&
          Array.isArray(parsed[0].frames[0]) &&
          parsed[0].frames[0].length === VECTOR_SIZE
        ) {
          const cleaned = sanitizeExamples(parsed);
          localStorage.setItem('signbridge_examples', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) {
      console.warn('Examples load warning:', e);
    }
    return [];
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recTimer, setRecTimer] = useState('1.5s');
  const [showReview, setShowReview] = useState(false);
  const [reviewVideoURL, setReviewVideoURL] = useState(null);
  const [signLabel, setSignLabel] = useState('');
  const pendingClipRef = useRef(null);

  const [recognizing, setRecognizing] = useState(false);
  const [recognizedOutput, setRecognizedOutput] = useState('—');
  const [translatedOutput, setTranslatedOutput] = useState(null);

  // Real-time live sign continuous stream state
  const [liveTrackingToken, setLiveTrackingToken] = useState('—');
  const [liveAssembledSentence, setLiveAssembledSentence] = useState('');
  const [liveTranslatedSentence, setLiveTranslatedSentence] = useState('');
  const [isLiveTranslating, setIsLiveTranslating] = useState(false);
  const [streamMode, setStreamMode] = useState('spelling'); // 'spelling' (letters only) | 'all'
  const streamRef = useRef(new RealtimeSignStream({ stabilityThreshold: 5, mode: 'spelling' }));
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.setMode(streamMode);
    }
  }, [streamMode]);

  const [listening, setListening] = useState(false);
  const [captionText, setCaptionText] = useState('Transcript will appear here…');
  const [logEntries, setLogEntries] = useState([]);

  const handLandmarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const rollingBufferRef = useRef([]);
  const recordedFramesRef = useRef([]);
  const recordedChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const lastRecognizeAtRef = useRef(0);
  const lastSpokenRef = useRef({ label: null, time: 0 });
  const speechRecognitionRef = useRef(null);

  // Temporal debouncer for standard signs
  const standardFilterRef = useRef(new SignTemporalFilter(3));

  const updateExamples = useCallback((newExamples) => {
    setExamples(newExamples);
    localStorage.setItem('signbridge_examples', JSON.stringify(newExamples));
  }, []);

  const addLog = useCallback((direction, text) => {
    setLogEntries((prev) => [
      {
        id: Date.now() + Math.random(),
        direction,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev.slice(0, 19)
    ]);
  }, []);

  const classifyClip = useCallback(
    (clip) => {
      if (!clip || examples.length === 0) return null;
      let best = null;
      let bestDist = Infinity;
      for (const ex of examples) {
        const d = clipDistance(clip, ex.frames);
        if (d < bestDist) {
          bestDist = d;
          best = ex.label;
        }
      }
      return bestDist <= THRESHOLD ? best : null;
    },
    [examples]
  );

  const handleRecognized = useCallback(
    async (label, icon = '✋', source = 'Standard') => {
      const now = Date.now();
      const isSameLabel = label === lastSpokenRef.current.label;
      const minGap = isSameLabel ? 1800 : 450;
      if (now - lastSpokenRef.current.time < minGap) {
        return;
      }
      lastSpokenRef.current = { label, time: now };

      const currentLang = selectedLanguageRef.current;
      const langObj =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

      setRecognizedOutput(`${icon} ${label}`);

      // Translate in real time using Google Translator
      const phraseToTranslate = label.length === 1 ? `Letter ${label}` : label;
      const translated = await translateWithGoogle(phraseToTranslate, currentLang, 'en');
      setTranslatedOutput({
        original: label,
        translated,
        icon,
        source,
        flag: langObj.flag,
        langName: langObj.name
      });

      // Speak in multilingual voice
      if (!speechMuted) {
        speakInLanguage(translated, currentLang, { rate: speechRate });
      }

      addLog(
        'sign',
        `${icon} ${label} → [${langObj.flag} ${langObj.name}] "${translated}" (${source})`
      );
    },
    [speechMuted, speechRate, addLog]
  );

  const handleLiveTranslation = useCallback(
    async (englishText) => {
      if (!englishText || !englishText.trim()) return;
      const clean = englishText.trim();
      const currentLang = selectedLanguageRef.current;
      const langObj =
        SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

      setIsLiveTranslating(true);
      let translated = clean;
      if (currentLang !== 'en') {
        translated = await translateWithGoogle(clean, currentLang, 'en');
      }
      setIsLiveTranslating(false);

      setLiveTranslatedSentence(translated);

      if (!speechMuted) {
        speakInLanguage(translated, currentLang, { rate: speechRate });
      }

      addLog(
        'sign',
        `Live Stream: "${clean}" → [${langObj.flag} ${langObj.name}] "${translated}"`
      );
    },
    [speechMuted, speechRate, addLog]
  );

  const handleSpace = () => {
    const updated = streamRef.current.commitSpace();
    setLiveAssembledSentence(updated);
    if (updated) handleLiveTranslation(updated);
  };

  const handleBackspace = () => {
    const updated = streamRef.current.backspace();
    setLiveAssembledSentence(updated);
    if (updated) handleLiveTranslation(updated);
  };

  const handleClearStream = () => {
    streamRef.current.clear();
    setLiveAssembledSentence('');
    setLiveTranslatedSentence('');
    setLiveTrackingToken('—');
  };

  const handleSpeakCurrent = () => {
    if (liveTranslatedSentence) {
      speakInLanguage(liveTranslatedSentence, selectedLanguage, { rate: speechRate });
    } else if (liveAssembledSentence) {
      handleLiveTranslation(liveAssembledSentence);
    }
  };

  const drawAllHands = useCallback((allLandmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!allLandmarks || allLandmarks.length === 0) return;

    const colors = [
      { bone: 'rgba(56, 189, 248, 0.75)', joint: '#38BDF8' },
      { bone: 'rgba(244, 114, 182, 0.75)', joint: '#F472B6' }
    ];

    allLandmarks.forEach((landmarks, handIdx) => {
      const color = colors[handIdx % colors.length];

      ctx.lineWidth = 3;
      ctx.strokeStyle = color.bone;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const p1 = landmarks[startIdx];
        const p2 = landmarks[endIdx];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      }

      for (const p of landmarks) {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = color.joint;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    });
  }, []);

  const updateHandsBadge = useCallback((count) => {
    if (count === 0) {
      setHandsBadgeText('No hands detected');
      setHandsBadgeClass('hands-badge');
    } else if (count === 1) {
      setHandsBadgeText('✋ 1 hand detected');
      setHandsBadgeClass('hands-badge active');
    } else {
      setHandsBadgeText('👐 2 hands detected');
      setHandsBadgeClass('hands-badge active dual');
    }
  }, []);

  const isRecordingRef = useRef(false);
  const recognizingRef = useRef(false);

  const predictLoop = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(predictLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const now = performance.now();
    try {
      const result = handLandmarkerRef.current.detectForVideo(video, now);
      const detectedHands = result?.landmarks || [];
      updateHandsBadge(detectedHands.length);

      if (detectedHands.length > 0) {
        drawAllHands(detectedHands);

        const featureVec = extractDualHandFeature(detectedHands, result.handednesses);
        rollingBufferRef.current.push({ t: now, vec: featureVec });
        const cutoff = now - (CLIP_DURATION_MS + 300);
        rollingBufferRef.current = rollingBufferRef.current.filter((f) => f.t >= cutoff);

        // Capture frame if recording is active
        if (isRecordingRef.current) {
          recordedFramesRef.current.push(featureVec);
        }

        // Live classification if recognizing is active
        if (recognizingRef.current) {
          const currentMode = recognitionModeRef.current;

          // 1. Standard Real-Time Sign Tracking & Conversion Stream
          if (currentMode === 'standard' || currentMode === 'hybrid') {
            const realtimeMatch = classifyRealtimeSign(detectedHands);
            if (realtimeMatch) {
              const liveDisplay = `${realtimeMatch.icon || '✋'} ${realtimeMatch.token}`;
              setLiveTrackingToken(liveDisplay);
              const streamRes = streamRef.current.feed(realtimeMatch);
              if (streamRes.newCommit) {
                setRecognizedOutput(`${streamRes.newCommit.icon || '✋'} ${streamRes.newCommit.token}`);
                handleRecognized(
                  streamRes.newCommit.token,
                  streamRes.newCommit.icon || '✋',
                  streamRes.newCommit.type === 'letter' ? 'Alphabet' : 'Standard Sign'
                );

                const fullText = streamRef.current.getFullText();
                setLiveAssembledSentence(fullText);
                if (streamRes.newCommit.type === 'word' || fullText.length >= 3) {
                  handleLiveTranslation(fullText);
                }
              }
            } else {
              setLiveTrackingToken('—');
            }
          }

          // 2. Personalized Sign Recognition (Trained motion clip classifier)
          if (
            (currentMode === 'personalized' || currentMode === 'hybrid') &&
            now - lastRecognizeAtRef.current >= RECOGNIZE_EVERY_MS
          ) {
            lastRecognizeAtRef.current = now;
            const recent = rollingBufferRef.current.filter((f) => now - f.t <= CLIP_DURATION_MS);
            if (recent.length >= MIN_FRAMES_REQUIRED) {
              const clip = resampleClip(recent.map((f) => f.vec));
              if (clip) {
                const label = classifyClip(clip);
                if (label) {
                  handleRecognized(label, '🎯', 'Custom Trained');
                }
              }
            }
          }
        }
      } else {
        drawAllHands([]);
        rollingBufferRef.current = [];
        standardFilterRef.current.reset();
      }
    } catch (err) {
      console.warn('Predict error:', err);
    }

    animFrameRef.current = requestAnimationFrame(predictLoop);
  }, [drawAllHands, classifyClip, handleRecognized, handleLiveTranslation, updateHandsBadge]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setModelStatus('Loading hand model…');
        const mod = await import(
          /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs'
        );
        const { HandLandmarker, FilesetResolver } = mod;

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );
        const modelAssetPath =
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

        let landmarker = null;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numHands: 2
          });
        } catch (gpuErr) {
          console.warn('GPU fallback to CPU:', gpuErr);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 2
          });
        }

        if (!isMounted) return;
        handLandmarkerRef.current = landmarker;

        setModelStatus('Starting camera…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        });

        if (!isMounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) {
              videoRef.current.play();
              setModelStatus('Ready — camera + dual-hand model loaded');
              predictLoop();
            }
          };
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setModelStatus('Setup failed — check camera permissions');
        }
      }
    }

    init();

    const currentVideo = videoRef.current;
    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (currentVideo && currentVideo.srcObject) {
        currentVideo.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [predictLoop]);

  // Hearing person speech recognition setup
  useEffect(() => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionImpl) {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setCaptionText(text);
      };

      recognition.onend = () => {
        setListening(false);
        setCaptionText((finalText) => {
          if (finalText && finalText !== 'Transcript will appear here…' && finalText.trim()) {
            addLog('speech', finalText.trim());
          }
          return finalText;
        });
      };

      recognition.onerror = (e) => {
        setCaptionText('Mic error: ' + e.error);
        setListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [selectedLanguage, addLog]);

  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (listening) {
      speechRecognitionRef.current.stop();
    } else {
      setCaptionText('');
      speechRecognitionRef.current.lang = selectedLanguage;
      speechRecognitionRef.current.start();
    }
  };

  const testCurrentVoice = async () => {
    speakInLanguage('Hello, thank you for using HearAid', selectedLanguage, {
      rate: speechRate
    });
  };

  const startRecording = () => {
    if (isRecordingRef.current || !videoRef.current || !videoRef.current.srcObject) return;
    isRecordingRef.current = true;
    setIsRecording(true);
    recordedFramesRef.current = [];
    recordedChunksRef.current = [];

    let remaining = RECORD_MS_TRAINING;
    setRecTimer((remaining / 1000).toFixed(1) + 's');
    const countdownInterval = setInterval(() => {
      remaining -= 100;
      setRecTimer(Math.max(remaining, 0) / 1000 + 's');
    }, 100);

    let recorderSupported = 'MediaRecorder' in window;
    if (recorderSupported) {
      try {
        let options = {};
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          options = { mimeType: 'video/webm;codecs=vp8' };
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          options = { mimeType: 'video/webm' };
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options = { mimeType: 'video/mp4' };
        }
        const recorder = new MediaRecorder(videoRef.current.srcObject, options);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.start(50);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder unavailable:', err);
        recorderSupported = false;
      }
    }

    setTimeout(() => {
      clearInterval(countdownInterval);
      isRecordingRef.current = false;
      setIsRecording(false);

      const finish = () => {
        if (recordedFramesRef.current.length < MIN_FRAMES_REQUIRED) {
          alert(
            'No hands detected during that recording — make sure your hand(s) are clearly in frame, then try again.'
          );
          return;
        }
        pendingClipRef.current = resampleClip(recordedFramesRef.current);
        setShowReview(true);
      };

      if (
        recorderSupported &&
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setReviewVideoURL(url);
          finish();
        };
        mediaRecorderRef.current.stop();
      } else {
        finish();
      }
    }, RECORD_MS_TRAINING);
  };

  const handleSaveExample = () => {
    const label = signLabel.trim();
    if (!label) {
      alert('Type what this sign means before saving.');
      return;
    }
    if (!pendingClipRef.current) return;

    const updated = [...examples, { label, frames: pendingClipRef.current }];
    updateExamples(updated);

    setShowReview(false);
    setSignLabel('');
    pendingClipRef.current = null;
    if (reviewVideoURL) {
      URL.revokeObjectURL(reviewVideoURL);
      setReviewVideoURL(null);
    }
  };

  const handleDiscardExample = () => {
    setShowReview(false);
    setSignLabel('');
    pendingClipRef.current = null;
    if (reviewVideoURL) {
      URL.revokeObjectURL(reviewVideoURL);
      setReviewVideoURL(null);
    }
  };

  const handleDeleteSign = (labelToDelete) => {
    const filtered = examples.filter((ex) => ex.label !== labelToDelete);
    updateExamples(filtered);
  };

  const trainedCounts = examples.reduce((acc, curr) => {
    acc[curr.label] = (acc[curr.label] || 0) + 1;
    return acc;
  }, {});

  // Guide filtering
  const filteredCatalog = STANDARD_SIGN_CATALOG.filter((item) => {
    const matchesCat = guideCategory === 'All' || item.category === guideCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(guideSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(guideSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['All', 'Greetings', 'Emergency', 'Polite', 'Expressions', 'Feedback', 'ASL Alphabet'];

  return (
    <div
      className="live-sign-container"
      style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px' }}
    >
      <style>{`
        .live-sign-app {
          max-width: 780px;
          margin: 0 auto;
          padding: 20px 16px 60px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .live-sign-header {
          background: var(--glass-bg, #1B2450);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          border-radius: 16px;
          color: white;
          padding: 24px 20px 20px;
          margin-bottom: 5px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        }
        .live-sign-header h1 {
          margin: 0 0 4px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: -0.5px;
        }
        .live-sign-header .tagline {
          margin: 0 0 14px;
          color: var(--text-secondary, #B9C3D6);
          font-size: 14px;
        }
        .pill {
          display: inline-block;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #DCE7F5;
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 20px;
        }
        .panel {
          background: var(--glass-bg, rgba(17, 24, 39, 0.85));
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          border-radius: 14px;
          padding: 18px;
          color: var(--text-primary, #ffffff);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .panel h2 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #ffffff);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hint {
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
          margin: 0 0 14px;
          line-height: 1.45;
        }
        .camera-wrap {
          position: relative;
          width: 100%;
          max-width: 440px;
          aspect-ratio: 4/3;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin: 0 auto 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .camera-wrap video, .camera-wrap canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }
        .mode-selector-bar {
          display: flex;
          gap: 8px;
          background: rgba(0,0,0,0.25);
          padding: 6px;
          border-radius: 10px;
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .mode-btn {
          flex: 1;
          min-width: 130px;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .mode-btn.active {
          background: var(--accent-cyan, #06b6d4);
          color: #fff;
          box-shadow: 0 2px 10px rgba(6, 182, 212, 0.4);
        }
        .multilingual-bar {
          background: rgba(0,0,0,0.22);
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .lang-select {
          background: rgba(17, 24, 39, 0.9);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 13px;
          cursor: pointer;
          outline: none;
        }
        .lang-select:focus {
          border-color: var(--accent-cyan, #06b6d4);
        }
        .train-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .train-controls input {
          flex: 1;
          min-width: 160px;
          padding: 10px 12px;
          border: 1px solid var(--border-light, rgba(255,255,255,0.2));
          background: rgba(0,0,0,0.3);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
        }
        .live-btn {
          background: var(--accent-cyan, #06b6d4);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .live-btn:hover {
          filter: brightness(1.1);
        }
        .live-btn:active {
          transform: scale(0.98);
        }
        .live-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .live-btn.secondary {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary, #ffffff);
          border: 1px solid var(--border-light, rgba(255,255,255,0.15));
        }
        .live-btn.recording {
          background: #EF4444 !important;
        }
        .rec-dot {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(239, 68, 68, 0.95);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.5px;
          z-index: 2;
        }
        .hands-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(22, 32, 58, 0.85);
          color: #E0E7FF;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 6px;
          letter-spacing: 0.3px;
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          z-index: 2;
          transition: all 0.2s ease;
        }
        .hands-badge.active {
          background: rgba(12, 74, 110, 0.85);
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.4);
        }
        .hands-badge.dual {
          background: rgba(88, 28, 135, 0.85);
          color: #F472B6;
          border-color: rgba(244, 114, 182, 0.4);
        }
        .review-panel {
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .review-video {
          width: 100%;
          max-width: 320px;
          display: block;
          margin: 0 auto 14px;
          border-radius: 10px;
          background: #000;
        }
        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 18px;
        }
        .chip {
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border-light, rgba(255,255,255,0.15));
          color: var(--text-primary, #ffffff);
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 16px;
        }
        .recognition-card {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(88, 28, 135, 0.12));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          padding: 16px;
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .recognition-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #38BDF8;
        }
        .recognition-body {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .recognized-main {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          font-family: 'Space Grotesk', sans-serif;
        }
        .translated-sub {
          font-size: 18px;
          color: #A5F3FC;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .log-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }
        .log-item {
          font-size: 13px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.25);
          border-radius: 8px;
          display: flex;
          gap: 8px;
          align-items: baseline;
          border: 1px solid var(--border-light, rgba(255,255,255,0.05));
        }
        .log-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan, #38BDF8);
          white-space: nowrap;
        }
        .guide-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .guide-modal {
          background: var(--glass-bg, #111827);
          border: 1px solid var(--border-light, rgba(255,255,255,0.15));
          border-radius: 16px;
          width: 100%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          color: white;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .guide-modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .guide-modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .catalog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .catalog-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .catalog-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(6, 182, 212, 0.4);
        }
        .catalog-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .catalog-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .catalog-desc {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.4;
        }
        .live-footer {
          text-align: center;
          font-size: 12px;
          color: var(--text-secondary, #94a3b8);
          padding: 20px;
        }
      `}</style>

      <main className="live-sign-app">
        {/* Header Banner */}
        <header className="live-sign-header">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h1>HearAid Live Sign</h1>
              <p className="tagline">
                Real-time Standard &amp; Personalized Sign Recognition with Multilingual Speech
              </p>
            </div>
            <button
              className="live-btn secondary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
              onClick={() => setShowGuideModal(true)}
            >
              📖 Standard Signs Guide
            </button>
          </div>
          <div id="statusBar" className="d-flex gap-2 align-items-center flex-wrap mt-2">
            <span id="modelStatus" className="pill">
              {modelStatus}
            </span>
            <span
              className="pill"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                color: '#38bdf8'
              }}
            >
              ✨ {STANDARD_SIGN_CATALOG.length} Standard Signs Pre-Loaded
            </span>
          </div>
        </header>

        {/* Multilingual Speech & Language Bar */}
        <section className="panel">
          <h2>
            <span>🌐</span> Multilingual Speech Settings
          </h2>
          <p className="hint">
            HearAid translates detected sign language into your chosen language and speaks it aloud
            automatically using localized voice synthesis.
          </p>

          <div className="multilingual-bar">
            <div className="d-flex align-items-center gap-2">
              <label style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                Spoken Language:
              </label>
              <select
                className="lang-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label style={{ fontSize: '13px', color: '#94a3b8' }}>Speed:</label>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                style={{ width: '80px', accentColor: 'var(--accent-cyan, #06b6d4)' }}
              />
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{speechRate.toFixed(2)}x</span>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                className="live-btn secondary"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => setSpeechMuted(!speechMuted)}
              >
                {speechMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
              <button
                className="live-btn"
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={testCurrentVoice}
              >
                📢 Test Voice
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
              Sign Recognition Engine:
            </label>
            <span style={{ fontSize: '12px', color: '#38bdf8' }}>
              {recognitionMode === 'hybrid'
                ? `⚡ Hybrid: Standard (${STANDARD_SIGN_CATALOG.length}) + Custom (${examples.length})`
                : recognitionMode === 'standard'
                ? `📘 Standard ASL (${STANDARD_SIGN_CATALOG.length} signs active)`
                : `🎯 Personalized (${examples.length} signs active)`}
            </span>
          </div>

          <div className="mode-selector-bar">
            <button
              className={`mode-btn ${recognitionMode === 'hybrid' ? 'active' : ''}`}
              onClick={() => setRecognitionMode('hybrid')}
            >
              <span>⚡</span> Hybrid (Standard + Custom)
            </button>
            <button
              className={`mode-btn ${recognitionMode === 'standard' ? 'active' : ''}`}
              onClick={() => setRecognitionMode('standard')}
            >
              <span>📘</span> Standard ASL Signs
            </button>
            <button
              className={`mode-btn ${recognitionMode === 'personalized' ? 'active' : ''}`}
              onClick={() => setRecognitionMode('personalized')}
            >
              <span>🎯</span> Personalized Only
            </button>
          </div>

          {/* Live Camera Feed */}
          <div className="camera-wrap">
            <video ref={videoRef} autoPlay playsInline muted></video>
            <canvas ref={canvasRef} id="overlay"></canvas>
            {isRecording && (
              <div id="recDot" className="rec-dot">
                ● REC <span id="recTimer">{recTimer}</span>
              </div>
            )}
            <div id="handsBadge" className={handsBadgeClass}>
              {handsBadgeText}
            </div>
          </div>

          {/* Live Recognition Trigger & Output */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <button
              id="recognizeBtn"
              className="live-btn"
              style={{
                background: recognizing ? '#EF4444' : 'var(--accent-cyan, #06b6d4)',
                minWidth: '170px'
              }}
              onClick={() => {
                const next = !recognizing;
                recognizingRef.current = next;
                setRecognizing(next);
                if (!next) {
                  setRecognizedOutput('—');
                  setTranslatedOutput(null);
                  standardFilterRef.current.reset();
                }
              }}
            >
              {recognizing ? '⏹ Stop Recognition' : '▶ Start Live Recognition'}
            </button>

            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              {recognizing
                ? '🟢 Active: Hold hands in front of camera to sign'
                : '⏸ Paused: Click start to begin live interpretation'}
            </span>
          </div>

          {/* Real-time Recognition & Multilingual Translation Card */}
          {recognizing && (
            <div className="recognition-card">
              <div className="recognition-header">
                <span>
                  {translatedOutput?.source === 'Standard ASL'
                    ? '📘 Standard Sign Detected'
                    : translatedOutput?.source === 'Custom Trained'
                    ? '🎯 Personalized Sign Detected'
                    : 'Awaiting Hand Gesture…'}
                </span>
                {translatedOutput && (
                  <span>
                    Translating to {translatedOutput.flag} {translatedOutput.langName}
                  </span>
                )}
              </div>
              <div className="recognition-body">
                <div className="recognized-main">
                  {recognizedOutput !== '—' ? recognizedOutput : 'Signing in progress…'}
                </div>
                {translatedOutput && translatedOutput.translated && (
                  <div className="translated-sub">
                    <span>→</span>
                    <span>{translatedOutput.flag}</span>
                    <span style={{ textDecoration: 'underline' }}>
                      "{translatedOutput.translated}"
                    </span>
                    {!speechMuted && (
                      <span
                        style={{ fontSize: '12px', color: '#67e8f9', cursor: 'pointer' }}
                        title="Replay Voice"
                        onClick={() =>
                          speakInLanguage(
                            translatedOutput.translated || translatedOutput.original,
                            selectedLanguage,
                            { rate: speechRate }
                          )
                        }
                      >
                        🔊
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Real-time Alphabet Tracking Cheatsheet Bar */}
          {recognizing && (
            <div
              style={{
                marginTop: '12px',
                padding: '12px 14px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>
                  🔤 Live Alphabet Tracker (Single-Hand ASL &amp; Dual-Hand ISL/BSL)
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Active Pose:{' '}
                  <strong style={{ color: '#67e8f9', fontSize: '13px' }}>
                    {liveTrackingToken !== '—' ? liveTrackingToken : 'Detecting hands…'}
                  </strong>
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '5px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin'
                }}
              >
                {ALPHABETS_LIST.map((letter) => {
                  const isCurrent =
                    (liveTrackingToken && liveTrackingToken.includes(letter)) ||
                    (recognizedOutput && recognizedOutput.includes(` ${letter}`));
                  return (
                    <span
                      key={letter}
                      style={{
                        minWidth: '32px',
                        height: '32px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: isCurrent ? '700' : '500',
                        background: isCurrent ? 'rgba(6, 182, 212, 0.45)' : 'rgba(255, 255, 255, 0.05)',
                        border: isCurrent
                          ? '2px solid #38bdf8'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isCurrent ? '#ffffff' : '#94a3b8',
                        boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.65)' : 'none',
                        transform: isCurrent ? 'scale(1.15)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Sign Letter ${letter}`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Continuous Real-time Sign Tracking & Conversion Stream */}
          {recognizing && (
            <div
              style={{
                marginTop: '16px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                  ⚡ Live Dynamic Sign Tracking Stream (No Predefined Dataset)
                </span>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '2px',
                      display: 'inline-flex',
                      gap: '2px'
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        borderRadius: '16px',
                        fontSize: '11px',
                        padding: '2px 10px',
                        background: streamMode === 'spelling' ? 'var(--accent-cyan, #06b6d4)' : 'transparent',
                        color: streamMode === 'spelling' ? '#fff' : '#94a3b8',
                        border: 'none',
                        fontWeight: streamMode === 'spelling' ? 700 : 500
                      }}
                      onClick={() => setStreamMode('spelling')}
                      title="Only assemble letters & numbers into clean words, filtering out accidental whole-word signs"
                    >
                      🔤 Letter-by-Letter Only
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{
                        borderRadius: '16px',
                        fontSize: '11px',
                        padding: '2px 10px',
                        background: streamMode === 'all' ? 'var(--accent-cyan, #06b6d4)' : 'transparent',
                        color: streamMode === 'all' ? '#fff' : '#94a3b8',
                        border: 'none',
                        fontWeight: streamMode === 'all' ? 700 : 500
                      }}
                      onClick={() => setStreamMode('all')}
                      title="Include conversational words (Hello, Help, Good) along with letters"
                    >
                      💬 All Signs
                    </button>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '11px'
                    }}
                  >
                    Live Pose: {liveTrackingToken || '—'}
                  </span>
                </div>
              </div>

              {/* Real-time Accumulated Sentence Stream */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px',
                  minHeight: '48px',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#fff',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {liveAssembledSentence ? (
                  liveAssembledSentence
                ) : (
                  <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 400 }}>
                    Sign continuously in front of the camera to assemble words and sentences in
                    real time...
                  </span>
                )}
              </div>

              {/* Stream Action Controls */}
              <div className="d-flex gap-2 mt-2 flex-wrap align-items-center">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={handleSpace}
                  style={{ fontSize: '12px' }}
                >
                  ␣ Space
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleBackspace}
                  style={{ fontSize: '12px' }}
                >
                  ⌫ Backspace
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleClearStream}
                  style={{ fontSize: '12px' }}
                >
                  🗑 Clear
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-info text-dark ms-auto"
                  onClick={handleSpeakCurrent}
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  📢 Speak Translation
                </button>
              </div>

              {/* Google Translate Live Output Banner */}
              {isLiveTranslating && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#38bdf8' }}>
                  <i className="fa-solid fa-spinner fa-spin me-1" /> Live Google Translating to {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.name}...
                </div>
              )}
              {liveTranslatedSentence && selectedLanguage !== 'en' && !isLiveTranslating && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                    🌐 Google Translated Output (
                    {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.name}):
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#67e8f9' }}>
                    {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.flag} "
                    {liveTranslatedSentence}"
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Personalized Sign Training Panel */}
        <section className="panel">
          <h2>
            <span>🎯</span> Train Personalized Signs
          </h2>
          <p className="hint">
            Want to teach HearAid a custom gesture or personalized name sign? Record your hand
            movement for 1.5 seconds, label it, and review before saving.
          </p>

          <div className="record-row">
            <button
              id="recordBtn"
              className={`live-btn ${isRecording ? 'recording' : ''}`}
              onClick={startRecording}
              disabled={isRecording}
            >
              ● Record Custom Sign (1.5s)
            </button>
          </div>

          {/* Review panel: shown after recording */}
          {showReview && (
            <div id="reviewPanel" className="review-panel">
              <h3>Review your recording</h3>
              {reviewVideoURL && (
                <video
                  ref={reviewVideoRef}
                  id="reviewVideo"
                  className="review-video"
                  src={reviewVideoURL}
                  controls
                  loop
                  autoPlay
                  muted
                  playsInline
                ></video>
              )}
              <div className="train-controls">
                <input
                  id="signLabel"
                  type="text"
                  placeholder="What does this sign mean? (e.g. Grandma, My Name, Medicine)"
                  value={signLabel}
                  onChange={(e) => setSignLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveExample()}
                  autoFocus
                />
                <button id="saveExampleBtn" className="live-btn" onClick={handleSaveExample}>
                  Save Sign
                </button>
                <button
                  id="discardBtn"
                  className="live-btn secondary"
                  onClick={handleDiscardExample}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Trained chips */}
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Your Trained Signs:</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {Object.keys(trainedCounts).length} unique sign(s)
              </span>
            </div>
            <div id="trainedList" className="chip-row align-items-center">
              {Object.keys(trainedCounts).length === 0 ? (
                <span className="hint">
                  No custom signs recorded yet. Use the "Record Custom Sign" button above to add
                  personalized vocabulary!
                </span>
              ) : (
                Object.entries(trainedCounts).map(([label, n]) => (
                  <span
                    key={label}
                    className="chip"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      borderColor: 'rgba(6, 182, 212, 0.3)'
                    }}
                  >
                    <span>
                      🎯 {label} · {n} sample{n > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      title={`Delete "${label}"`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSign(label);
                      }}
                      style={{
                        background: 'rgba(239, 68, 68, 0.25)',
                        border: 'none',
                        borderRadius: '50%',
                        color: '#fca5a5',
                        width: '18px',
                        height: '18px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Hearing Person Section */}
        <section className="panel">
          <h2>
            <span>🗣️</span> Hearing Person Speaks
          </h2>
          <p className="hint">
            Live speech-to-text captions appear here for deaf/mute individuals to read in real time.
          </p>
          <div className="d-flex align-items-center gap-2 mb-3">
            <button
              id="micBtn"
              className={`live-btn ${listening ? 'recording' : ''}`}
              onClick={toggleSpeechRecognition}
            >
              {listening ? '🎤 Listening…' : '🎤 Start Listening'}
            </button>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Recognizing language: <strong>{selectedLanguage}</strong>
            </span>
          </div>
          <div
            id="captionBox"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-light, rgba(255,255,255,0.1))',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '16px',
              minHeight: '48px',
              color: '#fff'
            }}
          >
            {captionText}
          </div>
        </section>

        {/* Multilingual Conversation Log */}
        <section className="panel log-panel">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="m-0">
              <span>💬</span> Multilingual Conversation Log
            </h2>
            {logEntries.length > 0 && (
              <button
                className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                onClick={() => setLogEntries([])}
                style={{ fontSize: '12px' }}
              >
                Clear log
              </button>
            )}
          </div>
          <div id="logList" className="log-list">
            {logEntries.length === 0 ? (
              <p className="hint">No exchanges yet. Start signing or speaking to see entries.</p>
            ) : (
              logEntries.map((e) => (
                <div key={e.id} className="log-item">
                  <span
                    className="log-tag"
                    style={{
                      color: e.direction === 'sign' ? '#38BDF8' : '#34D399'
                    }}
                  >
                    {e.direction === 'sign' ? 'SIGN → SPEECH' : 'SPEECH → TEXT'}
                  </span>
                  <span style={{ flex: 1 }}>{e.text}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{e.time}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="live-footer">
          <p>
            HearAid · Multilingual AI Sign Interpreter · On-device dual-hand tracking &amp; neural
            speech synthesis.
          </p>
        </footer>
      </main>

      {/* Standard Signs Catalog / Reference Guide Modal */}
      {showGuideModal && (
        <div className="guide-modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="guide-modal-header">
              <h3 className="m-0" style={{ fontSize: '18px', fontWeight: '700' }}>
                📘 Standard Sign Language Guide ({STANDARD_SIGN_CATALOG.length} Signs)
              </h3>
              <button
                className="btn btn-link text-white p-0"
                style={{ fontSize: '20px', textDecoration: 'none' }}
                onClick={() => setShowGuideModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="guide-modal-body">
              {/* Category pills */}
              <div className="d-flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '20px',
                      background: guideCategory === cat ? 'var(--accent-cyan, #06b6d4)' : 'rgba(255,255,255,0.08)',
                      color: guideCategory === cat ? '#fff' : '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '12px'
                    }}
                    onClick={() => setGuideCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search signs by name or gesture description…"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />

              {/* Catalog Cards Grid */}
              <div className="catalog-grid">
                {filteredCatalog.map((item) => (
                  <div key={item.id} className="catalog-card">
                    <div className="catalog-card-header">
                      <span className="catalog-title">
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: '#38bdf8',
                          fontSize: '10px'
                        }}
                      >
                        {item.category} · {item.hands}
                      </span>
                    </div>
                    <p className="catalog-desc m-0">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
