"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, Ticket, Globe, X, ChevronRight, Loader2, Info } from 'lucide-react';
import './Chatbot.css';

const TRANSLATIONS = {
    en: {
        welcome: "Hello! I am CityMind. I can help you with city info, apply for permissions, or raise a complaint ticket.",
        collectIssue: "I can help you raise a complaint. First, what type of issue are you facing?",
        collectLoc: "Got it. What is the approximate location or address of this issue?",
        collectDesc: "Please provide a brief description of the problem.",
        ticketCreated: "Your ticket has been registered at the 1st Level (Municipality Corporation). If it is not resolved in 7 days, it will be automatically escalated to the District Commissioner.",
        historyEmpty: "You don't have any tickets yet.",
        historyAvailable: "Here is your ticket history:",
        fallback: "I'm sorry, I couldn't understand that. What would you like to do?",
        raiseComplaint: "Raise a complaint",
        showHistory: "Show my tickets"
    },
    kn: {
        welcome: "ನಮಸ್ಕಾರ! ನಾನು ಸಿಟಿಮೈಂಡ್. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ದೂರನ್ನು ದಾಖಲಿಸಬಹುದು.",
        collectIssue: "ನಾನು ದೂರು ದಾಖಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಸಮಸ್ಯೆ ಏನು?",
        collectLoc: "ಆಯಿತು. ಈ ಸಮಸ್ಯೆಯ ಸ್ಥಳ ಅಥವಾ ವಿಳಾಸವನ್ನು ನೀಡಿ.",
        collectDesc: "ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆಯನ್ನು ನೀಡಿ.",
        ticketCreated: "ನಿಮ್ಮ ದೂರನ್ನು ನಗರಸಭೆಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ. 7 ದಿನಗಳಲ್ಲಿ ಬಗೆಹರಿಯದಿದ್ದರೆ, ಅದು ಜಿಲ್ಲಾಧಿಕಾರಿಗಳಿಗೆ ವರ್ಗಾವಣೆಯಾಗುತ್ತದೆ.",
        historyEmpty: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ದೂರನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
        historyAvailable: "ನಿಮ್ಮ ದೂರುಗಳ ಇತಿಹಾಸ ಇಲ್ಲಿದೆ:",
        fallback: "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?",
        raiseComplaint: "ದೂರು ದಾಖಲಿಸಿ",
        showHistory: "ನನ್ನ ದೂರುಗಳು"
    },
    hi: {
        welcome: "नमस्ते! मैं CityMind हूँ। मैं आपकी सहायता कर सकता हूँ, आप शिकायत दर्ज कर सकते हैं।",
        collectIssue: "मैं शिकायत दर्ज करने में मदद करूँगा। आपकी समस्या क्या है?",
        collectLoc: "ठीक है। कृपया इस समस्या का स्थान या पता बताएं।",
        collectDesc: "कृपया समस्या का संक्षिप्त विवरण दें।",
        ticketCreated: "आपकी शिकायत नगर निगम में दर्ज कर ली गई है। यदि यह 7 दिनों में हल नहीं होती है, तो यह जिला आयुक्त को भेज दी जाएगी।",
        historyEmpty: "आपने अभी तक कोई शिकायत दर्ज नहीं की है।",
        historyAvailable: "यहां आपके टिकट का इतिहास है:",
        fallback: "क्षमा करें, मुझे समझ नहीं आया। आप क्या करना चाहेंगे?",
        raiseComplaint: "शिकायत दर्ज करें",
        showHistory: "मेरे टिकट"
    }
};

type Language = 'en' | 'kn' | 'hi';
type Message = { type: 'bot' | 'user'; content: string | React.ReactNode; id: number };

