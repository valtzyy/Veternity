import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { TrendingUp, Package, MessageSquare, CheckCircle, Upload, ArrowUpRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stats {
    total_revenue: number;
    revenue_growth: string;
    active_products: number;
    pending_products: number;
    negotiation_count: number;
    negotiation_unread: number;
    completed_orders: number;
    completed_orders_this_month: string;
    monthly_revenue_total: number;
}

interface RecentOrder {
    id: number;
    customer: string;
    detail: string;
    status: string;
    status_color: 'success' | 'blue' | 'warning' | 'secondary';
}

interface DashboardProps {
    stats?: Stats;
    recentOrders?: RecentOrder[];
}

export default function Dashboard({ stats, recentOrders }: DashboardProps) {
    const { auth } = usePage<any>().props;
    const isSeller = auth?.user?.role === 'seller';

    if (!isSeller) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard - ReGuna" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                        Selamat datang, {auth?.user?.name}!
                    </h1>
                    <p className="text-neutral-500">Anda masuk sebagai pembeli. Jelajahi marketplace untuk menemukan produk daur ulang berkualitas.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Seller Dashboard - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#f6faf6] dark:bg-neutral-950/20">
                {/* Header section with Welcome and Upload button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-[#2e5a36] dark:text-emerald-400 font-bold tracking-tight flex items-center gap-2">
                            Selamat datang, {auth?.user?.name}! 👋
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Rabu, 16 Juli 2025 — Berikut ringkasan bisnis Anda hari ini.
                        </p>
                    </div>

                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center gap-2 bg-[#2e5a36] hover:bg-[#254b2e] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs"
                    >
                        <Upload className="h-4 w-4" />
                        Upload Produk
                    </Link>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Card 1: Revenue */}
                        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Pendapatan</span>
                                <div className="rounded-lg bg-[#e6f4e9] text-[#2e5a36] dark:bg-emerald-900/30 dark:text-emerald-400 p-2">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Rp {(stats.total_revenue / 1000000).toFixed(1)} Jt
                                </h3>
                                <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                    {stats.revenue_growth}
                                </p>
                            </div>
                        </div>

                        {/* Card 2: Active Products */}
                        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Produk Aktif</span>
                                <div className="rounded-lg bg-[#e6f4e9] text-[#2e5a36] dark:bg-emerald-900/30 dark:text-emerald-400 p-2">
                                    <Package className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.active_products}</h3>
                                <p className="mt-1.5 text-xs text-neutral-500">
                                    {stats.pending_products} pending review
                                </p>
                            </div>
                        </div>

                        {/* Card 3: Negotiations */}
                        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Negosiasi</span>
                                <div className="rounded-lg bg-[#e6f4e9] text-[#2e5a36] dark:bg-emerald-900/30 dark:text-emerald-400 p-2">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.negotiation_count}</h3>
                                <p className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                    {stats.negotiation_unread} belum dibaca
                                </p>
                            </div>
                        </div>

                        {/* Card 4: Completed Orders */}
                        <div className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pesanan Selesai</span>
                                <div className="rounded-lg bg-[#e6f4e9] text-[#2e5a36] dark:bg-emerald-900/30 dark:text-emerald-400 p-2">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.completed_orders}</h3>
                                <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                    {stats.completed_orders_this_month}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly Revenue Chart and Recent Orders Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Chart Widget */}
                    <div className="lg:col-span-2 rounded-xl border border-neutral-200/60 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-base font-bold text-neutral-900 dark:text-white">Pendapatan Bulanan</h2>
                                <p className="text-xs text-neutral-500">Januari — Juli 2025</p>
                            </div>
                            {stats && (
                                <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                                    Rp {(stats.monthly_revenue_total / 1000000).toFixed(1)} Jt Total
                                </span>
                            )}
                        </div>

                        {/* Custom visual chart representing months */}
                        <div className="flex items-end justify-between h-48 pt-6 border-b border-neutral-100 dark:border-neutral-800">
                            {[
                                { month: 'Jan', val: 'h-[30%]' },
                                { month: 'Feb', val: 'h-[45%]' },
                                { month: 'Mar', val: 'h-[35%]' },
                                { month: 'Apr', val: 'h-[60%]' },
                                { month: 'Mei', val: 'h-[75%]' },
                                { month: 'Jun', val: 'h-[50%]' },
                                { month: 'Jul', val: 'h-[90%]' },
                            ].map((bar) => (
                                <div key={bar.month} className="flex flex-col items-center gap-2 w-full group">
                                    <div className="w-8/12 bg-emerald-100 dark:bg-emerald-950 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 rounded-t-xs transition-all duration-300 relative flex justify-center">
                                        <div className={`w-full bg-emerald-600 dark:bg-emerald-500 rounded-t-xs absolute bottom-0 ${bar.val}`} />
                                    </div>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 pb-2">{bar.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders List */}
                    <div className="rounded-xl border border-neutral-200/60 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Pesanan Terbaru</h2>
                            <Link href="/seller/orders" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                                Lihat Semua
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentOrders?.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                            {order.customer}
                                        </h4>
                                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                                            {order.detail}
                                        </p>
                                    </div>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        order.status_color === 'success'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : order.status_color === 'blue'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400'
                                            : order.status_color === 'warning'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                                            : 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
