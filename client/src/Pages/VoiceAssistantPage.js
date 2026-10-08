import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { communityURL } from '../Config/config';
import '../Components/VoiceAssistant/VoiceAssistant.css';

const HEARAID_FULL_KNOWLEDGE = [
    {
        keywords: ['hearaid', 'what is hearaid', 'overview', 'ecosystem'],
        response: "HearAid is a complete AI-powered sign language ecosystem. It converts text and speech into 3D sign language avatars, translates physical camera signs into text, provides interactive syllabus lessons, and connects users through real-time community messaging."
    },
    {
        keywords: ['convert', '3d sign', 'text to sign', 'avatar'],
        response: "Our 3D Sign Converter translates typed or spoken sentences into natural 3D character avatar animations, helping you visualize real-world sign language gestures instantaneously."
    },
    {
        keywords: ['learn', 'syllabus', 'lessons', 'alphabet'],
        response: "HearAid provides structured learning modules covering the manual ASL alphabet, basic greetings, family terms, numbers, and common everyday expressions."
    },
    {
        keywords: ['camera', 'live sign', 'sign to text', 'hand tracking'],
        response: "Live Sign uses MediaPipe AI hand tracking to follow 21 joint points on your hands, converting your real-time sign gestures into clear written text."
    },
    {
        keywords: ['community', 'chat', 'messaging'],
        response: "Connect with fellow learners and native ASL signers through our Socket.io powered instant messaging community platform."
    },
    {
        keywords: ['asl', 'american sign language'],
        response: "American Sign Language is a rich visual language using hand shape, movement, location, orientation, and non-manual signals like facial expressions."
    }
];

