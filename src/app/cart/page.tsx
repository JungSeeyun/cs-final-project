'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  restaurant_name: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

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
      alert(`주문 완료! 주문번호: ${data.orderId}`);
      router.push('/orders');
    } else {
      alert(data.error);
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">🛒 장바구니</h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🛒</p>
          <p>장바구니가 비어있습니다</p>
        </div>
      ) : (
        <>
          {cart[0] && (
            <p className="text-sm text-gray-500 mb-4">
              📍 {cart[0].restaurant_name}
            </p>
          )}
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                  <p className="text-orange-500 font-bold">{(item.price * item.quantity).toLocaleString()}원</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition text-sm px-3 py-1 border border-gray-200 rounded-lg"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">총 금액</span>
              <span className="text-xl font-bold text-orange-500">{total.toLocaleString()}원</span>
            </div>
            <button
              onClick={placeOrder}
              disabled={ordering}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {ordering ? '주문 중...' : '주문하기'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
