import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Leaf, CreditCard, ArrowLeft, User, Phone, MapPin, ClipboardList, Info, AlertCircle } from 'lucide-react';
import React from 'react';

interface Product {
    id: number;
    title: string;
    reference_price: string;
    unit: string;
    images?: { image_url: string }[];
}

interface Seller {
    id: number;
    name: string;
}

interface Negotiation {
    id: number;
    agreed_price: string;
    agreed_quantity: number;
    product: Product;
    seller: Seller;
}

interface Props {
    negotiation: Negotiation;
    product: Product;
    seller: Seller;
}

export default function Checkout({ negotiation, product, seller }: Props) {
    const { auth } = usePage<any>().props;
    const currentUser = auth?.user;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Negosiasi', href: '/negotiations' },
        { title: 'Detail Chat', href: `/negotiations/${negotiation.id}` },
        { title: 'Checkout', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        receiver_name: currentUser?.name || '',
        receiver_phone: '',
        shipping_address: currentUser?.address || '',
        notes: '',
    });

    const formatCurrency = (val: string | number) => {
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const finalPriceNum = Number(negotiation.agreed_price);
    const totalPrice = finalPriceNum * negotiation.agreed_quantity;
    const shippingFee = 15000; // Simulated flat shipping fee
    const serviceFee = 2500;   // Escrow service fee
    const grandTotal = totalPrice + shippingFee + serviceFee;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('negotiations.checkout.store', negotiation.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout Pesanan - ReGuna" />

            <div className="mx-auto max-w-[1200px] p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Checkout Pemesanan</h1>
                        <p className="text-sm text-neutral-500 mt-1">Konfirmasi detail pengiriman dan selesaikan transaksi</p>
                    </div>
                    <Link
                        href={route('negotiations.show', negotiation.id)}
                        className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-neutral-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Chat
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Panel: Checkout Form (8 Cols) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
                        {/* Shipping Info Card */}
                        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-6">
                                <MapPin className="h-5 w-5 text-[#2e5a36]" />
                                <h2 className="text-base font-bold text-neutral-900">Informasi Pengiriman</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Receiver Name */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Nama Penerima</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.receiver_name}
                                            onChange={(e) => setData('receiver_name', e.target.value)}
                                            required
                                            placeholder="Masukkan nama lengkap penerima..."
                                            className="w-full rounded-2xl border-neutral-200/80 bg-white px-4 py-3 pl-11 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.receiver_name && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.receiver_name}</p>
                                    )}
                                </div>

                                {/* Receiver Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Nomor Telepon</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={data.receiver_phone}
                                            onChange={(e) => setData('receiver_phone', e.target.value)}
                                            required
                                            placeholder="Contoh: 081234567890..."
                                            className="w-full rounded-2xl border-neutral-200/80 bg-white px-4 py-3 pl-11 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.receiver_phone && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.receiver_phone}</p>
                                    )}
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Alamat Pengiriman Lengkap</label>
                                    <div className="relative">
                                        <textarea
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            required
                                            rows={3}
                                            placeholder="Masukkan alamat lengkap rumah/kantor untuk penjemputan/pengiriman..."
                                            className="w-full rounded-2xl border-neutral-200/80 bg-white p-4 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none resize-none"
                                        />
                                    </div>
                                    {errors.shipping_address && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.shipping_address}</p>
                                    )}
                                </div>

                                {/* Notes for driver/seller */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Catatan Tambahan (Opsional)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Contoh: Titipkan di satpam, gerbang warna hijau, dll..."
                                            className="w-full rounded-2xl border-neutral-200/80 bg-white px-4 py-3 pl-11 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none"
                                        />
                                        <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    </div>
                                    {errors.notes && (
                                        <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.notes}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Escrow Disclaimer Card */}
                        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5 flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Rekening Bersama ReGuna</h4>
                                <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
                                    Demi kenyamanan dan keamanan transaksi Anda, dana pembayaran akan ditampung sementara di rekening penampung pihak ketiga ReGuna (Escrow) dan baru akan diteruskan ke penjual setelah barang Anda terima secara lengkap.
                                </p>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#2e5a36] hover:bg-[#234529] text-white py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <CreditCard className="h-5 w-5" /> Buat Pesanan & Lanjut ke Pembayaran
                        </button>
                    </form>

                    {/* Right Panel: Order Summary (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Summary Card */}
                        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                                Rincian Pesanan
                            </h3>

                            {/* Product Card Row */}
                            <div className="flex gap-3 border-b border-neutral-100 pb-4 mb-4">
                                <div className="h-16 w-16 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
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
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-extrabold text-neutral-900 text-sm truncate capitalize">{product.title}</h4>
                                    <span className="text-[11px] text-neutral-400 font-bold uppercase">Seller: {seller.name}</span>
                                    <div className="text-xs font-bold text-neutral-600 mt-1">
                                        {negotiation.agreed_quantity} {product.unit || 'kg'} x {formatCurrency(negotiation.agreed_price)}
                                    </div>
                                </div>
                            </div>

                            {/* Calculation Rows */}
                            <div className="space-y-3 font-semibold text-sm">
                                <div className="flex justify-between text-neutral-500">
                                    <span>Subtotal Produk</span>
                                    <span className="text-neutral-800">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-500">
                                    <span>Biaya Pengiriman</span>
                                    <span className="text-neutral-800">{formatCurrency(shippingFee)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-500">
                                    <span>Biaya Layanan Bersama</span>
                                    <span className="text-neutral-800">{formatCurrency(serviceFee)}</span>
                                </div>
                                <div className="flex justify-between border-t border-neutral-100 pt-3 text-base">
                                    <span className="font-bold text-neutral-900">Total Pembayaran</span>
                                    <span className="font-extrabold text-[#2e5a36]">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Safety Card */}
                        <div className="rounded-3xl border border-neutral-100 bg-[#f6faf6] p-6 text-center">
                            <Leaf className="h-8 w-8 text-[#2e5a36] mx-auto mb-2" />
                            <h4 className="text-xs font-bold text-[#2e5a36] uppercase tracking-wider">Garansi ReGuna</h4>
                            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                                Transaksi sampah organik yang ramah lingkungan dan aman 100%. Uang kembali penuh jika penjual membatalkan pesanan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
