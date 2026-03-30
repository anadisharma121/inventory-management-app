import { NextResponse } from 'next/server';
import { getSessionUser } from '@/app/lib/auth';
import { deleteStockRow } from '@/app/lib/data';

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const formData = await request.formData();
  const rowId = String(formData.get('rowId') ?? '').trim();

  if (!rowId) {
    return NextResponse.json({ error: 'rowId is required' }, { status: 400 });
  }

  try {
    await deleteStockRow(sessionUser.tableName, rowId);
    return NextResponse.redirect(new URL('/dashboard/stocks', request.url));
  } catch (error) {
    console.error('Delete row error:', error);
    return NextResponse.json({ error: 'Failed to delete row' }, { status: 500 });
  }
}
