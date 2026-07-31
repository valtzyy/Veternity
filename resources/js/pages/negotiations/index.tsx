import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock, CreditCard, Handshake, MessageSquare, Search, ShoppingBag, Star, Truck, X } from 'lucide-react';
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
    detail_url?: string;
    complete_url?: string | null;
    has_reviewed?: boolean;
    nego?: boolean;
}

interface IndexProps {
    transactions?: Transaction[];
}

const steps = [
    { label: 'Menunggu', icon: Clock },
    { label: 'Negosiasi', icon: Handshake },
    { label: 'Pembayaran', icon: CreditCard },
    { label: 'Pickup', icon: Truck },
    { label: 'Selesai', icon: CheckCircle2 },
];

export default function NegotiationIndex({ transactions = [] }: IndexProps) {
    const { auth } = usePage<any>().props;
    const isSeller = auth?.user?.role === 'seller';

    const [orderTab, setOrderTab] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    // Rating Modal state
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedRatingOrder, setSelectedRatingOrder] = useState<Transaction | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const availableTags = [
        'Produk sesuai deskripsi',
        'Supplier responsif',
        'Kualitas bagus',
        'Pengiriman cepat',
        'Harga wajar',
        'Kemasan rapi',
    ];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleOpenRatingModal = (item: Transaction) => {
        setSelectedRatingOrder(item);
        setRating(0);
        setReviewText('');
        setSelectedTags([]);
        setIsRatingModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsRatingModalOpen(false);
        setSelectedRatingOrder(null);
    };

    const handleSubmitRating = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !selectedRatingOrder?.order_id) return;

        setIsSubmittingRating(true);
        router.post(
            route('orders.ratings.store', selectedRatingOrder.order_id),
            {
                rating: rating,
                review: reviewText,
                tags: selectedTags,
            },
            {
                onSuccess: () => {
                    handleCloseRatingModal();
                    setIsSubmittingRating(false);
                },
                onError: () => {
                    setIsSubmittingRating(false);
                },
            }
        );
    };

    const filteredTransactions = transactions.filter((item) => {
        const matchesTab = orderTab === 'Semua' || item.status === orderTab;
        const matchesSearch =
            searchQuery.trim() === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Selesai':
                return 'bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs';
            case 'Pickup':
                return 'bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-xs';
            case 'Pembayaran':
                return 'bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs';
            case 'Negosiasi':
                return 'bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs';
            case 'Menunggu':
            default:
                return 'bg-neutral-100 text-neutral-600 font-bold px-3 py-1 rounded-full text-xs';
        }
    };

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
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
                        <div className="space-y-4">
                            {filteredTransactions.map((order) => (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-xs transition-all hover:shadow-md space-y-4"
                                >
                                    {/* Top Header: Title, Seller, Price & Date */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {/* Thumbnail */}
                                            <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-[#2e5a36] flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100/50">
                                                {order.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-bold text-neutral-900">{order.name}</h3>
                                                </div>
                                                <p className="text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" />
                                                    <span>{order.seller} · {order.qty}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-sm font-extrabold text-[#2e5a36] block">{order.price}</span>
                                            <span className="text-[11px] text-neutral-400 font-semibold block mt-0.5">{order.date}</span>
                                        </div>
                                    </div>

                                    {/* Center 5-Icon Progress Stepper */}
                                    <div className="py-2">
                                        <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
                                            {steps.map((stepObj, idx) => {
                                                const StepIcon = stepObj.icon;
                                                const isDone = order.step >= idx;
                                                const isNextDone = order.step > idx;

                                                return (
                                                    <div key={idx} className="flex items-center flex-1 last:flex-none">
                                                        <div
                                                            className={`h-7 w-7 rounded-full flex items-center justify-center transition-all z-10 ${
                                                                isDone
                                                                    ? 'bg-[#2e5a36] text-white shadow-xs'
                                                                    : 'bg-white border-2 border-neutral-200 text-neutral-300'
                                                            }`}
                                                            title={stepObj.label}
                                                        >
                                                            <StepIcon className="h-3.5 w-3.5" />
                                                        </div>
                                                        {idx < steps.length - 1 && (
                                                            <div
                                                                className={`h-[2.5px] flex-1 mx-1 rounded-full ${
                                                                    isNextDone ? 'bg-[#2e5a36]' : 'bg-neutral-200'
                                                                }`}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Bottom Footer: Status Badge + Code on Left, Action Buttons on Right */}
                                    <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                                        <div className="flex items-center gap-2">
                                            <span className={getStatusBadge(order.status)}>
                                                {order.status}
                                            </span>
                                            <span className="text-xs text-neutral-400 font-bold">{order.code}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Action Buttons based on role */}
                                            {isSeller ? (
                                                <Link
                                                    href={`/negotiations/${order.negotiation_id}`}
                                                    className="border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    Lihat Chat
                                                </Link>
                                            ) : (
                                                <>
                                                    {order.status === 'Selesai' && !order.has_reviewed && (
                                                        <button
                                                            onClick={() => handleOpenRatingModal(order)}
                                                            className="border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                            Beri Ulasan
                                                        </button>
                                                    )}
                                                    {order.status === 'Selesai' && order.has_reviewed && (
                                                        <Link
                                                            href={`/negotiations/${order.negotiation_id}`}
                                                            className="border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            Lihat Chat
                                                        </Link>
                                                    )}
                                                    {order.status === 'Pickup' && (
                                                        <Link
                                                            href={order.action_url}
                                                            className="border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            Lihat Invoice
                                                        </Link>
                                                    )}
                                                    {order.status === 'Pembayaran' && (
                                                        <Link
                                                            href={order.action_url}
                                                            className="bg-[#2e5a36] hover:bg-[#234529] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            Bayar Sekarang
                                                        </Link>
                                                    )}
                                                    {(order.status === 'Negosiasi' || order.status === 'Menunggu') && (
                                                        <Link
                                                            href={`/negotiations/${order.negotiation_id}`}
                                                            className="border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <MessageSquare className="h-3.5 w-3.5" />
                                                            Lihat Chat
                                                        </Link>
                                                    )}

                                                    {/* Detail Button for Buyer only */}
                                                    <Link
                                                        href={order.detail_url || `/products/${order.id}`}
                                                        className="border border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs"
                                                    >
                                                        Detail
                                                    </Link>
                                                </>
                                            )}
                                        </div>
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

            {/* Rating Modal */}
            {isRatingModalOpen && selectedRatingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full transform transition-all flex flex-col border border-neutral-100">
                        {/* Header */}
                        <div className="bg-[#2e5a36] text-white p-6 relative flex items-center gap-4">
                            <button
                                onClick={handleCloseRatingModal}
                                className="absolute top-4 right-4 text-white/80 hover:text-white hover:scale-105 transition-all cursor-pointer"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            <div>
                                <h3 className="font-extrabold text-base capitalize">{selectedRatingOrder.name}</h3>
                                <p className="text-xs text-white/80 font-medium mt-0.5">{selectedRatingOrder.seller} • {selectedRatingOrder.code}</p>
                            </div>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmitRating} className="p-6 space-y-6 flex-1">
                            <div className="text-center space-y-3">
                                <h4 className="font-extrabold text-neutral-900 text-base">Seberapa puas Anda dengan produk ini?</h4>
                                <div className="flex justify-center items-center gap-2.5">
                                    {[1, 2, 3, 4, 5].map((starIdx) => {
                                        const isFilled = hoverRating >= starIdx || (hoverRating === 0 && rating >= starIdx);
                                        return (
                                            <button
                                                key={starIdx}
                                                type="button"
                                                onClick={() => setRating(starIdx)}
                                                onMouseEnter={() => setHoverRating(starIdx)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="cursor-pointer transition-all hover:scale-110 active:scale-95"
                                            >
                                                <Star
                                                    className={`h-8 w-8 transition-colors ${
                                                        isFilled
                                                            ? 'fill-[#f43f5e] text-[#f43f5e]'
                                                            : 'text-neutral-200 fill-none'
                                                    }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Pilih yang sesuai</h4>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => {
                                        const isSelected = selectedTags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#f0f7f1] text-[#2e5a36] border-[#2e5a36]/30'
                                                        : 'bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ceritakan Pengalaman Anda</h4>
                                <div className="relative">
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                                        rows={4}
                                        placeholder="Bagikan pengalaman Anda menggunakan produk ini..."
                                        className="w-full rounded-2xl border-transparent bg-[#f6faf6] p-4 text-xs sm:text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none placeholder-neutral-400 font-medium resize-none"
                                    />
                                    <span className="absolute bottom-3 right-4 text-[10px] text-neutral-400 font-bold">
                                        {reviewText.length}/500
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={rating === 0 || isSubmittingRating}
                                    className={`w-full py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        rating === 0 || isSubmittingRating
                                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                                            : 'bg-[#2e5a36] hover:bg-[#234529] text-white active:scale-[0.98]'
                                    }`}
                                >
                                    <Star className="h-4.5 w-4.5 fill-current" /> Kirim Ulasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

