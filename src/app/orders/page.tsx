'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { name: string; quantity: number; price_at_order: number; }
interface Order { id: number; restaurant_name: string; total_price: number; status: string; created_at: string; items: OrderItem[]; }

const STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: '📦 접수 완료',  color: 'bg-blue-50 text-blue-600' },
  delivering: { label: '🛵 배달 중',    color: 'bg-orange-50 text-orange-600' },
  done:       { label: '✅ 배달 완료',  color: 'bg-green-50 text-green-600' },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => { if (res.status === 401) { router.push('/auth/login'); return null; } return res.json(); })
      .then(data => { if (data) setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="text-4xl animate-bounce">📋</div>
      <p className="text-gray-400 text-sm">불러오는 중...</p>
    </div>
  );

  return (
    <div className="pb-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold text-gray-500">아직 주문 내역이 없어요</p>
          <button onClick={() => router.push('/restaurants')} className="mt-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md">
            첫 주문 하러가기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = STATUS[order.status] ?? { label: order.status, color: 'bg-gray-50 text-gray-500' };
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-black text-gray-900">{order.restaurant_name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleString('ko-KR')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold shrink-0 ml-2 ${st.color}`}>
                    {st.label}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                      <span className="font-semibold text-gray-700">{(item.price_at_order * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-400">총 결제금액</span>
                  <span className="font-black text-orange-500 text-lg">{order.total_price.toLocaleString()}원</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
