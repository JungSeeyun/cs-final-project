'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User { id: number; name: string; email: string; }

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
      <Link href="/restaurants" className="flex items-center gap-2">
        <span className="text-xl">🛵</span>
        <span className="text-lg font-black tracking-tight text-gray-900">BabBab</span>
      </Link>

      <div className="flex gap-1 items-center text-sm font-medium">
        <Link href="/restaurants" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg hidden sm:block">식당</Link>
        {user && (
          <>
            <Link href="/cart" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg">🛒 장바구니</Link>
            <Link href="/orders" className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition px-3 py-1.5 rounded-lg hidden sm:block">📋 주문내역</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs font-semibold text-gray-500 hidden sm:block">{user.name}님</span>
            <button onClick={logout} className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition">
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="ml-2 bg-gray-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 transition">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
