'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { name: string; quantity: number; price_at_order: number; }
interface Order { id: number; restaurant_name: string; total_price: number; status: string; created_at: string; delivery_time: number; items: OrderItem[]; }

// Delivery phases based on elapsed seconds:
//  0 ~ 10s         → 주문 접수중
//  10s ~ 2/3 time  → 메뉴 준비중
//  2/3 time ~ time → 배달중
//  > time          → 배달 완료!
function getPhase(createdAt: string, deliveryMinutes: number) {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000; // seconds
  const total = deliveryMinutes * 60;
  const preparing = total * (2 / 3);
  if (elapsed < 10) return { phase: 0, label: '주문 접수중', emoji: '📋', color: 'bg-blue-500', elapsed, total };
  if (elapsed < preparing) return { phase: 1, label: '메뉴 준비중', emoji: '👨‍🍳', color: 'bg-yellow-500', elapsed, total };
  if (elapsed < total) return { phase: 2, label: '배달중', emoji: '🛵', color: 'bg-orange-500', elapsed, total };
  return { phase: 3, label: '배달 완료!', emoji: '✅', color: 'bg-green-500', elapsed, total };
}

function eta(createdAt: string, deliveryMinutes: number) {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000;
  const remaining = Math.max(0, deliveryMinutes * 60 - elapsed);
  if (remaining === 0) return null;
  const m = Math.floor(remaining / 60);
  const s = Math.floor(remaining % 60);
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

const PHASE_STEPS = ['주문 접수', '준비중', '배달중', '완료'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => { if (res.status === 401) { router.push('/auth/login'); return null; } return res.json(); })
      .then(data => { if (data) setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Tick every second to update live status
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <div className="text-4xl animate-bounce">📋</div>
      <p className="text-gray-400 text-sm">불러오는 중...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-6xl mb-4">📋</p>
          <p className="font-bold text-gray-500 text-lg mb-1">아직 주문 내역이 없어요</p>
          <p className="text-sm mb-6">맛있는 음식을 주문해보세요!</p>
          <button onClick={() => router.push('/restaurants')} className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold text-sm shadow-md hover:opacity-90 transition">
            식당 보러가기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const { phase, label, emoji, color, elapsed, total } = getPhase(order.created_at, order.delivery_time);
            const remaining = eta(order.created_at, order.delivery_time);
            const progress = Math.min(100, (elapsed / total) * 100);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* 상태 헤더 */}
                <div className={`${color} px-5 py-3 flex items-center justify-between text-white`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{emoji}</span>
                    <div>
                      <p className="font-black text-sm">{label}</p>
                      <p className="text-xs opacity-80">{order.restaurant_name}</p>
                    </div>
                  </div>
                  {remaining && (
                    <div className="text-right">
                      <p className="text-xs opacity-80">예상 도착</p>
                      <p className="font-black text-sm">{remaining}</p>
                    </div>
                  )}
                </div>

                {/* 진행바 */}
                {phase < 3 && (
                  <div className="px-5 pt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      {PHASE_STEPS.map((step, i) => (
                        <span key={step} className={`font-medium ${i <= phase ? 'text-orange-500' : ''}`}>{step}</span>
                      ))}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {/* 주문 내역 */}
                <div className="p-5 pt-3">
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 mt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                        <span className="font-semibold text-gray-700">{(item.price_at_order * item.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('ko-KR')}</span>
                    </div>
                    <span className="font-black text-orange-500 text-lg">{order.total_price.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