export default function CityMindChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [currentLang, setCurrentLang] = useState<Language>('en');
    const [chatStage, _setChatStage] = useState<'neutral' | 'collect_issue' | 'collect_loc' | 'collect_desc'>('neutral');
    const chatStageRef = useRef(chatStage);

    const setChatStage = (stage: any) => {
        chatStageRef.current = stage;
        _setChatStage(stage);
    };

    const [currentDraft, setCurrentDraft] = useState<any>({});
    const [tickets, setTickets] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const translations = TRANSLATIONS[currentLang];

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(translations.welcome);
        }
        scrollToBottom();
    }, [isOpen, currentLang]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const addBotMessage = (content: string | React.ReactNode, delay = 1000) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev: Message[]) => [...prev, { type: 'bot', content, id: Date.now() }]);
        }, delay);
    };

    const addUserMessage = (content: string) => {
        setMessages((prev: Message[]) => [...prev, { type: 'user', content, id: Date.now() }]);
    };

    const processInput = (text: string) => {
        const lower = text.toLowerCase();

        const stage = chatStageRef.current;

        if (stage === 'collect_issue') {
            setCurrentDraft((prev: any) => ({ ...prev, issue: text }));
            setChatStage('collect_loc');
            addBotMessage(translations.collectLoc);
            return;
        } else if (stage === 'collect_loc') {
            setCurrentDraft((prev: any) => ({ ...prev, loc: text }));
            setChatStage('collect_desc');
            addBotMessage(translations.collectDesc);
            return;
        } else if (stage === 'collect_desc') {
            const finalDraft = { ...currentDraft, desc: text };
            createTicket(finalDraft);
            return;
        }

        if (lower.includes('complaint') || lower.includes('issue') || lower.includes('ticket') || lower.includes('pothole') || lower.includes('garbage') || lower.includes('streetlight')) {
            startComplaintFlow();
        } else if (lower.includes('history') || lower.includes('my tickets')) {
            showHistory();
        } else {
            addBotMessage(
                <div>
                    <p>{translations.fallback}</p>
                    <div className="suggested-chips">
                        <button className="chip" onClick={() => startComplaintFlow()}>{translations.raiseComplaint}</button>
                        <button className="chip" onClick={() => showHistory()}>{translations.showHistory}</button>
                    </div>
                </div>
            );
        }
    };

    const startComplaintFlow = () => {
        setChatStage('collect_issue');
        setCurrentDraft({});
        addBotMessage(
            <div>
                <p>{translations.collectIssue}</p>
                <div className="suggested-chips">
                    <button className="chip" onClick={() => handleChipInput("Pothole")}>Pothole</button>
                    <button className="chip" onClick={() => handleChipInput("Broken Streetlight")}>Broken Streetlight</button>
                    <button className="chip" onClick={() => handleChipInput("Garbage Issues")}>Garbage</button>
                </div>
            </div>
        );
    };

    const handleChipInput = (text: string) => {
        addUserMessage(text);
        processInput(text);
    };

    const createTicket = async (draft: any) => {
        setIsTyping(true);
        try {
            const ticketId = 'TKT-' + Math.floor(Math.random() * 90000 + 10000);
            const payload = {
                type: 'complaint',
                applicant: "CityMind AI Assistant",
                date: new Date().toISOString().split('T')[0],
                location: draft.loc || "Mysuru",
                status: "pending",
                details: {
                    issue: draft.issue,
                    description: draft.desc,
                    ticket_id: ticketId
                }
            };

            await fetch('http://localhost:8001/api/v1/forms/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            setIsTyping(false);
            setChatStage('neutral');

            addBotMessage(
                <div className="ui-card">
                    <p>{translations.ticketCreated}</p>
                    <div className="ticket-summary">
                        <p><strong>ID:</strong> {ticketId}</p>
                        <p><strong>Issue:</strong> {draft.issue}</p>
                        <p><span className="badge-warning">Status: Pending Review</span></p>
                    </div>
                </div>
            );
            
            // Refresh local history
            fetchHistory();
        } catch (e) {
            setIsTyping(false);
            addBotMessage("Sorry, I couldn't register your ticket at the moment. Please try again later.");
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:8001/api/v1/forms/submissions');
            const data = await res.json();
            // Filter only complaints from AI or specific user
            setTickets(data.filter((t: any) => t.type === 'complaint' || t.applicant === "CityMind AI Assistant"));
        } catch (e) {}
    };

    const showHistory = async () => {
        setIsTyping(true);
        await fetchHistory();
        setIsTyping(false);
        
        if (tickets.length === 0) {
            addBotMessage(translations.historyEmpty);
        } else {
            addBotMessage(
                <div>
                    <p>{translations.historyAvailable}</p>
                    {tickets.slice(0, 3).map((tk, idx) => (
                        <div key={idx} className="ui-card" style={{ marginBottom: "10px" }}>
                            <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                <strong>{tk.details?.ticket_id || tk.id}</strong>
                                <span className="badge-warning">{tk.status.toUpperCase()}</span>
                            </p>
                            <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{tk.details?.issue || tk.type}</p>
                            <p style={{ fontSize: '10px', color: '#64748b' }}>{tk.date}</p>
                        </div>
                    ))}
                    {tickets.length > 3 && (
                        <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '8px' }}>
                            View more in <a href="/citizen/tickets" style={{ color: '#1d4ed8', fontWeight: 'bold' }}>Track Status</a>
                        </p>
                    )}
                </div>
            );
        }
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        addUserMessage(inputValue);
        processInput(inputValue);
        setInputValue('');
    };

    if (!isOpen) {
        return (
            <button className="chatbot-launcher" onClick={() => setIsOpen(true)}>
                <MessageSquare size={24} />
                <span className="tooltip">City Mind AI</span>
            </button>
        );
    }

    return (
        <div className="chatbot-window">
            <div className="chatbot-header">
                <div className="bot-info">
                   <div className="bot-avatar">CM</div>
                   <div>
                       <h3>City Mind AI</h3>
                       <div className="status"><div className="dot"></div> Online</div>
                   </div>
                </div>
                <div className="header-actions">
                    <div className="lang-switcher">
                        <button className={currentLang === 'en' ? 'active' : ''} onClick={() => setCurrentLang('en')}>EN</button>
                        <button className={currentLang === 'kn' ? 'active' : ''} onClick={() => setCurrentLang('kn')}>ಕನ</button>
                        <button className={currentLang === 'hi' ? 'active' : ''} onClick={() => setCurrentLang('hi')}>हिं</button>
                    </div>
                    <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>
            </div>

            <div className="chatbot-body">
                {messages.map(m => (
                    <div key={m.id} className={`message ${m.type}-message`}>
                        <div className="message-content">{m.content}</div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message bot-message">
                        <div className="message-content"><Loader2 className="animate-spin" size={16} /></div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="chatbot-footer">
                <div className="input-wrapper">
                    <input 
                        placeholder="Type your question..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="send-btn" onClick={handleSend}><Send size={18} /></button>
                </div>
            </div>
        </div>
    );
}
