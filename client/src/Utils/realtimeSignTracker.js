// HearAid Real-Time Standard Sign Tracking & Continuous Conversion Engine
// Comprehensive Landmark-Biomechanical Analysis for Alphabets (A-Z), Numbers (0-9), and Universal Signs
// Supports both Single-Handed ASL fingerspelling and Two-Handed ISL/BSL (matching HearAid avatar animations)

function dist3D(a, b) {
  if (!a || !b) return 999;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Extracts scale-invariant, translation-invariant biomechanical features
 * from 21 MediaPipe hand landmarks.
 */
export function trackHandPose(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const palmSpan = Math.max(dist3D(wrist, middleMCP), 0.04);
  const norm = (p1, p2) => dist3D(p1, p2) / palmSpan;

  // Finger keypoints
  const thumbMCP = landmarks[2];
  const thumbTip = landmarks[4];

  const indexMCP = landmarks[5];
  const indexPIP = landmarks[6];
  const indexTip = landmarks[8];

  const middlePIP = landmarks[10];
  const middleTip = landmarks[12];

  const ringMCP = landmarks[13];
  const ringPIP = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMCP = landmarks[17];
  const pinkyPIP = landmarks[18];
  const pinkyTip = landmarks[20];

  // Distances to wrist
  const indexTipWrist = dist3D(indexTip, wrist);
  const indexPIPWrist = dist3D(indexPIP, wrist);
  const middleTipWrist = dist3D(middleTip, wrist);
  const middlePIPWrist = dist3D(middlePIP, wrist);
  const ringTipWrist = dist3D(ringTip, wrist);
  const ringPIPWrist = dist3D(ringPIP, wrist);
  const pinkyTipWrist = dist3D(pinkyTip, wrist);
  const pinkyPIPWrist = dist3D(pinkyPIP, wrist);

  // Extended state: tip is significantly farther from wrist than PIP/MCP
  const indexExt = indexTipWrist > indexPIPWrist * 1.12 && norm(indexTip, indexMCP) > 0.72;
  const middleExt = middleTipWrist > middlePIPWrist * 1.12 && norm(middleTip, middleMCP) > 0.72;
  const ringExt = ringTipWrist > ringPIPWrist * 1.12 && norm(ringTip, ringMCP) > 0.72;
  const pinkyExt = pinkyTipWrist > pinkyPIPWrist * 1.12 && norm(pinkyTip, pinkyMCP) > 0.72;

  // Curled state: tip is folded closer to palm/MCP
  const indexCurled = indexTip.y > indexPIP.y || norm(indexTip, indexMCP) < 0.62 || indexTipWrist < indexPIPWrist;
  const middleCurled = middleTip.y > middlePIP.y || norm(middleTip, middleMCP) < 0.62 || middleTipWrist < middlePIPWrist;
  const ringCurled = ringTip.y > ringPIP.y || norm(ringTip, ringMCP) < 0.62 || ringTipWrist < ringPIPWrist;
  const pinkyCurled = pinkyTip.y > pinkyPIP.y || norm(pinkyTip, pinkyMCP) < 0.62 || pinkyTipWrist < pinkyPIPWrist;

  // Thumb state
  const thumbWristDist = dist3D(thumbTip, wrist);
  const thumbIndexMCPDist = norm(thumbTip, indexMCP);
  const thumbExt = thumbIndexMCPDist > 0.68 && thumbWristDist > dist3D(thumbMCP, wrist) * 1.15;
  const thumbUp = thumbExt && thumbTip.y < indexMCP.y && thumbTip.y < wrist.y - 0.2 * palmSpan;
  const thumbDown = thumbExt && thumbTip.y > wrist.y + 0.25 * palmSpan;
  const thumbBesideIndex = !thumbExt && thumbTip.y < indexMCP.y && norm(thumbTip, indexMCP) < 0.55 && thumbTip.y < indexPIP.y;
  const thumbAcrossFingers = norm(thumbTip, middleMCP) < 0.45 || norm(thumbTip, ringMCP) < 0.45;

  // Pinch distances
  const thumbIndexDist = norm(thumbTip, indexTip);
  const thumbMiddleDist = norm(thumbTip, middleTip);
  const thumbRingDist = norm(thumbTip, ringTip);
  const thumbPinkyDist = norm(thumbTip, pinkyTip);

  const isPinchingThumbIndex = thumbIndexDist < 0.32;
  const isPinchingThumbMiddle = thumbMiddleDist < 0.32;
  const isPinchingThumbRing = thumbRingDist < 0.32;
  const isPinchingThumbPinky = thumbPinkyDist < 0.32;

  // Finger spreads and crossings
  const indexMiddleSpread = norm(indexTip, middleTip);
  const middleRingSpread = norm(middleTip, ringTip);
  const ringPinkySpread = norm(ringTip, pinkyTip);

  // Crossed fingers (R): Index and Middle tips cross over laterally
  const isIndexMiddleCrossed =
    indexExt &&
    middleExt &&
    !ringExt &&
    !pinkyExt &&
    indexMiddleSpread < 0.25 &&
    Math.abs(indexTip.x - middleTip.x) < 0.12 * palmSpan;

  // Hooked index (X): Index MCP is raised up, PIP is elevated, but DIP/Tip are sharply hooked down
  const isIndexHooked =
    !middleExt &&
    !ringExt &&
    !pinkyExt &&
    indexPIP.y < indexMCP.y - 0.15 * palmSpan &&
    indexTip.y > indexPIP.y + 0.08 * palmSpan &&
    norm(indexTip, indexMCP) > 0.38 &&
    norm(indexTip, indexMCP) < 0.85;

  // General postures
  const isFist = !indexExt && !middleExt && !ringExt && !pinkyExt;
  const isAllFourExt = indexExt && middleExt && ringExt && pinkyExt;
  const isAllFiveExt = isAllFourExt && thumbExt;

  // Hand orientation
  const isHandUpright = middleMCP.y < wrist.y;
  const isHandHorizontal = Math.abs(middleMCP.y - wrist.y) < 0.4 * palmSpan;

  return {
    palmSpan,
    wrist,
    thumbTip,
    thumbMCP,
    indexTip,
    indexMCP,
    indexPIP,
    middleTip,
    middleMCP,
    middlePIP,
    ringTip,
    ringMCP,
    pinkyTip,
    pinkyMCP,
    indexExt,
    middleExt,
    ringExt,
    pinkyExt,
    indexCurled,
    middleCurled,
    ringCurled,
    pinkyCurled,
    thumbExt,
    thumbUp,
    thumbDown,
    thumbBesideIndex,
    thumbAcrossFingers,
    thumbIndexDist,
    thumbMiddleDist,
    thumbRingDist,
    thumbPinkyDist,
    isPinchingThumbIndex,
    isPinchingThumbMiddle,
    isPinchingThumbRing,
    isPinchingThumbPinky,
    indexMiddleSpread,
    middleRingSpread,
    ringPinkySpread,
    isIndexMiddleCrossed,
    isIndexHooked,
    isFist,
    isAllFourExt,
    isAllFiveExt,
    isHandUpright,
    isHandHorizontal,
    norm
  };
}

/**
 * Classifies Single-Hand ASL Alphabets (A-Z, 0-9) and standard gestures
 */
export function classifySingleHandSign(h) {
  if (!h) return null;

  const {
    norm,
    palmSpan,
    wrist,
    thumbTip,
    indexTip,
    middleTip,
    pinkyTip,
    indexMCP,
    middleMCP,
    ringMCP,
    indexExt,
    middleExt,
    ringExt,
    pinkyExt,
    thumbExt,
    thumbUp,
    thumbDown,
    thumbBesideIndex,
    thumbAcrossFingers,
    thumbIndexDist,
    thumbMiddleDist,
    isPinchingThumbIndex,
    isPinchingThumbMiddle,
    isPinchingThumbRing,
    isPinchingThumbPinky,
    indexMiddleSpread,
    isIndexMiddleCrossed,
    isIndexHooked,
    isFist,
    isAllFourExt,
    isAllFiveExt,
    isHandUpright,
    isHandHorizontal
  } = h;

  // 1. "I LOVE YOU" (ASL ILY): Thumb, Index, Pinky extended; Middle and Ring curled
  if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'I LOVE YOU', type: 'word', confidence: 0.96, icon: '🤟' };
  }

  // 2. LETTER Y: Thumb and Pinky extended wide; Index, Middle, Ring curled
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'Y', type: 'letter', confidence: 0.95, icon: '🤙' };
  }

  // 3. LETTER L: Thumb and Index extended at ~90 deg; Middle, Ring, Pinky curled
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    const angleDist = norm(thumbTip, indexTip);
    if (angleDist > 0.6) {
      return { token: 'L', type: 'letter', confidence: 0.94, icon: '🇱' };
    }
  }

  // 4. LETTER R: Index and Middle crossed upright
  if (isIndexMiddleCrossed) {
    return { token: 'R', type: 'letter', confidence: 0.94, icon: '🇷' };
  }

  // 5. LETTER V / PEACE / NUMBER 2: Index and Middle extended in V shape; Ring and Pinky curled
  if (indexExt && middleExt && !ringExt && !pinkyExt && !isPinchingThumbIndex) {
    if (indexMiddleSpread > 0.26) {
      return { token: 'V', type: 'letter', confidence: 0.94, icon: '✌️' };
    }
    // LETTER U: Index and Middle extended held close together side-by-side
    return { token: 'U', type: 'letter', confidence: 0.92, icon: '🇺' };
  }

  // 6. LETTER W / NUMBER 3 / WATER: Index, Middle, Ring extended upright; Pinky curled
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return { token: 'W', type: 'letter', confidence: 0.94, icon: '🇼' };
  }

  // 7. LETTER F / OK: Thumb and Index pinch forming circle; Middle, Ring, Pinky extended
  if (isPinchingThumbIndex && middleExt && ringExt && pinkyExt) {
    return { token: 'F', type: 'letter', confidence: 0.95, icon: '🇫' };
  }

  // 8. LETTER I: Pinky extended upright; all other 4 fingers curled
  if (!thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return { token: 'I', type: 'letter', confidence: 0.95, icon: 'ℹ️' };
  }

  // 9. LETTER D / NUMBER 1: Index finger straight UP; other 3 fingers curled in circle with thumb
  if (indexExt && !middleExt && !ringExt && !pinkyExt) {
    if (!thumbExt || norm(thumbTip, middleTip) < 0.45) {
      return { token: 'D', type: 'letter', confidence: 0.93, icon: '🇩' };
    }
  }

  // 10. LETTER B / NUMBER 4: 4 fingers upright together; thumb folded flat across palm
  if (isAllFourExt && !thumbExt) {
    const spreadSpan = norm(indexTip, pinkyTip);
    if (spreadSpan < 0.85) {
      return { token: 'B', type: 'letter', confidence: 0.93, icon: '🅱️' };
    }
  }

  // 11. LETTER X: Hooked index finger while others curled
  if (isIndexHooked) {
    return { token: 'X', type: 'letter', confidence: 0.92, icon: '🇽' };
  }

  // 12. LETTER C: Curved fingers forming a "C" arc
  if (!isFist && !isAllFiveExt) {
    const tipSpread = norm(indexTip, middleTip);
    const thumbIndexArc = norm(thumbTip, indexTip);
    if (
      thumbIndexArc > 0.45 &&
      thumbIndexArc < 1.15 &&
      tipSpread < 0.35 &&
      norm(middleTip, middleMCP) > 0.45 &&
      norm(middleTip, middleMCP) < 0.95
    ) {
      return { token: 'C', type: 'letter', confidence: 0.91, icon: '🇨' };
    }
  }

  // 13. LETTER O / ZERO: Thumb and all fingertips touching in a closed ring/circle
  if (
    thumbIndexDist < 0.35 &&
    thumbMiddleDist < 0.38 &&
    !indexExt &&
    !middleExt &&
    !ringExt &&
    !pinkyExt
  ) {
    return { token: 'O', type: 'letter', confidence: 0.92, icon: '🅾️' };
  }

  // 14. LETTER K: Index upright, Middle angled forward (~45 deg), Thumb in between
  if (indexExt && norm(middleTip, middleMCP) > 0.65 && !ringExt && !pinkyExt) {
    if (norm(thumbTip, middleMCP) < 0.45) {
      return { token: 'K', type: 'letter', confidence: 0.90, icon: '🇰' };
    }
  }

  // 15. LETTER G / H: Pointing horizontally forward
  if (isHandHorizontal && indexExt && !ringExt && !pinkyExt) {
    if (middleExt) {
      return { token: 'H', type: 'letter', confidence: 0.91, icon: '🇭' };
    }
    return { token: 'G', type: 'letter', confidence: 0.91, icon: '🇬' };
  }

  // 16. LETTER P / Q: Pointing downward
  if (thumbDown && indexExt && !ringExt && !pinkyExt) {
    if (middleExt) {
      return { token: 'P', type: 'letter', confidence: 0.90, icon: '🇵' };
    }
    return { token: 'Q', type: 'letter', confidence: 0.90, icon: '🇶' };
  }

  // 17. NUMBER 7, 8, 9
  if (isPinchingThumbPinky && indexExt && middleExt && ringExt) {
    return { token: '7', type: 'number', confidence: 0.92, icon: '7️⃣' };
  }
  if (isPinchingThumbRing && indexExt && middleExt && pinkyExt) {
    return { token: '8', type: 'number', confidence: 0.92, icon: '8️⃣' };
  }
  if (isPinchingThumbMiddle && indexExt && ringExt && pinkyExt) {
    return { token: '9', type: 'number', confidence: 0.92, icon: '9️⃣' };
  }

  // 18. FIST / THUMBS VARIANTS: A, S, E, T, GOOD, BAD
  if (isFist) {
    // Thumbs up -> GOOD (require intentional clear vertical thumb elevation)
    if (thumbUp && thumbTip.y < wrist.y - 0.35 * palmSpan && thumbTip.y < indexMCP.y - 0.25 * palmSpan) {
      return { token: 'GOOD', type: 'word', confidence: 0.95, icon: '👍' };
    }
    // Thumbs down -> BAD
    if (thumbDown) {
      return { token: 'BAD', type: 'word', confidence: 0.94, icon: '👎' };
    }
    // LETTER A: Thumb resting alongside index finger pointing upright
    if (thumbBesideIndex) {
      return { token: 'A', type: 'letter', confidence: 0.94, icon: '🅰️' };
    }
    // LETTER S: Thumb crossed over the front of the curled fingers
    if (thumbAcrossFingers) {
      return { token: 'S', type: 'letter', confidence: 0.92, icon: '🇸' };
    }
    // LETTER T: Thumb tucked upright between index and middle knuckles
    if (norm(thumbTip, indexMCP) < 0.38 && norm(thumbTip, middleMCP) < 0.38 && thumbTip.y < indexMCP.y) {
      return { token: 'T', type: 'letter', confidence: 0.93, icon: '🇹' };
    }
    // LETTER E: Fingertips resting on top of folded thumb (thumb tucked across palm)
    if (norm(indexTip, thumbTip) < 0.28 && norm(middleTip, thumbTip) < 0.32) {
      return { token: 'E', type: 'letter', confidence: 0.91, icon: '🇪' };
    }
  }

  // 19. LETTER M / N: Thumb under 3 or 2 curled fingers
  if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
    if (norm(thumbTip, ringMCP) < 0.35) {
      return { token: 'M', type: 'letter', confidence: 0.88, icon: '🇲' };
    }
    if (norm(thumbTip, middleMCP) < 0.35) {
      return { token: 'N', type: 'letter', confidence: 0.88, icon: '🇳' };
    }
  }

  // 20. OPEN PALM / HELLO / 5
  if (isAllFiveExt && isHandUpright) {
    return { token: 'HELLO', type: 'word', confidence: 0.93, icon: '👋' };
  }

  return null;
}

