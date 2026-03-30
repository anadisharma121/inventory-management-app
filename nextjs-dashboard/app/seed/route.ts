import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function seedUsers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedCustomers() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

async function seedStocks() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  // Create stock_table1 for user1
  await sql`
    CREATE TABLE IF NOT EXISTS stock_table1 (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      warehouse VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      last_updated DATE NOT NULL
    );
  `;

  // Create stock_table2 for user2
  await sql`
    CREATE TABLE IF NOT EXISTS stock_table2 (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      item_name VARCHAR(255) NOT NULL,
      sku VARCHAR(100) NOT NULL,
      quantity INT NOT NULL,
      warehouse VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      last_updated DATE NOT NULL
    );
  `;

  // Insert sample data for user1's stock table
  const stockData1 = [
    { item_name: 'Laptop Dell XPS', sku: 'DEL-XPS-001', quantity: 45, warehouse: 'Main', category: 'Electronics', price: 1299.99, last_updated: '2024-03-28' },
    { item_name: 'Monitor LG 27"', sku: 'LG-MON-027', quantity: 120, warehouse: 'Main', category: 'Electronics', price: 349.99, last_updated: '2024-03-28' },
    { item_name: 'Keyboard Mechanical', sku: 'KEY-MEC-001', quantity: 200, warehouse: 'Storage A', category: 'Accessories', price: 149.99, last_updated: '2024-03-28' },
    { item_name: 'Mouse Wireless', sku: 'MOU-WIR-001', quantity: 350, warehouse: 'Storage A', category: 'Accessories', price: 49.99, last_updated: '2024-03-28' },
    { item_name: 'USB-C Cable', sku: 'USB-001', quantity: 500, warehouse: 'Storage B', category: 'Cables', price: 15.99, last_updated: '2024-03-28' },
  ];

  await Promise.all(
    stockData1.map((item) => sql`
      INSERT INTO stock_table1 (item_name, sku, quantity, warehouse, category, price, last_updated)
      VALUES (${item.item_name}, ${item.sku}, ${item.quantity}, ${item.warehouse}, ${item.category}, ${item.price}, ${item.last_updated})
      ON CONFLICT DO NOTHING;
    `)
  );

  // Insert sample data for user2's stock table
  const stockData2 = [
    { item_name: 'Office Chair Pro', sku: 'CHAIR-001', quantity: 80, warehouse: 'Warehouse B', category: 'Furniture', price: 299.99, last_updated: '2024-03-28' },
    { item_name: 'Desk Adjustable', sku: 'DESK-ADJ-001', quantity: 60, warehouse: 'Warehouse B', category: 'Furniture', price: 599.99, last_updated: '2024-03-28' },
    { item_name: 'Filing Cabinet', sku: 'FILE-CAB-001', quantity: 40, warehouse: 'Warehouse C', category: 'Storage', price: 179.99, last_updated: '2024-03-28' },
    { item_name: 'Desk Lamp LED', sku: 'LAMP-LED-001', quantity: 150, warehouse: 'Storage A', category: 'Lighting', price: 79.99, last_updated: '2024-03-28' },
    { item_name: 'Whiteboard Marker', sku: 'MARK-001', quantity: 1000, warehouse: 'Storage B', category: 'Supplies', price: 3.99, last_updated: '2024-03-28' },
  ];

  await Promise.all(
    stockData2.map((item) => sql`
      INSERT INTO stock_table2 (item_name, sku, quantity, warehouse, category, price, last_updated)
      VALUES (${item.item_name}, ${item.sku}, ${item.quantity}, ${item.warehouse}, ${item.category}, ${item.price}, ${item.last_updated})
      ON CONFLICT DO NOTHING;
    `)
  );

  return { table1: stockData1.length, table2: stockData2.length };
}

export async function GET() {
  try {
    const result = await sql.begin((sql) => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
      seedStocks(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
