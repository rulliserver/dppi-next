// app/sipena/Sipena.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Tambahkan deklarasi TypeScript untuk Web Speech API biar gak error
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

export default function Sipena() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // State baru untuk STT & TTS
    const [autoTTS, setAutoTTS] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // ==========================================
    // 1. SETUP SUARA (TEXT-TO-SPEECH)
    // ==========================================
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };

        loadVoices();
        // Browser kadang butuh waktu untuk nge-load suara
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
            utterance.volume = 1;       // Volume maksimum

            // Filter cari suara bahasa Indonesia
            const idVoices = availableVoices.filter(v => v.lang.includes('id'));

            if (idVoices.length > 0) {
                // Prioritaskan suara dengan nama yang mengindikasikan female voice
                const femaleVoice = idVoices.find(v =>
                    v.name.includes('Google') ||
                    v.name.toLowerCase().includes('female') ||
                    v.name.toLowerCase().includes('perempuan')
                ) || idVoices[0];

                utterance.voice = femaleVoice;

                // Debug: console.log pakai suara apa
                console.log('Using voice:', femaleVoice.name);
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

    // ==========================================
    // 2. SETUP MIC (SPEECH-TO-TEXT)
    // ==========================================
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Maaf, browser kamu belum mendukung fitur rekam suara (Gunakan Google Chrome).');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID'; // Deteksi bahasa Indonesia
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setInput('Sedang mendengarkan...'); // Indikator visual
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript); // Masukkan hasil omongan ke textbox
        };

        recognition.onerror = (event: any) => {
            console.error('STT Error:', event.error);
            setInput('');
            alert('Gagal mendengarkan suara. Pastikan izin mikrofon sudah diaktifkan.');
        };

        recognition.onend = () => {
            setIsListening(false);
            // Kalo gak dapet apa-apa, kosongkan lagi
            setInput((prev) => prev === 'Sedang mendengarkan...' ? '' : prev);
        };

        recognition.start();
    };

    // ==========================================
    // 3. LOGIKA KIRIM PESAN
    // ==========================================
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        // Cegah kirim kalau isinya kosong atau tulisan "Sedang mendengarkan..."
        if (!input.trim() || input === 'Sedang mendengarkan...') return;

        const userMessage = input.trim();

        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);
        stopSpeech();

        try {
            const response = await axios.post(`http://localhost:8080/chat`, {
                message: userMessage,
            });

            if (response.data && response.data.answer) {
                const aiAnswer = response.data.answer;

                setMessages((prev) => [
                    ...prev,
                    { role: 'ai', content: aiAnswer },
                ]);

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
        <div className="flex flex-col h-screen bg-linear-to-br from-slate-50 to-slate-100 font-sans">

            {/* Header - Lebih Elegan */}
            <header className="bg-linear-to-r from-slate-800 to-white text-white border-b border-yellow-700/90 shadow-xl ">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center md:justify-between space-y-7 md:space-y-0">
                        <a href='/' className='flex mx-auto items-center text-accent flex-row relative font-medium transition-colors duration-300 hover:text-red-600 group'>
                            <span className='fas fa-chevron-left pr-2'></span>
                            Kembali ke beranda
                            <span className="absolute left-0 bottom-0 w-full h-0.5 bg-red-600 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>                        
                        </a>

                        <div className="flex items-center mx-auto gap-3">
                            <img src="/assets/images/logo-sipena.png" alt="Logo Sipena" className='md:w-70 w-36' />
                        </div>
                        {/* Toggle Suara Otomatis - Desain Elegan */}
                        <div className="flex items-center mx-auto gap-3 px-4 py-2 bg-slate-800/50 rounded-xl backdrop-blur-sm">
                            <span className="text-sm font-medium text-slate-200">Suara Otomatis</span>
                            <button
                                onClick={() => {
                                    setAutoTTS(!autoTTS);
                                    stopSpeech();
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${autoTTS ? 'bg-blue-500' : 'bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${autoTTS ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Room Area - Desain Lebih Bersih */}
            <div className="flex-1 max-w-6xl w-full mx-auto  overflow-y-auto px-6 py-8 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center  text-center space-y-6">
                        <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-bold text-slate-700 mb-2">Selamat Datang</h2>
                            <p className="text-slate-500">Silakan ajukan pertanyaan atau gunakan mikrofon untuk berbicara langsung dengan asisten SiPena.</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            <div className={`max-w-[80%] lg:max-w-[70%] ${msg.role === 'user'
                                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'bg-white text-slate-700 shadow-md border border-slate-200'
                                } rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl`}>

                                <div className="px-5 py-4">
                                    <div className={`text-xs font-semibold mb-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                        {msg.role === 'user' ? 'ANDA' : 'SIPENA ASSISTANT'}
                                    </div>
                                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                        {msg.content}
                                    </p>
                                </div>

                                {msg.role === 'ai' && (
                                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex gap-3">
                                        <button
                                            onClick={() => speak(msg.content)}
                                            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m0 0a5 5 0 007.072 0m-7.072 0L3 21m3.586-3.586L3 21m12.728 0l3.586-3.586M21 21l-3.586-3.586"></path>
                                            </svg>
                                            Putar Suara
                                        </button>
                                        <button
                                            onClick={stopSpeech}
                                            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-red-600 transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                                            </svg>
                                            Hentikan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl shadow-md border border-slate-200 px-5 py-4 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm text-slate-500">SiPena sedang mengetik...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-8px_25px_-12px_rgba(0,0,0,0.1)] sticky bottom-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                        {/* Tombol Mikrofon */}
                        <button
                            type="button"
                            onClick={startListening}
                            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${isListening
                                ? 'bg-red-50 border-2 border-red-400 text-red-500 animate-pulse shadow-lg'
                                : 'bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-blue-500 hover:border-blue-200'
                                }`}
                            title="Klik untuk bicara"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                            </svg>
                        </button>

                        {/* Input Text */}
                        <div className="flex-1 relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? 'Sedang mendengarkan...' : 'Tulis pesan Anda di sini...'}
                                disabled={isListening}
                                rows={1}
                                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none focus:outline-none ${isListening
                                    ? 'bg-red-50 border-red-200 text-slate-500'
                                    : 'bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-700'
                                    }`}
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                        </div>

                        {/* Tombol Kirim */}
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim() || input === 'Sedang mendengarkan...'}
                            className="shrink-0 h-12 px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-medium rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    <span>Mengirim</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                                    </svg>
                                    <span>Kirim</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Indikator Status */}
                    {isSpeaking && (
                        <div className="mt-3 text-center">
                            <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Sedang membacakan pesan...
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}