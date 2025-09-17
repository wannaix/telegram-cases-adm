import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Plus, 
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Modal } from '../../components/ui/Modal';
export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const queryClient = useQueryClient();
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', currentPage, itemsPerPage, searchTerm, statusFilter],
    queryFn: () => adminApi.getUsers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter
    }),
  });
  const balanceChangeMutation = useMutation({
    mutationFn: ({ userId, amount, reason }: { userId: string; amount: number; reason?: string }) => 
      adminApi.updateUserBalance(userId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowBalanceModal(false);
      setSelectedUser(null);
    },
  });
  const blockUserMutation = useMutation({
    mutationFn: ({ userId, blocked, reason }: { userId: string; blocked: boolean; reason?: string }) => 
      adminApi.blockUser(userId, blocked, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;
  const handleBlockToggle = (user: any) => {
    const reason = prompt(`${user.isBlocked ? 'Разблокировать' : 'Заблокировать'} пользователя ${user.username || user.telegramId}?\nУкажите причину:`);
    if (reason !== null) {
      blockUserMutation.mutate({
        userId: user.id,
        blocked: !user.isBlocked,
        reason: reason || undefined
      });
    }
  };
  const handleViewHistory = async (user: any) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-gray-600">Просмотр и управление учетными записями пользователей</p>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
              <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter((u: any) => !u.isBlocked).length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Заблокированных</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter((u: any) => u.isBlocked).length}
              </p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Средний баланс</p>
              <p className="text-2xl font-bold text-purple-600">
                ${users.length > 0 
                  ? (users.reduce((sum: number, u: any) => sum + u.balance, 0) / users.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <Plus className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по имени пользователя, ID Telegram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все пользователи</option>
                <option value="active">Активные</option>
                <option value="blocked">Заблокированные</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Загрузка пользователей...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Пользователи не найдены</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'В системе пока нет пользователей'
                }
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Баланс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статистика
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.username || 'Без имени'
                            }
                          </div>
                          <div className="text-sm text-gray-500">@{user.username || user.telegramId}</div>
                          <div className="text-xs text-gray-400">ID: {user.telegramId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${user.balance.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        Потрачено: ${user.totalSpent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Выиграно: ${user.totalWon.toFixed(2)}</div>
                      {user.isPremium && (
                        <div className="text-xs text-yellow-600 font-medium">Premium</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewHistory(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Просмотр истории"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowBalanceModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Изменить баланс"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => handleBlockToggle(user)}
                        className={user.isBlocked ? "text-green-600 hover:text-green-900" : "text-red-600 hover:text-red-900"}
                        title={user.isBlocked ? "Разблокировать" : "Заблокировать"}
                      >
                        {user.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показаны {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-700">
                  Страница {pagination.page} из {pagination.pages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {}
      {showBalanceModal && selectedUser && (
        <BalanceModal
          user={selectedUser}
          onClose={() => {
            setShowBalanceModal(false);
            setSelectedUser(null);
          }}
          onSubmit={(amount, reason) => {
            balanceChangeMutation.mutate({
              userId: selectedUser.id,
              amount,
              reason
            });
          }}
          isLoading={balanceChangeMutation.isPending}
        />
      )}
      {}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
function BalanceModal({
  user,
  onClose,
  onSubmit,
  isLoading
}: {
  user: any;
  onClose: () => void;
  onSubmit: (amount: number, reason?: string) => void;
  isLoading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return;
    onSubmit(amountNum, reason || undefined);
  };
  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="Изменить баланс пользователя"
    >
      <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              Пользователь: <strong>{user.username || user.telegramId}</strong>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Текущий баланс: <strong>${user.balance.toFixed(2)}</strong>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма изменения
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Положительная для пополнения, отрицательная для списания"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Новый баланс будет: ${((user.balance || 0) + parseFloat(amount || '0')).toFixed(2)}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Причина изменения
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Укажите причину изменения баланса..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
            disabled={isLoading || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? 'Изменение...' : 'Изменить баланс'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function UserDetailsModal({
  user,
  onClose
}: {
  user: any;
  onClose: () => void;
}) {
  const { data: userHistory, isLoading } = useQuery({
    queryKey: ['user-history', user.id],
    queryFn: () => adminApi.getUserHistory(user.id),
    enabled: !!user.id
  });
  return (
    <Modal 
      isOpen={true} 
      onClose={onClose}
      title="История пользователя"
      size="twoThirds"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Загрузка истории...</p>
          </div>
        ) : (
          <div>
            {}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Информация о пользователе</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>Имя: {user.firstName || 'Не указано'}</div>
                <div>Фамилия: {user.lastName || 'Не указано'}</div>
                <div>Username: @{user.username || 'Не указан'}</div>
                <div>Telegram ID: {user.telegramId}</div>
                <div>Язык: {user.languageCode || 'Не указан'}</div>
                <div>Premium: {user.isPremium ? 'Да' : 'Нет'}</div>
              </div>
            </div>
            {}
            {userHistory && (
              <div>
                <h4 className="font-medium mb-4">История активности</h4>
                {}
                <div className="text-sm text-gray-500">
                  Детальная история будет реализована при необходимости
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Закрыть
        </button>
      </div>
    </Modal>
  );
}