/**
 * Classifies Two-Handed Signs and Alphabets (BSL/ISL as used in Convert.js)
 */
export function classifyDualHandSign(allLandmarks) {
  if (!allLandmarks || allLandmarks.length < 2) return null;

  const h1 = trackHandPose(allLandmarks[0]);
  const h2 = trackHandPose(allLandmarks[1]);
  if (!h1 || !h2) return null;

  const palmScale = Math.max(h1.palmSpan, h2.palmSpan);
  const wristDist = dist3D(h1.wrist, h2.wrist) / palmScale;

  // Identify dominant pointing hand vs target palm/hand
  let pointer = null;
  let target = null;

  if (h1.indexExt && !h1.middleExt && !h1.ringExt && !h1.pinkyExt) {
    pointer = h1;
    target = h2;
  } else if (h2.indexExt && !h2.middleExt && !h2.ringExt && !h2.pinkyExt) {
    pointer = h2;
    target = h1;
  }

  // 1. TWO-HANDED T or X (Both hands have ONLY index finger extended)
  const isH1OnlyIndex = h1.indexExt && !h1.middleExt && !h1.ringExt && !h1.pinkyExt;
  const isH2OnlyIndex = h2.indexExt && !h2.middleExt && !h2.ringExt && !h2.pinkyExt;

  if (isH1OnlyIndex && isH2OnlyIndex && wristDist < 3.2) {
    const tipDist = dist3D(h1.indexTip, h2.indexTip) / palmScale;
    const dTouch = Math.min(
      tipDist,
      dist3D(h1.indexTip, h2.indexPIP) / palmScale,
      dist3D(h2.indexTip, h1.indexPIP) / palmScale
    );

    // Direction vectors from MCP to Tip for each index finger
    const dx1 = h1.indexTip.x - h1.indexMCP.x;
    const dy1 = h1.indexTip.y - h1.indexMCP.y;
    const dx2 = h2.indexTip.x - h2.indexMCP.x;
    const dy2 = h2.indexTip.y - h2.indexMCP.y;

    const isH1Vertical = Math.abs(dy1) > Math.abs(dx1) * 1.1;
    const isH2Vertical = Math.abs(dy2) > Math.abs(dx2) * 1.1;
    const isH1Horizontal = Math.abs(dx1) > Math.abs(dy1) * 0.85;
    const isH2Horizontal = Math.abs(dx2) > Math.abs(dy2) * 0.85;

    // LETTER T: One finger forms vertical stem, other finger forms horizontal crossbar across it!
    const isTFormation = (isH1Vertical && isH2Horizontal) || (isH2Vertical && isH1Horizontal);

    if (isTFormation && dTouch < 0.75) {
      return { token: 'T', type: 'letter', confidence: 0.96, icon: '🇹' };
    }

    // LETTER X: Both index fingers crossed over each other
    if (tipDist < 0.55) {
      return { token: 'X', type: 'letter', confidence: 0.94, icon: '🇽' };
    }
  }

  // 2. VOWELS (BSL/ISL Two-Handed: Pointer index touches the 5 fingers of an OPEN target hand)
  // Target hand MUST have other fingers open/extended to be the vowel board!
  // A = Thumb, E = Index, I = Middle, O = Ring, U = Pinky
  if (pointer && target && wristDist < 2.8) {
    const isTargetVowelHand =
      target.middleExt ||
      target.ringExt ||
      target.pinkyExt ||
      target.isAllFourExt;

    if (isTargetVowelHand) {
      const pTip = pointer.indexTip;
      const dThumb = dist3D(pTip, target.thumbTip) / palmScale;
      const dIndex = dist3D(pTip, target.indexTip) / palmScale;
      const dMiddle = dist3D(pTip, target.middleTip) / palmScale;
      const dRing = dist3D(pTip, target.ringTip) / palmScale;
      const dPinky = dist3D(pTip, target.pinkyTip) / palmScale;

      const minDist = Math.min(dThumb, dIndex, dMiddle, dRing, dPinky);
      if (minDist < 0.45) {
        if (minDist === dThumb) return { token: 'A', type: 'letter', confidence: 0.96, icon: '🅰️' };
        if (minDist === dIndex) return { token: 'E', type: 'letter', confidence: 0.96, icon: '🇪' };
        if (minDist === dMiddle) return { token: 'I', type: 'letter', confidence: 0.96, icon: 'ℹ️' };
        if (minDist === dRing) return { token: 'O', type: 'letter', confidence: 0.96, icon: '🅾️' };
        if (minDist === dPinky) return { token: 'U', type: 'letter', confidence: 0.96, icon: '🇺' };
      }
    }
  }

  // LETTER B (BSL/ISL: Both hands form circles/rings touching each other)
  if (
    (h1.isPinchingThumbIndex || h1.thumbIndexDist < 0.45) &&
    (h2.isPinchingThumbIndex || h2.thumbIndexDist < 0.45) &&
    dist3D(h1.indexTip, h2.indexTip) / palmScale < 0.6
  ) {
    return { token: 'B', type: 'letter', confidence: 0.94, icon: '🅱️' };
  }

  // LETTER D (BSL/ISL: Non-dominant index upright, dominant index/thumb forms semi-circle against it)
  if (
    ((h1.indexExt && !h1.middleExt && !h1.ringExt) || (h2.indexExt && !h2.middleExt && !h2.ringExt)) &&
    dist3D(h1.thumbTip, h2.indexTip) / palmScale < 0.45 &&
    dist3D(h1.indexTip, h2.indexTip) / palmScale < 0.5
  ) {
    return { token: 'D', type: 'letter', confidence: 0.93, icon: '🇩' };
  }

  // LETTER F (BSL/ISL: Two index fingers or index+middle crossed over each other)
  if (h1.indexExt && h2.indexExt && dist3D(h1.indexTip, h2.indexTip) / palmScale < 0.45) {
    if (!h1.ringExt && !h2.ringExt) {
      return { token: 'F', type: 'letter', confidence: 0.94, icon: '🇫' };
    }
  }

  // LETTER G / S (Both fists touching)
  if (h1.isFist && h2.isFist && wristDist < 1.6) {
    return { token: 'G', type: 'letter', confidence: 0.91, icon: '🇬' };
  }

  // HELP (One hand flat palm facing up, other hand thumbs-up or fist resting on top)
  const isOneFlat =
    (h1.indexExt && h1.middleExt && h1.ringExt && h1.pinkyExt && !h1.thumbUp) ||
    (h2.indexExt && h2.middleExt && h2.ringExt && h2.pinkyExt && !h2.thumbUp);
  const isOneFistOrThumb = (h1.thumbUp && h1.isFist) || (h2.thumbUp && h2.isFist);

  if (isOneFlat && isOneFistOrThumb && wristDist < 2.0) {
    return { token: 'HELP', type: 'word', confidence: 0.96, icon: '🆘' };
  }

  return null;
}

