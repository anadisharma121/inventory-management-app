import postgres from 'postgres';
import { InvoicesTable, Revenue } from './definitions';
import { normalizeTableName } from './auth';

export type StockRow = Record<string, unknown>;

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      const trimmed = value.trim();
      return trimmed.replace(/^['"](.*)['"]$/, '$1');
    }
  }
  return '';
}

function createSqlClient() {
  const connectionString = readEnv('DATABASE_URL', 'POSTGRES_URL');

  if (!connectionString) {
    throw new Error('Missing DATABASE_URL or POSTGRES_URL environment variable.');
  }

  return postgres(connectionString, { ssl: 'require' });
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function toSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (value instanceof Date) {
    return `'${value.toISOString().replace(/'/g, "''")}'`;
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }

  return `'${String(value).replace(/'/g, "''")}'`;
}

function resolveTableName(input: string): string {
  const cleanInput = input.trim();
  if (!cleanInput) {
    return '';
  }

  const user1Id = readEnv('USER1_ID');
  const user2Id = readEnv('USER2_ID');
  const table1 = readEnv('TABLE1_NAME');
  const table2 = readEnv('TABLE2_NAME');

  if (cleanInput === user1Id) {
    return table1;
  }

  if (cleanInput === user2Id) {
    return table2;
  }

  // Backward-compatible: treat unknown input as an explicit table name,
  // then normalize legacy aliases such as stock_table1.
  return normalizeTableName(cleanInput);
}

// export async function fetchRevenue() {
//   const sql = createSqlClient();

//   try {
//     const tableName = readEnv('TABLE1_NAME', 'USER1_TABLE', 'APP_USER1_TABLE') || 'base table';
//     const data = await sql<Revenue[]>`SELECT * FROM ${sql(tableName)};`;

//     return data;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   } finally {
//     await sql.end();
//   }
// }

export async function fetchStockData(userId: string) {
  const sql = createSqlClient();

  try {
    const tableName = resolveTableName(userId);

    if (!tableName) {
      throw new Error('Table name could not be resolved from input.');
    }

    const data = await sql`SELECT * FROM ${sql(tableName)}`;

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch stock data.');
  } finally {
    await sql.end();
  }
}

export async function fetchStockRowById(tableName: string, rowId: string): Promise<StockRow | null> {
  const sql = createSqlClient();

  try {
    const resolvedTableName = normalizeTableName(tableName);
    const rows = await sql<StockRow[]>`
      SELECT *
      FROM ${sql(resolvedTableName)}
      WHERE id = ${rowId}
      LIMIT 1
    `;

    return rows[0] ?? null;
  } finally {
    await sql.end();
  }
}

export async function updateStockRow(
  tableName: string,
  rowId: string,
  updates: StockRow,
): Promise<void> {
  const sql = createSqlClient();

  try {
    const resolvedTableName = normalizeTableName(tableName);
    const updateEntries = Object.entries(updates).filter(
      ([columnName, value]) => columnName !== 'id' && value !== undefined,
    );

    if (updateEntries.length === 0) {
      return;
    }

    const assignmentSql = updateEntries
      .map(([columnName, value]) => `${quoteIdentifier(columnName)} = ${toSqlLiteral(value)}`)
      .join(', ');

    await sql.unsafe(
      `UPDATE ${quoteIdentifier(resolvedTableName)} SET ${assignmentSql} WHERE ${quoteIdentifier('id')} = ${toSqlLiteral(rowId)}`,
    );
  } finally {
    await sql.end();
  }
}

export async function deleteStockRow(tableName: string, rowId: string): Promise<void> {
  const sql = createSqlClient();

  try {
    const resolvedTableName = normalizeTableName(tableName);
    await sql.unsafe(
      `DELETE FROM ${quoteIdentifier(resolvedTableName)} WHERE ${quoteIdentifier('id')} = ${toSqlLiteral(rowId)}`,
    );
  } finally {
    await sql.end();
  }
}


