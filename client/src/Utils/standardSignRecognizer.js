// HearAid Standard Sign Language Recognition Engine
// Landmark-geometric classifier for ASL Alphabet & Universal Communication Signs

export const STANDARD_SIGN_CATALOG = [
  {
    id: 'hello',
    label: 'Hello',
    category: 'Greetings',
    icon: '👋',
    hands: '1 Hand',
    description: 'Open hand upright with all fingers extended, greeting the camera.'
  },
  {
    id: 'thank_you',
    label: 'Thank you',
    category: 'Polite',
    icon: '🙏',
    hands: '1 Hand',
    description: 'Flat open hand moving outward from the chin/chest.'
  },
  {
    id: 'yes',
    label: 'Yes',
    category: 'Response',
    icon: '✊',
    hands: '1 Hand',
    description: 'Closed fist with firm hand, simulating a nod.'
  },
  {
    id: 'no',
    label: 'No',
    category: 'Response',
    icon: '🤏',
    hands: '1 Hand',
    description: 'Index and middle finger touching thumb in a snap.'
  },
  {
    id: 'help',
    label: 'Help',
    category: 'Emergency',
    icon: '🆘',
    hands: '1 or 2 Hands',
    description: 'Thumbs up hand resting on flat open palm, or raised thumbs up.'
  },
  {
    id: 'please',
    label: 'Please',
    category: 'Polite',
    icon: '🤲',
    hands: '1 Hand',
    description: 'Flat open palm held in front of chest.'
  },
  {
    id: 'i_love_you',
    label: 'I love you',
    category: 'Expressions',
    icon: '🤟',
    hands: '1 Hand',
    description: 'ASL ILY sign: Thumb, Index, and Pinky extended, Middle & Ring folded.'
  },
  {
    id: 'peace',
    label: 'Peace',
    category: 'Expressions',
    icon: '✌️',
    hands: '1 Hand',
    description: 'Index and Middle fingers extended in a V-shape.'
  },
  {
    id: 'good',
    label: 'Good',
    category: 'Feedback',
    icon: '👍',
    hands: '1 Hand',
    description: 'Thumbs up with all 4 fingers closed into a fist.'
  },
  {
    id: 'bad',
    label: 'Bad',
    category: 'Feedback',
    icon: '👎',
    hands: '1 Hand',
    description: 'Thumbs down with all 4 fingers closed into a fist.'
  },
  {
    id: 'ok',
    label: 'OK',
    category: 'Response',
    icon: '👌',
    hands: '1 Hand',
    description: 'Thumb and Index fingertips touching to form a ring, other 3 extended.'
  },
  {
    id: 'stop',
    label: 'Stop',
    category: 'Alerts',
    icon: '✋',
    hands: '1 Hand',
    description: 'Open flat hand facing forward in a halt gesture.'
  },
  {
    id: 'call_me',
    label: 'Call me',
    category: 'Expressions',
    icon: '🤙',
    hands: '1 Hand',
    description: 'Thumb and Pinky extended, middle three fingers folded.'
  },
  {
    id: 'water',
    label: 'Water',
    category: 'Daily Needs',
    icon: '💧',
    hands: '1 Hand',
    description: 'ASL "W" sign: Index, Middle, and Ring extended upright, Thumb holding Pinky.'
  },
  {
    id: 'sign_l',
    label: 'Letter L',
    category: 'ASL Alphabet',
    icon: '🇱',
    hands: '1 Hand',
    description: 'Index finger straight up and Thumb out at 90 degrees forming an L.'
  },
  {
    id: 'sign_b',
    label: 'Letter B',
    category: 'ASL Alphabet',
    icon: '🅱️',
    hands: '1 Hand',
    description: 'Four fingers upright together, thumb tucked across palm.'
  },
  {
    id: 'sign_i',
    label: 'Letter I',
    category: 'ASL Alphabet',
    icon: 'ℹ️',
    hands: '1 Hand',
    description: 'Pinky finger extended upright, all other fingers closed in a fist.'
  },
  {
    id: 'sign_a',
    label: 'Letter A',
    category: 'ASL Alphabet',
    icon: '🅰️',
    hands: '1 Hand',
    description: 'Closed fist with thumb resting alongside the index finger.'
  }
];

