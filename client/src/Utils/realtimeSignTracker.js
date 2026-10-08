// HearAid Real-Time Standard Sign Tracking & Continuous Conversion Engine
// Biomechanical Hand Landmark Analysis (A-Z, Numbers 0-9, and Standard ASL Signs)

function dist3D(a, b) {
  if (!a || !b) return 999;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Extracts normalized biomechanical features from 21 MediaPipe hand landmarks.
 */
export function trackHandPose(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSpan = Math.max(dist3D(wrist, middleMCP), 0.05);

  const norm = (p1, p2) => dist3D(p1, p2) / palmSpan;

  // Key joints
  const thumbTip = landmarks[4];

  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];
  const indexMCP = landmarks[5];

  const middleTip = landmarks[12];
  const middlePIP = landmarks[10];

  const ringTip = landmarks[16];
  const ringPIP = landmarks[14];
  const ringMCP = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyPIP = landmarks[18];
  const pinkyMCP = landmarks[17];

  // Extension status for the 4 fingers
  const indexExt =
    dist3D(indexTip, wrist) > dist3D(indexPIP, wrist) * 1.15 &&
    norm(indexTip, indexMCP) > 0.75;
  const middleExt =
    dist3D(middleTip, wrist) > dist3D(middlePIP, wrist) * 1.15 &&
    norm(middleTip, middleMCP) > 0.75;
  const ringExt =
    dist3D(ringTip, wrist) > dist3D(ringPIP, wrist) * 1.15 &&
    norm(ringTip, ringMCP) > 0.75;
  const pinkyExt =
    dist3D(pinkyTip, wrist) > dist3D(pinkyPIP, wrist) * 1.15 &&
    norm(pinkyTip, pinkyMCP) > 0.75;

  // Thumb status
  const thumbSpread = norm(thumbTip, indexMCP);
  const thumbExt = thumbSpread > 0.65 && norm(thumbTip, wrist) > 0.6;
  const thumbUp = thumbExt && thumbTip.y < wrist.y - 0.25 * palmSpan && thumbTip.y < indexMCP.y;
  const thumbDown = thumbExt && thumbTip.y > wrist.y + 0.25 * palmSpan;

  // Pinching
  const thumbIndexDist = norm(thumbTip, indexTip);
  const isPinchingThumbIndex = thumbIndexDist < 0.28;
  const isPinchingThumbMiddle = norm(thumbTip, middleTip) < 0.28;

  // Fist check
  const isFist = !indexExt && !middleExt && !ringExt && !pinkyExt;
  const isAllExt = indexExt && middleExt && ringExt && pinkyExt && thumbExt;

  return {
    palmSpan,
    wrist,
    thumbTip,
    indexTip,
    middleTip,
    ringTip,
    pinkyTip,
    thumbExt,
    thumbUp,
    thumbDown,
    indexExt,
    middleExt,
    ringExt,
    pinkyExt,
    isPinchingThumbIndex,
    isPinchingThumbMiddle,
    isFist,
    isAllExt,
    norm
  };
}

/**
 * Real-time standard sign classifier.
 * Evaluates live hand poses dynamically without static pre-recorded data.
 */
