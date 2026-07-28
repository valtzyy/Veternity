import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, ShoppingBag, AlertTriangle, Leaf, DollarSign, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_users: number;
        total_sellers: number;
        total_buyers: number;
        total_products: number;
        pending_approvals: number;
        total_waste_prevented: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300">
                        Overview Platform
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Pantau aktivitas pengguna, moderasi produk, dan dampak lingkungan yang dihasilkan.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Card 1: Users */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Total Pengguna</span>
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <Users className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.total_users}</h3>
                            <p className="mt-1 text-xs text-neutral-500">
                                {stats.total_sellers} Penjual | {stats.total_buyers} Pembeli
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Products */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Total Produk</span>
                            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.total_products}</h3>
                            <p className="mt-1 text-xs text-neutral-500">Produk terdaftar di platform</p>
                        </div>
                    </div>

                    {/* Card 3: Pending Approvals */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Butuh Persetujuan</span>
                            <div className={`rounded-lg p-2 ${stats.pending_approvals > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.pending_approvals}</h3>
                            <p className="mt-1 text-xs text-neutral-500">Produk menunggu moderasi</p>
                        </div>
                    </div>

                    {/* Card 4: Environmental Impact */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 md:col-span-2 lg:col-span-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Dampak Sosial & Lingkungan</span>
                                <h3 className="mt-2 text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                    {stats.total_waste_prevented} Kg
                                </h3>
                                <p className="mt-1 text-xs text-neutral-500">Total potensi sampah pangan yang berhasil dialihkan dari TPA</p>
                            </div>
                            <div className="rounded-full bg-emerald-100 p-4 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                <Leaf className="h-8 w-8 animate-bounce" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Skeleton Layout */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Visual/Activity Graph Skeleton */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                            Tren Aktivitas Pengurangan Sampah
                        </h2>
                        <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-dashed border-neutral-300 dark:border-neutral-800">
                            <span className="text-sm text-neutral-400">Visualisasi data akan diintegrasikan pada Day 8</span>
                        </div>
                    </div>

                    {/* Quick Action & Info Panel */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                            Sistem Moderasi ReGuna
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">Moderasi Produk Wajib</h4>
                                    <p className="text-xs text-neutral-500 mt-1">Setiap produk yang diunggah penjual harus disetujui admin untuk menjamin kualitas sampah organik.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white">Skema Pembayaran Rekening Bersama</h4>
                                    <p className="text-xs text-neutral-500 mt-1">Transaksi aman dengan payment gateway Midtrans yang menahan dana hingga pesanan dikonfirmasi pembeli.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
