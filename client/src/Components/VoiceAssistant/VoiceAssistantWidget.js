import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { communityURL } from '../../Config/config';
import './VoiceAssistant.css';
import ClickSpark from '../animations/ClickSpark';
import { SUPPORTED_LANGUAGES, translateText, getBestVoiceForLanguage } from '../../Utils/multilingualSpeech';

const HEARAID_KNOWLEDGE = [
    {
        keywords: ['hearaid', 'what is hearaid', 'about hearaid', 'app'],
        response: "HearAid is an AI-powered sign language ecosystem designed to bridge communication gaps. It features real-time 3D sign language conversion, live camera sign recognition, structured syllabus courses, and a real-time community chat."
    },
    {
        keywords: ['convert', 'text to sign', '3d sign', 'translate text'],
        response: "You can visit the Convert page from the top menu. Enter any text or use your voice, and our interactive 3D avatar will perform the corresponding sign language animations in real-time!"
    },
    {
        keywords: ['learn', 'learn sign', 'course', 'basics', 'how to learn'],
        response: "To start learning, head over to the Learn Sign or Alphabet Syllabus section. You will find interactive cards, videos, and step-by-step guides covering the ASL alphabet, greetings, numbers, and common phrases."
    },
    {
        keywords: ['sign to text', 'camera', 'live sign', 'hand tracking', 'detect sign'],
        response: "The Live Sign feature uses your webcam and AI hand-pose detection models. It tracks 21 hand landmarks in real-time to translate your physical hand gestures directly into readable text on screen!"
    },
    {
        keywords: ['community', 'chat', 'connect', 'users', 'message'],
        response: "The Community tab connects you with other ASL learners and deaf community members. You can see active online users, send direct messages, and practice sign language together in real-time."
    },
    {
        keywords: ['asl', 'american sign language', 'what is asl'],
        response: "American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as spoken languages, with grammar that differs from English. It is expressed by movements of the hands and face."
    },
    {
        keywords: ['finger spelling', 'fingerspelling', 'alphabet'],
        response: "Fingerspelling is the process of spelling out words by signing individual letters of the manual alphabet. It is frequently used for proper names, technical terms, and words without a specific sign."
    },
    {
        keywords: ['hello', 'hi', 'hey', 'greetings'],
        response: "Hello! I am your HearAid AI Voice Assistant. How can I assist you with sign language or navigating HearAid today?"
    },
    {
        keywords: ['thank', 'thanks'],
        response: "You're very welcome! Feel free to ask me anything else about sign language or HearAid."
    }
];

function generateAIResponse(query) {
    const q = query.toLowerCase().trim();

    // Check pre-defined HearAid knowledge base first
    for (const item of HEARAID_KNOWLEDGE) {
        if (item.keywords.some(kw => q.includes(kw))) {
            return item.response;
        }
    }

    // Dynamic contextual responses for general queries
    if (q.includes('how are you')) {
        return "I'm doing great and ready to help you learn sign language!";
    }
    if (q.includes('who made you') || q.includes('creator')) {
        return "I was built for HearAid to make sign language learning and communication accessible to everyone through voice and AI.";
    }
    if (q.includes('help') || q.includes('what can you do')) {
        return "You can ask me questions about American Sign Language, how to use HearAid's 3D converter, camera sign detection, learning modules, or general knowledge. I will answer both in text and spoken voice!";
    }

    // Default intelligent educational response
    return `That's a great question about "${query}". In HearAid, we focus on combining visual sign language learning with AI assistance. Explore our Convert and Learn Sign sections to dive deeper, or ask me another question!`;
}

