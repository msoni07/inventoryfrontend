'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setLogout } from '@/redux/slices/authSlice';
import {
    LayoutDashboard, // More specific for Dashboard
    Package,
    ShoppingCart,
    LineChart, // For Sales/Reports
    Archive, // For Stock
    Users, // Example if needed later for user management
    Settings as SettingsIcon,
    LogOut,
    Building // For Company/Brand
} from 'lucide-react';
import React from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        dispatch(setLogout());
        localStorage.removeItem('token'); // Ensure key matches what's used in login
        router.push('/login');
    };

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/products', label: 'Products', icon: Package },
        { href: '/purchases', label: 'Purchases', icon: ShoppingCart },
        { href: '/sales', label: 'Sales', icon: LineChart },
        { href: '/stock', label: 'Stock Management', icon: Archive },
        { href: '/reports', label: 'Reports', icon: LineChart }, // Can use a more specific icon if available
        { href: '/settings', label: 'Settings', icon: SettingsIcon },
    ];

    // Placeholder for dynamic page title - can be improved with context or props
    const currentPage = menuItems.find(item => pathname.startsWith(item.href))?.label || 'Page';

    return (
        <div className="flex h-screen bg-gray-200">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 p-5 space-y-6 flex flex-col">
                <div className="flex items-center space-x-2 px-2 py-1">
                    <Building size={28} className="text-sky-500" />
                    <span className="text-2xl font-bold text-sky-500">MedInvent</span>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-sky-700 hover:text-white transition-colors duration-150 ease-in-out
                              ${pathname.startsWith(item.href) ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:text-slate-100'}`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-150 ease-in-out"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="bg-white shadow-md p-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-slate-800">{currentPage}</h1>
                        <div className="text-slate-600">
                            {/* Placeholder for user info - can be enhanced with actual user data from Redux */}
                            <span>Welcome, User!</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
