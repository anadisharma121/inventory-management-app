import LoginForm from '@/app/ui/login-form';
import { getSessionUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

type RootPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function Page({ searchParams }: RootPageProps) {
  const sessionUser = await getSessionUser();

  if (sessionUser) {
    redirect('/dashboard/stocks');
  }

  const params = searchParams ? await searchParams : undefined;
  const errorMessage = params?.error ?? '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/Fast_Fleet_Logistics_Logo.svg"
            alt="Fast Fleet Logistics"
            width={460}
            height={160}
            className="h-auto w-full max-w-sm"
            priority
          />
        </div>
        <LoginForm errorMessage={errorMessage} />
      </div>
    </main>
  );
}