export default function VoiceAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [inputText, setInputText] = useState('');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate] = useState(1.0);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [messages, setMessages] = useState([
        {
            sender: 'assistant',
            text: "Hello! I'm your HearAid Voice Assistant. Tap the microphone or type below, and I'll answer you in spoken voice!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);

    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // Initialize Web Speech Synthesis & Recognition
    useEffect(() => {
        // Load speech synthesis voices
        const updateVoices = () => {
            if ('speechSynthesis' in window) {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
                if (defaultVoice) setSelectedVoice(defaultVoice);
            }
        };

        updateVoices();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setIsListening(false);
                if (transcript) {
                    handleUserSubmit(transcript);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [assistantLanguage, setAssistantLanguage] = useState(() => {
        return localStorage.getItem('hearaid_lang') || 'en-US';
    });

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // Speak function using SpeechSynthesis
    const speakText = async (text) => {
        if (!('speechSynthesis' in window)) {
            console.warn("Speech synthesis is not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        let spokenText = text;
        if (!assistantLanguage.startsWith('en')) {
            try {
                spokenText = await translateText(text, assistantLanguage);
            } catch (err) {
                console.warn('Voice assistant translation error:', err);
            }
        }

        const utterance = new SpeechSynthesisUtterance(spokenText);
        const voice = selectedVoice || getBestVoiceForLanguage(assistantLanguage);
        if (voice) utterance.voice = voice;
        utterance.lang = assistantLanguage;
        utterance.rate = speechRate;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
        };

        utterance.onerror = (err) => {
            console.error("Speech synthesis error:", err);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking
    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Toggle Mic Listening
    const toggleListening = async () => {
        if (isSpeaking) {
            stopSpeaking();
        }

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
            console.error("Failed to start recognition:", e);
            setIsListening(false);
        }
    };

    // Handle Query Submission
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

        try {
            const res = await axios.post(`${communityURL}/voice/chat`, { message: text });
            const answer = res.data.response || generateAIResponse(text);

            const assistantMsg = {
                sender: 'assistant',
                text: answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsThinking(false);
            setMessages(prev => [...prev, assistantMsg]);

            if (autoSpeak) {
                speakText(answer);
            }
        } catch (error) {
            console.error("Error fetching voice response from server, falling back to local:", error);
            const answer = generateAIResponse(text);
            const assistantMsg = {
                sender: 'assistant',
                text: answer,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setIsThinking(false);
            setMessages(prev => [...prev, assistantMsg]);

            if (autoSpeak) {
                speakText(answer);
            }
        }
    };

    return (
        <>
            {/* Floating Mic Launcher Button */}
            <ClickSpark>
                <button
                    className={`voice-widget-btn ${isListening ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    title="HearAid AI Voice Assistant"
                >
                    <i className={`fas ${isOpen ? 'fa-times' : isListening ? 'fa-microphone-alt' : 'fa-microphone'} fs-4`}></i>
                </button>
            </ClickSpark>

            {/* Floating Drawer Modal */}
            {isOpen && (
                <div className="voice-drawer">
                    {/* Header */}
                    <div className="voice-drawer-header">
                        <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-robot text-gradient fs-4"></i>
                            <div>
                                <h6 className="m-0 font-weight-bold" style={{ color: 'var(--text-primary)' }}>HearAid Voice Assistant</h6>
                                <small className="text-muted">Ask anything — Answers in Voice</small>
                            </div>
                        </div>
                        <ClickSpark>
                            <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setIsOpen(false)}>
                                <i className="fas fa-times fs-5"></i>
                            </button>
                        </ClickSpark>
                    </div>

                    {/* 3D Orb Visualizer Section */}
                    <div className="voice-orb-container">
                        <div className={`voice-orb ${isListening ? 'listening' : isSpeaking ? 'speaking' : isThinking ? 'thinking' : ''}`}>
                            <i className={`fas ${isListening ? 'fa-microphone' : isSpeaking ? 'fa-volume-up' : isThinking ? 'fa-cog' : 'fa-wave-square'}`}></i>
                        </div>

                        {/* Status Label */}
                        <div className="mt-2 text-center">
                            <span className="badge rounded-pill px-3 py-1" style={{
                                background: isListening ? 'rgba(239, 68, 68, 0.15)' : isSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 132, 199, 0.15)',
                                color: isListening ? '#ef4444' : isSpeaking ? '#10b981' : 'var(--accent-cyan)'
                            }}>
                                {isListening ? '🎙 Listening to your voice...' : isSpeaking ? '🔊 Speaking response...' : isThinking ? '🧠 Thinking...' : 'Ready — Click mic or type below'}
                            </span>
                        </div>

                        {/* Sound Wave Animation */}
                        <div className={`sound-wave ${(isListening || isSpeaking) ? 'active' : ''}`}>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                            <div className="sound-wave-bar"></div>
                        </div>
                    </div>

                    {/* Voice Controls Bar */}
                    <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom flex-wrap gap-2" style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.02)' }}>
                        <div className="d-flex align-items-center gap-2">
                            <label className="m-0 text-muted">Lang:</label>
                            <select
                                className="form-select form-select-sm py-0"
                                style={{ width: '105px', fontSize: '0.75rem' }}
                                value={assistantLanguage}
                                onChange={(e) => {
                                    const lang = e.target.value;
                                    setAssistantLanguage(lang);
                                    localStorage.setItem('hearaid_lang', lang);
                                    const bestV = getBestVoiceForLanguage(lang);
                                    if (bestV) setSelectedVoice(bestV);
                                }}
                            >
                                {SUPPORTED_LANGUAGES.map((l) => (
                                    <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <label className="m-0 text-muted">Voice:</label>
                            <select
                                className="form-select form-select-sm py-0"
                                style={{ width: '115px', fontSize: '0.75rem' }}
                                value={selectedVoice?.name || ''}
                                onChange={(e) => {
                                    const v = voices.find(v => v.name === e.target.value);
                                    if (v) setSelectedVoice(v);
                                }}
                            >
                                {voices.map((v, i) => (
                                    <option key={i} value={v.name}>{v.name.slice(0, 16)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <ClickSpark>
                                <button
                                    className={`btn btn-sm ${autoSpeak ? 'btn-outline-info' : 'btn-outline-secondary'} py-0 px-2`}
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => setAutoSpeak(!autoSpeak)}
                                    title="Toggle Auto Voice Answer"
                                >
                                    <i className={`fas ${autoSpeak ? 'fa-volume-up' : 'fa-volume-mute'} me-1`}></i>
                                    {autoSpeak ? 'Auto Voice ON' : 'Muted'}
                                </button>
                            </ClickSpark>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="voice-chat-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-bubble ${msg.sender}`}>
                                <div>{msg.text}</div>
                                {msg.sender === 'assistant' && (
                                    <div className="chat-bubble-actions">
                                        <ClickSpark>
                                            <button className="bubble-btn" onClick={() => speakText(msg.text)}>
                                                <i className="fas fa-volume-up me-1"></i> Speak Again
                                            </button>
                                        </ClickSpark>
                                        <ClickSpark>
                                            <button className="bubble-btn" onClick={() => navigator.clipboard.writeText(msg.text)}>
                                                <i className="fas fa-copy me-1"></i> Copy
                                            </button>
                                        </ClickSpark>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isThinking && (
                            <div className="chat-bubble assistant">
                                <i className="fas fa-spinner fa-spin me-2"></i> Generating answer...
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    <div className="quick-prompts">
                        {[
                            "What is ASL?",
                            "How to use HearAid Convert?",
                            "Teach me fingerspelling",
                            "How does Live Sign work?"
                        ].map((prompt, i) => (
                            <ClickSpark key={i}>
                                <div className="quick-prompt-chip" onClick={() => handleUserSubmit(prompt)}>
                                    {prompt}
                                </div>
                            </ClickSpark>
                        ))}
                    </div>

                    {/* Input Footer */}
                    <div className="voice-footer">
                        <ClickSpark>
                            <button
                                className={`mic-toggle-btn ${isListening ? 'listening' : ''}`}
                                onClick={toggleListening}
                                title={isListening ? "Stop listening" : "Click to Speak"}
                            >
                                <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                            </button>
                        </ClickSpark>

                        <input
                            type="text"
                            className="voice-input-field"
                            placeholder={isListening ? "Listening..." : "Ask in text or click mic to speak..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
                        />

                        <ClickSpark>
                            <button className="send-btn" onClick={() => handleUserSubmit()}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </ClickSpark>
                    </div>
                </div>
            )}
        </>
    );
}
