import { NextResponse } from 'next/server';
import { getSessionUser } from '@/app/lib/auth';
import { fetchStockRowById, updateStockRow } from '@/app/lib/data';

function coerceValue(previousValue: unknown, nextValue: FormDataEntryValue | null): unknown {
  if (nextValue === null) {
    return previousValue;
  }

  const textValue = String(nextValue);

  if (typeof previousValue === 'number') {
    const parsed = Number(textValue);
    return Number.isFinite(parsed) ? parsed : previousValue;
  }

  if (typeof previousValue === 'boolean') {
    return textValue === 'true';
  }

  if (previousValue instanceof Date) {
    return new Date(textValue);
  }

  if (typeof previousValue === 'object' && previousValue !== null) {
    try {
      return JSON.parse(textValue);
    } catch {
      return previousValue;
    }
  }

  return textValue;
}

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

  const currentRow = await fetchStockRowById(sessionUser.tableName, rowId);

  if (!currentRow) {
    return NextResponse.json({ error: 'Row not found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  for (const [columnName, previousValue] of Object.entries(currentRow)) {
    if (columnName === 'id') {
      continue;
    }

    updates[columnName] = coerceValue(previousValue, formData.get(columnName));
  }

  try {
    await updateStockRow(sessionUser.tableName, rowId, updates);
    return NextResponse.redirect(new URL('/dashboard/stocks', request.url));
  } catch (error) {
    console.error('Update row error:', error);
    return NextResponse.json({ error: 'Failed to update row' }, { status: 500 });
  }
}
