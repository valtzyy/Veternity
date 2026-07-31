import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Image as ImageIcon,
    Leaf,
    MessageCircle,
    Phone,
    Send,
    ShieldAlert,
    ShoppingBag,
    Star,
    ThumbsDown,
    ThumbsUp,
    X,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    profile_photo?: string;
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

interface ChatMessage {
    id: number;
    negotiation_id: number;
    sender_id: number;
    message?: string;
    image_url?: string;
    message_type: 'text' | 'image' | 'offer' | 'system';
    offer_price?: number;
    offer_quantity?: number;
    offer_status?: 'pending' | 'accepted' | 'rejected' | 'countered';
    created_at?: string;
    sender?: User;
}

interface Invoice {
    id: number;
    order_id: number;
    invoice_number: string;
    invoice_url?: string;
}

interface Order {
    id: number;
    negotiation_id: number;
    order_number: string;
    final_price: number;
    final_quantity: number;
    status: string;
    invoice?: Invoice;
    rating?: any;
}

interface Negotiation {
    id: number;
    product_id: number;
    buyer_id: number;
    seller_id: number;
    agreed_price?: number;
    agreed_quantity?: number;
    status: 'pending' | 'negotiating' | 'agreed' | 'cancelled';
    closed_at?: string;
    product?: Product;
    buyer?: User;
    seller?: User;
    messages?: ChatMessage[];
    order?: Order;
}

interface Lifecycle {
    status: 'Menunggu' | 'Negosiasi' | 'Pembayaran' | 'Pickup' | 'Selesai' | 'Batal';
    step: number;
    can_chat: boolean;
    can_offer: boolean;
    has_reviewed: boolean;
}

interface ShowProps {
    negotiation: Negotiation;
    product: Product;
    buyer: User;
    seller: User;
    chatMessages: ChatMessage[];
    activeNegotiations: Negotiation[];
    lifecycle?: Lifecycle;
}

