import StocksTable from '@/app/ui/stocks/table';
import { lusitana } from '@/app/ui/fonts';
import { getSessionUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

type StocksPageProps = {
  searchParams?: Promise<{
    account?: string;
    warehouse?: string;
  }>;
};

export default async function StocksPage({ searchParams }: StocksPageProps) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect('/');
  }

  const params = searchParams ? await searchParams : undefined;
  const account = params?.account ?? '';
  const warehouse = params?.warehouse ?? '';

  return (
    <main>
      <div className="mb-6 flex items-center justify-end gap-4 border-b border-gray-200 pb-4 text-sm text-gray-700">
        <p className="font-medium">Hi {sessionUser.username}</p>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50">
            Log Out
          </button>
        </form>
      </div>

      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Stock On Hand
      </h1>

      <StocksTable
        tableName={sessionUser.tableName}
        selectedAccount={account}
        selectedWarehouse={warehouse}
      />
    </main>
  );
}