/**
 * Universal Real-Time Classifier:
 * Intelligently routes between dual-hand and single-hand tracking.
 */
export function classifyRealtimeSign(allLandmarks) {
  if (!allLandmarks || allLandmarks.length === 0) return null;

  // 1. Check dual-hand gestures first if 2 hands are visible
  if (allLandmarks.length >= 2) {
    const dualMatch = classifyDualHandSign(allLandmarks);
    if (dualMatch) return dualMatch;
  }

  // 2. Classify dominant/first hand
  const h1 = trackHandPose(allLandmarks[0]);
  const singleMatch = classifySingleHandSign(h1);
  if (singleMatch) return singleMatch;

  // 3. If second hand is present, check it as well
  if (allLandmarks.length >= 2) {
    const h2 = trackHandPose(allLandmarks[1]);
    const secondMatch = classifySingleHandSign(h2);
    if (secondMatch) return secondMatch;
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
    this.stabilityThreshold = options.stabilityThreshold || 5;
    this.mode = options.mode || 'spelling'; // 'spelling' (letters/numbers only) | 'all'
    this.history = [];
    this.activeWord = '';
    this.sentence = '';
    this.lastCommittedToken = null;
    this.lastCommitTime = 0;
  }

  setMode(mode) {
    this.mode = mode;
  }

  feed(classified) {
    const now = Date.now();
    if (!classified || !classified.token) {
      this.history = [];
      return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
    }

    // When in 'spelling' mode, ignore any full-word conversational signs
    if (this.mode === 'spelling' && classified.type !== 'letter' && classified.type !== 'number') {
      this.history = [];
      return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
    }

    this.history.push(classified.token);
    if (this.history.length > this.stabilityThreshold * 2) {
      this.history.shift();
    }

    // Require consecutive uninterrupted frames of the same gesture
    let consecutiveMatches = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i] === classified.token) {
        consecutiveMatches++;
      } else {
        break;
      }
    }

    // Debounce: require threshold and prevent fast identical repetitions (must hold >2000ms or change sign)
    const isSameAsLast = classified.token === this.lastCommittedToken;
    const canCommit =
      consecutiveMatches >= this.stabilityThreshold &&
      (!isSameAsLast || now - this.lastCommitTime > 2000);

    if (canCommit) {
      this.lastCommittedToken = classified.token;
      this.lastCommitTime = now;
      this.history = [];

      if (classified.type === 'letter' || classified.type === 'number') {
        this.activeWord += classified.token;
      } else if (this.mode === 'all') {
        if (this.activeWord) {
          this.sentence = (this.sentence + ' ' + this.activeWord).trim();
          this.activeWord = '';
        }
        this.sentence = (this.sentence + ' ' + classified.token).trim();
      }

      return {
        activeWord: this.activeWord,
        sentence: this.sentence,
        newCommit: classified
      };
    }

    return { activeWord: this.activeWord, sentence: this.sentence, newCommit: null };
  }

  commitSpace() {
    if (this.activeWord) {
      this.sentence = (this.sentence + ' ' + this.activeWord).trim();
      this.activeWord = '';
    } else if (this.sentence) {
      this.sentence += ' ';
    }
    return this.getFullText();
  }

  backspace() {
    if (this.activeWord.length > 0) {
      this.activeWord = this.activeWord.slice(0, -1);
    } else if (this.sentence.length > 0) {
      this.sentence = this.sentence.slice(0, -1);
    }
    return this.getFullText();
  }

  clear() {
    this.history = [];
    this.activeWord = '';
    this.sentence = '';
    this.lastCommittedToken = null;
    this.lastCommitTime = 0;
  }

  getFullText() {
    if (this.sentence && this.activeWord) {
      return `${this.sentence} ${this.activeWord}`;
    }
    return this.sentence || this.activeWord || '';
  }
}
