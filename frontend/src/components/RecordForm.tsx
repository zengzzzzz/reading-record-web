import { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Star, Calendar } from 'lucide-react';
import type { ReadingRecord, ReadingType, ReadingStatus, CreateRecordRequest } from '../types';
import { createRecord, updateRecord } from '../api';

interface RecordFormProps {
  record?: ReadingRecord;
  onClose: () => void;
  onSuccess: () => void;
}

const typeOptions: { value: ReadingType; label: string; icon: typeof BookOpen }[] = [
  { value: 'book', label: '书籍', icon: BookOpen },
  { value: 'article', label: '文章', icon: FileText },
];

const statusOptions: { value: ReadingStatus; label: string }[] = [
  { value: 'want', label: '想读' },
  { value: 'reading', label: '在读' },
  { value: 'completed', label: '已读' },
];

export function RecordForm({ record, onClose, onSuccess }: RecordFormProps) {
  const isEditing = !!record;

  const [formData, setFormData] = useState<CreateRecordRequest>({
    title: '',
    author: '',
    type: 'book',
    status: 'want',
    rating: null,
    notes: '',
    startDate: null,
    completeDate: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setFormData({
        title: record.title,
        author: record.author,
        type: record.type,
        status: record.status,
        rating: record.rating,
        notes: record.notes || '',
        startDate: record.startDate,
        completeDate: record.completeDate,
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('请输入标题');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = {
        ...formData,
        notes: formData.notes || undefined,
        rating: formData.rating || undefined,
        startDate: formData.startDate || undefined,
        completeDate: formData.completeDate || undefined,
      };

      if (isEditing && record) {
        await updateRecord(record.id, data);
      } else {
        await createRecord(data);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save record:', err);
      setError('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? '编辑阅读记录' : '添加阅读记录'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 类型选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: option.value })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.type === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="书名或文章标题"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 作者 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作者
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="作者姓名"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 阅读状态 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              阅读状态
            </label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: option.value })}
                  className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                    formData.status === option.value
                      ? option.value === 'want'
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : option.value === 'reading'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 评分 - 仅在已读时显示 */}
          {formData.status === 'completed' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        rating: formData.rating === star ? null : star,
                      })
                    }
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        formData.rating && star <= formData.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 日期选择 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value || null,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                完成日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.completeDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      completeDate: e.target.value || null,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 笔记 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              读书笔记
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="记录你的想法、摘录..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEditing ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
