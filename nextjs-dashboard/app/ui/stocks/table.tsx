import postgres from 'postgres';
import Link from 'next/link';
import { ReactNode } from 'react';
import { normalizeTableName } from '@/app/lib/auth';

interface DatabaseRow {
  [key: string]: unknown;
}

interface TableViewProps {
  tableName?: string;
  limit?: number;
  selectedAccount?: string;
  selectedWarehouse?: string;
}

export default async function StocksTable({
  tableName = 'base table',
  limit,
  selectedAccount = '',
  selectedWarehouse = '',
}: TableViewProps): Promise<ReactNode> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Missing database connection. Set DATABASE_URL in your environment.
      </div>
    );
  }

  const sql = postgres(connectionString, { ssl: 'require' });
  const resolvedTableName = normalizeTableName(tableName);

  let dbData: DatabaseRow[] = [];
  let fetchError: string | null = null;

  try {
    const result: DatabaseRow[] =
      typeof limit === 'number'
        ? await sql`SELECT * FROM ${sql(resolvedTableName)} LIMIT ${limit}`
        : await sql`SELECT * FROM ${sql(resolvedTableName)}`;
    dbData = result;
  } catch (error: unknown) {
    console.error('Failed to fetch data:', error);
    fetchError = error instanceof Error ? error.message : 'Unknown error occurred';
  } finally {
    await sql.end();
  }

  if (fetchError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error loading {resolvedTableName}: {fetchError}
      </div>
    );
  }

  if (dbData.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No rows found in {resolvedTableName}.
      </div>
    );
  }

  const tableHeaders: string[] = Object.keys(dbData[0]);
  const hasRowActions = dbData.some((row) => row.id !== null && row.id !== undefined && String(row.id).trim().length > 0);

  const findColumnByName = (name: string): string | undefined => {
    const exactMatch = tableHeaders.find((header) => header.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      return exactMatch;
    }
    return tableHeaders.find((header) => header.toLowerCase().includes(name.toLowerCase()));
  };

  const accountColumn = findColumnByName('account');
  const warehouseColumn = findColumnByName('warehouse');

  const accountOptions = accountColumn
    ? Array.from(new Set(dbData.map((row) => String(row[accountColumn] ?? '').trim()).filter(Boolean))).sort()
    : [];

  const warehouseOptions = warehouseColumn
    ? Array.from(new Set(dbData.map((row) => String(row[warehouseColumn] ?? '').trim()).filter(Boolean))).sort()
    : [];

  const filteredRows = dbData.filter((row) => {
    const accountMatches =
      !selectedAccount || !accountColumn
        ? true
        : String(row[accountColumn] ?? '').trim() === selectedAccount;

    const warehouseMatches =
      !selectedWarehouse || !warehouseColumn
        ? true
        : String(row[warehouseColumn] ?? '').trim() === selectedWarehouse;

    return accountMatches && warehouseMatches;
  });

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <form className="space-y-4" method="get">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-sky-600" htmlFor="account-filter">
                Account
              </label>
              <select
                id="account-filter"
                name="account"
                defaultValue={selectedAccount}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Select Account</option>
                {accountOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-sky-600" htmlFor="warehouse-filter">
                Warehouse
              </label>
              <select
                id="warehouse-filter"
                name="warehouse"
                defaultValue={selectedWarehouse}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              >
                <option value="">Select Warehouse</option>
                {warehouseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <a
              href="/dashboard/stocks"
              className="rounded-md border border-sky-400 px-5 py-2 text-sm font-semibold text-sky-500 hover:bg-sky-50"
            >
              Reset
            </a>
            <button
              type="submit"
              className="rounded-md border border-sky-400 bg-white px-5 py-2 text-sm font-semibold text-sky-500 hover:bg-sky-50"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="p-4">
        <p className="mb-3 text-sm text-gray-600">Showing {filteredRows.length} rows</p>

        <table className="w-full table-fixed border text-left text-xs text-gray-700">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-sky-600">
            <tr>
              {tableHeaders.map((header: string) => (
                <th key={header} className="border-b px-2 py-2 font-semibold">
                  {header}
                </th>
              ))}
              {hasRowActions && (
                <th className="border-b px-2 py-2 font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredRows.map((row: DatabaseRow, rowIndex: number) => (
              <tr key={String(row.id ?? rowIndex)}>
                {tableHeaders.map((header: string) => (
                  <td key={`${rowIndex}-${header}`} className="break-words px-2 py-2 align-top">
                    {formatCellValue(row[header])}
                  </td>
                ))}
                {hasRowActions && (
                  <td className="whitespace-nowrap px-2 py-2 align-top">
                    {row.id ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/stocks/${encodeURIComponent(String(row.id))}/edit`}
                          className="rounded-md border border-sky-300 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                        >
                          Edit
                        </Link>
                        <form action="/api/stocks/delete" method="post">
                          <input type="hidden" name="rowId" value={String(row.id)} />
                          <button
                            type="submit"
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No id</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">No rows matched the selected filters.</p>
        )}
      </div>
    </div>
  );
}