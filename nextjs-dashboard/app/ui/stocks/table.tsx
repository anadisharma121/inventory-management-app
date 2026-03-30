import postgres from 'postgres';
import { ReactNode } from 'react';

interface DatabaseRow {
  [key: string]: string | number | boolean | object | null | undefined;
}

interface TableViewProps {
  title?: string;
  limit?: number;
}

// 1. This is a Server Component, so it can be 'async' and fetch data directly!
export default async function DatabaseViewPage({
  title = 'Neon Database Viewer',
  limit = 50,
}: TableViewProps): Promise<ReactNode> {
  
  // Initialize the connection
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

  let dbData: DatabaseRow[] = [];
  let fetchError: string | null = null;

  try {
    // 2. Fetch the data directly from database
    const result: DatabaseRow[] = await sql`SELECT * FROM "base table" LIMIT ${limit}`;
    dbData = result;
  } catch (error: unknown) {
    console.error('Failed to fetch data:', error);
    fetchError = error instanceof Error ? error.message : 'Unknown error occurred';
  } finally {
    // Close the connection
    await sql.end();
  }

  // 3. Handle Errors or Empty States
  if (fetchError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error loading data</h2>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (dbData.length === 0) {
    return <div style={{ padding: '20px' }}>No records found in the database.</div>;
  }

  // 4. Dynamically extract the headers from the first row of data
  const tableHeaders: string[] = Object.keys(dbData[0]);

  // 5. Helper function to format cell values
  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // 6. Render the UI
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>{title}</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table 
          border={1}
          cellPadding={12}
          style={{ 
            borderCollapse: 'collapse', 
            width: '100%',
            textAlign: 'left',
            border: '1px solid #ddd',
          }}
        >
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              {/* Generate headers dynamically */}
              {tableHeaders.map((header: string) => (
                <th
                  key={header}
                  style={{
                    textTransform: 'capitalize',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Map over the rows of data */}
            {dbData.map((row: DatabaseRow, rowIndex: number) => (
              <tr
                key={String(row.id) || rowIndex}
                style={{ borderBottom: '1px solid #ddd' }}
              >
                {/* Map over the headers to insert the correct data into each column */}
                {tableHeaders.map((header: string) => (
                  <td key={`${rowIndex}-${header}`}>
                    {formatCellValue(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}