import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Users,
  Gift,
  Ticket,
  Link2,
  FileText,
  LogOut,
  Menu
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import styles from './Sidebar.module.css';
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
const menuItems = [
  { path: '/dashboard', icon: BarChart3, label: 'Панель управления' },
  { path: '/cases', icon: Package, label: 'Управление кейсами' },
  { path: '/users', icon: Users, label: 'Пользователи' },
  { path: '/gifts', icon: Gift, label: 'Подарки' },
  { path: '/promocodes', icon: Ticket, label: 'Промокоды' },
  { path: '/referral-links', icon: Link2, label: 'Реферальные ссылки' },
  { path: '/logs', icon: FileText, label: 'Логи' },
];
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <>
      {}
      {isOpen && (
        <div
          className={`fixed inset-0 z-20 lg:hidden ${styles.sidebarOverlay}`}
          onClick={onToggle}
        />
      )}
      {}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${styles.sidebar} ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`flex items-center justify-between h-16 px-6 ${styles.sidebarHeader}`}>
          <div className={styles.headerContent}>
            <h1 className={styles.brandTitle}>Giftomus</h1>
            <p className={styles.brandSubtitle}>Admin Panel</p>
          </div>
          <button
            onClick={onToggle}
            className={`lg:hidden ${styles.menuToggle}`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <nav className={styles.navigation}>
          <div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <item.icon className={`w-5 h-5 ${styles.navIcon}`} />
                <span className={styles.navText}>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <div className={styles.logoutSection}>
            <button
              onClick={logout}
              className={styles.logoutButton}
            >
              <LogOut className={`w-5 h-5 ${styles.logoutIcon}`} />
              Выйти
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};