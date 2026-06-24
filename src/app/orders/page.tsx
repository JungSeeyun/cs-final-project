'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  name: string;
  quantity: number;
  price_at_order: number;
}

interface Order {
  id: number;
  restaurant_name: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const STATUS_LABEL: Record<string, string> = {
  pending: '📦 접수 완료',
  delivering: '🛵 배달 중',
  done: '✅ 배달 완료',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => {
        if (res.status === 401) { router.push('/auth/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setOrders(data.orders ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">{order.restaurant_name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <span className="text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>

              <div className="border-t border-gray-50 pt-3 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price_at_order * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="text-sm text-gray-500">합계</span>
                <span className="font-bold text-orange-500">{order.total_price.toLocaleString()}원</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
