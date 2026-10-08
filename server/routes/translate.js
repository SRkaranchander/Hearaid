const express = require('express');
const router = express.Router();

const translationCache = new Map();

/**
 * POST /api/translate
 * Body: { text: string, from?: string, to: string }
 * Translates text using Google Translate API with caching.
 */
router.post('/', async (req, res) => {
  try {
    const { text, from = 'auto', to = 'en' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for translation' });
    }

    const cleanText = text.trim();
    const targetLang = (to || 'en').toLowerCase().split('-')[0];
    const sourceLang = (from || 'auto').toLowerCase().split('-')[0];

    // If source and target are the same language, return immediately
    if (sourceLang === targetLang && sourceLang !== 'auto') {
      return res.json({
        originalText: cleanText,
        translatedText: cleanText,
        from: sourceLang,
        to: targetLang
      });
    }

    const cacheKey = `${sourceLang}_${targetLang}_${cleanText.toLowerCase()}`;
    if (translationCache.has(cacheKey)) {
      return res.json({
        originalText: cleanText,
        translatedText: translationCache.get(cacheKey),
        from: sourceLang,
        to: targetLang,
        cached: true
      });
    }

    // Query Google Translate public gtx endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sourceLang
    )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate API returned status ${response.status}`);
    }

    const data = await response.json();
    let translated = '';

    // Google Translate returns array of segments: data[0] = [[segment1, orig1], [segment2, orig2], ...]
    if (data && Array.isArray(data[0])) {
      translated = data[0].map((item) => (item && item[0] ? item[0] : '')).join('');
    }

    if (!translated) {
      translated = cleanText;
    }

    translationCache.set(cacheKey, translated);

    // Limit cache size to 1000 items
    if (translationCache.size > 1000) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    res.json({
      originalText: cleanText,
      translatedText: translated,
      from: sourceLang,
      to: targetLang
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    // Graceful fallback to original text if offline or API error
    res.json({
      originalText: req.body?.text || '',
      translatedText: req.body?.text || '',
      error: error.message
    });
  }
});

module.exports = router;
