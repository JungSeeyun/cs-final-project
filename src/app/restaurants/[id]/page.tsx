'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface Restaurant {
  id: number;
  name: string;
  category: string;
  description: string;
  delivery_time: number;
  min_order: number;
}

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch(`/api/restaurants/${id}/menu`)
      .then(r => r.json())
      .then(data => {
        setRestaurant(data.restaurant);
        setMenu(data.menu);
        setLoading(false);
      });
  }, [id]);

  async function addToCart(menuItemId: number) {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setAdding(menuItemId);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId }),
    });

    setAdding(null);

    if (res.status === 401) {
      router.push('/auth/login');
      return;
    }

    setToast('장바구니에 담았습니다 🛒');
    setTimeout(() => setToast(''), 2000);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!restaurant) return <div className="text-center py-20 text-gray-400">식당을 찾을 수 없습니다</div>;

  return (
    <div>
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
        <p className="text-gray-500 mt-1">{restaurant.description}</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>⏱ 배달 {restaurant.delivery_time}분</span>
          <span>💰 최소 주문 {restaurant.min_order.toLocaleString()}원</span>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 mb-3">메뉴</h2>
      <div className="space-y-3">
        {menu.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              )}
              <p className="text-orange-500 font-bold mt-1">{item.price.toLocaleString()}원</p>
            </div>
            <button
              onClick={() => addToCart(item.id)}
              disabled={adding === item.id}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50 ml-4 shrink-0"
            >
              {adding === item.id ? '...' : '담기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
