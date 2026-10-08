// HearAid Google Translator Engine & Multilingual Voice Service
import axios from 'axios';
import { communityURL } from '../Config/config';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', bcp47: 'en-US', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', bcp47: 'es-ES', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', bcp47: 'fr-FR', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', bcp47: 'de-DE', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', bcp47: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', bcp47: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', bcp47: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', bcp47: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', bcp47: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn', bcp47: 'bn-IN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'ja', bcp47: 'ja-JP', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', bcp47: 'zh-CN', name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ar', bcp47: 'ar-SA', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt', bcp47: 'pt-BR', name: 'Portuguese', native: 'Português', flag: '🇧🇷' },
  { code: 'it', bcp47: 'it-IT', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', bcp47: 'ru-RU', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ko', bcp47: 'ko-KR', name: 'Korean', native: '한국어', flag: '🇰🇷' }
];

const translationCache = new Map();

/**
 * Translates text using Google Translator API.
 * Tries the backend proxy first; falls back to direct client-side Google API.
 */
export async function translateWithGoogle(text, targetLang = 'en', sourceLang = 'auto') {
  if (!text || !text.trim()) return '';

  const clean = text.trim();
  const tgt = (targetLang || 'en').toLowerCase().split('-')[0];
  const src = (sourceLang || 'auto').toLowerCase().split('-')[0];

  if (src === tgt && src !== 'auto') {
    return clean;
  }

  const cacheKey = `${src}_${tgt}_${clean.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 1. Try Backend Proxy (/api/translate)
  try {
    const res = await axios.post(`${communityURL}/translate`, {
      text: clean,
      from: src,
      to: tgt
    }, { timeout: 3500 });

    if (res.data && res.data.translatedText) {
      translationCache.set(cacheKey, res.data.translatedText);
      return res.data.translatedText;
    }
  } catch (err) {
    // Continue to direct fallback
  }

  // 2. Direct Fallback to Google Translate public gtx endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      src
    )}&tl=${encodeURIComponent(tgt)}&dt=t&q=${encodeURIComponent(clean)}`;

    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data[0])) {
        const translated = data[0].map((s) => (s && s[0] ? s[0] : '')).join('');
        if (translated) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (fetchErr) {
    console.warn('Google Translate direct endpoint notice:', fetchErr);
  }

  // If translation fails, return original text safely
  return clean;
}

/**
 * Finds the best available SpeechSynthesis voice for the specified language.
 */
export function getVoiceForLanguage(langCode) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (voices.length === 0) return null;

  const prefix = (langCode || 'en').toLowerCase().split('-')[0];

  // Try exact match first
  const exact = voices.find((v) => v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;

  // Try prefix match (e.g. 'es', 'hi', 'fr', 'ta')
  const partial = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (partial) return partial;

  return voices.find((v) => v.lang.startsWith('en')) || voices[0];
}

/**
 * Speaks text out loud in the chosen language.
 */
export function speakInLanguage(text, langCode = 'en', options = {}) {
  if (!('speechSynthesis' in window) || !text) return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = options.rate || 0.95;
  utter.pitch = options.pitch || 1.0;
  utter.volume = options.volume !== undefined ? options.volume : 1.0;

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode || l.bcp47 === langCode);
  const bcp = langObj ? langObj.bcp47 : langCode;
  utter.lang = bcp;

  const voice = getVoiceForLanguage(bcp);
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}
