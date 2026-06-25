import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_STATUSES = ['pending', 'preparing', 'delivering', 'done'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: '인증 오류' }, { status: 401 });

  let userId: number;
  try { userId = verifyToken(token).userId; } catch {
    return NextResponse.json({ error: '인증 오류' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값' }, { status: 400 });
  }

  // 본인 주문만 업데이트 가능
  const result = await query(
    'UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
    [status, id, userId]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json({ message: '상태 업데이트 완료', status });
}
