import { BookOpen, FileText, Star, Edit, Trash2 } from 'lucide-react';
import type { ReadingRecord, ReadingType, ReadingStatus } from '../types';

interface RecordCardProps {
  record: ReadingRecord;
  onEdit: (record: ReadingRecord) => void;
  onDelete: (id: number) => void;
}

const typeConfig: Record<ReadingType, { label: string; icon: typeof BookOpen; color: string; bgColor: string }> = {
  book: {
    label: '书籍',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  article: {
    label: '文章',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
};

const statusConfig: Record<ReadingStatus, { label: string; color: string; bgColor: string }> = {
  want: {
    label: '想读',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
  },
  reading: {
    label: '在读',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: '已读',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

export function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  const typeInfo = typeConfig[record.type];
  const statusInfo = statusConfig[record.status];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* 封面/类型图标 */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${typeInfo.bgColor} flex items-center justify-center`}>
            <TypeIcon className={`w-8 h-8 ${typeInfo.color}`} />
          </div>

          {/* 内容区 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {record.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(record)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(record.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              {record.author || '未知作者'}
              {record.type && (
                <span className="mx-1.5 text-gray-400">·</span>
              )}
              <span className={`inline-flex items-center gap-1 ${typeInfo.color}`}>
                <TypeIcon className="w-3.5 h-3.5" />
                {typeInfo.label}
              </span>
            </p>

            <div className="mt-3 flex items-center gap-3">
              {/* 状态标签 */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>

              {/* 评分 */}
              {record.rating ? (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < record.rating!
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              ) : record.status === 'completed' ? (
                <span className="text-sm text-gray-400">未评分</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
