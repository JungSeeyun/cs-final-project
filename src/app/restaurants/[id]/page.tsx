'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface MenuItem { id: number; name: string; description: string; price: number; }
interface Restaurant { id: number; name: string; category: string; description: string; delivery_time: number; min_order: number; image_url?: string; avg_rating: number; review_count: number; }
interface CartItem { restaurant_id: number; }
interface Review { id: number; user_name: string; rating: number; content: string; created_at: string; }

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`${s} ${i <= rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          className={`w-8 h-8 cursor-pointer transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function RestaurantPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [conflictItem, setConflictItem] = useState<{ id: number; name: string } | null>(null);
  const [cartRestaurantId, setCartRestaurantId] = useState<number | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}/menu`)
      .then(r => r.json())
      .then(data => { setRestaurant(data.restaurant); setMenu(data.menu); setReviews(data.reviews ?? []); setLoading(false); });
    fetch('/api/cart').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.cart?.length > 0) setCartRestaurantId((data.cart[0] as CartItem).restaurant_id);
    });
  }, [id]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function addToCart(menuItemId: number, menuName: string) {
    if (!localStorage.getItem('user')) { setShowLoginModal(true); return; }
    if (cartRestaurantId && cartRestaurantId !== Number(id)) { setConflictItem({ id: menuItemId, name: menuName }); return; }
    await doAddToCart(menuItemId);
  }

  async function doAddToCart(menuItemId: number) {
    setAdding(menuItemId);
    const res = await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuItemId }) });
    setAdding(null);
    if (res.status === 401) { setShowLoginModal(true); return; }
    setCartRestaurantId(Number(id));
    showToast('🛒 장바구니에 담았습니다!');
  }

  async function handleConflictConfirm() {
    if (!conflictItem) return;
    await fetch('/api/cart', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clearAll: true }) });
    setConflictItem(null);
    await doAddToCart(conflictItem.id);
  }

  async function submitReview() {
    if (!localStorage.getItem('user')) { setShowLoginModal(true); return; }
    if (!reviewRating) { showToast('별점을 선택해주세요'); return; }
    if (!reviewContent.trim()) { showToast('리뷰 내용을 입력해주세요'); return; }
    setSubmitting(true);
    const res = await fetch(`/api/restaurants/${id}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, content: reviewContent }),
    });
    setSubmitting(false);
    if (res.ok) {
      showToast('✅ 리뷰가 등록되었습니다!');
      setShowReviewForm(false); setReviewRating(0); setReviewContent('');
      const data = await fetch(`/api/restaurants/${id}/menu`).then(r => r.json());
      setReviews(data.reviews ?? []); setRestaurant(data.restaurant);
    } else {
      const data = await res.json();
      showToast(data.error ?? '리뷰 등록에 실패했습니다');
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <div className="text-5xl animate-bounce">🍽️</div>
      <p className="text-gray-400 text-sm">메뉴를 불러오는 중...</p>
    </div>
  );
  if (!restaurant) return <p className="text-center py-20 text-gray-400">식당을 찾을 수 없습니다</p>;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm z-50 shadow-xl whitespace-nowrap animate-fade-in">
          {toast}
        </div>
      )}

      {/* 로그인 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-4"><div className="text-4xl mb-2">🔐</div>
              <h3 className="text-lg font-black text-gray-900">로그인이 필요해요</h3>
              <p className="text-sm text-gray-400 mt-1">이 기능을 사용하려면 로그인해주세요</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-sm font-semibold text-gray-400">닫기</button>
              <Link href="/auth/login" className="flex-1 py-3 rounded-2xl bg-yellow-400 text-gray-900 text-sm font-bold text-center">로그인</Link>
            </div>
          </div>
        </div>
      )}

      {/* 장바구니 충돌 모달 */}
      {conflictItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-black text-gray-900">같은 가게 메뉴만 담을 수 있어요</h3>
            <p className="text-xs text-gray-400 mt-2">기존 장바구니를 비우고 새 메뉴를 담을까요?</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setConflictItem(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-sm font-semibold text-gray-400">취소</button>
              <button onClick={handleConflictConfirm} className="flex-1 py-3 rounded-2xl bg-yellow-400 text-gray-900 text-sm font-bold">비우고 담기</button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 이미지 */}
      <div className="h-52 rounded-3xl overflow-hidden mb-4 relative bg-gray-100">
        {restaurant.image_url
          ? <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-8xl">🍽️</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-xs opacity-75 font-medium">{restaurant.category}</p>
          <h1 className="text-2xl font-black">{restaurant.name}</h1>
        </div>
      </div>

      {/* 식당 정보 */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">{restaurant.description}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Stars rating={Number(restaurant.avg_rating)} size="sm" />
            <span className="font-black text-sm text-gray-800">{Number(restaurant.avg_rating) > 0 ? Number(restaurant.avg_rating).toFixed(1) : '신규'}</span>
            <span className="text-xs text-gray-400">리뷰 {restaurant.review_count}개</span>
          </div>
          <span className="text-gray-200">|</span>
          <span className="text-sm text-gray-500">⏱ {restaurant.delivery_time}분</span>
          <span className="text-gray-200">|</span>
          <span className="text-sm text-gray-500">💰 최소 {restaurant.min_order.toLocaleString()}원</span>
        </div>
      </div>

      {/* 메뉴 */}
      <h2 className="text-base font-black text-gray-800 mb-3 px-1">메뉴</h2>
      <div className="space-y-2 mb-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-orange-100 hover:shadow-md transition-all">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
              {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
              <p className="text-yellow-600 font-black mt-1.5">{item.price.toLocaleString()}원</p>
            </div>
            <button onClick={() => addToCart(item.id, item.name)} disabled={adding === item.id}
              className="ml-4 shrink-0 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-500 transition disabled:opacity-50 shadow-sm">
              {adding === item.id ? '...' : '담기'}
            </button>
          </div>
        ))}
      </div>

      {/* 리뷰 섹션 */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-base font-black text-gray-800">리뷰 {reviews.length}개</h2>
            {Number(restaurant.avg_rating) > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={Math.round(Number(restaurant.avg_rating))} size="sm" />
                <span className="text-lg font-black text-gray-900">{Number(restaurant.avg_rating).toFixed(1)}</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowReviewForm(v => !v)}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-500 transition shadow-sm">
            {showReviewForm ? '취소' : '✏️ 리뷰 작성'}
          </button>
        </div>

        {/* 리뷰 작성 폼 */}
        {showReviewForm && (
          <div className="bg-yellow-50 border border-orange-100 rounded-2xl p-4 mb-4">
            <p className="text-sm font-bold text-gray-700 mb-3">별점을 선택해주세요</p>
            <StarPicker value={reviewRating} onChange={setReviewRating} />
            <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)}
              placeholder="이 식당은 어떠셨나요? 솔직한 리뷰를 남겨주세요"
              className="w-full mt-3 p-3 rounded-xl border border-orange-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              rows={3} />
            <button onClick={submitReview} disabled={submitting}
              className="mt-2 w-full py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold text-sm hover:bg-yellow-500 transition disabled:opacity-50">
              {submitting ? '등록 중...' : '리뷰 등록하기'}
            </button>
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">아직 리뷰가 없어요. 첫 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(rv => (
              <div key={rv.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{rv.user_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Stars rating={rv.rating} />
                      <span className="text-xs text-gray-400">{rv.rating}.0</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">{new Date(rv.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{rv.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
