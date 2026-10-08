const express = require('express');
const router = express.Router();

const HEARAID_KNOWLEDGE_BASE = [
  {
    keywords: ['hearaid', 'what is hearaid', 'about', 'app', 'system', 'ecosystem', 'project'],
    response: "HearAid is an accessible AI platform bridging communication for Deaf and Hard-of-Hearing individuals. It features 3D Sign Translation, Live Camera Sign Recognition, interactive ASL learning, emergency SOS assistance, and real-time community chat."
  },
  {
    keywords: ['convert', 'text to sign', '3d sign', 'avatar', 'translate text', 'voice to sign'],
    response: "You can visit the Convert page to type or speak any text. Our 3D avatar will instantly perform the corresponding American Sign Language animations in real-time."
  },
  {
    keywords: ['learn', 'learn sign', 'course', 'basics', 'how to learn', 'syllabus', 'alphabet'],
    response: "Head to the Learn Sign or Alphabet Syllabus section to explore interactive 3D lessons, ASL alphabet letters, numbers, and common conversation phrases."
  },
  {
    keywords: ['live sign', 'sign to text', 'camera', 'webcam', 'hand tracking', 'gesture', 'recognize'],
    response: "The Live Sign feature uses your webcam with MediaPipe AI to track 21 hand landmarks, converting your physical sign gestures into written text on screen."
  },
  {
    keywords: ['sos', 'emergency', 'help', 'medical', 'doctor', 'ambulance'],
    response: "HearAid includes an Emergency SOS Mode accessible from the top bar. You can quickly select emergency messages like Medical Help, display 3D sign demonstrations for first responders, and trigger alerts."
  },
  {
    keywords: ['community', 'chat', 'connect', 'users', 'message', 'friends'],
    response: "The Community tab connects you with other ASL learners and deaf community members for instant messaging and practice in real time."
  },
  {
    keywords: ['asl', 'american sign language', 'what is asl', 'sign language'],
    response: "American Sign Language is a complete, natural visual language using hand movements, facial expressions, and postures to communicate."
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    response: "Hello! I am your HearAid AI Voice Assistant. How can I assist you with sign language or navigating HearAid today?"
  },
  {
    keywords: ['thank', 'thanks', 'thank you'],
    response: "You're very welcome! Feel free to ask me anything else about sign language or HearAid."
  },
  {
    keywords: ['how are you', 'how do you do'],
    response: "I'm doing great and ready to help you communicate and learn sign language!"
  },
  {
    keywords: ['who made you', 'who created you', 'creator'],
    response: "I was built for HearAid to make sign language learning and communication accessible to everyone through voice, 3D avatars, and AI."
  }
];

function generateIntelligentResponse(userQuery) {
  const q = (userQuery || '').toLowerCase().trim();

  for (const item of HEARAID_KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.response;
    }
  }

  // Common interactive contextual responses
  if (q.includes('name')) {
    return "I am the HearAid AI Voice Assistant, your companion for sign language and accessibility.";
  }
  if (q.includes('fingerspelling') || q.includes('finger spelling')) {
    return "Fingerspelling is the art of spelling words letter by letter using the ASL manual alphabet. You can practice all 26 letters in our Syllabus tab!";
  }
  if (q.includes('vowel') || q.includes('vowels')) {
    return "In ASL fingerspelling, vowels A, E, I, O, U are formed using distinct hand shapes. Check our 3D Alphabet Syllabus to see them animated!";
  }

  return `In HearAid, we combine real-time 3D sign language conversion, live camera recognition, and voice AI. Feel free to ask me about any sign, feature, or navigate through the top menu!`;
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // If Groq API key is available, call Groq
    if (apiKey && apiKey.trim() && !apiKey.includes('placeholder')) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'system',
                content: 'You are the HearAid AI Voice Assistant, a friendly and helpful AI built to assist deaf individuals, hard of hearing people, and sign language learners on the HearAid platform. Your answers should be warm, encouraging, and highly concise (typically 1 to 3 short sentences) because they will be read aloud. Answer queries accurately, keeping in mind the HearAid ecosystem features: 3D Sign Converter, Live Sign (webcam recognition), Learn Sign syllabus, Emergency SOS, and Community chat.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
          if (reply && reply.trim()) {
            return res.json({ response: reply.trim() });
          }
        } else {
          const errText = await response.text();
          console.warn('Groq API returned error, switching to fallback:', errText);
        }
      } catch (groqErr) {
        console.warn('Groq API call error, falling back to smart NLP engine:', groqErr.message);
      }
    }

    // Graceful smart local knowledge engine fallback
    const fallbackReply = generateIntelligentResponse(message);
    res.json({ response: fallbackReply });
  } catch (error) {
    console.error('Voice chat route error:', error);
    const fallbackReply = generateIntelligentResponse(req.body ? req.body.message : '');
    res.json({ response: fallbackReply });
  }
});

module.exports = router;
