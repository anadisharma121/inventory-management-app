import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { CubeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active: Stocks */}
        <Link href="/dashboard/stocks">
          <div className="flex cursor-pointer rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 transition hover:border-emerald-400 hover:shadow-lg">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-emerald-700">
                    Inventory
                  </h2>
                </div>
                <p className="mt-2 text-sm text-emerald-600">
                  View and manage stock
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Active
              </div>
            </div>
          </div>
        </Link>

        {/* Locked: Orders */}
        <div>
          <div className="flex rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-500">
                    Orders
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Manage orders
                </p>
              </div>
              <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked: Reports */}
        <div>
          <div className="flex rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-500">
                    Reports
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  View analytics
                </p>
              </div>
              <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked: Customers */}
        <div>
          <div className="flex rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-500">
                    Customers
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Manage customers
                </p>
              </div>
              <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked: Settings */}
        <div>
          <div className="flex rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-500">
                    Settings
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Configure system
                </p>
              </div>
              <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locked: Analytics */}
        <div>
          <div className="flex rounded-lg border-2 border-gray-200 bg-gray-50 p-6 opacity-60">
            <div className="flex w-full items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <CubeIcon className="h-8 w-8 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-500">
                    Analytics
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  View insights
                </p>
              </div>
              <div className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <LockClosedIcon className="h-3 w-3" />
                  Locked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}