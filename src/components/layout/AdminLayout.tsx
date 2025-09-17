import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './AdminLayout.module.css';
export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className={styles.adminLayout}>
      <div className={styles.contentWrapper}>
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className={styles.mainContent}>
          <Header onSidebarToggle={toggleSidebar} />
          <main className={styles.pageContent}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};