import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Search, Filter, MessageSquare, CreditCard, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pesanan Saya',
        href: '/negotiations',
    },
];

export interface Transaction {
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
    nego?: boolean;
}

interface IndexProps {
    transactions?: Transaction[];
}

export default function NegotiationIndex({ transactions = [] }: IndexProps) {
    const [orderTab, setOrderTab] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTransactions = transactions.filter((item) => {
        const matchesTab = orderTab === 'Semua' || item.status === orderTab;
        const matchesSearch =
            searchQuery.trim() === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesanan Saya - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#f6faf6]">
                {/* Header title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#2e5a36]">
                            Pesanan Saya
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Pusat kelola seluruh lifecycle transaksi &amp; negosiasi limbah pangan Anda.
                        </p>
                    </div>

                    {/* Search box */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari pesanan, supplier, kode..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200/80 rounded-xl text-xs outline-none focus:border-[#2e5a36] focus:ring-1 focus:ring-[#2e5a36]"
                        />
                    </div>
                </div>

                {/* Main Card Container */}
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-xs">
                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-neutral-100">
                        {['Semua', 'Menunggu', 'Negosiasi', 'Pembayaran', 'Pickup', 'Selesai'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setOrderTab(tab)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    orderTab === tab
                                        ? 'bg-[#2e5a36] text-white shadow-xs'
                                        : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-neutral-100'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Transaction List */}
                    {filteredTransactions.length > 0 ? (
                        <div className="space-y-6">
                            {filteredTransactions.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-100 last:border-0 last:pb-0"
                                >
                                    {/* Left Product details */}
                                    <div className="flex gap-4 min-w-[260px]">
                                        <div className="h-12 w-12 rounded-xl bg-[#f0f7f1] text-[#2e5a36] flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {order.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-neutral-900">{order.name}</h4>
                                                {order.nego && (
                                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        Nego
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-400 mt-0.5">
                                                {order.seller} • {order.qty}
                                            </p>
                                            <span className="text-[10px] bg-neutral-100 text-neutral-500 font-semibold px-2 py-0.5 rounded mt-2 inline-block">
                                                {order.code}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Step Bar */}
                                    <div className="flex items-center gap-2 my-2 lg:my-0">
                                        {[
                                            { label: 'Menunggu', idx: 0 },
                                            { label: 'Negosiasi', idx: 1 },
                                            { label: 'Pembayaran', idx: 2 },
                                            { label: 'Pickup', idx: 3 },
                                            { label: 'Selesai', idx: 4 },
                                        ].map((stepObj) => {
                                            const isDone = order.step >= stepObj.idx;
                                            return (
                                                <div key={stepObj.idx} className="flex items-center">
                                                    <div
                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                            isDone ? 'bg-[#2e5a36]' : 'bg-neutral-200'
                                                        }`}
                                                        title={stepObj.label}
                                                    />
                                                    {stepObj.idx < 4 && (
                                                        <div
                                                            className={`h-[2px] w-6 sm:w-10 ${
                                                                order.step > stepObj.idx
                                                                    ? 'bg-[#2e5a36]'
                                                                    : 'bg-neutral-200'
                                                            }`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <span className="text-xs font-bold text-neutral-700 ml-2">
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between lg:justify-end gap-4 text-right">
                                        <div>
                                            <span className="text-sm font-extrabold text-neutral-950 block">
                                                {order.price}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 font-bold block">
                                                {order.date}
                                            </span>
                                        </div>

                                        {order.button ? (
                                            <Link
                                                href={order.action_url}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                                    order.button.includes('Bayar')
                                                        ? 'bg-[#2e5a36] text-white hover:bg-[#234529]'
                                                        : 'border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50'
                                                }`}
                                            >
                                                {order.button}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={order.action_url}
                                                className="border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 px-4 py-2.5 rounded-xl text-xs font-bold"
                                            >
                                                Detail
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-neutral-400 flex flex-col items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-neutral-300 mb-3" />
                            <p className="text-sm font-bold text-neutral-600">Tidak ada transaksi ditemukan.</p>
                            <p className="text-xs text-neutral-400 mt-1">
                                Belum ada pesanan dengan status "{orderTab}" saat ini.
                            </p>
                            <Link
                                href="/marketplace"
                                className="mt-4 bg-[#2e5a36] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#234529] transition-colors"
                            >
                                Jelajahi Marketplace
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
