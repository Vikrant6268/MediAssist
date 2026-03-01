import React from 'react';
import styles from './Header.module.css';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <h1 className={styles.title}>Medi <span className={styles.highlight}>Assistant</span></h1>
            </div>
            <ThemeToggle />
        </header>
    );
};

export default Header;
