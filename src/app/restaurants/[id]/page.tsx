'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItem { id: number; name: string; description: string; price: number; }
interface Restaurant { id: number; name: string; category: string; description: string; delivery_time: number; min_order: number; }
interface CartItem { restaurant_id: number; restaurant_name: string; }

const CATEGORY_STYLE: Record<string, { emoji: string; gradient: string }> = {
  치킨: { emoji: '🍗', gradient: 'from-yellow-400 to-orange-400' },
  피자: { emoji: '🍕', gradient: 'from-red-400 to-rose-400' },
  일식: { emoji: '🍣', gradient: 'from-blue-400 to-cyan-400' },
  한식: { emoji: '🍚', gradient: 'from-green-400 to-emerald-400' },
};

export default function RestaurantPage() {
  const { id } = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [conflictItem, setConflictItem] = useState<{ id: number; name: string } | null>(null);
  const [cartRestaurantId, setCartRestaurantId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${id}/menu`)
      .then(r => r.json())
      .then(data => { setRestaurant(data.restaurant); setMenu(data.menu); setLoading(false); });

    fetch('/api/cart')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.cart?.length > 0) {
          setCartRestaurantId((data.cart[0] as CartItem).restaurant_id);
        }
      });
  }, [id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function addToCart(menuItemId: number, menuName: string) {
    if (!localStorage.getItem('user')) {
      setShowLoginModal(true);
      return;
    }

    if (cartRestaurantId && cartRestaurantId !== Number(id)) {
      setConflictItem({ id: menuItemId, name: menuName });
      return;
    }

    await doAddToCart(menuItemId);
  }

  async function doAddToCart(menuItemId: number) {
    setAdding(menuItemId);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuItemId }),
    });
    setAdding(null);
    if (res.status === 401) { setShowLoginModal(true); return; }
    setCartRestaurantId(Number(id));
    showToast('🛒 장바구니에 담았습니다!');
  }

  async function handleConflictConfirm() {
    if (!conflictItem) return;
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearAll: true }),
    });
    setConflictItem(null);
    await doAddToCart(conflictItem.id);
  }

  const style = restaurant ? (CATEGORY_STYLE[restaurant.category] ?? { emoji: '🍽️', gradient: 'from-gray-400 to-gray-500' }) : null;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-4xl animate-bounce">🍽️</div>
      <p className="text-gray-400 text-sm">메뉴를 불러오는 중...</p>
    </div>
  );
  if (!restaurant || !style) return <p className="text-center py-20 text-gray-400">식당을 찾을 수 없습니다</p>;

  return (
    <div className="pb-8">
      {/* 토스트 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm z-50 shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 로그인 필요 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔐</div>
              <h3 className="text-lg font-black text-gray-900">로그인을 해주세요</h3>
              <p className="text-sm text-gray-400 mt-1">장바구니를 이용하려면 로그인이 필요해요</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">닫기</button>
              <Link href="/auth/login" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold text-center hover:opacity-90 transition">로그인</Link>
            </div>
          </div>
        </div>
      )}

      {/* 장바구니 충돌 모달 */}
      {conflictItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="mb-1">
              <h3 className="text-base font-black text-gray-900">장바구니에는 같은 가게의 메뉴만 담을 수 있습니다.</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                선택하신 메뉴를 장바구니에 담을 경우 이전에 담은 메뉴가 삭제됩니다
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setConflictItem(null)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">취소</button>
              <button onClick={handleConflictConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold hover:opacity-90 transition">담기</button>
            </div>
          </div>
        </div>
      )}

      {/* 뒤로가기 */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition text-sm mb-4">
        <span className="text-lg">←</span> 이전으로
      </button>

      {/* 식당 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
        <div className={`bg-gradient-to-br ${style.gradient} h-32 flex items-center justify-center`}>
          <span className="text-7xl drop-shadow-sm">{style.emoji}</span>
        </div>
        <div className="p-5">
          <h1 className="text-xl font-black text-gray-900">{restaurant.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{restaurant.description}</p>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">⏱ 배달 {restaurant.delivery_time}분</span>
            <span>·</span>
            <span className="flex items-center gap-1">💰 최소 {restaurant.min_order.toLocaleString()}원</span>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <h2 className="text-base font-bold text-gray-700 mb-3 px-1">메뉴</h2>
      <div className="space-y-3">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-orange-100 transition">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
              {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
              <p className="text-orange-500 font-black mt-1.5 text-base">{item.price.toLocaleString()}원</p>
            </div>
            <button
              onClick={() => addToCart(item.id, item.name)}
              disabled={adding === item.id}
              className="ml-4 shrink-0 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50 shadow-sm"
            >
              {adding === item.id ? '...' : '담기'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
