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

const CATEGORY_EMOJI: Record<string, string> = {
  치킨: '🍗',
  피자: '🍕',
  일식: '🍣',
  한식: '🍚',
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(data => {
        setRestaurants(data.restaurants);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏪 식당 목록</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {restaurants.map(r => (
          <Link key={r.id} href={`/restaurants/${r.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-orange-200 transition cursor-pointer">
              <div className="text-3xl mb-2">{CATEGORY_EMOJI[r.category] ?? '🍽️'}</div>
              <h2 className="text-lg font-bold text-gray-900">{r.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{r.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>⏱ {r.delivery_time}분</span>
                <span>💰 최소 {r.min_order.toLocaleString()}원</span>
              </div>
              <span className="inline-block mt-2 text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
                {r.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
