import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePoll } from '@inertiajs/react';
import { 
    ShoppingBag, Calendar, CheckCircle2, MessageSquare, Wallet, 
    ArrowRight, BadgeCheck, MapPin, ChevronRight, Check, X, Star, Upload
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pesanan Saya', href: '/buyer/orders' },
];

interface User {
    id: number;
    name: string;
    email: string;
}

interface ProductImage {
    id: number;
    image_url: string;
}

interface Product {
    id: number;
    title: string;
    reference_price: number;
    stock: number;
    unit: string;
    location?: string;
    condition?: string;
    seller?: User;
    images?: ProductImage[];
}

interface Invoice {
    id: number;
    invoice_number: string;
}

interface Order {
    id: number;
    order_number: string;
    final_price: number;
    final_quantity: number;
    status: 'waiting_payment' | 'paid' | 'processing' | 'shipping' | 'completed' | 'cancelled';
    invoice?: Invoice;
    created_at?: string;
}

interface Negotiation {
    id: number;
    status: 'pending' | 'negotiating' | 'agreed' | 'cancelled';
    agreed_price?: number;
    agreed_quantity?: number;
    product?: Product;
    seller?: User;
    order?: Order;
    updated_at: string;
}

interface Props {
    negotiations: Negotiation[];
}

