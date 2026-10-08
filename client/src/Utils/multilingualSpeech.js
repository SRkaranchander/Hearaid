// HearAid Multilingual Speech & Translation Engine

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', langPrefix: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es-ES', langPrefix: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', langPrefix: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', langPrefix: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi-IN', langPrefix: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta-IN', langPrefix: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', langPrefix: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ja-JP', langPrefix: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', langPrefix: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar-SA', langPrefix: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt-BR', langPrefix: 'pt', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'it-IT', langPrefix: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'ru-RU', langPrefix: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ko-KR', langPrefix: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' }
];

// High-speed localized dictionary for instantaneous offline zero-latency translation
export const SIGN_DICTIONARY = {
  'hello': {
    'en-US': 'Hello',
    'es-ES': 'Hola',
    'fr-FR': 'Bonjour',
    'de-DE': 'Hallo',
    'hi-IN': 'नमस्ते',
    'ta-IN': 'வணக்கம்',
    'te-IN': 'నమస్కారం',
    'ja-JP': 'こんにちは',
    'zh-CN': '你好',
    'ar-SA': 'مرحبا',
    'pt-BR': 'Olá',
    'it-IT': 'Ciao',
    'ru-RU': 'Привет',
    'ko-KR': '안녕하세요'
  },
  'thank you': {
    'en-US': 'Thank you',
    'es-ES': 'Gracias',
    'fr-FR': 'Merci',
    'de-DE': 'Danke',
    'hi-IN': 'धन्यवाद',
    'ta-IN': 'நன்றி',
    'te-IN': 'ధన్యవాదాలు',
    'ja-JP': 'ありがとう',
    'zh-CN': '谢谢',
    'ar-SA': 'شكرا لك',
    'pt-BR': 'Obrigado',
    'it-IT': 'Grazie',
    'ru-RU': 'Спасибо',
    'ko-KR': '감사합니다'
  },
  'thanks': {
    'en-US': 'Thanks',
    'es-ES': 'Gracias',
    'fr-FR': 'Merci',
    'de-DE': 'Danke',
    'hi-IN': 'धन्यवाद',
    'ta-IN': 'நன்றி',
    'te-IN': 'ధన్యవాదాలు',
    'ja-JP': 'ありがとう',
    'zh-CN': '多谢',
    'ar-SA': 'شكرا',
    'pt-BR': 'Valeu',
    'it-IT': 'Grazie',
    'ru-RU': 'Спасибо',
    'ko-KR': '고마워요'
  },
  'yes': {
    'en-US': 'Yes',
    'es-ES': 'Sí',
    'fr-FR': 'Oui',
    'de-DE': 'Ja',
    'hi-IN': 'हाँ',
    'ta-IN': 'ஆம்',
    'te-IN': 'అవును',
    'ja-JP': 'はい',
    'zh-CN': '是的',
    'ar-SA': 'نعم',
    'pt-BR': 'Sim',
    'it-IT': 'Sì',
    'ru-RU': 'Да',
    'ko-KR': '네'
  },
  'no': {
    'en-US': 'No',
    'es-ES': 'No',
    'fr-FR': 'Non',
    'de-DE': 'Nein',
    'hi-IN': 'नहीं',
    'ta-IN': 'இல்லை',
    'te-IN': 'కాదు',
    'ja-JP': 'いいえ',
    'zh-CN': '不',
    'ar-SA': 'لا',
    'pt-BR': 'Não',
    'it-IT': 'No',
    'ru-RU': 'Нет',
    'ko-KR': '아니요'
  },
  'help': {
    'en-US': 'Help',
    'es-ES': 'Ayuda',
    'fr-FR': 'Aide',
    'de-DE': 'Hilfe',
    'hi-IN': 'मदद चाहिए',
    'ta-IN': 'உதவி',
    'te-IN': 'సహాయం',
    'ja-JP': '助けて',
    'zh-CN': '请帮助我',
    'ar-SA': 'مساعدة',
    'pt-BR': 'Ajuda',
    'it-IT': 'Aiuto',
    'ru-RU': 'Помогите',
    'ko-KR': '도와주세요'
  },
  'please': {
    'en-US': 'Please',
    'es-ES': 'Por favor',
    'fr-FR': "S'il vous plaît",
    'de-DE': 'Bitte',
    'hi-IN': 'कृपया',
    'ta-IN': 'தயவுசெய்து',
    'te-IN': 'దయచేసి',
    'ja-JP': 'お願いします',
    'zh-CN': '请',
    'ar-SA': 'من فضلك',
    'pt-BR': 'Por favor',
    'it-IT': 'Per favore',
    'ru-RU': 'Пожалуйста',
    'ko-KR': '부탁합니다'
  },
  'i love you': {
    'en-US': 'I love you',
    'es-ES': 'Te quiero',
    'fr-FR': "Je t'aime",
    'de-DE': 'Ich liebe dich',
    'hi-IN': 'मैं तुमसे प्यार करता हूँ',
    'ta-IN': 'நான் உன்னை நேசிக்கிறேன்',
    'te-IN': 'నేను నిన్ను ప్రేమిస్తున్నాను',
    'ja-JP': '愛してる',
    'zh-CN': '我爱你',
    'ar-SA': 'أحبك',
    'pt-BR': 'Eu te amo',
    'it-IT': 'Ti amo',
    'ru-RU': 'Я тебя люблю',
    'ko-KR': '사랑해요'
  },
  'peace': {
    'en-US': 'Peace',
    'es-ES': 'Paz',
    'fr-FR': 'Paix',
    'de-DE': 'Frieden',
    'hi-IN': 'शांति',
    'ta-IN': 'அமைதி',
    'te-IN': 'శాంతి',
    'ja-JP': '平和',
    'zh-CN': '和平',
    'ar-SA': 'سلام',
    'pt-BR': 'Paz',
    'it-IT': 'Pace',
    'ru-RU': 'Мир',
    'ko-KR': '평화'
  },
  'good': {
    'en-US': 'Good',
    'es-ES': 'Bueno',
    'fr-FR': 'Bien',
    'de-DE': 'Gut',
    'hi-IN': 'अच्छा',
    'ta-IN': 'நல்லது',
    'te-IN': 'మంచిది',
    'ja-JP': 'いいね',
    'zh-CN': '很好',
    'ar-SA': 'جيد',
    'pt-BR': 'Muito bom',
    'it-IT': 'Bene',
    'ru-RU': 'Хорошо',
    'ko-KR': '좋아요'
  },
  'bad': {
    'en-US': 'Bad',
    'es-ES': 'Malo',
    'fr-FR': 'Mauvais',
    'de-DE': 'Schlecht',
    'hi-IN': 'बुरा',
    'ta-IN': 'மோசம்',
    'te-IN': 'చెడు',
    'ja-JP': '悪い',
    'zh-CN': '不好',
    'ar-SA': 'سيء',
    'pt-BR': 'Ruim',
    'it-IT': 'Male',
    'ru-RU': 'Плохо',
    'ko-KR': '나빠요'
  },
  'ok': {
    'en-US': 'Okay',
    'es-ES': 'De acuerdo',
    'fr-FR': "D'accord",
    'de-DE': 'In Ordnung',
    'hi-IN': 'सब ठीक है',
    'ta-IN': 'சரி',
    'te-IN': 'సరే',
    'ja-JP': '了解です',
    'zh-CN': '好的',
    'ar-SA': 'حسنا',
    'pt-BR': 'Tudo bem',
    'it-IT': 'Va bene',
    'ru-RU': 'Хорошо',
    'ko-KR': '괜찮아요'
  },
  'stop': {
    'en-US': 'Stop',
    'es-ES': 'Alto',
    'fr-FR': 'Arrêtez',
    'de-DE': 'Halt',
    'hi-IN': 'रुकिए',
    'ta-IN': 'நில்லுங்கள்',
    'te-IN': 'ఆగండి',
    'ja-JP': '止まって',
    'zh-CN': '停止',
    'ar-SA': 'توقف',
    'pt-BR': 'Pare',
    'it-IT': 'Fermati',
    'ru-RU': 'Стоп',
    'ko-KR': '멈추세요'
  },
  'call me': {
    'en-US': 'Call me',
    'es-ES': 'Llámame',
    'fr-FR': 'Appelle-moi',
    'de-DE': 'Ruf mich an',
    'hi-IN': 'मुझे फोन करो',
    'ta-IN': 'என்னை அழைக்கவும்',
    'te-IN': 'నన్ను పిలవండి',
    'ja-JP': '電話してね',
    'zh-CN': '打给我',
    'ar-SA': 'اتصل بي',
    'pt-BR': 'Me liga',
    'it-IT': 'Chiamami',
    'ru-RU': 'Позвони мне',
    'ko-KR': '전화해줘요'
  },
  'water': {
    'en-US': 'Water',
    'es-ES': 'Agua',
    'fr-FR': 'Eau',
    'de-DE': 'Wasser',
    'hi-IN': 'पानी चाहिए',
    'ta-IN': 'தண்ணீர்',
    'te-IN': 'నీరు',
    'ja-JP': '水',
    'zh-CN': '水',
    'ar-SA': 'ماء',
    'pt-BR': 'Água',
    'it-IT': 'Acqua',
    'ru-RU': 'Вода',
    'ko-KR': '물'
  },
  'emergency': {
    'en-US': 'Emergency',
    'es-ES': 'Emergencia',
    'fr-FR': 'Urgence',
    'de-DE': 'Notfall',
    'hi-IN': 'आपातकाल',
    'ta-IN': 'அவசர நிலை',
    'te-IN': 'అత్యవసర పరిస్థితి',
    'ja-JP': '緊急事態',
    'zh-CN': '紧急情况',
    'ar-SA': 'حالة طوارئ',
    'pt-BR': 'Emergência',
    'it-IT': 'Emergenza',
    'ru-RU': 'Срочно',
    'ko-KR': '비상사태'
  }
};

