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

// Returns phase info based on elapsed time within each stage
function getPhase(createdAt: string, deliveryMinutes: number, now: number) {
  const elapsed = (now - new Date(createdAt).getTime()) / 1000;
  const total = deliveryMinutes * 60;
  const p0End = 10;                    // 10 seconds: 주문 접수중
  const p1End = total * (2 / 3);      // 2/3 of delivery: 메뉴 준비중
  const p2End = total;                 // rest: 배달중

  if (elapsed < p0End) {
    const rem = p0End - elapsed;
    return { phase: 0, label: '주문 접수중', emoji: '📋', bg: 'from-blue-500 to-blue-600',
      progress: (elapsed / p0End) * 100,
      timeLabel: `${fmtTime(rem)} 후 준비 시작` };
  }
  if (elapsed < p1End) {
    const rem = p1End - elapsed;
    return { phase: 1, label: '메뉴 준비중', emoji: '👨‍🍳', bg: 'from-yellow-500 to-orange-400',
      progress: ((elapsed - p0End) / (p1End - p0End)) * 100,
      timeLabel: `배달까지 ${fmtTime(rem)}` };
  }
  if (elapsed < p2End) {
    const rem = p2End - elapsed;
    return { phase: 2, label: '배달중 🛵', emoji: '🛵', bg: 'from-orange-500 to-rose-500',
      progress: ((elapsed - p1End) / (p2End - p1End)) * 100,
      timeLabel: `도착까지 ${fmtTime(rem)}` };
  }
  return { phase: 3, label: '배달 완료!', emoji: '✅', bg: 'from-green-500 to-emerald-500',
    progress: 100, timeLabel: '맛있게 드세요 😋' };
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

  // Tick every second — drives all live countdowns
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
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-3 rounded-full font-bold text-sm shadow-md">
            식당 보러가기
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const { phase, label, bg, progress, timeLabel } = getPhase(order.created_at, order.delivery_time, now);

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

                {/* 상태 헤더 */}
                <div className={`bg-gradient-to-r ${bg} p-5 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-medium opacity-80 mb-0.5">{order.restaurant_name}</p>
                      <p className="text-xl font-black">{label}</p>
                    </div>
                    <div className="text-right bg-white/20 rounded-2xl px-3 py-2">
                      <p className="text-xs opacity-80 mb-0.5">현재 상태</p>
                      <p className="text-sm font-black">{timeLabel}</p>
                    </div>
                  </div>

                  {/* 단계 표시 */}
                  <div className="flex items-center gap-1 mb-3">
                    {STEPS.map((step, i) => (
                      <div key={step.label} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center flex-1 ${i <= phase ? 'opacity-100' : 'opacity-40'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1
                            ${i < phase ? 'bg-white/90 text-gray-700' : i === phase ? 'bg-white ring-2 ring-white/50 text-gray-700 scale-110' : 'bg-white/30'}`}>
                            {i < phase ? '✓' : step.emoji}
                          </div>
                          <p className="text-[10px] font-semibold text-center leading-tight opacity-90">{step.label}</p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 rounded-full mb-4 ${i < phase ? 'bg-white/80' : 'bg-white/30'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 진행 막대 (단계 내 진행률) */}
                  {phase < 3 && (
                    <div>
                      <div className="flex justify-between text-xs opacity-75 mb-1">
                        <span>이 단계 진행률</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
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