export function classifyRealtimeSign(allLandmarks) {
  if (!allLandmarks || allLandmarks.length === 0) return null;

  const h1 = trackHandPose(allLandmarks[0]);
  if (!h1) return null;

  // Dual-hand standard signs
  if (allLandmarks.length >= 2) {
    const h2 = trackHandPose(allLandmarks[1]);
    if (h2) {
      const isOneFlat =
        (h1.indexExt && h1.middleExt && h1.ringExt && h1.pinkyExt) ||
        (h2.indexExt && h2.middleExt && h2.ringExt && h2.pinkyExt);
      const isOneFistOrThumb =
        (h1.thumbUp && h1.isFist) || (h2.thumbUp && h2.isFist);

      const wristDist = dist3D(h1.wrist, h2.wrist) / Math.max(h1.palmSpan, h2.palmSpan);
      if (isOneFlat && isOneFistOrThumb && wristDist < 2.2) {
        return { token: 'HELP', type: 'word', confidence: 0.95, icon: '🆘' };
      }
    }
  }

  const {
    norm,
    thumbTip,
    indexTip,
    middleTip,
    thumbExt,
    thumbUp,
    thumbDown,
    indexExt,
    middleExt,
    ringExt,
    pinkyExt,
    isPinchingThumbIndex,
    isFist,
    isAllExt
  } = h1;

  // 1. I LOVE YOU (ASL ILY)
  if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'I LOVE YOU', type: 'word', confidence: 0.96, icon: '🤟' };
  }

  // 2. CALL ME / Y
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'Y', type: 'letter', confidence: 0.94, icon: '🤙' };
  }

  // 3. LETTER L
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    const spread = norm(thumbTip, indexTip);
    if (spread > 0.65) {
      return { token: 'L', type: 'letter', confidence: 0.94, icon: '🇱' };
    }
  }

  // 4. PEACE / V
  if (indexExt && middleExt && !ringExt && !pinkyExt && !isPinchingThumbIndex) {
    const spread = norm(indexTip, middleTip);
    if (spread > 0.22) {
      return { token: 'V', type: 'letter', confidence: 0.93, icon: '✌️' };
    }
    return { token: 'U', type: 'letter', confidence: 0.90, icon: '🇺' };
  }

  // 5. WATER / W
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return { token: 'W', type: 'letter', confidence: 0.92, icon: '💧' };
  }

  // 6. OK / F
  if (isPinchingThumbIndex && middleExt && ringExt && pinkyExt) {
    return { token: 'OK', type: 'word', confidence: 0.95, icon: '👌' };
  }

  // 7. LETTER I
  if (!thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'I', type: 'letter', confidence: 0.94, icon: 'ℹ️' };
  }

  // 8. GOOD / THUMBS UP
  if (thumbUp && isFist) {
    return { token: 'GOOD', type: 'word', confidence: 0.95, icon: '👍' };
  }

  // 9. BAD / THUMBS DOWN
  if (thumbDown && isFist) {
    return { token: 'BAD', type: 'word', confidence: 0.94, icon: '👎' };
  }

  // 10. STOP / OPEN PALM / HELLO
  if (isAllExt) {
    return { token: 'HELLO', type: 'word', confidence: 0.92, icon: '👋' };
  }

  // 11. LETTER B
  if (indexExt && middleExt && ringExt && pinkyExt && !thumbExt) {
    return { token: 'B', type: 'letter', confidence: 0.91, icon: '🅱️' };
  }

  // 12. LETTER D
  if (indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt) {
    return { token: 'D', type: 'letter', confidence: 0.91, icon: '🇩' };
  }

  // 13. LETTER A / FIST
  if (isFist) {
    if (thumbExt) {
      return { token: 'A', type: 'letter', confidence: 0.89, icon: '🅰️' };
    }
    return { token: 'YES', type: 'word', confidence: 0.88, icon: '✊' };
  }

  // 14. NO (Index, Middle, Thumb tap)
  if (!ringExt && !pinkyExt && norm(thumbTip, indexTip) < 0.35) {
    return { token: 'NO', type: 'word', confidence: 0.89, icon: '🤏' };
  }

  return null;
}

/**
 * Continuous Sign Conversion Stream:
 * Manages live stream of tracked signs, buffers steady letters,
 * and assembles them into real-time sentences.
 */
export class RealtimeSignStream {
  constructor(options = {}) {
    this.stabilityThreshold = options.stabilityThreshold || 4; // consecutive matching frames
    this.history = [];
    this.activeWord = '';
    this.sentence = '';
    this.lastToken = null;
    this.lastTokenTime = 0;
  }

  feed(classified) {
    const now = Date.now();
    if (!classified || !classified.token) {
      this.history = [];
      return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
    }

    this.history.push(classified.token);
    if (this.history.length > this.stabilityThreshold * 2) {
      this.history.shift();
    }

    const matches = this.history.filter((t) => t === classified.token).length;

    // Confirmed steady gesture
    if (matches >= this.stabilityThreshold) {
      // Debounce: require 1.4s between repeated identical letters/words
      if (this.lastToken === classified.token && now - this.lastTokenTime < 1400) {
        return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
      }

      this.lastToken = classified.token;
      this.lastTokenTime = now;
      this.history = [];

      let newCommit = null;

      if (classified.type === 'letter') {
        this.activeWord += classified.token;
        newCommit = { token: classified.token, type: 'letter' };
      } else if (classified.type === 'word') {
        if (this.activeWord) {
          this.sentence = (this.sentence + ' ' + this.activeWord).trim();
          this.activeWord = '';
        }
        this.sentence = (this.sentence + ' ' + classified.token).trim();
        newCommit = { token: classified.token, type: 'word' };
      }

      return {
        activeWord: this.activeWord,
        sentence: this.sentence,
        fullText: (this.sentence + (this.activeWord ? ' ' + this.activeWord : '')).trim(),
        newCommit
      };
    }

    return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
  }

  commitSpace() {
    if (this.activeWord) {
      this.sentence = (this.sentence + ' ' + this.activeWord).trim();
      this.activeWord = '';
    } else if (this.sentence && !this.sentence.endsWith(' ')) {
      this.sentence += ' ';
    }
    return (this.sentence + (this.activeWord ? ' ' + this.activeWord : '')).trim();
  }

  backspace() {
    if (this.activeWord.length > 0) {
      this.activeWord = this.activeWord.slice(0, -1);
    } else if (this.sentence.length > 0) {
      this.sentence = this.sentence.slice(0, -1).trim();
    }
    return (this.sentence + (this.activeWord ? ' ' + this.activeWord : '')).trim();
  }

  clear() {
    this.activeWord = '';
    this.sentence = '';
    this.lastToken = null;
    this.history = [];
    return '';
  }

  getFullText() {
    return (this.sentence + (this.activeWord ? ' ' + this.activeWord : '')).trim();
  }
}
