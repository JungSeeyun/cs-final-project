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
    <nav className="sticky top-0 z-40 bg-yellow-400 px-6 py-4 flex items-center justify-between shadow-sm">
      <Link href="/restaurants" className="flex items-center gap-2">
        <span className="text-xl">🛵</span>
        <span className="text-lg font-black tracking-tight text-gray-900">BabBab</span>
      </Link>

      <div className="flex gap-4 items-center text-sm font-medium">
        <Link href="/restaurants" className="text-gray-800 hover:text-gray-600 transition hidden sm:block font-semibold">식당</Link>
        {user && (
          <>
            <Link href="/cart" className="text-gray-800 hover:text-gray-600 transition font-semibold">🛒 장바구니</Link>
            <Link href="/orders" className="text-gray-800 hover:text-gray-600 transition hidden sm:block font-semibold">📋 주문내역</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-yellow-400 rounded-full px-3 py-1 text-xs font-bold">{user.name}님</span>
            <button onClick={logout} className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 transition">
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="bg-gray-900 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
