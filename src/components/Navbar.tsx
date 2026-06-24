'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <nav className="bg-orange-500 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link href="/restaurants" className="text-xl font-bold tracking-tight">
        🛵 배달앱
      </Link>
      <div className="flex gap-5 items-center text-sm font-medium">
        <Link href="/restaurants" className="hover:text-orange-200 transition">식당 목록</Link>
        {user && (
          <>
            <Link href="/cart" className="hover:text-orange-200 transition">🛒 장바구니</Link>
            <Link href="/orders" className="hover:text-orange-200 transition">📋 주문내역</Link>
          </>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-orange-100">{user.name}님</span>
            <button
              onClick={logout}
              className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
