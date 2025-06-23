import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiHome, 
  FiDatabase, 
  FiMap, 
  FiBarChart2, 
  FiTrendingUp,
  FiSettings
} from 'react-icons/fi';
import { useApp } from '../../contexts/AppContext';

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useApp();
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
    { path: '/cases', label: 'Cazuri', icon: <FiDatabase size={20} /> },
    { path: '/locations', label: 'Locații', icon: <FiMap size={20} /> },
    { path: '/statistics', label: 'Statistici', icon: <FiBarChart2 size={20} /> },
    { path: '/predictions', label: 'Predicții', icon: <FiTrendingUp size={20} /> },
    { path: '/settings', label: 'Setări', icon: <FiSettings size={20} /> },
  ];

  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-900 to-blue-700 text-white shadow-lg">
      <div className="p-6">
        <div className="text-xl font-bold">Admin Panel</div>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 py-2 text-xs uppercase tracking-wider text-blue-300">
          Navigare
        </div>
        
        <ul className="mt-2">
          {menuItems.map((item) => (
            <li key={item.path} className="px-2 py-1">
              <Link
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;