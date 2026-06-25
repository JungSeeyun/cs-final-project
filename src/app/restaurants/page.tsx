'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const RANDOM_FOODS = [
  { name: '치킨', emoji: '🍗' }, { name: '피자', emoji: '🍕' }, { name: '초밥', emoji: '🍣' },
  { name: '비빔밥', emoji: '🍚' }, { name: '라면', emoji: '🍜' }, { name: '떡볶이', emoji: '🌶️' },
  { name: '삼겹살', emoji: '🥩' }, { name: '파스타', emoji: '🍝' }, { name: '타코', emoji: '🌮' },
  { name: '샐러드', emoji: '🥗' }, { name: '김치찌개', emoji: '🍲' }, { name: '냉면', emoji: '🍱' },
  { name: '햄버거', emoji: '🍔' }, { name: '국밥', emoji: '🥣' }, { name: '순대국', emoji: '🫕' },
];

interface Restaurant {
  id: number; name: string; category: string; description: string;
  delivery_time: number; min_order: number; image_url?: string;
  avg_rating: number; review_count: number;
}

const CATEGORIES = ['전체', '치킨', '피자', '일식', '한식'];
const CAT_EMOJI: Record<string, string> = { 치킨: '🍗', 피자: '🍕', 일식: '🍣', 한식: '🍚' };
const CAT_COLOR: Record<string, string> = {
  치킨: 'bg-amber-50 text-amber-700',
  피자: 'bg-red-50 text-red-600',
  일식: 'bg-blue-50 text-blue-600',
  한식: 'bg-green-50 text-green-700',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('전체');
  const [search, setSearch] = useState('');
  const [luckyFood, setLuckyFood] = useState<{ name: string; emoji: string } | null>(null);

  useEffect(() => {
    fetch('/api/restaurants')
      .then(r => r.json())
      .then(data => { setRestaurants(data.restaurants ?? []); setLoading(false); });
  }, []);

  const filtered = restaurants.filter(r => {
    const matchCat = selected === '전체' || r.category === selected;
    const matchSearch = !search || r.name.includes(search) || r.description.includes(search) || r.category.includes(search);
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-3">
      <div className="text-5xl animate-bounce">🛵</div>
      <p className="text-gray-400 text-sm font-medium">맛있는 식당을 불러오는 중...</p>
    </div>
  );

  return (
    <div>
      {/* 음식운 모달 */}
      {luckyFood && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setLuckyFood(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="text-7xl mb-4">{luckyFood.emoji}</div>
            <p className="text-xs text-gray-400 font-medium mb-1">오늘의 음식운</p>
            <h2 className="text-3xl font-black text-gray-900 mb-1">{luckyFood.name}</h2>
            <p className="text-sm text-gray-400">오늘은 {luckyFood.name} 어때요? 😋</p>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setLuckyFood(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">닫기</button>
              <button onClick={() => setLuckyFood(RANDOM_FOODS[Math.floor(Math.random() * RANDOM_FOODS.length)])} className="flex-1 py-3 rounded-2xl bg-yellow-400 text-gray-900 text-sm font-bold hover:bg-yellow-500 transition">다시 뽑기 🎲</button>
            </div>
          </div>
        </div>
      )}

      {/* 히어로 — 가로 레이아웃, 노란색 유지 */}
      <div className="bg-yellow-400 rounded-2xl px-8 py-6 mb-6 flex items-center justify-between overflow-hidden relative">
        <div>
          <p className="text-sm font-semibold text-yellow-800 mb-1">BabBab 배달 🛵</p>
          <h1 className="text-3xl font-black text-gray-900 mb-4">오늘 뭐 먹지?</h1>
          <button
            onClick={() => setLuckyFood(RANDOM_FOODS[Math.floor(Math.random() * RANDOM_FOODS.length)])}
            className="bg-gray-900 text-yellow-400 font-bold rounded-xl px-5 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-800 active:scale-95 transition">
            🎲 오늘의 음식운은?
          </button>
        </div>
        <div className="hidden sm:grid grid-cols-3 gap-2 text-4xl select-none opacity-80 shrink-0">
          {['🍗','🍕','🍣','🍚','🍜','🥩'].map(e => (
            <span key={e} className="flex items-center justify-center w-12 h-12 bg-yellow-300/60 rounded-xl">{e}</span>
          ))}
        </div>
      </div>

      {/* 검색 + 카테고리 한 줄 */}
      <div className="flex gap-3 mb-5 items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="식당명, 카테고리 검색"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-xs">✕</button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelected(cat)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                selected === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
              }`}>
              {CAT_EMOJI[cat] && <span className="mr-1">{CAT_EMOJI[cat]}</span>}{cat}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 수 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium">
          {search ? <><span className="text-gray-900 font-bold">"{search}"</span> 검색결과 </> : '전체 '}
          <span className="font-bold text-gray-900">{filtered.length}개</span>
        </p>
      </div>

      {/* 식당 그리드 — 3열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => (
          <Link key={r.id} href={`/restaurants/${r.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
              {/* 이미지 */}
              <div className="h-44 overflow-hidden relative bg-gray-100">
                {r.image_url
                  ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-6xl">{CAT_EMOJI[r.category] ?? '🍽️'}</div>
                }
                {/* 카테고리 뱃지 */}
                <span className={`absolute top-2.5 left-2.5 text-xs px-2 py-0.5 rounded-lg font-bold ${CAT_COLOR[r.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {CAT_EMOJI[r.category]} {r.category}
                </span>
                {/* 배달 시간 뱃지 */}
                <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-xs px-2 py-0.5 rounded-lg font-semibold backdrop-blur-sm">
                  ⏱ {r.delivery_time}분
                </span>
              </div>

              {/* 정보 */}
              <div className="p-4">
                <h2 className="font-black text-gray-900 text-base mb-0.5">{r.name}</h2>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{r.description}</p>

                <div className="flex items-center justify-between">
                  {/* 평점 */}
                  <div className="flex items-center gap-1">
                    <Stars rating={Number(r.avg_rating)} />
                    <span className="text-xs font-bold text-gray-700 ml-0.5">
                      {Number(r.avg_rating) > 0 ? Number(r.avg_rating).toFixed(1) : '신규'}
                    </span>
                    {r.review_count > 0 && <span className="text-xs text-gray-400">({r.review_count})</span>}
                  </div>
                  {/* 최소주문 */}
                  <span className="text-xs text-gray-400">최소 <span className="font-semibold text-gray-600">{r.min_order.toLocaleString()}원</span></span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-500 mb-1">검색 결과가 없어요</p>
          <p className="text-sm">다른 키워드로 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