export default function OrdersIndex({ negotiations }: Props) {
    // Start background polling every 5 seconds to keep data real-time
    usePoll(30000);

    const [activeTab, setActiveTab] = useState('Semua');

    // Ulasan / Rating Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNego, setSelectedNego] = useState<Negotiation | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableTags = [
        'Produk sesuai deskripsi',
        'Supplier responsif',
        'Kualitas bagus',
        'Pengiriman cepat',
        'Harga wajar',
        'Kemasan rapi'
    ];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleOpenRatingModal = (nego: Negotiation) => {
        setSelectedNego(nego);
        setRating(0);
        setReviewText('');
        setSelectedTags([]);
        setIsModalOpen(true);
    };

    const handleCloseRatingModal = () => {
        setIsModalOpen(false);
        setSelectedNego(null);
    };

    const handleSubmitRating = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !selectedNego?.order) return;

        setIsSubmitting(true);
        router.post(route('orders.ratings.store', selectedNego.order.id), {
            rating: rating,
            review: reviewText,
            tags: selectedTags
        }, {
            onSuccess: () => {
                handleCloseRatingModal();
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Calculate step index from negotiation & order status
    const getStepDetails = (nego: Negotiation) => {
        if (nego.status === 'cancelled' || (nego.order && nego.order.status === 'cancelled')) {
            return { step: -1, statusName: 'Dibatalkan', color: 'bg-red-50 text-red-700 border-red-200' };
        }

        if (nego.status === 'pending') {
            return { step: 0, statusName: 'Menunggu', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
        }

        if (nego.status === 'negotiating') {
            return { step: 1, statusName: 'Negosiasi', color: 'bg-amber-50 text-amber-700 border-amber-200' };
        }

        if (nego.status === 'agreed' && nego.order) {
            const orderStatus = nego.order.status;
            if (orderStatus === 'waiting_payment') {
                return { step: 2, statusName: 'Pembayaran', color: 'bg-blue-50 text-blue-700 border-blue-200' };
            }
            if (['paid', 'processing', 'shipping'].includes(orderStatus)) {
                return { step: 3, statusName: 'Pickup', color: 'bg-purple-50 text-purple-700 border-purple-200' };
            }
            if (orderStatus === 'completed') {
                return { step: 4, statusName: 'Selesai', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            }
        }

        return { step: 0, statusName: 'Menunggu', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
    };

    // Tab filtering logic
    const filteredNegotiations = negotiations.filter((nego) => {
        const { statusName } = getStepDetails(nego);
        if (activeTab === 'Semua') return true;
        return statusName === activeTab;
    });

    // Dynamic stats counts
    const totalCount = negotiations.length;
    const waitingCount = negotiations.filter(n => getStepDetails(n).statusName === 'Menunggu').length;
    const negoCount = negotiations.filter(n => getStepDetails(n).statusName === 'Negosiasi').length;
    const paymentCount = negotiations.filter(n => getStepDetails(n).statusName === 'Pembayaran').length;
    const completedCount = negotiations.filter(n => getStepDetails(n).statusName === 'Selesai').length;

    // Helper for formatted date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '16 Jul 2025';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesanan Saya - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#f6faf6]">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-[#2e5a36] font-bold tracking-tight text-2xl">Pesanan Saya</h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            {totalCount} pesanan tercatat
                        </p>
                    </div>

                    <Link
                        href={route('marketplace')}
                        className="inline-flex items-center gap-2 bg-[#2e5a36] hover:bg-[#234529] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                        <ShoppingBag className="h-4 w-4" /> Cari Produk Baru
                    </Link>
                </div>

                {/* Upper Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                        { label: 'Semua', count: totalCount, activeColor: 'bg-neutral-850 text-white' },
                        { label: 'Menunggu', count: waitingCount, activeColor: 'bg-neutral-100 text-neutral-800' },
                        { label: 'Negosiasi', count: negoCount, activeColor: 'bg-amber-50 text-amber-800' },
                        { label: 'Pembayaran', count: paymentCount, activeColor: 'bg-blue-50 text-blue-800' },
                        { label: 'Selesai', count: completedCount, activeColor: 'bg-[#e6f4e9] text-[#2e5a36]' },
                    ].map((stat) => (
                        <div 
                            key={stat.label}
                            onClick={() => setActiveTab(stat.label)}
                            className={`border rounded-2xl p-4 shadow-xs text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                                activeTab === stat.label 
                                ? 'bg-white border-[#2e5a36] ring-2 ring-[#2e5a36]/10' 
                                : 'bg-white border-neutral-100/60 hover:border-neutral-200'
                            }`}
                        >
                            <span className="text-[28px] font-black text-neutral-900 leading-none">{stat.count}</span>
                            <span className="text-xs text-neutral-400 font-bold mt-2">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Tab select bar */}
                <div className="rounded-3xl bg-white p-6 shadow-xs border border-neutral-100/60 flex flex-col gap-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-neutral-100">
                        {['Semua', 'Menunggu', 'Negosiasi', 'Pembayaran', 'Pickup', 'Selesai'].map((tab) => {
                            const isCurrent = activeTab === tab;
                            const count = tab === 'Semua' ? totalCount :
                                          tab === 'Menunggu' ? waitingCount :
                                          tab === 'Negosiasi' ? negoCount :
                                          tab === 'Pembayaran' ? paymentCount :
                                          tab === 'Selesai' ? completedCount :
                                          negotiations.filter(n => getStepDetails(n).statusName === tab).length;

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                        isCurrent 
                                        ? 'bg-[#2e5a36] text-white' 
                                        : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-transparent hover:border-neutral-100'
                                    }`}
                                >
                                    {tab}
                                    <span className={`inline-flex items-center justify-center h-4.5 min-w-4.5 px-1 rounded-full text-[10px] font-black ${
                                        isCurrent ? 'bg-white text-[#2e5a36]' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Order Cards List */}
                    <div className="space-y-6">
                        {filteredNegotiations.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                                <ShoppingBag className="h-10 w-10 text-neutral-200" />
                                <p className="text-sm font-semibold">Tidak ada pesanan atau negosiasi di kategori ini.</p>
                            </div>
                        ) : (
                            filteredNegotiations.map((nego) => {
                                const { step, statusName, color } = getStepDetails(nego);
                                const primaryImg = nego.product?.images?.[0]?.image_url || '/images/placeholder.jpg';
                                const itemPrice = nego.status === 'agreed' ? (nego.agreed_price || 0) : (nego.product?.reference_price || 0);
                                const itemQty = nego.status === 'agreed' ? (nego.agreed_quantity || 1) : (nego.product?.stock || 1);
                                const totalPrice = itemPrice * itemQty;
                                const isNego = nego.status !== 'agreed';

                                return (
                                    <div key={nego.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
                                        
                                        {/* Product Info */}
                                        <div className="flex gap-4 min-w-[280px]">
                                            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-neutral-100 flex-shrink-0 border border-neutral-200/40">
                                                <img src={primaryImg} alt={nego.product?.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-neutral-900 capitalize truncate">{nego.product?.title}</h4>
                                                    {isNego && (
                                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200/50">
                                                            Harga Nego
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1 truncate">
                                                    {nego.seller?.name} • {itemQty} {nego.product?.unit} • Rp {Number(itemPrice).toLocaleString('id-ID')}/{nego.product?.unit}
                                                </p>
                                                <span className="text-[10px] bg-neutral-150 text-neutral-600 font-bold px-2 py-0.5 rounded mt-2 inline-block">
                                                    {nego.order?.order_number || `NEG-2025-${nego.id.toString().padStart(4, '0')}`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress step bar */}
                                        {step >= 0 && (
                                            <div className="flex flex-col gap-1 my-2 xl:my-0 min-w-[280px] xl:max-w-md w-full">
                                                <div className="flex items-center justify-between relative px-2">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[calc(150%-2rem)] h-[2px] bg-neutral-100 -z-10" />
                                                    {[0, 1, 2, 3, 4].map((stepIdx) => {
                                                        const isDone = step >= stepIdx;
                                                        return (
                                                            <div key={stepIdx} className="flex items-center">
                                                                <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 transition-all ${
                                                                    isDone 
                                                                    ? 'bg-[#2e5a36] border-[#2e5a36] text-white' 
                                                                    : 'bg-white border-neutral-200 text-neutral-300'
                                                                }`}>
                                                                    {isDone && <Check className="h-2.5 w-2.5" />}
                                                                </div>
                                                                {stepIdx < 4 && (
                                                                    <div className={`h-[2.5px] w-12 sm:w-16 ${
                                                                        step > stepIdx ? 'bg-[#2e5a36]' : 'bg-neutral-100'
                                                                    }`} />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold text-neutral-400 px-1 mt-1.5 uppercase tracking-wider">
                                                    <span className={step >= 0 ? 'text-[#2e5a36]' : ''}>Menunggu</span>
                                                    <span className={step >= 1 ? 'text-[#2e5a36]' : ''}>Negosiasi</span>
                                                    <span className={step >= 2 ? 'text-[#2e5a36]' : ''}>Pembayaran</span>
                                                    <span className={step >= 3 ? 'text-[#2e5a36]' : ''}>Pickup</span>
                                                    <span className={step >= 4 ? 'text-[#2e5a36]' : ''}>Selesai</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pricing details and actions */}
                                        <div className="flex items-center justify-between xl:justify-end gap-6 text-right">
                                            <div className="min-w-[120px]">
                                                <span className="text-base font-black text-neutral-900 block">
                                                    Rp {totalPrice.toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 font-bold block mt-0.5">
                                                    {formatDate(nego.order?.created_at || nego.updated_at)}
                                                </span>
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase mt-2 ${color}`}>
                                                    {statusName}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {step === 4 && (
                                                    <button 
                                                        onClick={() => handleOpenRatingModal(nego)}
                                                        className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                                                    >
                                                        Beri Ulasan
                                                    </button>
                                                )}
                                                {step === 3 && (
                                                    <button className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs">
                                                        Info Pickup
                                                    </button>
                                                )}
                                                {step === 2 && nego.order && (
                                                    <Link 
                                                        href={route('orders.payment', nego.order.id)}
                                                        className="bg-[#2e5a36] hover:bg-[#234529] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
                                                    >
                                                        Bayar Sekarang
                                                    </Link>
                                                )}
                                                {step === 1 && (
                                                    <Link 
                                                        href={route('negotiations.show', nego.id)}
                                                        className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs"
                                                    >
                                                        Lanjut Negosiasi
                                                    </Link>
                                                )}
                                                
                                                <Link 
                                                    href={route('products.show', nego.product?.id || 1)}
                                                    className="bg-white border border-neutral-100 hover:bg-neutral-50 text-neutral-500 px-4 py-2.5 rounded-xl text-xs font-bold"
                                                >
                                                    Detail Produk
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ── RATINGS MODAL ──────────────────────────────── */}
            {isModalOpen && selectedNego && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full transform transition-all flex flex-col border border-neutral-100">
                        {/* Green Header */}
                        <div className="bg-[#2e5a36] text-white p-6 relative flex items-center gap-4">
                            <button 
                                onClick={handleCloseRatingModal}
                                className="absolute top-4 right-4 text-white/80 hover:text-white hover:scale-105 transition-all cursor-pointer"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                                <img 
                                    src={selectedNego.product?.images?.[0]?.image_url || '/images/placeholder.jpg'} 
                                    alt={selectedNego.product?.title} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base capitalize">{selectedNego.product?.title}</h3>
                                <p className="text-xs text-white/80 font-medium mt-0.5">{selectedNego.seller?.name}</p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitRating} className="p-6 space-y-6 flex-1">
                            {/* Stars rating selection */}
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
                                                <Star className={`h-8 w-8 transition-colors ${
                                                    isFilled 
                                                    ? 'fill-[#f43f5e] text-[#f43f5e]' // Pink/red star like mockup
                                                    : 'text-neutral-200 fill-none'
                                                }`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tags / Chips section */}
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

                            {/* Textarea review */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ceritakan Pengalaman Anda</h4>
                                <div className="relative">
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                                        rows={4}
                                        placeholder="Bagikan pengalaman Anda menggunakan produk ini. Ulasan jujur Anda sangat membantu buyer lain..."
                                        className="w-full rounded-2xl border-transparent bg-[#f6faf6] p-4 text-xs sm:text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none placeholder-neutral-400 font-medium resize-none"
                                    />
                                    <span className="absolute bottom-3 right-4 text-[10px] text-neutral-400 font-bold">
                                        {reviewText.length}/500
                                    </span>
                                </div>
                            </div>

                            {/* Actions / Submit button */}
                            <div className="space-y-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={rating === 0 || isSubmitting}
                                    className={`w-full py-4 rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                        rating === 0 
                                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none' 
                                        : 'bg-[#2e5a36] hover:bg-[#234529] text-white active:scale-[0.98]'
                                    }`}
                                >
                                    <Star className="h-4.5 w-4.5 fill-current" /> Kirim Ulasan
                                </button>
                                {rating === 0 && (
                                    <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                        Pilih bintang terlebih dahulu
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
