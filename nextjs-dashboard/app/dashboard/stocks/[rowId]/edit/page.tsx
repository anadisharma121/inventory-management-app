import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { lusitana } from '@/app/ui/fonts';
import { getSessionUser } from '@/app/lib/auth';
import { fetchStockRowById } from '@/app/lib/data';

type EditStockPageProps = {
  params?: Promise<{
    rowId?: string;
  }>;
};

function formatInputValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default async function EditStockPage({ params }: EditStockPageProps) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/');
  }

  const resolvedParams = params ? await params : undefined;
  const rowId = resolvedParams?.rowId?.trim() ?? '';

  if (!rowId) {
    notFound();
  }

  const row = await fetchStockRowById(sessionUser.tableName, rowId);

  if (!row) {
    notFound();
  }

  const editableEntries = Object.entries(row).filter(([key]) => key !== 'id');

  return (
    <main>
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className={`${lusitana.className} text-xl md:text-2xl`}>
            Edit Row
          </h1>
          <p className="text-sm text-gray-600">Table: {sessionUser.tableName}</p>
        </div>
        <Link
          href="/dashboard/stocks"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </Link>
      </div>

      <form action="/api/stocks/update" method="post" className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <input type="hidden" name="rowId" value={rowId} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {editableEntries.map(([key, value]) => {
            const inputId = `field-${key}`;
            const fieldValue = formatInputValue(value);

            if (typeof value === 'boolean') {
              return (
                <label key={key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  <span className="capitalize">{key}</span>
                  <select
                    id={inputId}
                    name={key}
                    defaultValue={String(value)}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
              );
            }

            if (typeof value === 'number') {
              return (
                <label key={key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  <span className="capitalize">{key}</span>
                  <input
                    id={inputId}
                    name={key}
                    type="number"
                    step="any"
                    defaultValue={fieldValue}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              );
            }

            if (typeof value === 'object' && value !== null) {
              return (
                <label key={key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
                  <span className="capitalize">{key}</span>
                  <textarea
                    id={inputId}
                    name={key}
                    rows={4}
                    defaultValue={fieldValue}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </label>
              );
            }

            return (
              <label key={key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <span className="capitalize">{key}</span>
                <input
                  id={inputId}
                  name={key}
                  type="text"
                  defaultValue={fieldValue}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/stocks"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md border border-sky-400 bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
}
