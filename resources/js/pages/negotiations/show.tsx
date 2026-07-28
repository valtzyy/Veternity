import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Home,
    Image as ImageIcon,
    Info,
    Leaf,
    MessageCircle,
    Package,
    Phone,
    Send,
    ShieldAlert,
    ShoppingBag,
    Store,
    ThumbsDown,
    ThumbsUp,
    X,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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
}

interface ShowProps {
    negotiation: Negotiation;
    product: Product;
    buyer: User;
    seller: User;
    chatMessages: ChatMessage[];
    activeNegotiations: Negotiation[];
}

export default function NegotiationShow({
    negotiation,
    product,
    buyer,
    seller,
    chatMessages,
    activeNegotiations,
}: ShowProps) {
    const page = usePage();
    const authUser = (page.props as any).auth.user;

    const isBuyer = authUser?.id === buyer.id;
    const partner = isBuyer ? seller : buyer;

    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [counterTargetMessage, setCounterTargetMessage] = useState<ChatMessage | null>(null);

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

    // Handle sending standard text chat
    const handleSendMessage: FormEventHandler = (e) => {
        e.preventDefault();
        if (!messageForm.data.message.trim()) return;

        messageForm.post(route('negotiations.messages.store', negotiation.id), {
            onSuccess: () => messageForm.reset('message'),
        });
    };

    // Handle submitting an offer
    const handleSubmitOffer: FormEventHandler = (e) => {
        e.preventDefault();
        if (counterTargetMessage) {
            offerForm.post(
                route('negotiations.messages.counter', [negotiation.id, counterTargetMessage.id]),
                {
                    onSuccess: () => {
                        setIsOfferModalOpen(false);
                        setCounterTargetMessage(null);
                    },
                }
            );
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

    const canRespondToPendingOffer =
        latestPendingOffer && latestPendingOffer.sender_id !== authUser?.id;

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
                        <Link href="/" className="font-medium text-slate-600 transition-colors hover:text-emerald-600">
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
                        <Link
                            href={route('negotiations.index')}
                            className="text-sm font-semibold text-slate-700 hover:text-slate-900"
                        >
                            Daftar Negosiasi
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
                                <h2 className="text-lg font-bold leading-snug text-slate-900">
                                    {product.title}
                                </h2>
                                <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
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
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            STATUS TRANSAKSI
                        </h3>

                        <div className="relative flex flex-col gap-6 pl-7 before:absolute before:bottom-3 before:left-3 before:top-3 before:w-0.5 before:bg-slate-200">
                            {/* Step 1 */}
                            <div className="relative flex items-center justify-between">
                                <div className="absolute -left-7 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800">Menunggu</span>
                            </div>

                            {/* Step 2 (Negotiating) */}
                            <div className="relative flex items-center justify-between">
                                <div
                                    className={`absolute -left-7 z-10 flex h-6 w-6 items-center justify-center rounded-full ${
                                        negotiation.status === 'negotiating'
                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                            : 'bg-emerald-600 text-white'
                                    }`}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                                <span
                                    className={`text-sm ${
                                        negotiation.status === 'negotiating'
                                            ? 'font-bold text-emerald-700'
                                            : 'font-semibold text-slate-800'
                                    }`}
                                >
                                    Negosiasi
                                </span>
                                {negotiation.status === 'negotiating' && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                        Aktif
                                    </span>
                                )}
                            </div>

                            {/* Step 3 (Pembayaran) */}
                            <div className="relative flex items-center justify-between">
                                <div
                                    className={`absolute -left-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                                        negotiation.status === 'agreed'
                                            ? 'border-emerald-600 bg-emerald-600 text-white'
                                            : 'border-slate-300 bg-white'
                                    }`}
                                >
                                    {negotiation.status === 'agreed' && <Check className="h-3.5 w-3.5" />}
                                </div>
                                <span
                                    className={`text-sm ${
                                        negotiation.status === 'agreed'
                                            ? 'font-bold text-emerald-700'
                                            : 'font-medium text-slate-400'
                                    }`}
                                >
                                    Pembayaran
                                </span>
                                {negotiation.status === 'agreed' && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                        Aktif
                                    </span>
                                )}
                            </div>

                            {/* Step 4 */}
                            <div className="relative flex items-center justify-between">
                                <div className="absolute -left-7 z-10 h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
                                <span className="text-sm font-medium text-slate-400">Pickup</span>
                            </div>

                            {/* Step 5 */}
                            <div className="relative flex items-center justify-between">
                                <div className="absolute -left-7 z-10 h-6 w-6 rounded-full border-2 border-slate-300 bg-white" />
                                <span className="text-sm font-medium text-slate-400">Selesai</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                        <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                            TINDAKAN CEPAT
                        </h3>

                        {negotiation.order ? (
                            negotiation.order.status === 'paid' ? (
                                <Link
                                    href={route('invoices.show', negotiation.order.invoice?.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f0f7f1] text-[#2e5a36] border border-[#2e5a36]/20 px-4 py-3 text-sm font-semibold shadow-xs transition-all hover:bg-emerald-50"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Lihat Bukti Pembayaran
                                </Link>
                            ) : isBuyer ? (
                                <Link
                                    href={route('orders.payment', negotiation.order.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-800"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    Bayar Sekarang
                                </Link>
                            ) : (
                                <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-500 leading-relaxed">
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
                                <div className="text-center p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-500 leading-relaxed">
                                    Negosiasi telah disetujui! Menunggu pembayaran dari pembeli.
                                </div>
                            )
                        ) : (
                            <>
                                <button
                                    type="button"
                                    disabled={!canRespondToPendingOffer}
                                    onClick={() => latestPendingOffer && handleAcceptOffer(latestPendingOffer.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-40 cursor-pointer"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Terima Penawaran
                                </button>

                                <button
                                    type="button"
                                    disabled={!canRespondToPendingOffer}
                                    onClick={() => latestPendingOffer && handleRejectOffer(latestPendingOffer.id)}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                                >
                                    <ThumbsDown className="h-4 w-4 text-rose-500" />
                                    Tolak Negosiasi
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
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
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
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
                                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    negotiation.status === 'agreed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100/70 text-amber-700'
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
                            <span className="shadow-2xs rounded-full border border-slate-100 bg-white px-4 py-1 text-xs font-semibold text-slate-400">
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
                                            className={`flex flex-col gap-1 ${
                                                isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                                            } max-w-[85%]`}
                                        >
                                            <div className="shadow-2xs w-full rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                                                        <MessageCircle className="h-4 w-4" />
                                                        Penawaran
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            msg.offer_status === 'accepted'
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
                                                <p className="mb-3 text-xs text-slate-500">
                                                    {isSelf ? 'Penawaran Anda:' : 'Penawaran dari mitra:'}
                                                </p>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">Harga</span>
                                                        <span className="text-sm font-bold text-emerald-700">
                                                            {formatCurrency(msg.offer_price)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">
                                                            Kuantitas
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-800">
                                                            {msg.offer_quantity} {product.unit || 'kg'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[11px] text-slate-400">Total</span>
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {formatCurrency(
                                                                (msg.offer_price || 0) * (msg.offer_quantity || 0)
                                                            )}
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
                                        className={`flex items-start gap-3 ${
                                            isSelf ? 'ml-auto flex-row-reverse max-w-[85%]' : 'max-w-[85%]'
                                        }`}
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
                                                className={`shadow-2xs p-4 leading-relaxed text-sm ${
                                                    isSelf
                                                        ? 'rounded-2xl rounded-tr-xs bg-emerald-800 text-white'
                                                        : 'rounded-2xl rounded-tl-xs border border-amber-100/60 bg-amber-50/60 text-slate-800'
                                                }`}
                                            >
                                                {msg.message}
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

                    {/* Chat Input Bar */}
                    <form
                        onSubmit={handleSendMessage}
                        className="flex items-center gap-3 border-t border-slate-100 bg-white p-4"
                    >
                        <button
                            type="button"
                            disabled={negotiation.status === 'agreed'}
                            onClick={() => {
                                setCounterTargetMessage(null);
                                setIsOfferModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-emerald-200/50 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-40"
                        >
                            <DollarSign className="h-4 w-4" />
                            Tawar
                        </button>

                        <div className="relative flex flex-1 items-center">
                            <input
                                type="text"
                                value={messageForm.data.message}
                                onChange={(e) => messageForm.setData('message', e.target.value)}
                                placeholder="Ketik pesan..."
                                className="w-full rounded-full border-none bg-[#F4F6F8] px-5 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={messageForm.processing || !messageForm.data.message.trim()}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs transition-all hover:scale-105 hover:bg-emerald-700 disabled:opacity-50"
                        >
                            <Send className="h-5 w-5 translate-x-0.5 -translate-y-0.5" />
                        </button>
                    </form>
                </section>

                {/* Right Sidebar: Active Conversations & Floating Actions (3 Cols) */}
                <aside className="relative flex flex-col gap-6 lg:col-span-3">
                    {/* Active Conversations Card */}
                    <div className="flex min-h-[500px] flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Negosiasi Aktif</h2>
                            <p className="text-xs font-medium text-slate-400">
                                {activeNegotiations ? activeNegotiations.length : 0} percakapan
                            </p>
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
                                            className={`-mx-2 flex items-start gap-3 rounded-xl py-3 px-2 transition-colors ${
                                                isCurrent ? 'bg-slate-50/80 font-bold' : 'hover:bg-slate-50/50'
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
                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-0.5 flex items-center justify-between">
                                                    <h3 className="truncate text-sm font-bold text-slate-900">
                                                        {itemPartner?.name || 'Mitra'}
                                                    </h3>
                                                    <span className="text-[11px] text-slate-400">
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="truncate text-xs font-semibold text-slate-700">
                                                    {item.product?.title || 'Produk'}
                                                </p>
                                                <p className="truncate text-xs text-slate-400">
                                                    {item.agreed_price
                                                        ? `Agreed: ${formatCurrency(item.agreed_price)}`
                                                        : 'Sedang bernegosiasi...'}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div className="py-6 text-center text-xs text-slate-400">
                                    Belum ada sesi negosiasi lain.
                                </div>
                            )}
                        </div>
                    </div>


                </aside>
            </main>

            {/* Offer Modal */}
            {isOfferModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
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
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Harga Penawaran (Rp / unit)
                                </label>
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
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    Kuantitas ({product.unit || 'unit'})
                                </label>
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
                                    {formatCurrency(
                                        (Number(offerForm.data.offer_price) || 0) *
                                            (Number(offerForm.data.offer_quantity) || 0)
                                    )}
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
