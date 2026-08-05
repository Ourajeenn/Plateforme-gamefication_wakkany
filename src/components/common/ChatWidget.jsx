import React, { useState, useRef, useEffect } from 'react';
import useChat from '../../hooks/useChat';

export default function ChatWidget({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [view, setView] = useState('global');
    const { messages, assistantMessages, sendMessage, sendAssistantMessage, loading } = useChat(user);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, assistantMessages, isOpen, view]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const success = view === 'assistant'
            ? await sendAssistantMessage(inputValue)
            : await sendMessage(inputValue);
        if (success) {
            setInputValue('');
        }
    };

    if (!user) return null;

    return (
        <div className={`fixed bottom-4 left-4 z-[100] flex flex-col items-start pointer-events-none md:left-auto md:right-4 md:items-end`}>
            {/* Chat Window */}
            <div className={`
                pointer-events-auto relative bg-zinc-950/95 backdrop-blur-xl border border-[#c28e3a]/30 
                rounded-2xl overflow-hidden transition-all duration-300 flex flex-col origin-bottom-left md:origin-bottom-right
                ${isOpen ? 'w-[calc(100vw-2rem)] md:w-80 h-96 mb-4 opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-95'}
            `}>
                {/* Visible close button (overlay) for accessibility */}
                <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Fermer le chat"
                    className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-zinc-800/80 text-zinc-200 flex items-center justify-center hover:bg-zinc-700"
                >
                    <iconify-icon icon="mdi:close" width="16" />
                </button>
                <div className="bg-zinc-900 border-b border-white/10 p-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <iconify-icon icon="mdi:message-square" className="text-[#c28e3a]"></iconify-icon>
                            <h3 className="font-heading font-bold text-sm">Chat Wakkany</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} aria-label="Fermer le chat" className="text-zinc-400 hover:text-white">
                            <iconify-icon icon="mdi:x"></iconify-icon>
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setView('global')}
                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${view === 'global' ? 'bg-[#c28e3a] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                            Global
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('assistant')}
                            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${view === 'assistant' ? 'bg-[#c28e3a] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                            Assistant
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-hide">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
                            Connexion...
                        </div>
                    ) : (view === 'assistant' ? assistantMessages : messages).length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm italic">
                            {view === 'assistant'
                                ? 'Pose une question à l’assistant AI.'
                                : 'Aucun message pour le moment.'}
                        </div>
                    ) : (
                        (view === 'assistant' ? assistantMessages : messages).map((msg) => {
                            const isMeByName = msg.username === user.name;
                            const isAssistant = msg.assistant && msg.username === 'Wakkany Assistant';
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMeByName ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-zinc-500 mb-1">
                                        {isAssistant ? 'Assistant' : isMeByName ? 'Moi' : msg.username}
                                        {msg.academy && !isAssistant && <span className="ml-1 text-[#a855f7]">({msg.academy})</span>}
                                    </span>
                                    <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] break-words ${isMeByName ? 'bg-[#c28e3a] text-black rounded-tr-none' : isAssistant ? 'bg-blue-600 text-white rounded-tl-none' : 'bg-zinc-800 text-white rounded-tl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-2 border-t border-white/10 flex gap-2">
                    <label htmlFor="chat-widget-input" className="sr-only">Votre message</label>
                    <input 
                        id="chat-widget-input"
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={view === 'assistant' ? 'Pose une question à l’assistant...' : 'Votre message...'}
                        aria-label="Votre message"
                        className="flex-1 bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c28e3a]/50"
                    />
                    <button type="submit" disabled={!inputValue.trim()} className="bg-[#c28e3a] text-black w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-50">
                        <iconify-icon icon="mdi:send" width="16"></iconify-icon>
                    </button>
                </form>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
                className={`
                    pointer-events-auto w-14 h-14 rounded-full bg-[#c28e3a] text-black flex items-center justify-center
                    shadow-xl shadow-[#c28e3a]/20 transition-transform hover:scale-110 active:scale-95
                    ${isOpen ? 'hidden' : 'flex'}
                `}
            >
                <iconify-icon icon="mdi:message-circle" width="24"></iconify-icon>
            </button>
        </div>
    );
}

