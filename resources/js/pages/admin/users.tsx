import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { UserCheck, Shield, ShoppingCart, UserX } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Manage Users',
        href: '/admin/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'admin';
    phone: string | null;
    is_verified: boolean;
}

interface UsersProps {
    users: {
        data: User[];
        links: any[];
    };
}

export default function Users({ users }: UsersProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengguna - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300">
                        Manajemen Pengguna
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Kelola data pembeli, penjual, serta verifikasi status kemitraan seller.
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama & Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Kontak</th>
                                    <th className="px-6 py-4">Verifikasi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-neutral-900 dark:text-white">{user.name}</div>
                                            <div className="text-xs text-neutral-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                    ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400' 
                                                    : user.role === 'seller'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400'
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            }`}>
                                                {user.role === 'admin' && <Shield className="h-3 w-3" />}
                                                {user.role === 'seller' && <UserCheck className="h-3 w-3" />}
                                                {user.role === 'buyer' && <ShoppingCart className="h-3 w-3" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                user.is_verified 
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                                                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
                                            }`}>
                                                {user.is_verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors">
                                                Suspend
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
