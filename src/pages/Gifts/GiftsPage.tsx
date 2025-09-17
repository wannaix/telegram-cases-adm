import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Gift, Edit2, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Modal } from '../../components/ui/Modal';
export function GiftsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: giftsData, isLoading } = useQuery({
    queryKey: ['admin-gifts'],
    queryFn: () => adminApi.getGifts(),
  });
  const createGiftMutation = useMutation({
    mutationFn: (data: any) => adminApi.createGift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gifts'] });
      setShowCreateModal(false);
    },
  });
  const gifts = giftsData?.gifts || [];
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление подарками</h1>
          <p className="text-gray-600">Создание и настройка подарков для пользователей</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Создать подарок
        </button>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего подарков</p>
              <p className="text-2xl font-bold text-gray-900">{gifts.length}</p>
            </div>
            <Gift className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-green-600">
                {gifts.filter((g: any) => g.isActive).length}
              </p>
            </div>
            <Gift className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средняя цена</p>
              <p className="text-2xl font-bold text-purple-600">
                ${gifts.length > 0 ? (gifts.reduce((sum: number, g: any) => sum + g.price, 0) / gifts.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Подарки</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Загрузка подарков...</p>
            </div>
          ) : gifts.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет подарков</h3>
              <p className="mt-1 text-sm text-gray-500">Создайте первый подарок</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gifts.map((gift: any) => (
                <div key={gift.id} className="border border-gray-200 rounded-lg p-4">
                  {gift.imageUrl && (
                    <div className="aspect-square mb-3">
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{gift.name}</h3>
                    <div className="flex gap-1">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={14} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {gift.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{gift.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-green-600">${gift.price}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      gift.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gift.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {}
      {showCreateModal && (
        <CreateGiftModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createGiftMutation.mutate(data)}
          isLoading={createGiftMutation.isPending}
        />
      )}
    </div>
  );
}
function CreateGiftModal({
  onClose,
  onSubmit,
  isLoading
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      price: parseFloat(price),
      imageUrl: imageUrl || undefined,
      isActive
    });
  };
  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="Создать подарок"
    >
      <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL изображения
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.png"
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
                <span className="text-sm font-medium text-gray-700">Подарок активен</span>
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
            disabled={isLoading || !name || !price}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </form>
    </Modal>
  );
}