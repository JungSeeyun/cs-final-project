'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/restaurants';
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛵</div>
          <h1 className="text-3xl font-black text-gray-900">다시 오셨군요!</h1>
          <p className="text-gray-500 mt-1 text-sm">로그인하고 맛있는 음식을 주문하세요</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 border border-yellow-200">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition bg-gray-50"
                placeholder="example@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition bg-gray-50"
                placeholder="비밀번호를 입력하세요" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-yellow-400 text-gray-900 py-3.5 rounded-xl font-bold text-base hover:bg-yellow-500 transition disabled:opacity-50">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-gray-900 font-bold hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