function dist3D(a, b) {
  if (!a || !b) return 999;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Analyzes finger postures on a single hand landmark set (21 points)
 * Normalizes all measurements relative to palm span (Wrist -> Middle MCP)
 * to ensure complete distance invariance.
 */
export function analyzeHandPosture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSize = Math.max(dist3D(wrist, middleMCP), 0.05);

  const norm = (p1, p2) => dist3D(p1, p2) / palmSize;

  // Finger Joint References:
  // Thumb: 1, 2, 3, 4
  // Index: 5 (MCP), 6 (PIP), 7 (DIP), 8 (TIP)
  // Middle: 9, 10, 11, 12
  // Ring: 13, 14, 15, 16
  // Pinky: 17, 18, 19, 20

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const indexMCP = landmarks[5];
  const middleMCPPt = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  const indexPIP = landmarks[6];
  const middlePIP = landmarks[10];
  const ringPIP = landmarks[14];
  const pinkyPIP = landmarks[18];

  // Extension status for the 4 fingers
  const isIndexExt =
    dist3D(indexTip, wrist) > dist3D(indexPIP, wrist) * 1.15 &&
    norm(indexTip, indexMCP) > 0.75;
  const isMiddleExt =
    dist3D(middleTip, wrist) > dist3D(middlePIP, wrist) * 1.15 &&
    norm(middleTip, middleMCPPt) > 0.75;
  const isRingExt =
    dist3D(ringTip, wrist) > dist3D(ringPIP, wrist) * 1.15 &&
    norm(ringTip, ringMCP) > 0.75;
  const isPinkyExt =
    dist3D(pinkyTip, wrist) > dist3D(pinkyPIP, wrist) * 1.15 &&
    norm(pinkyTip, pinkyMCP) > 0.75;

  // Thumb status
  const thumbSpread = norm(thumbTip, indexMCP);
  const isThumbExt = thumbSpread > 0.65 && norm(thumbTip, wrist) > 0.6;
  const isThumbUp = isThumbExt && thumbTip.y < wrist.y - 0.25 * palmSize && thumbTip.y < indexMCP.y;
  const isThumbDown = isThumbExt && thumbTip.y > wrist.y + 0.25 * palmSize;

  // Pinching
  const thumbIndexDist = norm(thumbTip, indexTip);
  const isThumbIndexPinching = thumbIndexDist < 0.28;

  // All fingers curled (fist)
  const isFist = !isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt;

  // Hand orientation
  const isHandUpright = middleTip.y < wrist.y;

  return {
    palmSize,
    isThumbExt,
    isThumbUp,
    isThumbDown,
    isIndexExt,
    isMiddleExt,
    isRingExt,
    isPinkyExt,
    isThumbIndexPinching,
    isFist,
    isHandUpright,
    thumbSpread,
    thumbIndexDist,
    thumbTip,
    indexTip,
    middleTip,
    ringTip,
    pinkyTip,
    wrist,
    norm
  };
}

/**
 * Recognizes standard sign gestures from detected hand landmarks.
 * Supports both single-hand and dual-hand gestures.
 */
