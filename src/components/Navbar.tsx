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
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <Link href="/restaurants" className="flex items-center gap-2">
        <span className="bg-white/20 rounded-xl px-2 py-1 text-xl">🛵</span>
        <span className="text-lg font-black tracking-tight">BabBab</span>
      </Link>

      <div className="flex gap-4 items-center text-sm font-medium">
        <Link href="/restaurants" className="hover:text-white/70 transition hidden sm:block">식당</Link>
        {user && (
          <>
            <Link href="/cart" className="hover:text-white/70 transition">🛒 장바구니</Link>
            <Link href="/orders" className="hover:text-white/70 transition hidden sm:block">📋 주문내역</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">{user.name}님</span>
            <button
              onClick={logout}
              className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="bg-white text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-orange-50 transition shadow-sm">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
