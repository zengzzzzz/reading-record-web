import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import type { ReadingRecord, FilterParams, Statistics } from './types';
import { getRecords, getStatistics } from './api';
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { RecordList } from './components/RecordList';
import { RecordForm } from './components/RecordForm';

function App() {
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReadingRecord | undefined>();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await getRecords(filters);
      setRecords(response.items);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  const handleAddClick = () => {
    setEditingRecord(undefined);
    setShowForm(true);
  };

  const handleEditClick = (record: ReadingRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRecord(undefined);
  };

  const handleFormSuccess = () => {
    fetchRecords();
    fetchStatistics();
    setShowForm(false);
    setEditingRecord(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">阅读记录</h1>
              <p className="mt-1 text-sm text-gray-500">
                {new Date().getFullYear()}年 · 统计总览
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              添加记录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {statistics && <StatCards stats={statistics} />}

        <div className="mt-8">
          <FilterBar filters={filters} onChange={handleFilterChange} />
        </div>

        <div className="mt-6">
          <RecordList
            records={records}
            loading={loading}
            onEdit={handleEditClick}
            onRefresh={fetchRecords}
          />
        </div>
      </main>

      {showForm && (
        <RecordForm
          record={editingRecord}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

export default App
