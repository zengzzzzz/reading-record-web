import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReadingRecord } from '../types';
import { deleteRecord } from '../api';
import { RecordCard } from './RecordCard';

interface RecordListProps {
  records: ReadingRecord[];
  loading: boolean;
  onEdit: (record: ReadingRecord) => void;
  onRefresh: () => void;
}

export function RecordList({ records, loading, onEdit, onRefresh }: RecordListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteRecord(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete record:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">暂无记录</h3>
        <p className="mt-1 text-gray-500">开始添加你的第一本阅读记录吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <RecordCard
          key={record.id}
          record={record}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
