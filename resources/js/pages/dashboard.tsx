import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    TrendingUp, Package, MessageSquare, CheckCircle, Upload, ArrowUpRight,
    Calendar, Wallet, ShoppingBag, Search, Leaf, BadgeCheck, MessageCircle, Star,
    Clock, Handshake, CreditCard, Truck, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

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

interface TransactionItem {
    id: number;
    negotiation_id: number;
    order_id?: number | null;
    code: string;
    name: string;
    seller: string;
    qty: string;
    price: string;
    date: string;
    status: 'Menunggu' | 'Negosiasi' | 'Pembayaran' | 'Pickup' | 'Selesai' | 'Batal';
    step: number;
    button: string | null;
    action_url: string;
    detail_url?: string;
    has_reviewed?: boolean;
    nego?: boolean;
}

interface DashboardProps {
    stats?: Stats;
    recentOrders?: RecentOrder[];
    transactions?: TransactionItem[];
}

export default function Dashboard({ stats, recentOrders, transactions = [] }: DashboardProps) {
    const { auth } = usePage<any>().props;
    const isSeller = auth?.user?.role === 'seller';
    const [orderTab, setOrderTab] = useState('Semua');

    const previewTransactions = transactions
        .filter((t) => orderTab === 'Semua' || t.status === orderTab)
        .slice(0, 4);

    if (!isSeller) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Buyer Dashboard - ReGuna" />
                <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#f6faf6]">
                    {/* Header welcome */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-[#2e5a36] font-bold tracking-tight text-2xl flex items-center gap-2">
                                Selamat datang, {auth?.user?.name || 'Sari'}! 👋
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1">
                                Kamis, 17 Juli 2025 — Berikut ringkasan aktivitas pembelian Anda.
                            </p>
                        </div>
                        <span className="bg-[#e6f4e9] text-[#2e5a36] px-4 py-2 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 border border-[#2e5a36]/10">
                            <BadgeCheck className="h-4 w-4" /> Akun Terverifikasi
                        </span>
                    </div>

                    {/* Stats row */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* total spend */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Pembelian</span>
                                <div className="rounded-xl bg-[#e6f4e9] text-[#2e5a36] p-2.5">
                                    <Wallet className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900">Rp 5,9 Jt</h3>
                                <p className="mt-1 text-xs text-neutral-400">Jul 2025</p>
                            </div>
                        </div>

                        {/* active orders */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pesanan Aktif</span>
                                <div className="rounded-xl bg-blue-50 text-blue-700 p-2.5">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900">4</h3>
                                <p className="mt-1 text-xs text-blue-600 font-bold">2 perlu tindakan</p>
                            </div>
                        </div>

                        {/* negotiations */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Negosiasi Berjalan</span>
                                <div className="rounded-xl bg-amber-50 text-amber-700 p-2.5">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900">2</h3>
                                <p className="mt-1 text-xs text-amber-600 font-bold">1 counter offer</p>
                            </div>
                        </div>

                        {/* carbon reduced */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">CO₂ Dikurangi</span>
                                <div className="rounded-xl bg-[#2e5a36] text-white p-2.5">
                                    <Leaf className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-neutral-900">1.4 ton</h3>
                                <p className="mt-1 text-xs text-emerald-700 font-bold">bulan ini</p>
                            </div>
                        </div>
                    </div>

                    {/* Spend Chart and Favorite Products Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-xs">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900">Riwayat Pengeluaran</h2>
                                    <p className="text-xs text-neutral-500">Februari — Juli 2025</p>
                                </div>
                                <span className="bg-[#e6f4e9] text-[#2e5a36] text-xs font-bold px-3 py-1 rounded-full">
                                    Total Rp 8,95 Jt
                                </span>
                            </div>
                            <div className="flex items-end justify-between h-44 pt-6 border-b border-neutral-100">
                                {[
                                    { month: 'Feb', val: 'h-[30%]' },
                                    { month: 'Mar', val: 'h-[40%]' },
                                    { month: 'Apr', val: 'h-[25%]' },
                                    { month: 'Mei', val: 'h-[55%]' },
                                    { month: 'Jun', val: 'h-[70%]' },
                                    { month: 'Jul', val: 'h-[90%]' },
                                ].map((bar) => (
                                    <div key={bar.month} className="flex flex-col items-center gap-2 w-full group">
                                        <div className="w-8/12 bg-neutral-100 group-hover:bg-[#2e5a36]/90 rounded-t-lg transition-all duration-300 relative flex justify-center h-28">
                                            <div className={`w-full bg-[#2e5a36] rounded-t-lg absolute bottom-0 ${bar.val}`} />
                                        </div>
                                        <span className="text-xs text-neutral-500 pb-2">{bar.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Favorite Products */}
                        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-xs flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-base font-bold text-neutral-900">Produk Favorit</h2>
                                <button className="text-xs font-semibold text-[#2e5a36] hover:text-[#234529]">Lihat semua</button>
                            </div>
                            <div className="space-y-4 flex-1">
                                {[
                                    { name: 'Ampas Tahu Premium', seller: 'CV. Sari Murni', price: 'Rp 850/kg' },
                                    { name: 'Ampas Kopi Arabika', seller: 'Kopiku Nusantara', price: 'Rp 1.200/kg' },
                                    { name: 'Dedak Padi Halus', seller: 'PT. Agri Mandiri', price: 'Rp 300/kg' },
                                ].map((fav, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-xl border border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-lg bg-[#f0f7f1] text-[#2e5a36] flex items-center justify-center font-bold text-xs">
                                                {fav.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-neutral-900">{fav.name}</h4>
                                                <p className="text-xs text-neutral-400">{fav.seller}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-extrabold text-[#2e5a36]">{fav.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link href={route('marketplace')} className="mt-4 w-full bg-[#f0f7f1] hover:bg-[#e6f4e9] text-[#2e5a36] text-center py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                                + Temukan Produk Baru
                            </Link>
                        </div>
                    </div>

                    {/* Pesanan Saya Preview */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-xs">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base font-bold text-neutral-900">Pesanan Saya</h2>
                            <Link href={route('negotiations.index')} className="text-xs font-semibold text-[#2e5a36] hover:text-[#234529] cursor-pointer">
                                Lihat semua &rarr;
                            </Link>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-neutral-100">
                            {['Semua', 'Menunggu', 'Negosiasi', 'Pembayaran', 'Pickup', 'Selesai'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setOrderTab(tab)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${orderTab === tab
                                            ? 'bg-[#2e5a36] text-white'
                                            : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-neutral-100'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Order timeline list */}
                        {previewTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {previewTransactions.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-xs space-y-3"
                                    >
                                        {/* Top Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#2e5a36] flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-100/50">
                                                    {order.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-bold text-neutral-900">{order.name}</h4>
                                                        {order.nego && (
                                                            <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                                🏷 Nego
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{order.seller} • {order.qty}</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-sm font-extrabold text-[#2e5a36] block">{order.price}</span>
                                                <span className="text-[10px] text-neutral-400 font-semibold block">{order.date}</span>
                                            </div>
                                        </div>

                                        {/* Center 5-Icon Progress Stepper */}
                                        <div className="py-1">
                                            <div className="flex items-center justify-between relative max-w-xl mx-auto px-2">
                                                {[
                                                    { label: 'Menunggu', icon: Clock },
                                                    { label: 'Negosiasi', icon: Handshake },
                                                    { label: 'Pembayaran', icon: CreditCard },
                                                    { label: 'Pickup', icon: Truck },
                                                    { label: 'Selesai', icon: CheckCircle2 },
                                                ].map((stepObj, idx) => {
                                                    const StepIcon = stepObj.icon;
                                                    const isDone = order.step >= idx;
                                                    const isNextDone = order.step > idx;

                                                    return (
                                                        <div key={idx} className="flex items-center flex-1 last:flex-none">
                                                            <div
                                                                className={`h-6 w-6 rounded-full flex items-center justify-center transition-all z-10 ${
                                                                    isDone
                                                                        ? 'bg-[#2e5a36] text-white shadow-xs'
                                                                        : 'bg-white border-2 border-neutral-200 text-neutral-300'
                                                                }`}
                                                                title={stepObj.label}
                                                            >
                                                                <StepIcon className="h-3 w-3" />
                                                            </div>
                                                            {idx < 4 && (
                                                                <div
                                                                    className={`h-[2px] flex-1 mx-1 rounded-full ${
                                                                        isNextDone ? 'bg-[#2e5a36]' : 'bg-neutral-200'
                                                                    }`}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bottom Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    order.status === 'Selesai'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : order.status === 'Pickup'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : order.status === 'Pembayaran'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.status === 'Negosiasi'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-bold">{order.code}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isSeller ? (
                                                    <Link
                                                        href={`/negotiations/${order.negotiation_id}`}
                                                        className="border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                                                    >
                                                        Lihat Chat
                                                    </Link>
                                                ) : (
                                                    <>
                                                        {order.status === 'Pembayaran' && (
                                                            <Link
                                                                href={order.action_url}
                                                                className="bg-[#2e5a36] hover:bg-[#234529] text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                                            >
                                                                Bayar Sekarang
                                                            </Link>
                                                        )}
                                                        {(order.status === 'Negosiasi' || order.status === 'Menunggu' || order.status === 'Selesai') && (
                                                            <Link
                                                                href={`/negotiations/${order.negotiation_id}`}
                                                                className="border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer"
                                                            >
                                                                {order.status === 'Selesai' && !order.has_reviewed ? 'Beri Ulasan' : 'Lihat Chat'}
                                                            </Link>
                                                        )}
                                                        {order.status === 'Pickup' && (
                                                            <Link
                                                                href={order.action_url}
                                                                className="border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer"
                                                            >
                                                                Lihat Invoice
                                                            </Link>
                                                        )}
                                                    </>
                                                )}

                                                {/* Crucial: Detail Button ALWAYS present */}
                                                <Link
                                                    href={order.detail_url || `/products/${order.id}`}
                                                    className="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 px-3 py-1 rounded-full text-xs font-bold shadow-2xs"
                                                >
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-xs text-neutral-400">
                                Belum ada transaksi aktif untuk kategori "{orderTab}".
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-xs">
                        <h2 className="text-base font-bold text-neutral-900 mb-6">Rekomendasi Untukmu</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { name: 'Ampas Tahu Premium', location: 'Bogor, Jawa Barat', price: 'Rp 850/kg', stock: '2 ton' },
                                { name: 'Kulit Jagung Kering', location: 'Malang, Jawa Timur', price: 'Rp 400/kg', stock: '800 kg' },
                                { name: 'Ampas Kopi Arabika', location: 'Aceh, Sumatra', price: 'Rp 1.200/kg', stock: '500 kg' },
                                { name: 'Dedak Padi Halus', location: 'Karawang, Jawa Barat', price: 'Rp 300/kg', stock: '5 ton' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col justify-between p-4 rounded-2xl border border-neutral-100 hover:shadow-xs transition-shadow">
                                    <div>
                                        <h4 className="text-sm font-bold text-neutral-900 capitalize">{item.name}</h4>
                                        <p className="text-[10px] text-neutral-400 mt-0.5">{item.location} • {item.stock}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-50">
                                        <span className="text-xs font-bold text-[#2e5a36]">{item.price}</span>
                                        <Link href={route('marketplace')} className="text-xs font-bold text-neutral-400 hover:text-[#2e5a36]">Detail</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                            <Link href="/seller/orders" className="text-xs font-semibold text-[#2e5a36] hover:text-[#234529] flex items-center gap-1">
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
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status_color === 'success'
                                            ? 'bg-[#e6f4e9] text-[#2e5a36] border-[#2e5a36]/20'
                                            : order.status_color === 'blue'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : order.status_color === 'warning'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
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