export default function NegotiationShow({ negotiation, product, buyer, seller, chatMessages, activeNegotiations, lifecycle }: ShowProps) {
    const { auth } = usePage<SharedData>().props;
    const authUser = auth.user;

    const isBuyer = authUser?.id === buyer.id;
    const isSeller = !isBuyer;
    const partner = isBuyer ? seller : buyer;

    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [counterTargetMessage, setCounterTargetMessage] = useState<ChatMessage | null>(null);

    // Image upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearImageSelection = () => {
        setSelectedImage(null);
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
            setImagePreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Form for text message
    const messageForm = useForm({
        message_type: 'text' as const,
        message: '',
    });

    // Form for offer / counter offer
    const offerForm = useForm({
        message_type: 'offer' as const,
        offer_price: product.reference_price ? String(product.reference_price) : '',
        offer_quantity: product.stock ? String(product.stock) : '1',
    });

    // Handle sending standard text or image chat
    const handleSendMessage: FormEventHandler = (e) => {
        e.preventDefault();
        if (!messageForm.data.message.trim() && !selectedImage) return;

        if (selectedImage) {
            router.post(
                route('negotiations.messages.store', negotiation.id),
                {
                    message_type: 'image',
                    message: messageForm.data.message || '',
                    image: selectedImage,
                },
                {
                    forceFormData: true,
                    onSuccess: () => {
                        messageForm.reset('message');
                        clearImageSelection();
                    },
                }
            );
        } else {
            messageForm.post(route('negotiations.messages.store', negotiation.id), {
                onSuccess: () => messageForm.reset('message'),
            });
        }
    };

    // Handle submitting an offer
    const handleSubmitOffer: FormEventHandler = (e) => {
        e.preventDefault();
        if (counterTargetMessage) {
            offerForm.post(route('negotiations.messages.counter', [negotiation.id, counterTargetMessage.id]), {
                onSuccess: () => {
                    setIsOfferModalOpen(false);
                    setCounterTargetMessage(null);
                },
            });
        } else {
            offerForm.post(route('negotiations.messages.store', negotiation.id), {
                onSuccess: () => setIsOfferModalOpen(false),
            });
        }
    };

    // Handle accept offer
    const handleAcceptOffer = (messageId: number) => {
        const acceptForm = messageForm; // reusable inertia form instance
        acceptForm.post(route('negotiations.messages.accept', [negotiation.id, messageId]));
    };

    // Handle reject offer
    const handleRejectOffer = (messageId: number) => {
        const rejectForm = messageForm;
        rejectForm.post(route('negotiations.messages.reject', [negotiation.id, messageId]));
    };

    // Open counter modal
    const openCounterModal = (msg: ChatMessage) => {
        setCounterTargetMessage(msg);
        offerForm.setData({
            message_type: 'offer',
            offer_price: msg.offer_price ? String(msg.offer_price) : String(product.reference_price),
            offer_quantity: msg.offer_quantity ? String(msg.offer_quantity) : '1',
        });
        setIsOfferModalOpen(true);
    };

    // Find latest pending offer for Quick Actions
    const latestPendingOffer = chatMessages
        ?.slice()
        .reverse()
        .find((m) => m.message_type === 'offer' && m.offer_status === 'pending');

    const canRespondToPendingOffer = latestPendingOffer && latestPendingOffer.sender_id !== authUser?.id;

    // Helper for formatting currency
    const formatCurrency = (val?: number) => {
        if (!val && val !== 0) return 'Rp 0';
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-slate-800 antialiased">
            <Head title={`Negosiasi - ${product.title}`} />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">ReGuna</span>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link href="/dashboard" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            Home
                        </Link>
                        <Link href="#" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            Marketplace
                        </Link>
                        <Link href="#" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            About
                        </Link>
                        <Link href="#" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
                            How It Works
                        </Link>
                    </nav>

                    {/* Navigation / User links */}
                    <div className="flex items-center gap-4">
                        <Link href={route('negotiations.index')} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                            Pesanan Saya
                        </Link>
                        <span className="text-xs font-semibold text-emerald-700">
                            {authUser?.name} ({isBuyer ? 'Buyer' : 'Seller'})
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Container (3 Columns Layout matching Figma) */}
            <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 items-start gap-6 p-6 lg:grid-cols-12">
                {/* Left Sidebar: Product & Transaction Info (3 Cols) */}
                <aside className="flex flex-col gap-6 lg:col-span-3">
                    {/* Product Card */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-100">
                            <img
                                src={
                                    product.images && product.images.length > 0
                                        ? product.images[0].image_url
                                        : 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'
                                }
                                alt={product.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="mb-1 flex items-center justify-between gap-2">
                                <h2 className="text-lg leading-snug font-bold text-slate-900">{product.title}</h2>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap text-emerald-700">
                                    Food Grade
                                </span>
                            </div>
                            <p className="flex items-center gap-1 text-xs text-slate-500">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                {seller.name} · {product.location || 'Indonesia'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F6F8FA] p-3">
                            <div>
                                <span className="mb-0.5 block text-[11px] text-slate-500">Harga Awal</span>
                                <span className="text-sm font-bold text-emerald-700">
                                    {formatCurrency(product.reference_price)}/{product.unit || 'kg'}
                                </span>
                            </div>
                            <div>
                                <span className="mb-0.5 block text-[11px] text-slate-500">Tersedia</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {product.stock} {product.unit || 'ton'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Status Card */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">STATUS TRANSAKSI</h3>

                        <div className="relative flex flex-col gap-6 pl-7 before:absolute before:top-3 before:bottom-3 before:left-3 before:w-0.5 before:bg-slate-200">
                            {[
                                { label: 'Menunggu', idx: 0 },
                                { label: 'Negosiasi', idx: 1 },
                                { label: 'Pembayaran', idx: 2 },
                                { label: 'Pickup', idx: 3 },
                                { label: 'Selesai', idx: 4 },
                            ].map((st) => {
                                const statusVal = lifecycle?.status || (negotiation.order ? (negotiation.order.status === 'completed' ? 'Selesai' : negotiation.order.status === 'paid' ? 'Pickup' : 'Pembayaran') : (negotiation.status === 'agreed' ? 'Pembayaran' : negotiation.status === 'negotiating' ? 'Negosiasi' : 'Menunggu'));
                                const stepVal = lifecycle?.step ?? (statusVal === 'Selesai' ? 4 : statusVal === 'Pickup' ? 3 : statusVal === 'Pembayaran' ? 2 : statusVal === 'Negosiasi' ? 1 : 0);

                                const isDone = stepVal > st.idx;
                                const isCurrent = stepVal === st.idx;

                                return (
                                    <div key={st.idx} className="relative flex items-center justify-between">
                                        <div
                                            className={`absolute -left-7 z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                                                isCurrent
                                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                                    : isDone
                                                      ? 'bg-emerald-600 text-white'
                                                      : 'border-2 border-slate-300 bg-white'
                                            }`}
                                        >
                                            {(isDone || isCurrent) && <Check className="h-3.5 w-3.5" />}
                                        </div>
                                        <span
                                            className={`text-sm ${
                                                isCurrent ? 'font-bold text-emerald-700' : isDone ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'
                                            }`}
                                        >
                                            {st.label}
                                        </span>
                                        {isCurrent && (
                                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aktif</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                        <h3 className="mb-1 text-xs font-bold tracking-wider text-slate-400 uppercase">TINDAKAN CEPAT</h3>

                        {isSeller ? (
                            <div className="flex flex-col gap-2">
                                {negotiation.order?.invoice && (
                                    <Link
                                        href={route('invoices.show', negotiation.order.invoice.id)}
                                        className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2e5a36]/20 bg-[#f0f7f1] px-4 py-3 text-sm font-semibold text-[#2e5a36] shadow-xs transition-all hover:bg-emerald-50"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Lihat Invoice
                                    </Link>
                                )}
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-xs leading-relaxed font-semibold text-slate-500">
                                    Sesi percakapan transaksi. Semua rincian tersimpan otomatis.
                                </div>
                            </div>
                        ) : (
                            <>
                                {negotiation.order ? (
                                    negotiation.order.status === 'completed' ? (
                                        negotiation.order.invoice ? (
                                            <Link
                                                href={route('invoices.show', negotiation.order.invoice.id)}
                                                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2e5a36]/20 bg-[#f0f7f1] px-4 py-3 text-sm font-semibold text-[#2e5a36] shadow-xs transition-all hover:bg-emerald-50"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                Lihat Invoice
                                            </Link>
                                        ) : (
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-xs leading-relaxed font-semibold text-slate-500">
                                                Transaksi telah selesai.
                                            </div>
                                        )
                                    ) : negotiation.order.status === 'paid' || negotiation.order.status === 'shipping' || negotiation.order.status === 'processing' ? (
                                        negotiation.order.invoice ? (
                                            <Link
                                                href={route('invoices.show', negotiation.order.invoice.id)}
                                                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#2e5a36]/20 bg-[#f0f7f1] px-4 py-3 text-sm font-semibold text-[#2e5a36] shadow-xs transition-all hover:bg-emerald-50"
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                Lihat Invoice
                                            </Link>
                                        ) : (
                                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-center text-xs leading-relaxed font-semibold text-blue-800">
                                                Pesanan sedang diproses/pickup oleh seller.
                                            </div>
                                        )
                                    ) : isBuyer ? (
                                        <Link
                                            href={route('orders.payment', negotiation.order.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-800"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Bayar Sekarang
                                        </Link>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-xs leading-relaxed font-semibold text-slate-500">
                                            Menunggu pembayaran dari pembeli.
                                        </div>
                                    )
                                ) : negotiation.status === 'agreed' ? (
                                    isBuyer ? (
                                        <Link
                                            href={route('negotiations.checkout', negotiation.id)}
                                            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-800"
                                        >
                                            <CreditCard className="h-4 w-4" />
                                            Lanjut ke Pembayaran
                                        </Link>
                                    ) : (
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center text-xs leading-relaxed font-semibold text-slate-500">
                                            Negosiasi telah disetujui! Menunggu pembayaran dari pembeli.
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            disabled={!canRespondToPendingOffer}
                                            onClick={() => latestPendingOffer && handleAcceptOffer(latestPendingOffer.id)}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-40"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            Terima Penawaran
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!canRespondToPendingOffer}
                                            onClick={() => latestPendingOffer && handleRejectOffer(latestPendingOffer.id)}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
                                        >
                                            <ThumbsDown className="h-4 w-4 text-rose-500" />
                                            Tolak Negosiasi
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        <button
                            type="button"
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            <ShieldAlert className="h-4 w-4 text-slate-400" />
                            Laporkan Masalah
                        </button>
                    </div>
                </aside>

                {/* Center Chat Area (6 Cols) */}
                <section className="flex h-[780px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs lg:col-span-6">
                    {/* Chat Header */}
                    <div className="z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={
                                        partner.profile_photo ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                                    }
                                    alt={partner.name}
                                    className="h-11 w-11 rounded-full object-cover"
                                />
                                <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h2 className="text-base font-bold text-slate-900">{partner.name}</h2>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <p className="text-xs font-medium text-slate-500">
                                    Online · {partner.name}, {product.location || 'Bogor'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span
                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${negotiation.status === 'agreed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100/70 text-amber-700'
                                    }`}
                            >
                                <Clock className="h-3.5 w-3.5" />
                                {negotiation.status === 'agreed' ? 'Disetujui' : 'Negosiasi Aktif'}
                            </span>
                            <button className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                                <Phone className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages List Stream */}
                    <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-6">
                        {/* Date Divider */}
                        <div className="my-4 flex items-center justify-center">
                            <span className="rounded-full border border-slate-100 bg-white px-4 py-1 text-xs font-semibold text-slate-400 shadow-2xs">
                                Sesi Negosiasi ReGuna
                            </span>
                        </div>

                        {chatMessages && chatMessages.length > 0 ? (
                            chatMessages.map((msg) => {
                                const isSelf = msg.sender_id === authUser?.id;

                                // System message
                                if (msg.message_type === 'system') {
                                    return (
                                        <div key={msg.id} className="my-3 flex justify-center">
                                            <span className="rounded-full bg-slate-200/70 px-4 py-1.5 text-center text-xs font-semibold text-slate-600">
                                                {msg.message}
                                            </span>
                                        </div>
                                    );
                                }

                                // Offer message card
                                if (msg.message_type === 'offer') {
                                    const canActOnThisOffer = !isSelf && msg.offer_status === 'pending';

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col gap-1 ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'} max-w-[85%]`}
                                        >
                                            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-2xs">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                                        <MessageCircle className="h-4 w-4" />
                                                        Penawaran
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${msg.offer_status === 'accepted'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : msg.offer_status === 'rejected'
                                                                    ? 'bg-rose-100 text-rose-800'
                                                                    : msg.offer_status === 'countered'
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        {msg.offer_status?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="mb-3 text-xs text-slate-500">{isSelf ? 'Penawaran Anda:' : 'Penawaran dari mitra:'}</p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">Harga</span>
                                                        <span className="text-sm font-bold text-emerald-700">{formatCurrency(msg.offer_price)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">Kuantitas</span>
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {msg.offer_quantity} {product.unit || 'kg'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">Total</span>
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {formatCurrency((msg.offer_price || 0) * (msg.offer_quantity || 0))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action buttons if pending and recipient */}
                                                {canActOnThisOffer && negotiation.status !== 'agreed' && (
                                                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-blue-100 pt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAcceptOffer(msg.id)}
                                                            className="rounded-full bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800"
                                                        >
                                                            Terima
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openCounterModal(msg)}
                                                            className="rounded-full bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-700"
                                                        >
                                                            Counter Offer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRejectOffer(msg.id)}
                                                            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-slate-400">
                                                {msg.created_at
                                                    ? new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : ''}
                                            </span>
                                        </div>
                                    );
                                }

                                // Text or Image message
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-3 ${isSelf ? 'ml-auto max-w-[85%] flex-row-reverse' : 'max-w-[85%]'}`}
                                    >
                                        {!isSelf && (
                                            <img
                                                src={
                                                    partner.profile_photo ||
                                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                                                }
                                                alt={partner.name}
                                                className="mt-1 h-8 w-8 rounded-full object-cover"
                                            />
                                        )}
                                        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`p-3 text-sm leading-relaxed shadow-2xs ${isSelf
                                                        ? 'rounded-2xl rounded-tr-xs bg-emerald-800 text-white'
                                                        : 'rounded-2xl rounded-tl-xs border border-amber-100/60 bg-amber-50/60 text-slate-800'
                                                    }`}
                                            >
                                                {msg.image_url && (
                                                    <a href={msg.image_url} target="_blank" rel="noopener noreferrer" className="block mb-2 overflow-hidden rounded-xl">
                                                        <img src={msg.image_url} alt="Lampiran Foto" className="max-h-60 max-w-full rounded-xl object-cover hover:opacity-95 transition-opacity" />
                                                    </a>
                                                )}
                                                {msg.message && <p>{msg.message}</p>}
                                            </div>
                                            <span className="mt-1 block text-[11px] text-slate-400">
                                                {msg.created_at
                                                    ? new Date(msg.created_at).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-xs text-slate-400">
                                Belum ada percakapan. Mulai negosiasi dengan mengirim pesan atau penawaran.
                            </div>
                        )}
                    </div>

                    {/* Image Preview Banner */}
                    {imagePreviewUrl && (
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2">
                            <div className="flex items-center gap-3">
                                <img src={imagePreviewUrl} alt="Preview Foto" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                                    {selectedImage?.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={clearImageSelection}
                                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Chat Input Bar */}
                    {lifecycle && !lifecycle.can_chat ? (
                        <div className="border-t border-slate-100 bg-slate-100 p-4 text-center text-xs font-semibold text-slate-600">
                            Sesi percakapan ini telah selesai dan disimpan sebagai arsip transaksi.
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-slate-100 bg-white p-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />

                            <button
                                type="button"
                                disabled={lifecycle ? !lifecycle.can_offer : negotiation.status === 'agreed'}
                                onClick={() => {
                                    setCounterTargetMessage(null);
                                    setIsOfferModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
                            >
                                <DollarSign className="h-4 w-4" />
                                Tawar
                            </button>

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Upload Foto"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>

                        <div className="relative flex flex-1 items-center">
                            <input
                                type="text"
                                value={messageForm.data.message}
                                onChange={(e) => messageForm.setData('message', e.target.value)}
                                placeholder={selectedImage ? 'Tambah keterangan foto (opsional)...' : 'Ketik pesan...'}
                                className="w-full rounded-full border-none bg-[#F4F6F8] px-5 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={messageForm.processing || (!messageForm.data.message.trim() && !selectedImage)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs transition-all hover:scale-105 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                            <Send className="h-5 w-5 translate-x-0.5 -translate-y-0.5" />
                        </button>
                    </form>
                    )}
                </section>

                {/* Right Sidebar: Active Conversations & Floating Actions (3 Cols) */}
                <aside className="relative flex flex-col gap-6 lg:col-span-3">
                    {/* Active Conversations Card */}
                    <div className="flex min-h-[500px] flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Negosiasi Aktif</h2>
                            <p className="text-xs font-medium text-slate-400">{activeNegotiations ? activeNegotiations.length : 0} percakapan</p>
                        </div>

                        <div className="flex flex-col divide-y divide-slate-100">
                            {activeNegotiations && activeNegotiations.length > 0 ? (
                                activeNegotiations.map((item) => {
                                    const isCurrent = item.id === negotiation.id;
                                    const itemPartner = item.buyer_id === authUser?.id ? item.seller : item.buyer;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={route('negotiations.show', item.id)}
                                            className={`-mx-2 flex items-start gap-3 rounded-xl px-2 py-3 transition-colors ${isCurrent ? 'bg-slate-50/80 font-bold' : 'hover:bg-slate-50/50'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <img
                                                    src={
                                                        itemPartner?.profile_photo ||
                                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
                                                    }
                                                    alt={itemPartner?.name || 'User'}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-0.5 flex items-center justify-between">
                                                    <h3 className="truncate text-sm font-bold text-slate-900">{itemPartner?.name || 'Mitra'}</h3>
                                                    <span className="text-[11px] text-slate-400">{item.status.toUpperCase()}</span>
                                                </div>
                                                <p className="truncate text-xs font-semibold text-slate-700">{item.product?.title || 'Produk'}</p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {item.agreed_price ? `Agreed: ${formatCurrency(item.agreed_price)}` : 'Sedang bernegosiasi...'}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-400">Belum ada sesi negosiasi lain.</div>
                            )}
                        </div>
                    </div>
                </aside>
            </main>

            {/* Offer Modal */}
            {isOfferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">
                                {counterTargetMessage ? 'Ajukan Counter Offer' : 'Buat Penawaran Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsOfferModalOpen(false)}
                                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitOffer} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">Harga Penawaran (Rp / unit)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="500"
                                    value={offerForm.data.offer_price}
                                    onChange={(e) => offerForm.setData('offer_price', e.target.value)}
                                    placeholder="Masukkan harga..."
                                    className="w-full rounded-xl border border-slate-200 bg-[#F4F6F8] px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-700">Kuantitas ({product.unit || 'unit'})</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={offerForm.data.offer_quantity}
                                    onChange={(e) => offerForm.setData('offer_quantity', e.target.value)}
                                    placeholder="Masukkan kuantitas..."
                                    className="w-full rounded-xl border border-slate-200 bg-[#F4F6F8] px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    required
                                />
                            </div>

                            {/* Total summary */}
                            <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-900">
                                <span className="block font-semibold">Total Nilai Penawaran:</span>
                                <span className="text-base font-extrabold text-emerald-700">
                                    {formatCurrency((Number(offerForm.data.offer_price) || 0) * (Number(offerForm.data.offer_quantity) || 0))}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOfferModalOpen(false)}
                                    className="rounded-full px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={offerForm.processing}
                                    className="rounded-full bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                                >
                                    Kirim Penawaran
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
