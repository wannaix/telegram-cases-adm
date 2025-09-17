import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import styles from './LoginPage.module.css';
export const LoginPage: React.FC = () => {
  const [telegramId, setTelegramId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (telegramId === 'admin') {
        const mockToken = 'mock-admin-token';
        login(mockToken);
        navigate('/');
      } else {
        setError('Недостаточно прав доступа');
      }
    } catch (err) {
      setError('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Админ панель
            </h2>
            <p className={styles.subtitle}>
              Giftomus Administration
            </p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className={styles.errorAlert}>
                {error}
              </div>
            )}
            <div className={styles.inputGroup}>
              <label htmlFor="telegramId" className="sr-only">
                Telegram ID
              </label>
              <input
                id="telegramId"
                name="telegramId"
                type="text"
                required
                className={styles.input}
                placeholder="Введите Telegram ID"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              <span className={styles.buttonContent}>
                {isLoading ? (
                  <LoadingSpinner size="sm" variant="circle" />
                ) : (
                  'Войти в систему'
                )}
              </span>
            </button>
            <div className={styles.demoHint}>
              💡 Для демо используйте: <strong>admin</strong>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};