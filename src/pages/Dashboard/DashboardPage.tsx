import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import styles from './DashboardPage.module.css';
export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  });
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['chart-data', 30],
    queryFn: () => adminApi.getChartData(30),
  });
  if (statsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const statCards = stats ? [
    {
      title: 'Всего пользователей',
      value: stats.users.total.toLocaleString(),
      icon: Users,
      color: 'blue',
      change: `+${stats.users.today} сегодня`,
    },
    {
      title: 'Платящие за месяц',
      value: stats.users.payingMonth.toString(),
      icon: TrendingUp,
      color: 'green',
      change: `${stats.users.payingToday} сегодня`,
    },
    {
      title: 'Депозиты сегодня',
      value: `$${stats.finances.today.deposits.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      change: `${stats.finances.today.depositsCount} транзакций`,
    },
    {
      title: 'Выводы сегодня',
      value: `$${stats.finances.today.withdrawals.toLocaleString()}`,
      icon: TrendingDown,
      color: 'red',
      change: `${stats.finances.today.withdrawalsCount} транзакций`,
    },
  ] : [];
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Панель управления</h1>
        <p className={styles.subtitle}>
          Обзор статистики и активности приложения
        </p>
      </div>
      {}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statCardContent}>
              <div className={`${styles.iconContainer} ${styles[card.color]}`}>
                <card.icon className={styles.icon} />
              </div>
              <div className={styles.statInfo}>
                <p className={styles.statTitle}>
                  {card.title}
                </p>
                <p className={styles.statValue}>
                  {card.value}
                </p>
                <p className={styles.statChange}>
                  {card.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Депозиты и выводы (30 дней)
          </h3>
          {chartLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === 'deposits' ? 'Депозиты' : 'Выводы'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="deposits" fill="url(#depositsGradient)" name="deposits" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" fill="url(#withdrawalsGradient)" name="withdrawals" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="depositsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="withdrawalsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            Тренд депозитов
          </h3>
          {chartLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Депозиты']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="deposits" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      {}
      {stats && (
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>
              Статистика за месяц
            </h3>
            <div className={styles.summaryContent}>
              <div className={styles.summaryItem}>
                <p className={`${styles.summaryValue} ${styles.green}`}>
                  ${stats.finances.month.deposits.toLocaleString()}
                </p>
                <p className={styles.summaryLabel}>Общие депозиты</p>
              </div>
              <div className={styles.summaryItem}>
                <p className={`${styles.summaryValue} ${styles.red}`}>
                  ${stats.finances.month.withdrawals.toLocaleString()}
                </p>
                <p className={styles.summaryLabel}>Общие выводы</p>
              </div>
              <div className={styles.summaryItem}>
                <p className={`${styles.summaryValue} ${styles.blue}`}>
                  {stats.users.month}
                </p>
                <p className={styles.summaryLabel}>Новые пользователи</p>
              </div>
              <div className={styles.summaryItem}>
                <p className={`${styles.summaryValue} ${styles.purple}`}>
                  {stats.users.payingMonth}
                </p>
                <p className={styles.summaryLabel}>Платящие пользователи</p>
              </div>
            </div>
          </div>
          {}
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>
              Баланс поставщика товаров
            </h3>
            <div className={styles.balanceCard}>
              <div>
                <Wallet className={styles.balanceIcon} />
                <p className={styles.balanceValue}>
                  ${(stats.supplierBalance || 0).toLocaleString()}
                </p>
                <p className={styles.balanceLabel}>Текущий баланс</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};