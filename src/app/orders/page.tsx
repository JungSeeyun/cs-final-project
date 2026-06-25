'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface OrderItem { name: string; quantity: number; price_at_order: number; }
interface Order {
  id: number; restaurant_id: number; restaurant_name: string; total_price: number;
  status: string; created_at: string; delivery_time: number; items: OrderItem[];
}

const PHASE_STATUS = ['pending', 'preparing', 'delivering', 'done'] as const;

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

  if (elapsed < p0End) return { phase: 0, label: '주문 접수중', emoji: '📋', bg: 'bg-yellow-400', text: 'text-gray-900', timeLabel: `${fmtTime(p0End - elapsed)} 후 준비 시작` };
  if (elapsed < p1End) return { phase: 1, label: '메뉴 준비중', emoji: '👨‍🍳', bg: 'bg-amber-500', text: 'text-white', timeLabel: `배달까지 ${fmtTime(total - elapsed)}` };
  if (elapsed < total) return { phase: 2, label: '배달중', emoji: '🛵', bg: 'bg-orange-500', text: 'text-white', timeLabel: `도착까지 ${fmtTime(total - elapsed)}` };
  return { phase: 3, label: '배달 완료!', emoji: '✅', bg: 'bg-green-500', text: 'text-white', timeLabel: '맛있게 드세요 😋' };
}

const STEPS = [
  { label: '주문 접수', emoji: '📋' },
  { label: '메뉴 준비', emoji: '👨‍🍳' },
  { label: '배달중', emoji: '🛵' },
  { label: '완료', emoji: '✅' },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          className={`w-9 h-9 cursor-pointer transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const syncedStatus = useRef<Record<number, string>>({});

  // 리뷰 모달 상태
  const [reviewTarget, setReviewTarget] = useState<{ restaurantId: number; restaurantName: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

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

  useEffect(() => {
    orders.forEach(order => {
      const { phase } = getPhase(order.created_at, order.delivery_time, now);
      const newStatus = PHASE_STATUS[phase];
      if (syncedStatus.current[order.id] === newStatus) return;
      syncedStatus.current[order.id] = newStatus;
      fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    });
  }, [now, orders]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function submitReview() {
    if (!reviewTarget || !reviewRating) return;
    setSubmitting(true);
    const res = await fetch(`/api/restaurants/${reviewTarget.restaurantId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, content: reviewContent }),
    });
    setSubmitting(false);
    if (res.ok) {
      setReviewTarget(null);
      setReviewRating(0);
      setReviewContent('');
      showToast('✅ 리뷰가 등록되었습니다!');
    } else {
      const data = await res.json();
      showToast(data.error ?? '리뷰 등록에 실패했습니다');
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <div className="text-4xl animate-bounce">📋</div>
      <p className="text-gray-400 text-sm">불러오는 중...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm z-50 shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {reviewTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setReviewTarget(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-gray-900 mb-0.5">리뷰 작성</h3>
            <p className="text-sm text-gray-400 mb-5">{reviewTarget.restaurantName}</p>

            <p className="text-sm font-semibold text-gray-700 mb-2">별점</p>
            <StarPicker value={reviewRating} onChange={setReviewRating} />

            <textarea
              value={reviewContent}
              onChange={e => setReviewContent(e.target.value)}
              placeholder="식당은 어떠셨나요? 솔직한 후기를 남겨주세요"
              className="w-full mt-4 p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
              rows={4}
            />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setReviewTarget(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                취소
              </button>
              <button onClick={submitReview} disabled={submitting || !reviewRating}
                className="flex-1 py-3 rounded-xl bg-yellow-400 text-gray-900 text-sm font-bold hover:bg-yellow-500 transition disabled:opacity-40">
                {submitting ? '등록 중...' : '리뷰 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-black text-gray-900 mb-6">주문 내역</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-6xl mb-4">📋</p>
          <p className="font-bold text-gray-500 text-lg mb-1">아직 주문 내역이 없어요</p>
          <p className="text-sm mb-6">맛있는 음식을 주문해보세요!</p>
          <button onClick={() => router.push('/restaurants')} className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-yellow-500 transition">
            식당 보러가기
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => {
            const { phase, label, emoji, bg, text, timeLabel } = getPhase(order.created_at, order.delivery_time, now);
            const isDone = phase === 3;

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
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

                  {/* 배달 완료된 주문에만 리뷰 버튼 표시 */}
                  {isDone && (
                    <button
                      onClick={() => { setReviewTarget({ restaurantId: order.restaurant_id, restaurantName: order.restaurant_name }); setReviewRating(0); setReviewContent(''); }}
                      className="mt-3 w-full py-2.5 rounded-xl border-2 border-yellow-400 text-yellow-600 font-bold text-sm hover:bg-yellow-50 transition">
                      ✏️ 리뷰 쓰기!
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
