import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './ChatInterface.module.css';

const ChatInterface = ({ messages, isTyping, onSendMessage, onReset }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.statusIndicator}></div>
                    <h2>AI Medical Assistant</h2>
                </div>
                {messages.length > 0 && (
                    <button
                        className={styles.resetButton}
                        onClick={onReset}
                        title="Clear Chat History"
                        aria-label="Clear Chat History"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                )}
            </header>

            <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h3>How can I help you today?</h3>
                        <p>Upload a prescription to see extracted medicines and affordable generic alternatives.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.aiWrapper}`}>
                            <div className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
                                {msg.role === 'ai' && (
                                    <div className={styles.avatar}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                            <circle cx="12" cy="5" r="2"></circle>
                                            <path d="M12 7v4"></path>
                                            <line x1="8" y1="16" x2="8" y2="16"></line>
                                            <line x1="16" y1="16" x2="16" y2="16"></line>
                                        </svg>
                                    </div>
                                )}
                                <div className={`${styles.content} ${msg.role === 'ai' ? styles.markdownContent : ''}`}>
                                    {msg.role === 'ai' ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
                        <div className={`${styles.message} ${styles.aiMessage}`}>
                            <div className={styles.avatar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                    <circle cx="12" cy="5" r="2"></circle>
                                    <path d="M12 7v4"></path>
                                </svg>
                            </div>
                            <div className={styles.typingIndicator}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the medicines..."
                    className={styles.input}
                    disabled={isTyping}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!input.trim() || isTyping}
                    aria-label="Send message"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
