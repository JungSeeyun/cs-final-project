'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem { id: number; name: string; price: number; quantity: number; restaurant_name: string; }

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  async function fetchCart() {
    const res = await fetch('/api/cart');
    if (res.status === 401) { router.push('/auth/login'); return; }
    const data = await res.json();
    setCart(data.cart ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchCart(); }, []);

  async function removeItem(cartItemId: number) {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId }),
    });
    fetchCart();
  }

  async function placeOrder() {
    setOrdering(true);
    const res = await fetch('/api/orders', { method: 'POST' });
    const data = await res.json();
    setOrdering(false);
    if (res.ok) {
      setOrdered(true);
      setTimeout(() => router.push('/orders'), 1500);
    } else {
      alert(data.error);
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-4xl animate-bounce">🛒</div>
      <p className="text-gray-400 text-sm">불러오는 중...</p>
    </div>
  );

  if (ordered) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-6xl">🎉</div>
      <h2 className="text-xl font-black text-gray-900">주문 완료!</h2>
      <p className="text-sm text-gray-400">주문 내역으로 이동합니다...</p>
    </div>
  );

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">장바구니</h1>

      {cart.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-semibold text-gray-500">장바구니가 비어있어요</p>
          <p className="text-sm mt-1">맛있는 메뉴를 담아보세요</p>
          <button onClick={() => router.push('/restaurants')} className="mt-6 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-sm">
            식당 보러가기
          </button>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2">
            <span className="text-lg">📍</span>
            <span className="text-sm font-semibold text-orange-700">{cart[0].restaurant_name}</span>
          </div>

          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">수량 {item.quantity}개</p>
                  <p className="text-gray-900 font-black mt-1">{(item.price * item.quantity).toLocaleString()}원</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-gray-300 hover:text-red-400 transition text-xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">메뉴 {cart.length}개</span>
              <span className="text-2xl font-black text-gray-900">{total.toLocaleString()}원</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">배달비 별도</p>
            <button
              onClick={placeOrder}
              disabled={ordering}
              className="w-full bg-yellow-400 text-gray-900 py-4 rounded-2xl font-black text-base hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {ordering ? '주문 중...' : `${total.toLocaleString()}원 주문하기`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
