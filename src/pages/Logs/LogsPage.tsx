import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  target?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  admin: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}
export const LogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['logs', page, limit],
    queryFn: () => adminApi.getLogs({ page, limit })
  });
  const logs: AdminLog[] = logsData?.logs || [];
  const totalPages = Math.ceil((logsData?.total || 0) / limit);
  const getActionColor = (action: string) => {
    switch (action) {
      case 'AUTH':
        return 'bg-blue-100 text-blue-800';
      case 'CREATE_CASE':
      case 'CREATE_GIFT':
      case 'CREATE_PROMOCODE':
      case 'CREATE_REFERRAL_LINK':
        return 'bg-green-100 text-green-800';
      case 'UPDATE_CASE':
      case 'UPDATE_PROMOCODE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE_CASE':
      case 'DELETE_PROMOCODE':
        return 'bg-red-100 text-red-800';
      case 'VIEW_USERS':
      case 'VIEW_CASES':
      case 'VIEW_STATS':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getActionText = (action: string) => {
    switch (action) {
      case 'AUTH':
        return 'Авторизация';
      case 'CREATE_CASE':
        return 'Создание кейса';
      case 'UPDATE_CASE':
        return 'Обновление кейса';
      case 'DELETE_CASE':
        return 'Удаление кейса';
      case 'CREATE_GIFT':
        return 'Создание подарка';
      case 'CREATE_PROMOCODE':
        return 'Создание промокода';
      case 'UPDATE_PROMOCODE':
        return 'Обновление промокода';
      case 'DELETE_PROMOCODE':
        return 'Удаление промокода';
      case 'CREATE_REFERRAL_LINK':
        return 'Создание реф. ссылки';
      case 'VIEW_USERS':
        return 'Просмотр пользователей';
      case 'VIEW_CASES':
        return 'Просмотр кейсов';
      case 'VIEW_STATS':
        return 'Просмотр статистики';
      default:
        return action;
    }
  };
  const formatAdminName = (admin: AdminLog['admin']) => {
    if (admin.firstName || admin.lastName) {
      return `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    }
    return admin.username || 'Неизвестный админ';
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Логи действий админов</h1>
        <div className="text-sm text-gray-500">
          Всего записей: {logsData?.total || 0}
        </div>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Администратор
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действие
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цель
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatAdminName(log.admin)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                    {getActionText(log.action)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {log.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.target ? (
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {log.target}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Логи не найдены
          </div>
        )}
      </div>
      {}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          
          <span className="text-sm text-gray-600">
            Страница {page} из {totalPages}
          </span>
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};