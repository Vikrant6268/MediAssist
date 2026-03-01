"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import UploadPrescription from '../components/UploadPrescription';
import ChatInterface from '../components/ChatInterface';
import styles from './page.module.css';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  const handleUpload = async (fileData) => {
    setHasUploaded(true);
    setMessages(prev => [...prev, { role: 'user', content: `Uploaded prescription: ${fileData.name}` }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract',
          fileName: fileData.name,
          mimeType: fileData.type,
          base64: fileData.base64
        })
      });

      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, there was an error processing your prescription." }]);
    }
  };

  const handleSendMessage = async (input) => {
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: input
        })
      });

      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I am having trouble connecting." }]);
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.contentGrid}>
          <div className={`${styles.leftColumn} ${hasUploaded ? styles.compact : ''}`}>
            <div className={styles.uploadCard}>
              <UploadPrescription onUpload={handleUpload} />
            </div>
          </div>

          <div className={styles.rightColumn}>
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
