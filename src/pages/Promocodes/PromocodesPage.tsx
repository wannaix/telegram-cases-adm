import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Ticket, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Modal } from '../../components/ui/Modal';
export function PromocodesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromocode, setSelectedPromocode] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: promocodesData, isLoading } = useQuery({
    queryKey: ['admin-promocodes'],
    queryFn: () => adminApi.getPromocodes(),
  });
  const createPromocodeMutation = useMutation({
    mutationFn: (data: any) => adminApi.createPromocode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promocodes'] });
      setShowCreateModal(false);
    },
  });
  const updatePromocodeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updatePromocode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promocodes'] });
      setShowEditModal(false);
      setSelectedPromocode(null);
    },
  });
  const deletePromocodeMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePromocode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promocodes'] });
    },
  });
  const promocodes = promocodesData?.promocodes || [];
  const handleDelete = (promocode: any) => {
    if (confirm(`Удалить промокод "${promocode.code}"?`)) {
      deletePromocodeMutation.mutate(promocode.id);
    }
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление промокодами</h1>
          <p className="text-gray-600">Создание и настройка промокодов с бонусами</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Создать промокод
        </button>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего промокодов</p>
              <p className="text-2xl font-bold text-gray-900">{promocodes.length}</p>
            </div>
            <Ticket className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-green-600">
                {promocodes.filter((p: any) => p.isActive).length}
              </p>
            </div>
            <Ticket className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Использований</p>
              <p className="text-2xl font-bold text-purple-600">
                {promocodes.reduce((sum: number, p: any) => sum + (p.usedCount || 0), 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Истекающих</p>
              <p className="text-2xl font-bold text-orange-600">
                {promocodes.filter((p: any) => p.expiresAt && new Date(p.expiresAt) < new Date()).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Промокоды</h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Загрузка промокодов...</p>
            </div>
          ) : promocodes.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет промокодов</h3>
              <p className="mt-1 text-sm text-gray-500">Создайте первый промокод</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Бонус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Использования</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Истекает</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promocodes.map((promocode: any) => (
                  <tr key={promocode.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{promocode.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {promocode.description || 'Без описания'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${promocode.bonusAmount}
                        {promocode.bonusPercent && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({promocode.bonusPercent}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {promocode.usedCount || 0}
                        {promocode.maxUses && (
                          <span className="text-xs text-gray-400 ml-1">
                            / {promocode.maxUses}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        promocode.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {promocode.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promocode.expiresAt 
                        ? new Date(promocode.expiresAt).toLocaleDateString('ru-RU')
                        : 'Бессрочный'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPromocode(promocode);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(promocode)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {}
      {showCreateModal && (
        <PromocodeModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createPromocodeMutation.mutate(data)}
          isLoading={createPromocodeMutation.isPending}
        />
      )}
      {}
      {showEditModal && selectedPromocode && (
        <PromocodeModal
          promocode={selectedPromocode}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPromocode(null);
          }}
          onSubmit={(data) => updatePromocodeMutation.mutate({ id: selectedPromocode.id, data })}
          isLoading={updatePromocodeMutation.isPending}
        />
      )}
    </div>
  );
}
function PromocodeModal({
  promocode,
  onClose,
  onSubmit,
  isLoading
}: {
  promocode?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [code, setCode] = useState(promocode?.code || '');
  const [description, setDescription] = useState(promocode?.description || '');
  const [bonusAmount, setBonusAmount] = useState(promocode?.bonusAmount?.toString() || '');
  const [bonusPercent, setBonusPercent] = useState(promocode?.bonusPercent?.toString() || '');
  const [maxUses, setMaxUses] = useState(promocode?.maxUses?.toString() || '');
  const [expiresAt, setExpiresAt] = useState(
    promocode?.expiresAt 
      ? new Date(promocode.expiresAt).toISOString().slice(0, 16)
      : ''
  );
  const [isActive, setIsActive] = useState(promocode?.isActive ?? true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...(promocode ? {} : { code }), 
      description: description || undefined,
      bonusAmount: parseFloat(bonusAmount),
      bonusPercent: bonusPercent ? parseFloat(bonusPercent) : undefined,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      expiresAt: expiresAt || undefined,
      isActive
    };
    onSubmit(data);
  };
  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title={promocode ? 'Редактировать промокод' : 'Создать промокод'}
    >
      <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!promocode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код промокода
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="NEWUSER2024"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Описание промокода..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бонусная сумма ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бонус в процентах (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Опционально"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Максимум использований
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Без ограничений"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата истечения
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Промокод активен</span>
              </label>
            </div>
          </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading || !bonusAmount || (!promocode && !code)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? 'Сохранение...' : (promocode ? 'Сохранить' : 'Создать')}
          </button>
        </div>
      </form>
    </Modal>
  );
}