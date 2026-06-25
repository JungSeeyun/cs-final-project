'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { name: string; quantity: number; price_at_order: number; }
interface Order {
  id: number; restaurant_name: string; total_price: number;
  status: string; created_at: string; delivery_time: number; items: OrderItem[];
}

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function getPhase(createdAt: string, deliveryMinutes: number, now: number) {
  const elapsed = (now - new Date(createdAt).getTime()) / 1000;
  const total = deliveryMinutes * 60;
  const p0End = 10;
  const p1End = total * (2 / 3);

  if (elapsed < p0End) {
    return { phase: 0, label: '주문 접수중', emoji: '📋',
      bg: 'bg-yellow-400', text: 'text-gray-900',
      timeLabel: `${fmtTime(p0End - elapsed)} 후 준비 시작` };
  }
  if (elapsed < p1End) {
    return { phase: 1, label: '메뉴 준비중', emoji: '👨‍🍳',
      bg: 'bg-amber-500', text: 'text-white',
      timeLabel: `배달까지 ${fmtTime(total - elapsed)}` };
  }
  if (elapsed < total) {
    return { phase: 2, label: '배달중', emoji: '🛵',
      bg: 'bg-orange-500', text: 'text-white',
      timeLabel: `도착까지 ${fmtTime(total - elapsed)}` };
  }
  return { phase: 3, label: '배달 완료!', emoji: '✅',
    bg: 'bg-green-500', text: 'text-white',
    timeLabel: '맛있게 드세요 😋' };
}

const STEPS = [
  { label: '주문 접수', emoji: '📋' },
  { label: '메뉴 준비', emoji: '👨‍🍳' },
  { label: '배달중', emoji: '🛵' },
  { label: '완료', emoji: '✅' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch('/api/orders')
      .then(res => { if (res.status === 401) { router.push('/auth/login'); return null; } return res.json(); })
      .then(data => { if (data) setOrders(data.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
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
          <button onClick={() => router.push('/restaurants')}
            className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition">
            식당 보러가기
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const { phase, label, emoji, bg, text, timeLabel } = getPhase(order.created_at, order.delivery_time, now);

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                {/* 상태 헤더 */}
                <div className={`${bg} p-5`}>
                  <div className={`flex items-center justify-between ${text}`}>
                    <div>
                      <p className="text-xs font-semibold opacity-75 mb-0.5">{order.restaurant_name}</p>
                      <p className="text-xl font-black">{emoji} {label}</p>
                    </div>
                    <div className={`text-right rounded-2xl px-3 py-2 ${phase === 0 ? 'bg-gray-900/10' : 'bg-black/10'}`}>
                      <p className="text-xs opacity-75 mb-0.5">현재 상태</p>
                      <p className="text-sm font-black">{timeLabel}</p>
                    </div>
                  </div>

                  {/* 단계 표시 */}
                  <div className={`flex items-center gap-1 mt-4 ${text}`}>
                    {STEPS.map((step, i) => (
                      <div key={step.label} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center flex-1 transition-opacity ${i <= phase ? 'opacity-100' : 'opacity-35'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1 font-bold
                            ${i < phase ? 'bg-white/90 text-gray-700' : i === phase ? 'bg-white ring-2 ring-white/40 text-gray-800 scale-110' : 'bg-white/25'}`}>
                            {i < phase ? '✓' : step.emoji}
                          </div>
                          <p className="text-[10px] font-semibold text-center leading-tight">{step.label}</p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 rounded-full mb-4 ${i < phase ? 'bg-white/70' : 'bg-white/25'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 주문 내역 */}
                <div className="p-5">
                  <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} <span className="text-gray-400">× {item.quantity}</span></span>
                        <span className="font-semibold text-gray-800">{(item.price_at_order * item.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString('ko-KR')}</span>
                    <span className="font-black text-gray-900 text-lg">{order.total_price.toLocaleString()}원</span>
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
