'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface ChatWidgetProps {
    onClose: () => void;
}

export default function ChatWidget({ onClose }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoTTS, setAutoTTS] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };
        loadVoices();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        };
    }, []);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 1.1;
            utterance.pitch = 1.3;
            utterance.volume = 1;
            const idVoices = availableVoices.filter(v => v.lang.includes('id'));
            if (idVoices.length > 0) {
                const femaleVoice = idVoices.find(v =>
                    v.name.includes('Google') ||
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('perempuan')
                ) || idVoices[0];
                utterance.voice = femaleVoice;
            }
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Maaf, browser kamu belum mendukung fitur rekam suara (Gunakan Google Chrome).');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
            setIsListening(true);
            setInput('Sedang mendengarkan...');
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
        recognition.onerror = (event: any) => {
            console.error('STT Error:', event.error);
            setInput('');
            alert('Gagal mendengarkan suara. Pastikan izin mikrofon sudah diaktifkan.');
        };
        recognition.onend = () => {
            setIsListening(false);
            setInput((prev) => prev === 'Sedang mendengarkan...' ? '' : prev);
        };
        recognition.start();
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || input === 'Sedang mendengarkan...') return;
        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);
        stopSpeech();

        try {
            const response = await axios.post(`https://dppi.bpip.go.id/sila/chat`, {
                message: userMessage,
            });
            if (response.data && response.data.answer) {
                const aiAnswer = response.data.answer;
                setMessages((prev) => [...prev, { role: 'ai', content: aiAnswer }]);
                if (autoTTS) speak(aiAnswer);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMsg = 'Mohon maaf, sistem sedang mengalami kendala jaringan.';
            setMessages((prev) => [...prev, { role: 'ai', content: errorMsg }]);
            if (autoTTS) speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-2 right-2 z-50 w-[90vw] max-w-md h-150 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-slate-200 to-red-700 text-white">
                <div className="flex items-center gap-2">
                    <img src="/assets/images/logo-sipena.png" alt="SiPena" className="h-12 w-auto" />

                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setAutoTTS(!autoTTS)}
                        className={`text-xs px-2 py-1 rounded-full ${autoTTS ? 'bg-blue-500' : 'bg-slate-600'} transition`}
                    >
                        🔊 Suara {autoTTS ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-slate-600 rounded-full transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 font-medium">Halo! Saya SiPena</p>
                        <p className="text-gray-500 text-sm">Asisten AI yang siap membantu Anda menjawab pertanyaan seputar BPIP, Paskibraka, DPPI, dan wawasan kebangsaan lainnya</p>
                        <p className="text-xs text-gray-400">Klik mikrofon untuk bicara atau ketik pesan.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                ? 'bg-red-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none shadow border border-gray-200'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                {msg.role === 'ai' && (
                                    <div className="flex gap-2 mt-2 pt-1 border-t border-gray-100 text-xs">
                                        <button onClick={() => speak(msg.content)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                            🔊 Putar
                                        </button>
                                        <button onClick={stopSpeech} className="text-gray-500 hover:text-red-600 flex items-center gap-1">
                                            ⏹️ Henti
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl px-4 py-2 shadow flex items-center gap-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-gray-500">SiPena mengetik...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button
                        type="button"
                        onClick={startListening}
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition ${isListening
                            ? 'bg-red-100 text-red-500 animate-pulse'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? 'Sedang mendengarkan...' : 'Tulis pesan...'}
                        disabled={isListening}
                        rows={1}
                        className="flex-1 resize-none rounded-xl px-3 py-2 text-sm border border-gray-300 focus:outline-none"
                        style={{ minHeight: '40px', maxHeight: '80px' }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || input === 'Sedang mendengarkan...'}
                        className="shrink-0 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition"
                    >
                        Kirim
                    </button>
                </form>
                {isSpeaking && (
                    <div className="text-center mt-2">
                        <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Suara diputar...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}