const translationCache = new Map();

/**
 * Translates a given text into the target language code.
 * Uses dictionary first for instantaneous zero-latency response,
 * and falls back to public translation API for custom phrases.
 */
export async function translateText(text, targetLangCode = 'en-US') {
  if (!text || !text.trim()) return '';
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // If target is English and text is English, return directly
  if (targetLangCode.startsWith('en') && /^[a-zA-Z0-9\s.,!?'"-]+$/.test(clean)) {
    return clean;
  }

  // 1. Check direct dictionary match
  if (SIGN_DICTIONARY[lower] && SIGN_DICTIONARY[lower][targetLangCode]) {
    return SIGN_DICTIONARY[lower][targetLangCode];
  }

  // Check partial key match (e.g. "letter A" -> "A")
  for (const [key, mapping] of Object.entries(SIGN_DICTIONARY)) {
    if (lower === key || lower.startsWith(key) || lower.endsWith(key)) {
      if (mapping[targetLangCode]) return mapping[targetLangCode];
    }
  }

  // If it's a single letter / alphabet sign (e.g., "Letter A" or "A")
  const letterMatch = clean.match(/^(?:Letter\s+)?([A-Z0-9])$/i);
  if (letterMatch) {
    return letterMatch[1].toUpperCase();
  }

  // 2. Check in-memory cache
  const cacheKey = `${lower}_${targetLangCode}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 3. Fallback: Query translation API asynchronously
  const targetPrefix = targetLangCode.split('-')[0];
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|${targetPrefix}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && !translated.includes('MYMEMORY WARNING')) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (err) {
    console.warn('Multilingual translation API fallback error:', err);
  }

  // Default fallback: return original text
  return clean;
}

/**
 * Finds the most suitable SpeechSynthesisVoice for the requested language code.
 */
export function getBestVoiceForLanguage(targetLangCode) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const exact = voices.find((v) => v.lang.toLowerCase() === targetLangCode.toLowerCase());
  if (exact) return exact;

  const prefix = targetLangCode.split('-')[0].toLowerCase();
  const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (partial) return partial;

  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

/**
 * High-level multilingual speech synthesis function.
 * Automatically translates the sign text into target language and speaks it.
 */
export async function speakMultilingual(text, targetLangCode = 'en-US', options = {}) {
  if (!('speechSynthesis' in window) || !text) return { translatedText: text };

  const rate = options.rate || 0.95;
  const pitch = options.pitch || 1.0;
  const volume = options.volume !== undefined ? options.volume : 1.0;

  // Translate text
  const translated = await translateText(text, targetLangCode);

  window.speechSynthesis.cancel(); // Stop any pending speech

  const utter = new SpeechSynthesisUtterance(translated);
  utter.rate = rate;
  utter.pitch = pitch;
  utter.volume = volume;
  utter.lang = targetLangCode;

  const voice = getBestVoiceForLanguage(targetLangCode);
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);

  return {
    originalText: text,
    translatedText: translated,
    langCode: targetLangCode
  };
}
