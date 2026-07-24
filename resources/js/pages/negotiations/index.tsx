import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    Clock,
    Leaf,
    MessageSquare,
    Package,
    Plus,
    Store,
    User as UserIcon,
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface Product {
    id: number;
    title: string;
    reference_price: number;
    stock: number;
    unit: string;
    seller?: {
        id: number;
        name: string;
    };
}

interface Negotiation {
    id: number;
    product_id: number;
    buyer_id: number;
    seller_id: number;
    status: string;
    updated_at: string;
    product?: Product;
    buyer?: { name: string };
    seller?: { name: string };
    messages?: Array<{ message: string; created_at: string }>;
}

interface IndexProps {
    negotiations: Negotiation[];
    sampleProduct?: Product | null;
}

export default function NegotiationIndex({ negotiations, sampleProduct }: IndexProps) {
    const { post, processing } = useForm({
        product_id: sampleProduct ? sampleProduct.id : 1,
    });

    const handleCreateNegotiation: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('negotiations.store'));
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
            <Head title="Negotiation Development - ReGuna" />

            {/* Simple App Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">ReGuna</span>
                    </Link>
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            Home
                        </Link>
                        <Link href="/dashboard" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            Dashboard
                        </Link>
                        <Link href="/negotiations" className="font-bold text-emerald-600">
                            Negosiasi
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Content Container */}
            <main className="mx-auto max-w-5xl px-6 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Negotiation Development Page
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Halaman pengembang &amp; daftar sesi negosiasi aktif aplikasi ReGuna.
                        </p>
                    </div>
                </div>

                {/* Prototype Action Card */}
                <div className="mb-10 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm ring-1 ring-emerald-500/10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/70 px-3 py-1 text-xs font-semibold text-emerald-800">
                                <Package className="h-3.5 w-3.5" />
                                Prototype Development Mode
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">
                                Product: {sampleProduct ? sampleProduct.title : 'Ampas Tahu Premium'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Store className="h-4 w-4 text-emerald-600" />
                                    Seller: {sampleProduct?.seller ? sampleProduct.seller.name : 'CV Sari Organik'}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Status: <span className="font-bold text-amber-600">Negotiating</span>
                                </span>
                            </div>
                        </div>

                        {sampleProduct ? (
                            <form onSubmit={handleCreateNegotiation}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat / Buka Negotiation
                                </button>
                            </form>
                        ) : (
                            <div className="text-xs italic text-slate-400">
                                Tidak ada produk tersedia untuk sesi negosiasi.
                            </div>
                        )}
                    </div>
                </div>

                {/* Existing Active Negotiations List */}
                <div>
                    <h2 className="mb-4 text-lg font-bold text-slate-900">Daftar Sesi Negosiasi Anda</h2>

                    {negotiations && negotiations.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {negotiations.map((item) => (
                                <Link
                                    key={item.id}
                                    href={route('negotiations.show', item.id)}
                                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-md"
                                >
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400">
                                                ID Negosiasi: #{item.id}
                                            </span>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    item.status === 'agreed'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}
                                            >
                                                {item.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700">
                                            {item.product?.title || 'Produk Limba Pangan'}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Mitra: {item.seller?.name || item.buyer?.name}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                                        <span>Buka Chat Room</span>
                                        <ArrowRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                            <p className="text-sm font-medium">Belum ada sesi negosiasi aktif.</p>
                            <p className="text-xs text-slate-400">
                                Klik tombol &quot;Buat / Buka Negotiation&quot; di atas untuk memulai.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
