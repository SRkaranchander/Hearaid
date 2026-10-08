import React, { useRef, useState, useEffect, useCallback } from 'react';

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
const RECOGNIZE_EVERY_MS = 200;// continuous recognition throttle
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

  const sanitizeExamples = (list) => {
    if (!Array.isArray(list)) return [];
    const banned = ['fuck', 'fuck off', 'f**k', 'bitch', 'shit'];
    return list.filter(item => {
      const l = ((item && item.label) || '').toLowerCase().trim();
      return l && !banned.some(b => l.includes(b));
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

  const updateExamples = useCallback((newExamples) => {
    setExamples(newExamples);
    localStorage.setItem('signbridge_examples', JSON.stringify(newExamples));
  }, []);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

  const addLog = useCallback((direction, text) => {
    setLogEntries((prev) => [
      {
        id: Date.now() + Math.random(),
        direction,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 19),
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
    (label) => {
      const now = Date.now();
      if (label === lastSpokenRef.current.label && now - lastSpokenRef.current.time < 2500) {
        return;
      }
      lastSpokenRef.current = { label, time: now };
      speak(label);
      addLog('sign', label);
    },
    [speak, addLog]
  );

  const drawAllHands = useCallback((allLandmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!allLandmarks || allLandmarks.length === 0) return;

    const colors = [
      { bone: 'rgba(56, 189, 248, 0.75)', joint: '#38BDF8' },
      { bone: 'rgba(244, 114, 182, 0.75)', joint: '#F472B6' },
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
        if (recognizingRef.current && now - lastRecognizeAtRef.current >= RECOGNIZE_EVERY_MS) {
          lastRecognizeAtRef.current = now;
          const recent = rollingBufferRef.current.filter((f) => now - f.t <= CLIP_DURATION_MS);
          if (recent.length >= MIN_FRAMES_REQUIRED) {
            const clip = resampleClip(recent.map((f) => f.vec));
            if (clip) {
              const label = classifyClip(clip);
              setRecognizedOutput(label || '…');
              if (label) handleRecognized(label);
            }
          }
        }
      } else {
        drawAllHands([]);
        rollingBufferRef.current = [];
      }
    } catch (err) {
      console.warn('Predict error:', err);
    }

    animFrameRef.current = requestAnimationFrame(predictLoop);
  }, [drawAllHands, classifyClip, handleRecognized, updateHandsBadge]);

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
            numHands: 2,
          });
        } catch (gpuErr) {
          console.warn('GPU fallback to CPU:', gpuErr);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath, delegate: 'CPU' },
            runningMode: 'VIDEO',
            numHands: 2,
          });
        }

        if (!isMounted) return;
        handLandmarkerRef.current = landmarker;

        setModelStatus('Starting camera…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
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
          setModelStatus('Setup failed — check console & camera permissions');
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

  useEffect(() => {
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionImpl) {
      const recognition = new SpeechRecognitionImpl();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

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
  }, [addLog]);

  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (listening) {
      speechRecognitionRef.current.stop();
    } else {
      setCaptionText('');
      speechRecognitionRef.current.start();
    }
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
          alert('No hands detected during that recording — make sure your hand(s) are clearly in frame, then try again.');
          return;
        }
        pendingClipRef.current = resampleClip(recordedFramesRef.current);
        setShowReview(true);
      };

      if (recorderSupported && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

  return (
    <div className="live-sign-container" style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '60px' }}>
      <style>{`
        .live-sign-app {
          max-width: 720px;
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
        }
        .live-sign-header h1 {
          margin: 0 0 4px;
          font-family: Georgia, serif;
          font-size: 28px;
          font-weight: bold;
        }
        .live-sign-header .tagline {
          margin: 0 0 12px;
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
        }
        .panel h2 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #ffffff);
        }
        .hint {
          font-size: 13px;
          color: var(--text-secondary, #94a3b8);
          margin: 0 0 14px;
          line-height: 1.4;
        }
        .camera-wrap {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 4/3;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin: 0 auto 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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
          background: var(--accent-cyan, #1C7293);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
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
        .record-row {
          margin-bottom: 14px;
          text-align: left;
        }
        .live-btn.recording {
          background: #C0392B !important;
        }
        .rec-dot {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(192,57,43,0.9);
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
        .review-panel h3 {
          margin: 0 0 10px;
          font-size: 15px;
          font-weight: 600;
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
        .toggle-row {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .output-text {
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border-light, rgba(255,255,255,0.1));
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 16px;
          min-height: 44px;
          flex: 1;
          min-width: 180px;
          color: var(--text-primary, #ffffff);
          display: flex;
          align-items: center;
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
          padding: 8px 10px;
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
        .live-footer {
          text-align: center;
          font-size: 11px;
          color: var(--text-secondary, #94a3b8);
          padding: 20px;
        }
      `}</style>

      <main className="live-sign-app">
        {/* Header Banner */}
        <header className="live-sign-header">
          <h1>HearAid Live Sign</h1>
          <p className="tagline">Real-time dual-hand tracking &amp; AI sign interpreter.</p>
          <div id="statusBar">
            <span id="modelStatus" className="pill">
              {modelStatus}
            </span>
          </div>
        </header>

        {/* 1. Train a sign & 2. Recognize live */}
        <section className="panel">
          <h2>1. Train a sign</h2>
          <p className="hint">
            Press "Record," perform the sign using <strong>one or both hands</strong> in front of the camera (~1.5 seconds — moving signs like "Help", "Thank you", or two-handed signs are supported), then review the clip before saving it. Repeat ~5-10 times per sign.
          </p>

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

          <div className="record-row">
            <button
              id="recordBtn"
              className={`live-btn ${isRecording ? 'recording' : ''}`}
              onClick={startRecording}
              disabled={isRecording}
            >
              ● Record gesture (1.5s)
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
                  placeholder="e.g. Hello, Thank you, Help…"
                  value={signLabel}
                  onChange={(e) => setSignLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveExample()}
                  autoFocus
                />
                <button id="saveExampleBtn" className="live-btn" onClick={handleSaveExample}>
                  Save example
                </button>
                <button id="discardBtn" className="live-btn secondary" onClick={handleDiscardExample}>
                  Discard &amp; retry
                </button>
              </div>
            </div>
          )}

          {/* Trained chips */}
          <div id="trainedList" className="chip-row align-items-center">
            {Object.keys(trainedCounts).length === 0 ? (
              <span className="hint">No signs trained yet.</span>
            ) : (
              Object.entries(trainedCounts).map(([label, n]) => (
                <span
                  key={label}
                  className="chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px'
                  }}
                >
                  <span>{label} · {n}</span>
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
                      padding: 0,
                      lineHeight: 1
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
                  >
                    ✕
                  </button>
                </span>
              ))
            )}
          </div>

          <h2>2. Recognize live</h2>
          <div className="toggle-row">
            <button
              id="recognizeBtn"
              className="live-btn"
              onClick={() => {
                const next = !recognizing;
                recognizingRef.current = next;
                setRecognizing(next);
                if (!next) setRecognizedOutput('—');
              }}
            >
              {recognizing ? 'Stop recognizing' : 'Start recognizing'}
            </button>
            <span id="recognizedOutput" className="output-text">
              {recognizing ? recognizedOutput : '—'}
            </span>
          </div>
        </section>

        {/* 3. Hearing person speaks */}
        <section className="panel">
          <h2>3. Hearing person speaks</h2>
          <p className="hint">Live speech-to-text captions appear here for the deaf/mute person to read.</p>
          <button
            id="micBtn"
            className={`live-btn ${listening ? 'listening' : ''}`}
            onClick={toggleSpeechRecognition}
          >
            {listening ? '🎤 Listening…' : '🎤 Start listening'}
          </button>
          <div id="captionBox" className="output-text">
            {captionText}
          </div>
        </section>

        {/* Conversation log */}
        <section className="panel log-panel">
          <h2>Conversation log</h2>
          <div id="logList" className="log-list">
            {logEntries.length === 0 ? (
              <p className="hint">No exchanges yet.</p>
            ) : (
              logEntries.map((e) => (
                <div key={e.id} className="log-item">
                  <span className="log-tag">{e.direction === 'sign' ? 'SIGN→SPEECH' : 'SPEECH→TEXT'}</span>
                  <span>{e.text}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <footer className="live-footer">
          <p>HearAid · AI Sign Interpreter · Runs entirely in your browser — on-device dual-hand tracking &amp; speech synthesis.</p>
        </footer>
      </main>
    </div>
  );
}
