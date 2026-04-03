import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
import type { FilterParams, ReadingType, ReadingStatus } from '../types';

interface FilterBarProps {
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
}

const typeOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'book' as const, label: '书籍' },
  { value: 'article' as const, label: '文章' },
];

const statusOptions = [
  { value: 'all' as const, label: '所有状态' },
  { value: 'want' as const, label: '想读' },
  { value: 'reading' as const, label: '在读' },
  { value: 'completed' as const, label: '已读' },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearch = () => {
    onChange({ ...filters, search: searchInput || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchInput('');
    onChange({});
  };

  const hasFilters = filters.type || filters.status || filters.search;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索书名、作者..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 类型筛选 */}
        <div className="flex gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onChange({
                  ...filters,
                  type: option.value === 'all' ? undefined : (option.value as ReadingType),
                })
              }
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                (filters.type || 'all') === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 状态筛选 */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 mr-2">
            <Filter className="w-4 h-4" />
            <span>状态筛选：</span>
          </div>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                onChange({
                  ...filters,
                  status: option.value === 'all' ? undefined : (option.value as ReadingStatus),
                })
              }
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (filters.status || 'all') === option.value
                  ? option.value === 'want'
                    ? 'bg-amber-100 text-amber-700'
                    : option.value === 'reading'
                    ? 'bg-blue-100 text-blue-700'
                    : option.value === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={handleClear}
              className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              清除筛选
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
