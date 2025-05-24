'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Package, ShoppingCart, BarChart, Settings, Layers, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setLogout } from '../../../redux/slices/authSlice';
import clsx from 'clsx';

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
    { name: 'Sales', href: '/sales', icon: Layers },
    { name: 'Stock', href: '/stock', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(setLogout());
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={clsx(
                'bg-white shadow-lg flex flex-col transition-all duration-200 z-20',
                sidebarOpen ? 'w-56' : 'w-16',
                'fixed md:static h-full'
            )}>
                <div className="flex items-center justify-between h-16 px-4 border-b">
                    <span className="font-bold text-blue-600 text-lg hidden md:block">Jules</span>
                    <button
                        className="md:hidden p-2 focus:outline-none"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="Toggle sidebar"
                    >
                        <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                'flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors',
                                currentPath.startsWith(item.href) && 'bg-blue-100 text-blue-700 font-semibold',
                                'group'
                            )}
                        >
                            <item.icon className="h-5 w-5 mr-3 text-blue-500 group-hover:text-blue-700" />
                            <span className={clsx('text-sm', !sidebarOpen && 'hidden md:inline')}>{item.name}</span>
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 w-full mt-4 transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        <span className={clsx('text-sm', !sidebarOpen && 'hidden md:inline')}>Logout</span>
                    </button>
                </nav>
            </aside>
            {/* Main content area */}
            <div className="flex-1 flex flex-col ml-16 md:ml-56">
                {/* Topbar */}
                <header className="h-16 bg-white shadow flex items-center px-6 justify-between">
                    <div className="font-semibold text-lg text-blue-700">Medical Inventory</div>
                    <div className="flex items-center space-x-4">
                        {/* User info placeholder */}
                        <span className="text-gray-700 text-sm">User</span>
                        <button onClick={handleLogout} className="p-2 rounded hover:bg-gray-100">
                            <LogOut className="h-5 w-5 text-red-500" />
                        </button>
                    </div>
                </header>
                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
            </div>
        </div>
    );
} 