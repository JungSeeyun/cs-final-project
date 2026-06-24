'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Restaurant {
  id: number;
  name: string;
  category: string;
  description: string;
  delivery_time: number;
  min_order: number;
}

const CATEGORIES = ['전체', '치킨', '피자', '일식', '한식'];

const CATEGORY_STYLE: Record<string, { emoji: string; gradient: string }> = {
  치킨: { emoji: '🍗', gradient: 'from-yellow-400 to-orange-400' },
  피자: { emoji: '🍕', gradient: 'from-red-400 to-rose-400' },
  일식: { emoji: '🍣', gradient: 'from-blue-400 to-cyan-400' },
  한식: { emoji: '🍚', gradient: 'from-green-400 to-emerald-400' },
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('전체');

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(data => { setRestaurants(data.restaurants); setLoading(false); });
  }, []);

  const filtered = selected === '전체' ? restaurants : restaurants.filter(r => r.category === selected);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <div className="text-4xl animate-bounce">🛵</div>
        <p className="text-gray-400 text-sm">맛있는 식당을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 히어로 */}
      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-3xl p-6 mb-6 text-white">
        <p className="text-sm font-medium opacity-80">오늘도 맛있게 🍽️</p>
        <h1 className="text-2xl font-black mt-1">뭐 드실래요?</h1>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
              selected === cat
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'
            }`}
          >
            {cat !== '전체' && (CATEGORY_STYLE[cat]?.emoji + ' ')}
            {cat}
          </button>
        ))}
      </div>

      {/* 식당 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(r => {
          const style = CATEGORY_STYLE[r.category] ?? { emoji: '🍽️', gradient: 'from-gray-400 to-gray-500' };
          return (
            <Link key={r.id} href={`/restaurants/${r.id}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className={`bg-gradient-to-br ${style.gradient} h-28 flex items-center justify-center`}>
                  <span className="text-6xl drop-shadow-sm">{style.emoji}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{r.name}</h2>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.description}</p>
                    </div>
                    <span className="shrink-0 ml-2 text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                      {r.category}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-3 text-xs text-gray-400">
                    <span>⏱ {r.delivery_time}분</span>
                    <span>·</span>
                    <span>최소 {r.min_order.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">해당 카테고리 식당이 없습니다</p>
        </div>
      )}
    </div>
  );
}
