import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Package,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { partnersApi } from "../../services/partnersApi";
import {
  adminApi,
  CreateCaseWithNftsRequest,
  CaseData,
} from "../../services/adminApi";
import { useToast } from "../../components/Toast";
import { Modal } from "../../components/ui/Modal";
export function CasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedNftsForCase, setSelectedNftsForCase] = useState<
    Array<{
      nftId: string;
      dropChance: number;
      rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "CONTRABAND";
    }>
  >([]);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const getImageSrc = (imageUrl: string | undefined) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    return `${cleanBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const toggleNftSelection = (nft: any) => {
    const isSelected = selectedNftsForCase.some(item => item.nftId === nft.id);
    
    if (isSelected) {
      // Убрать NFT из выбранных
      setSelectedNftsForCase(prev => prev.filter(item => item.nftId !== nft.id));
    } else {
      // Добавить NFT в выбранные
      setSelectedNftsForCase(prev => [...prev, {
        nftId: nft.id,
        dropChance: 10, // Начальный шанс
        rarity: 'COMMON' as const
      }]);
    }
  };
  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ["admin-cases"],
    queryFn: () => adminApi.getCases(),
  });
  const { data: nftsData, isLoading: nftsLoading } = useQuery({
    queryKey: ["available-nfts", currentPage, itemsPerPage, selectedCollection],
    queryFn: () =>
      partnersApi.searchNfts({
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        status: "listed",
        filter_by_collections: selectedCollection
          ? [selectedCollection]
          : undefined,
        with_attributes: true,
        sort_by: "price asc",
      }),
  });
  const { data: collectionsData } = useQuery({
    queryKey: ["collections-list"],
    queryFn: () => partnersApi.getCollectionsList(),
  });
  const createCaseMutation = useMutation({
    mutationFn: (data: CreateCaseWithNftsRequest) =>
      adminApi.createCaseWithNfts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setShowCreateModal(false);
      showToast("Кейс успешно создан", "success");
    },
    onError: (error: any) => {
      showToast(`Ошибка создания кейса: ${error.message}`, "error");
    },
  });
  const updateCaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminApi.updateCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setShowEditModal(false);
      setSelectedCase(null);
      showToast("Кейс успешно обновлен", "success");
    },
    onError: (error: any) => {
      showToast(`Ошибка обновления кейса: ${error.message}`, "error");
    },
  });
  const deleteCaseMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      showToast("Кейс успешно удален", "success");
    },
    onError: (error: any) => {
      showToast(`Ошибка удаления кейса: ${error.message}`, "error");
    },
  });
  const deleteEmptyCasesMutation = useMutation({
    mutationFn: () => adminApi.deleteEmptyCases(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      showToast(
        `Успешно удалено ${data.deletedCount} пустых кейсов`,
        "success"
      );
    },
    onError: (error) => {
      console.error("Ошибка при удалении пустых кейсов:", error);
      showToast("Ошибка при удалении пустых кейсов", "error");
    },
  });
  const cases = casesData?.cases || [];
  const nfts = nftsData?.results || [];
  const hasMorePages = nfts.length === itemsPerPage;
  const collections = collectionsData?.collections || [];
  const filteredNfts = nfts.filter((nft) => {
    const matchesSearch = nft.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };
  const handleCollectionChange = (value: string) => {
    setSelectedCollection(value);
    setCurrentPage(1);
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Управление кейсами
          </h1>
          <p className="text-gray-600">Создание и настройка кейсов с NFT</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (
                confirm(
                  "Вы уверены, что хотите удалить все пустые кейсы (без предметов)?"
                )
              ) {
                deleteEmptyCasesMutation.mutate();
              }
            }}
            disabled={deleteEmptyCasesMutation.isPending}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:bg-red-400"
          >
            <Trash2 size={20} />
            {deleteEmptyCasesMutation.isPending
              ? "Удаление..."
              : "Удалить пустые"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Создать кейс
          </button>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего кейсов</p>
              <p className="text-2xl font-bold text-gray-900">{cases.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-2xl font-bold text-green-600">
                {cases.filter((c) => c.isActive).length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Доступных NFT</p>
              <p className="text-2xl font-bold text-purple-600">
                {nfts.length}
              </p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Пустых кейсов</p>
              <p className="text-2xl font-bold text-red-600">
                {cases.filter((c) => !c.items || c.items.length === 0).length}
              </p>
            </div>
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Существующие кейсы
          </h2>
        </div>
        <div className="p-6">
          {casesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Загрузка кейсов...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Нет кейсов
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Создайте первый кейс для начала работы
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  {}
                  {caseItem.imageUrl && (
                    <div className="aspect-square mb-2">
                      <img
                        src={getImageSrc(caseItem.imageUrl)}
                        alt={caseItem.name}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"%2F%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12"%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {caseItem.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить кейс "${caseItem.name}"?`)) {
                            deleteCaseMutation.mutate(caseItem.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {caseItem.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {caseItem.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-green-600">
                      {caseItem.price} TON
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        caseItem.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {caseItem.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  {caseItem.items && caseItem.items.length > 0 && (
                    <>
                      <div className="text-xs text-gray-500 mb-1">
                        Предметов: {caseItem.items.length} | Открытий:{" "}
                        {caseItem.totalOpenings || 0}
                      </div>
                      {}
                      <div className="flex -space-x-1">
                        {caseItem.items.slice(0, 4).map((caseItem, idx) => (
                          <div
                            key={caseItem.id}
                            className="w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                            style={{ zIndex: 4 - idx }}
                          >
                            <img
                              src={caseItem.item.imageUrl || ""}
                              alt={caseItem.item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" fill="%23e5e7eb"%2F%3E%3C%2Fsvg%3E';
                              }}
                            />
                          </div>
                        ))}
                        {caseItem.items.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            +{caseItem.items.length - 4}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            NFT с маркетплейса для кейсов
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Выберите NFT с маркетплейса для добавления в кейсы
          </p>
        </div>
        {}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск NFT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCollection}
              onChange={(e) => handleCollectionChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!collections.length}
            >
              <option value="">
                {collections.length ? "Все коллекции" : "Загрузка коллекций..."}
              </option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                  {collection.floor_price &&
                    ` (floor: ${collection.floor_price} TON)`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6">
          {nftsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Загрузка NFT...</p>
            </div>
          ) : filteredNfts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                NFT не найдены
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCollection
                  ? "Попробуйте изменить фильтры поиска"
                  : "У вас пока нет доступных NFT"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredNfts.map((nft) => (
                <div
                  key={nft.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square mb-2">
                    <img
                      src={nft.photo_url}
                      alt={nft.name}
                      className="w-full h-full object-cover rounded-md"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"%2F%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="12"%3ENo Image%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {nft.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">
                    #{nft.external_collection_number}
                  </p>
                  {nft.floor_price && (
                    <p className="text-xs font-medium text-green-600">
                      Floor: {nft.floor_price} TON
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {nft.attributes.slice(0, 2).map((attr, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {attr.value}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNftSelection(nft)}
                    className={`mt-2 w-full py-1 px-2 text-xs rounded transition-colors ${
                      selectedNftsForCase.some(item => item.nftId === nft.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedNftsForCase.some(item => item.nftId === nft.id) ? 'Убрать' : 'Добавить'}
                  </button>
                </div>
              ))}
            </div>
          )}
          {}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Показывать:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              {}
              <div className="flex items-center gap-2">
                {}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                {}
                <div className="flex items-center gap-1">
                  {}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      currentPage === 1
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    1
                  </button>
                  {}
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage(2)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === 2
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      2
                    </button>
                  )}
                  {}
                  {currentPage > 2 && (
                    <>
                      {currentPage > 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white">
                        {currentPage}
                      </button>
                    </>
                  )}
                  {}
                  {hasMorePages && (
                    <>
                      {currentPage > 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={handleNextPage}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                      >
                        {currentPage + 1}
                      </button>
                    </>
                  )}
                </div>
                {}
                <button
                  onClick={handleNextPage}
                  disabled={!hasMorePages || nftsLoading}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать новый кейс"
        size="xl"
      >
        <CreateCaseModalContent
          onClose={() => setShowCreateModal(false)}
          availableNfts={filteredNfts}
          selectedNfts={selectedNftsForCase}
          onSubmit={(data) => {
            createCaseMutation.mutate(data);
            setSelectedNftsForCase([]); // Очистить выбранные NFT после создания
          }}
          isLoading={createCaseMutation.isPending}
        />
      </Modal>
      {}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCase(null);
        }}
        title="Редактировать кейс"
        size="lg"
      >
        {selectedCase && (
          <EditCaseModalContent
            caseData={selectedCase}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCase(null);
            }}
            onSubmit={(data) =>
              updateCaseMutation.mutate({ id: selectedCase.id, data })
            }
            isLoading={updateCaseMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
function CreateCaseModalContent({
  onClose,
  availableNfts,
  selectedNfts,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  availableNfts: any[];
  selectedNfts: Array<{
    nftId: string;
    dropChance: number;
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "CONTRABAND";
  }>;
  onSubmit: (data: CreateCaseWithNftsRequest) => void;
  isLoading: boolean;
}) {
  const { showToast } = useToast();
  
  // Функция для получения полного URL изображения
  const getImageSrc = (imageUrl: string | undefined) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    return `${cleanBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };
  
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [casePrice, setCasePrice] = useState("");
  const [caseImageUrl, setCaseImageUrl] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName || !casePrice || localSelectedNfts.length === 0) {
      showToast("Заполните все обязательные поля", "warning");
      return;
    }
    const totalChance = localSelectedNfts.reduce(
      (sum, nft) => sum + nft.dropChance,
      0
    );
    if (Math.abs(totalChance - 100) > 0.01) {
      showToast(
        `Сумма шансов должна быть 100%, сейчас ${totalChance.toFixed(2)}%`,
        "warning"
      );
      return;
    }
    const nftItems = localSelectedNfts.map((selectedNft) => {
      const nft = availableNfts.find((n) => n.id === selectedNft.nftId);
      if (!nft) throw new Error(`NFT ${selectedNft.nftId} not found`);
      return {
        nftId: nft.id,
        name: nft.name,
        imageUrl: nft.photo_url,
        rarity: selectedNft.rarity,
        dropChance: selectedNft.dropChance,
        estimatedPrice: nft.floor_price
          ? parseFloat(nft.floor_price)
          : undefined,
      };
    });
    const caseData: CreateCaseWithNftsRequest = {
      name: caseName,
      description: caseDescription || undefined,
      price: parseFloat(casePrice),
      imageUrl: caseImageUrl || undefined,
      nftItems,
      isActive: true,
    };
    onSubmit(caseData);
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Показать превью
      setCaseImageUrl(URL.createObjectURL(file));
      
      try {
        // Загрузить файл на backend
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'case');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/public-admin/upload-image`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Upload response:', data); // Для отладки
          
          // Сохраняем URL как есть - он уже обрабатывается в getImageSrc при отображении
          setCaseImageUrl(data.imageUrl);
          showToast("Изображение загружено", "success");
        } else {
          throw new Error('Ошибка загрузки');
        }
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        showToast("Ошибка загрузки изображения. Попробуйте меньший файл", "error");
        setCaseImageUrl(""); // Очистить превью при ошибке
      }
    }
  };
  const [localSelectedNfts, setLocalSelectedNfts] = useState(selectedNfts);

  // Синхронизируем локальное состояние с пропсами при изменении
  useEffect(() => {
    setLocalSelectedNfts(selectedNfts);
  }, [selectedNfts]);

  const updateNftRarity = (
    nftId: string,
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "CONTRABAND"
  ) => {
    setLocalSelectedNfts((prev) =>
      prev.map((item) => (item.nftId === nftId ? { ...item, rarity } : item))
    );
  };

  const updateNftChance = (nftId: string, dropChance: number) => {
    setLocalSelectedNfts((prev) =>
      prev.map((item) =>
        item.nftId === nftId ? { ...item, dropChance } : item
      )
    );
  };

  const getTotalChance = () => {
    return localSelectedNfts.reduce((sum, nft) => sum + nft.dropChance, 0);
  };
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название кейса
            </label>
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена (TON)
            </label>
            <input
              type="number"
              step="0.01"
              value={casePrice}
              onChange={(e) => setCasePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение кейса
          </label>
          <div className="flex items-start gap-4">
            {caseImageUrl ? (
              <div className="relative">
                <img
                  src={getImageSrc(caseImageUrl)}
                  alt="Превью кейса"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setCaseImageUrl("")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e)}
                  className="hidden"
                  id="case-image-upload"
                />
                <label
                  htmlFor="case-image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Выбрать изображение
              </label>
              </div>
            )}
          </div>
        </div>
        {localSelectedNfts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Настройка шансов выпадения (общий шанс:{" "}
              {getTotalChance().toFixed(1)}%)
            </label>
            <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {localSelectedNfts.map((selectedNft) => {
                const nft = availableNfts.find(
                  (n) => n.id === selectedNft.nftId
                );
                if (!nft) return null;
                return (
                  <div
                    key={selectedNft.nftId}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                  >
                    <div className="w-12 h-12 flex-shrink-0">
                      <img
                        src={nft.photo_url}
                        alt={nft.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23e5e7eb"%2F%3E%3C%2Fsvg%3E';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{nft.name}</p>
                      <p className="text-xs text-gray-500">
                        #{nft.external_collection_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">
                          Редкость
                        </label>
                        <select
                          value={selectedNft.rarity}
                          onChange={(e) =>
                            updateNftRarity(
                              selectedNft.nftId,
                              e.target.value as any
                            )
                          }
                          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="COMMON">Common</option>
                          <option value="UNCOMMON">Uncommon</option>
                          <option value="RARE">Rare</option>
                          <option value="EPIC">Epic</option>
                          <option value="LEGENDARY">Legendary</option>
                          <option value="CONTRABAND">Contraband</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">
                          Шанс %
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={selectedNft.dropChance}
                            onChange={(e) =>
                              updateNftChance(
                                selectedNft.nftId,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24 text-sm border border-gray-300 rounded-md px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {Math.abs(getTotalChance() - 100) > 0.01 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ Сумма шансов должна быть равна 100%
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
            disabled={
              isLoading ||
              !caseName ||
              !casePrice ||
              localSelectedNfts.length === 0 ||
              Math.abs(getTotalChance() - 100) > 0.01
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? "Создание..." : "Создать кейс"}
          </button>
        </div>
      </form>
    </div>
  );
}
function EditCaseModalContent({
  caseData,
  onClose,
  onSubmit,
  isLoading,
}: {
  caseData: CaseData;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  // Функция для получения полного URL изображения
  const getImageSrc = (imageUrl: string | undefined) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const cleanBaseUrl = baseUrl.replace(/\/api$/, "");
    return `${cleanBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };
  
  const [caseName, setCaseName] = useState(caseData.name);
  const [caseDescription, setCaseDescription] = useState(
    caseData.description || ""
  );
  const [casePrice, setCasePrice] = useState(caseData.price.toString());
  const [caseImageUrl, setCaseImageUrl] = useState(caseData.imageUrl || "");
  const [isActive, setIsActive] = useState(caseData.isActive);
  const [isLocked, setIsLocked] = useState(caseData.isLocked);
  const [unlockLevel, setUnlockLevel] = useState(
    caseData.unlockLevel?.toString() || ""
  );
  const [unlockPrice, setUnlockPrice] = useState(
    caseData.unlockPrice?.toString() || ""
  );
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCaseImageUrl(URL.createObjectURL(file));
      
      try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', 'case');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/public-admin/upload-image`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Upload response:', data); // Для отладки
          
          // Сохраняем URL как есть - он уже обрабатывается в getImageSrc при отображении
          setCaseImageUrl(data.imageUrl);
          showToast("Изображение загружено", "success");
        } else {
          throw new Error('Ошибка загрузки');
        }
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        showToast("Ошибка загрузки изображения", "error");
        setCaseImageUrl("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData = {
      name: caseName,
      description: caseDescription || undefined,
      price: parseFloat(casePrice),
      imageUrl: caseImageUrl || undefined,
      isActive,
      isLocked,
      unlockLevel: unlockLevel ? parseInt(unlockLevel) : undefined,
      unlockPrice: unlockPrice ? parseFloat(unlockPrice) : undefined,
    };
    onSubmit(updateData);
  };
  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название кейса
            </label>
            <input
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена (TON)
            </label>
            <input
              type="number"
              step="0.01"
              value={casePrice}
              onChange={(e) => setCasePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            value={caseDescription}
            onChange={(e) => setCaseDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение кейса
          </label>
          <div className="flex items-start gap-4">
            {caseImageUrl ? (
              <div className="relative">
                <img
                  src={getImageSrc(caseImageUrl)}
                  alt="Превью кейса"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"%3E%3Crect width="128" height="128" fill="%23e5e7eb"%2F%3E%3Ctext x="64" y="64" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="14"%3EОшибка загрузки%3C%2Ftext%3E%3C%2Fsvg%3E';
                }}
              />
              <button
                type="button"
                onClick={() => setCaseImageUrl("")}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="edit-case-image-upload"
              />
              <label
                htmlFor="edit-case-image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Выбрать изображение
              </label>
            </div>
          )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Кейс активен
              </span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Требует разблокировки
              </span>
            </label>
          </div>
        </div>
        {isLocked && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень для разблокировки
              </label>
              <input
                type="number"
                value={unlockLevel}
                onChange={(e) => setUnlockLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена разблокировки (TON)
              </label>
              <input
                type="number"
                step="0.01"
                value={unlockPrice}
                onChange={(e) => setUnlockPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        {}
        {caseData.items && caseData.items.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Предметы в кейсе ({caseData.items.length})
            </h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div className="space-y-2">
                {caseData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {item.item.imageUrl && (
                        <img
                          src={item.item.imageUrl}
                          alt={item.item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.item.rarity}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {item.dropChance}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
