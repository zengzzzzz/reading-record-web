import { BookOpen, Clock, Bookmark, Star } from 'lucide-react';
import type { Statistics } from '../types';

interface StatCardsProps {
  stats: Statistics;
}

export function StatCards({ stats }: StatCardsProps) {
  const cards = [
    {
      title: '今年读完',
      value: stats.totalCompleted,
      subtitle: '本书 / 篇文章',
      icon: BookOpen,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
    {
      title: '正在读',
      value: stats.totalReading,
      subtitle: '进行中',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '想读',
      value: stats.totalWant,
      subtitle: '待阅列表',
      icon: Bookmark,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: '平均评分',
      value: stats.averageRating?.toFixed(1) ?? '--',
      subtitle: '★ 综合评分',
      icon: Star,
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-gray-400">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
