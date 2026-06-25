import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

function getUserId(req: NextRequest): number | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try { return verifyToken(token).userId; } catch { return null; }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });

  const { id } = await params;
  const { rating, content } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '별점을 선택해주세요 (1~5)' }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: '리뷰 내용을 입력해주세요' }, { status: 400 });
  }

  const existing = await query(
    'SELECT id FROM reviews WHERE restaurant_id = $1 AND user_id = $2',
    [id, userId]
  );
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: '이미 리뷰를 작성했습니다' }, { status: 409 });
  }

  await query(
    'INSERT INTO reviews (restaurant_id, user_id, rating, content) VALUES ($1, $2, $3, $4)',
    [id, userId, rating, content.trim()]
  );

  return NextResponse.json({ message: '리뷰가 등록되었습니다' }, { status: 201 });
}
