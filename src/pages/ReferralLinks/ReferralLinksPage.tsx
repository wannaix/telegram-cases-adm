import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
interface ReferralLink {
  id: string;
  code: string;
  name?: string;
  description?: string;
  isActive: boolean;
  stats: {
    totalUsers: number;
    totalDeposits: number;
    depositsCount: number;
  };
  createdAt: string;
}
export const ReferralLinksPage: React.FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  });
  const queryClient = useQueryClient();
  const { data: linksData, isLoading } = useQuery({
    queryKey: ['referralLinks'],
    queryFn: () => adminApi.getReferralLinks()
  });
  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createReferralLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralLinks'] });
      setCreateModalOpen(false);
      setNewLink({ code: '', name: '', description: '', isActive: true });
    }
  });
  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.code.trim()) {
      createMutation.mutate(newLink);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const links: ReferralLink[] = linksData?.referralLinks || [];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Реферальные ссылки</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary"
        >
          Создать ссылку
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Код
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователей
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Депозиты
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {link.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {link.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {link.stats.totalUsers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {link.stats.totalDeposits.toFixed(2)} TON ({link.stats.depositsCount})
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    link.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {link.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(link.createdAt).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {links.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Реферальные ссылки не найдены
          </div>
        )}
      </div>
      {}
      {isCreateModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setCreateModalOpen(false)}
          title="Создать реферальную ссылку"
        >
          <form onSubmit={handleCreateLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Код ссылки *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newLink.code}
                onChange={(e) => setNewLink({ ...newLink, code: e.target.value })}
                placeholder="Например: WELCOME2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="Название кампании"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Описание ссылки"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 rounded"
                checked={newLink.isActive}
                onChange={(e) => setNewLink({ ...newLink, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Активна
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={createMutation.isPending}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Создать'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};