export function recognizeStandardSign(allLandmarks) {
  if (!allLandmarks || allLandmarks.length === 0) return null;

  const h1 = analyzeHandPosture(allLandmarks[0]);
  if (!h1) return null;

  // Dual-hand recognition
  if (allLandmarks.length >= 2) {
    const h2 = analyzeHandPosture(allLandmarks[1]);
    if (h2) {
      // HELP sign (dual hand):
      // One hand is a flat palm facing upwards, the other is a thumbs-up or fist resting on top
      const isOneFlat =
        (h1.isIndexExt && h1.isMiddleExt && h1.isRingExt && h1.isPinkyExt && !h1.isThumbUp) ||
        (h2.isIndexExt && h2.isMiddleExt && h2.isRingExt && h2.isPinkyExt && !h2.isThumbUp);
      const isOneThumbsUp =
        (h1.isThumbUp && h1.isFist) || (h2.isThumbUp && h2.isFist);

      const wristDist = dist3D(h1.wrist, h2.wrist) / Math.max(h1.palmSize, h2.palmSize);
      if (isOneFlat && isOneThumbsUp && wristDist < 2.2) {
        return { sign: 'Help', confidence: 0.94, icon: '🆘' };
      }
    }
  }

  // Single-hand recognition logic:
  const {
    isThumbExt,
    isThumbUp,
    isThumbDown,
    isIndexExt,
    isMiddleExt,
    isRingExt,
    isPinkyExt,
    isThumbIndexPinching,
    isFist,
    isHandUpright,
    norm,
    thumbTip,
    indexTip,
    middleTip,
    pinkyTip
  } = h1;

  // 1. "I Love You" (ILY) Sign: Thumb, Index, Pinky extended; Middle and Ring curled
  if (isThumbExt && isIndexExt && !isMiddleExt && !isRingExt && isPinkyExt) {
    return { sign: 'I love you', confidence: 0.96, icon: '🤟' };
  }

  // 2. "Call Me" Sign: Thumb and Pinky extended; Index, Middle, Ring curled
  if (isThumbExt && !isIndexExt && !isMiddleExt && !isRingExt && isPinkyExt) {
    return { sign: 'Call me', confidence: 0.93, icon: '🤙' };
  }

  // 3. "Letter L": Thumb and Index extended at ~90 deg; Middle, Ring, Pinky curled
  if (isThumbExt && isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt) {
    const spread = norm(thumbTip, indexTip);
    if (spread > 0.65) {
      return { sign: 'Letter L', confidence: 0.92, icon: '🇱' };
    }
  }

  // 4. "Peace" / "Letter V": Index and Middle extended in V; Ring and Pinky curled
  if (isIndexExt && isMiddleExt && !isRingExt && !isPinkyExt && !isThumbIndexPinching) {
    const tipSpread = norm(indexTip, middleTip);
    if (tipSpread > 0.22) {
      return { sign: 'Peace', confidence: 0.94, icon: '✌️' };
    }
    return { sign: 'Peace', confidence: 0.88, icon: '✌️' };
  }

  // 5. "Water" / ASL 'W': Index, Middle, and Ring extended upright, Pinky curled & thumb touching pinky
  if (isIndexExt && isMiddleExt && isRingExt && !isPinkyExt) {
    return { sign: 'Water', confidence: 0.91, icon: '💧' };
  }

  // 6. "OK" Sign: Thumb & Index fingertips touching; Middle, Ring, Pinky extended
  if (isThumbIndexPinching && isMiddleExt && isRingExt && isPinkyExt) {
    return { sign: 'OK', confidence: 0.95, icon: '👌' };
  }

  // 7. "Letter I": Pinky extended upright, all other 4 fingers curled into fist
  if (!isThumbExt && !isIndexExt && !isMiddleExt && !isRingExt && isPinkyExt) {
    return { sign: 'Letter I', confidence: 0.93, icon: 'ℹ️' };
  }

  // 8. "Good" / Thumbs Up: Thumb pointing upward, other 4 fingers curled
  if (isThumbUp && isFist) {
    return { sign: 'Good', confidence: 0.95, icon: '👍' };
  }

  // 9. "Bad" / Thumbs Down: Thumb pointing downward, other 4 fingers curled
  if (isThumbDown && isFist) {
    return { sign: 'Bad', confidence: 0.93, icon: '👎' };
  }

  // 10. "Letter B": 4 fingers straight up together, thumb folded across palm
  if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt && !isThumbExt) {
    const tipsSpan = norm(indexTip, pinkyTip);
    if (tipsSpan < 0.75) {
      return { sign: 'Letter B', confidence: 0.90, icon: '🅱️' };
    }
  }

  // 11. "Stop" / Open Hand: All 5 fingers extended upright
  if (isThumbExt && isIndexExt && isMiddleExt && isRingExt && isPinkyExt && isHandUpright) {
    return { sign: 'Stop', confidence: 0.94, icon: '✋' };
  }

  // 12. "No" Sign: Index, Middle, and Thumb fingertips pinched close together
  if (
    !isRingExt &&
    !isPinkyExt &&
    norm(thumbTip, indexTip) < 0.35 &&
    norm(thumbTip, middleTip) < 0.35
  ) {
    return { sign: 'No', confidence: 0.89, icon: '🤏' };
  }

  // 13. "Yes" / Fist: All fingers closed tight into fist held upright
  if (isFist && !isThumbUp && !isThumbDown && isHandUpright) {
    return { sign: 'Yes', confidence: 0.88, icon: '✊' };
  }

  // 14. "Letter A": Fist with thumb upright against side of index
  if (isFist && isThumbExt && thumbTip.y <= h1.wrist.y) {
    return { sign: 'Letter A', confidence: 0.87, icon: '🅰️' };
  }

  return null;
}

/**
 * Temporal smoothing filter:
 * Demands consistency across consecutive frames before firing a recognition event
 * to prevent frame-to-frame jitter.
 */
export class SignTemporalFilter {
  constructor(thresholdCount = 3) {
    this.thresholdCount = thresholdCount;
    this.history = [];
    this.lastEmitted = null;
    this.lastEmittedTime = 0;
  }

  process(recognized) {
    const now = Date.now();
    if (!recognized || !recognized.sign) {
      this.history = [];
      return null;
    }

    this.history.push(recognized.sign);
    if (this.history.length > this.thresholdCount * 2) {
      this.history.shift();
    }

    const count = this.history.filter((s) => s === recognized.sign).length;

    if (count >= this.thresholdCount) {
      // Avoid immediate spam repetition within 2 seconds for identical gesture
      if (this.lastEmitted === recognized.sign && now - this.lastEmittedTime < 2200) {
        return null;
      }
      this.lastEmitted = recognized.sign;
      this.lastEmittedTime = now;
      return recognized;
    }

    return null;
  }

  reset() {
    this.history = [];
    this.lastEmitted = null;
    this.lastEmittedTime = 0;
  }
}
