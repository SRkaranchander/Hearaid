// HearAid Standard Sign Language Recognition Engine
// Landmark-geometric classifier for ASL Alphabet, ISL Two-Handed Alphabet, & Universal Communication Signs
import { classifyRealtimeSign } from './realtimeSignTracker';

export const STANDARD_SIGN_CATALOG = [
  // --- Universal Signs ---
  {
    id: 'hello',
    label: 'Hello',
    category: 'Greetings',
    icon: '👋',
    hands: '1 Hand',
    description: 'Open hand upright with all 5 fingers extended, greeting the camera.'
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
    description: 'Closed upright fist, simulating an affirmative nod.'
  },
  {
    id: 'no',
    label: 'No',
    category: 'Response',
    icon: '🤏',
    hands: '1 Hand',
    description: 'Index and middle fingers snapping down against thumb.'
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
    id: 'i_love_you',
    label: 'I love you',
    category: 'Expressions',
    icon: '🤟',
    hands: '1 Hand',
    description: 'ASL ILY sign: Thumb, Index, and Pinky extended, Middle & Ring folded.'
  },
  {
    id: 'good',
    label: 'Good',
    category: 'Feedback',
    icon: '👍',
    hands: '1 Hand',
    description: 'Thumbs up with all 4 fingers closed into a firm fist.'
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
    id: 'water',
    label: 'Water',
    category: 'Daily Needs',
    icon: '💧',
    hands: '1 Hand',
    description: 'ASL "W" sign: Index, Middle, and Ring extended upright, Thumb holding Pinky.'
  },

  // --- Complete Alphabets A - Z (Both ASL Single-Hand & Convert.js Two-Handed) ---
  {
    id: 'sign_a',
    label: 'A',
    category: 'Alphabet',
    icon: '🅰️',
    hands: '1 or 2 Hands',
    description: '1 Hand: Fist with thumb upright against side of index. 2 Hands: Index touches thumb.'
  },
  {
    id: 'sign_b',
    label: 'B',
    category: 'Alphabet',
    icon: '🅱️',
    hands: '1 or 2 Hands',
    description: '1 Hand: 4 fingers straight up, thumb across palm. 2 Hands: Fingers touch forming circles.'
  },
  {
    id: 'sign_c',
    label: 'C',
    category: 'Alphabet',
    icon: '🇨',
    hands: '1 Hand',
    description: 'All fingers and thumb curved into an open "C" shape facing sideways.'
  },
  {
    id: 'sign_d',
    label: 'D',
    category: 'Alphabet',
    icon: '🇩',
    hands: '1 or 2 Hands',
    description: '1 Hand: Index straight up, others circle with thumb. 2 Hands: Index up, other hand curves.'
  },
  {
    id: 'sign_e',
    label: 'E',
    category: 'Alphabet',
    icon: '🇪',
    hands: '1 or 2 Hands',
    description: '1 Hand: Claw/curled fingers over thumb. 2 Hands: Pointer touches index finger tip.'
  },
  {
    id: 'sign_f',
    label: 'F',
    category: 'Alphabet',
    icon: '🇫',
    hands: '1 or 2 Hands',
    description: '1 Hand: Thumb & index pinched, 3 up (OK shape). 2 Hands: Crossed index fingers.'
  },
  {
    id: 'sign_g',
    label: 'G',
    category: 'Alphabet',
    icon: '🇬',
    hands: '1 or 2 Hands',
    description: '1 Hand: Index and thumb pointing horizontally forward. 2 Hands: Fists together.'
  },
  {
    id: 'sign_h',
    label: 'H',
    category: 'Alphabet',
    icon: '🇭',
    hands: '1 Hand',
    description: 'Index and middle fingers extended together pointing horizontally.'
  },
  {
    id: 'sign_i',
    label: 'I',
    category: 'Alphabet',
    icon: 'ℹ️',
    hands: '1 or 2 Hands',
    description: '1 Hand: Pinky extended upright, others curled. 2 Hands: Pointer touches middle finger tip.'
  },
  {
    id: 'sign_k',
    label: 'K',
    category: 'Alphabet',
    icon: '🇰',
    hands: '1 Hand',
    description: 'Index finger upright, Middle angled forward, thumb tucked in between.'
  },
  {
    id: 'sign_l',
    label: 'L',
    category: 'Alphabet',
    icon: '🇱',
    hands: '1 Hand',
    description: 'Index finger straight up and Thumb out at 90 degrees forming an "L".'
  },
  {
    id: 'sign_m',
    label: 'M',
    category: 'Alphabet',
    icon: '🇲',
    hands: '1 Hand',
    description: 'Thumb tucked under index, middle, and ring fingers folded over it.'
  },
  {
    id: 'sign_n',
    label: 'N',
    category: 'Alphabet',
    icon: '🇳',
    hands: '1 Hand',
    description: 'Thumb tucked under index and middle fingers folded over it.'
  },
  {
    id: 'sign_o',
    label: 'O',
    category: 'Alphabet',
    icon: '🅾️',
    hands: '1 or 2 Hands',
    description: '1 Hand: All fingertips and thumb touch in a circular ring. 2 Hands: Index touches ring tip.'
  },
  {
    id: 'sign_p',
    label: 'P',
    category: 'Alphabet',
    icon: '🇵',
    hands: '1 Hand',
    description: 'Like "K" but pointing downwards (Index and Middle pointing down).'
  },
  {
    id: 'sign_q',
    label: 'Q',
    category: 'Alphabet',
    icon: '🇶',
    hands: '1 Hand',
    description: 'Like "G" but pointing downwards (Index and Thumb pointing down).'
  },
  {
    id: 'sign_r',
    label: 'R',
    category: 'Alphabet',
    icon: '🇷',
    hands: '1 Hand',
    description: 'Index and Middle fingers extended upright and crossed over each other.'
  },
  {
    id: 'sign_s',
    label: 'S',
    category: 'Alphabet',
    icon: '🇸',
    hands: '1 Hand',
    description: 'Tight fist with thumb folded across the front of the curled fingers.'
  },
  {
    id: 'sign_t',
    label: 'T',
    category: 'Alphabet',
    icon: '🇹',
    hands: '1 Hand',
    description: 'Thumb tucked between index and middle fingers in a fist.'
  },
  {
    id: 'sign_u',
    label: 'U',
    category: 'Alphabet',
    icon: '🇺',
    hands: '1 or 2 Hands',
    description: '1 Hand: Index & Middle upright together. 2 Hands: Index touches pinky tip.'
  },
  {
    id: 'sign_v',
    label: 'V',
    category: 'Alphabet',
    icon: '✌️',
    hands: '1 Hand',
    description: 'Index and Middle fingers spread in a "V" shape (Peace sign).'
  },
  {
    id: 'sign_w',
    label: 'W',
    category: 'Alphabet',
    icon: '🇼',
    hands: '1 Hand',
    description: 'Index, Middle, and Ring fingers extended upright in a "W" shape.'
  },
  {
    id: 'sign_x',
    label: 'X',
    category: 'Alphabet',
    icon: '🇽',
    hands: '1 Hand',
    description: 'Index finger hooked in a claw/curve while other fingers are in a fist.'
  },
  {
    id: 'sign_y',
    label: 'Y',
    category: 'Alphabet',
    icon: '🤙',
    hands: '1 Hand',
    description: 'Thumb and Pinky extended wide ("shaka" / call me sign), 3 middle fingers curled.'
  }
];

export const ALPHABETS_LIST = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y'
];

/**
 * Recognizes standard sign gestures from detected hand landmarks.
 * Delegates to the unified biomechanical real-time classifier.
 */
export function recognizeStandardSign(allLandmarks) {
  const match = classifyRealtimeSign(allLandmarks);
  if (!match) return null;
  return {
    sign: match.token,
    confidence: match.confidence,
    icon: match.icon || '✋',
    type: match.type || 'sign'
  };
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
      // Debounce: allow different signs after 450ms, duplicate after 1800ms
      const isSame = this.lastEmitted === recognized.sign;
      const minInterval = isSame ? 1800 : 450;
      if (now - this.lastEmittedTime < minInterval) {
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