export default function VoiceAssistantPage() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [inputText, setInputText] = useState('');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(1.0);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: "Welcome to HearAid Voice Assistant! Speak your question using the mic or type it below. I will answer you both visually and in clear spoken voice.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        const updateVoices = () => {
            if ('speechSynthesis' in window) {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                const engVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                if (engVoice) setSelectedVoice(engVoice);
            }
        };

        updateVoices();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                if (transcript) handleUserSubmit(transcript);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = speechRate;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const toggleListening = async () => {
        if (isSpeaking) stopSpeaking();

        if (isListening) {
            try {
                recognitionRef.current?.stop();
            } catch (_) {}
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
            return;
        }

        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
            }
        } catch (err) {
            console.error("Microphone permission denied:", err);
            alert("Microphone access was denied. Please allow microphone access in your browser address bar.");
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let finalTranscript = '';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let full = '';
                for (let i = 0; i < event.results.length; i++) {
                    full += event.results[i][0].transcript;
                }
                finalTranscript = full.trim();
                setInputText(finalTranscript);
            };

            recognition.onerror = (event) => {
                console.warn("Speech recognition notice:", event?.error);
                setIsListening(false);
                if (event?.error === 'not-allowed') {
                    alert("Microphone access is blocked. Please allow microphone permissions in your browser URL bar.");
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                if (finalTranscript && finalTranscript.trim()) {
                    handleUserSubmit(finalTranscript.trim());
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.error("Error starting speech recognition:", e);
            setIsListening(false);
        }
    };

    const handleUserSubmit = async (queryText) => {
        const text = queryText || inputText;
        if (!text.trim()) return;

        stopSpeaking();

        const userMsg = {
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsThinking(true);

        const getLocalResponse = (qText) => {
            const q = qText.toLowerCase();
            for (const item of HEARAID_FULL_KNOWLEDGE) {
                if (item.keywords.some(kw => q.includes(kw))) {
                    return item.response;
                }
            }
            return "In HearAid, we combine visual 3D sign language rendering with AI learning context. Ask me anything else about sign language or HearAid features!";
        };

        try {
            const res = await axios.post(`${communityURL}/voice/chat`, { message: text });
            const answer = res.data.response || getLocalResponse(text);

            const assistantMsg = {
                sender: 'assistant',
                text: answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsThinking(false);
            setMessages(prev => [...prev, assistantMsg]);

            if (autoSpeak) speakText(answer);
        } catch (error) {
            console.error("Error fetching voice response from server, falling back to local:", error);
            const answer = getLocalResponse(text);

            const assistantMsg = {
                sender: 'assistant',
                text: answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsThinking(false);
            setMessages(prev => [...prev, assistantMsg]);

            if (autoSpeak) speakText(answer);
        }
    };

    return (
        <div className="voice-page-container">
            <div className="text-center mb-4">
                <span className="badge rounded-pill bg-primary px-3 py-2 mb-2">AI Voice Assistant</span>
                <h1 className="display-5 font-weight-bold text-gradient">Speak & Listen Assistant</h1>
                <p className="text-secondary max-width-600 mx-auto">
                    Ask any question aloud or by typing. HearAid AI will process your question and answer you in spoken voice in real-time.
                </p>
            </div>

            <div className="voice-hero-card">
                {/* Visual Orb & Sound Wave */}
                <div className="voice-orb-container mb-4">
                    <div className={`voice-orb ${isListening ? 'listening' : isSpeaking ? 'speaking' : isThinking ? 'thinking' : ''}`}>
                        <i className={`fas ${isListening ? 'fa-microphone' : isSpeaking ? 'fa-volume-up' : isThinking ? 'fa-cog' : 'fa-wave-square'}`}></i>
                    </div>

                    <div className="mt-3 text-center">
                        <h5 className="m-0 text-gradient">
                            {isListening ? 'Listening to your voice...' : isSpeaking ? 'Speaking response aloud...' : isThinking ? 'Processing answer...' : 'Ready for your question'}
                        </h5>
                    </div>

                    <div className={`sound-wave ${(isListening || isSpeaking) ? 'active' : ''} mt-3`}>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                        <div className="sound-wave-bar"></div>
                    </div>
                </div>

                {/* Voice Settings Toolbar */}
                <div className="row g-3 align-items-center mb-4 p-3 rounded-3" style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)' }}>
                    <div className="col-md-5">
                        <label className="form-label text-muted small m-0 me-2">Voice Accent:</label>
                        <select
                            className="form-select form-select-sm"
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                                const v = voices.find(v => v.name === e.target.value);
                                if (v) setSelectedVoice(v);
                            }}
                        >
                            {voices.map((v, i) => (
                                <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label text-muted small m-0 me-2">Speed: {speechRate}x</label>
                        <input
                            type="range"
                            className="form-range"
                            min="0.7"
                            max="1.4"
                            step="0.1"
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className="col-md-3 text-end">
                        <button
                            className={`btn btn-sm ${autoSpeak ? 'btn-primary' : 'btn-outline-secondary'} w-100`}
                            onClick={() => setAutoSpeak(!autoSpeak)}
                        >
                            <i className={`fas ${autoSpeak ? 'fa-volume-up' : 'fa-volume-mute'} me-2`}></i>
                            {autoSpeak ? 'Auto Voice On' : 'Voice Muted'}
                        </button>
                    </div>
                </div>

                {/* Chat Output Window */}
                <div className="voice-chat-body" style={{ height: '360px', border: '1px solid var(--border-light)', borderRadius: '16px', background: 'var(--bg-surface)' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-bubble ${msg.sender}`}>
                            <div>{msg.text}</div>
                            {msg.sender === 'assistant' && (
                                <div className="chat-bubble-actions">
                                    <button className="bubble-btn" onClick={() => speakText(msg.text)}>
                                        <i className="fas fa-volume-up me-1"></i> Speak Answer
                                    </button>
                                    <button className="bubble-btn" onClick={() => navigator.clipboard.writeText(msg.text)}>
                                        <i className="fas fa-copy me-1"></i> Copy Text
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {isThinking && (
                        <div className="chat-bubble assistant">
                            <i className="fas fa-spinner fa-spin me-2"></i> Thinking...
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="row g-2 mt-3">
                    {[
                        "What is American Sign Language?",
                        "How do I convert text to 3D sign?",
                        "How does camera sign recognition work?",
                        "Give me tips for learning finger spelling"
                    ].map((p, idx) => (
                        <div key={idx} className="col-6 col-md-3">
                            <button className="btn btn-sm btn-outline-primary w-100 text-truncate" onClick={() => handleUserSubmit(p)}>
                                {p}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bottom Input Area */}
                <div className="voice-footer mt-4">
                    <button
                        className={`mic-toggle-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                    >
                        <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                    </button>

                    <input
                        type="text"
                        className="voice-input-field"
                        placeholder={isListening ? "Listening..." : "Type your question or click mic to speak..."}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
                    />

                    <button className="send-btn" onClick={() => handleUserSubmit()}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
