import React from 'react';
import { Menu } from 'lucide-react';
import styles from './Header.module.css';
interface HeaderProps {
  onSidebarToggle: () => void;
}
export const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.leftSection}>
          <button
            onClick={onSidebarToggle}
            className={styles.mobileMenuButton}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className={styles.title}>
            Dashboard
          </h2>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.dateDisplay}>
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </header>
  );
};