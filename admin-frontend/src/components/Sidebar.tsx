'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FiHome, FiList, FiMapPin, FiBarChart2, FiPlus, FiSettings } from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Cazuri', href: '/cases', icon: FiList },
  { name: 'Adaugă Caz', href: '/cases/create', icon: FiPlus },
  { name: 'Locații', href: '/locations', icon: FiMapPin },
  { name: 'Adaugă Locație', href: '/locations/new', icon: FiPlus },
  { name: 'Statistici', href: '/statistics', icon: FiBarChart2 },
  { name: 'Setări', href: '/settings', icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 