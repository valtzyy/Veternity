import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Leaf, ArrowLeft, ShieldCheck, CreditCard, Landmark, Wallet, Check, AlertCircle, Copy } from 'lucide-react';
import React, { useState } from 'react';

interface Product {
    id: number;
    title: string;
    reference_price: string;
    unit: string;
    images?: { image_url: string }[];
}

interface Order {
    id: number;
    order_number: string;
    final_price: string;
    final_quantity: number;
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    negotiation_id: number;
}

interface Seller {
    id: number;
    name: string;
}

interface Props {
    order: Order;
    product: Product;
    seller: Seller;
}

export default function Payment({ order, product, seller }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Negosiasi', href: '/negotiations' },
        { title: 'Detail Chat', href: `/negotiations/${order.negotiation_id}` },
        { title: 'Pembayaran', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        payment_method: 'reguna_escrow',
    });

    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatCurrency = (val: string | number) => {
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const finalPriceNum = Number(order.final_price);
    const totalPrice = finalPriceNum * order.final_quantity;
    const shippingFee = 15000;
    const serviceFee = 2500;
    const grandTotal = totalPrice + shippingFee + serviceFee;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('orders.payment.store', order.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gerbang Pembayaran - ReGuna" />

            <div className="mx-auto max-w-[1000px] p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Gerbang Pembayaran</h1>
                        <p className="text-sm text-neutral-500 mt-1">Selesaikan transfer pembayaran pesanan Anda</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Payment Method Forms (7 Cols) */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
                        {/* Summary details */}
                        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
                            <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-4">
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">No. Transaksi</span>
                                    <span className="text-sm font-bold text-neutral-800">{order.order_number}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Total Bayar</span>
                                    <span className="text-lg font-extrabold text-[#2e5a36]">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>

                            <div className="text-xs text-neutral-500 flex justify-between font-semibold">
                                <span>Penerima: {order.receiver_name}</span>
                                <span>Kuantitas: {order.final_quantity} {product.unit || 'kg'}</span>
                            </div>
                        </div>

                        {/* Payment Options Selection */}
                        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
                            <h2 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wider">Pilih Metode Pembayaran</h2>

                            <div className="space-y-3">
                                {/* Option 1: Escrow Rekber */}
                                <label className={`flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                                    data.payment_method === 'reguna_escrow' 
                                    ? 'border-[#2e5a36] bg-[#f0f7f1]/30' 
                                    : 'border-neutral-100 hover:border-neutral-200'
                                }`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="reguna_escrow"
                                        checked={data.payment_method === 'reguna_escrow'}
                                        onChange={() => setData('payment_method', 'reguna_escrow')}
                                        className="sr-only"
                                    />
                                    <div className="h-10 w-10 rounded-xl bg-[#e6f4e9] text-[#2e5a36] flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-extrabold text-neutral-900">Rekening Bersama ReGuna (Escrow)</h4>
                                            <span className="text-[10px] bg-[#e6f4e9] text-[#2e5a36] px-2 py-0.5 rounded-md font-bold">Direkomendasikan</span>
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                            Dana dijamin aman. Hanya akan diteruskan ke supplier setelah barang terkonfirmasi diterima dengan baik.
                                        </p>
                                    </div>
                                </label>

                                {/* Option 2: Bank Transfer */}
                                <label className={`flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                                    data.payment_method === 'bank_transfer' 
                                    ? 'border-[#2e5a36] bg-[#f0f7f1]/30' 
                                    : 'border-neutral-100 hover:border-neutral-200'
                                }`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="bank_transfer"
                                        checked={data.payment_method === 'bank_transfer'}
                                        onChange={() => setData('payment_method', 'bank_transfer')}
                                        className="sr-only"
                                    />
                                    <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Landmark className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-extrabold text-neutral-900">Transfer Bank Mandiri / BCA</h4>
                                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                            Lakukan transfer manual ke Virtual Account resmi. Verifikasi otomatis dalam waktu 1-3 menit.
                                        </p>
                                    </div>
                                </label>

                                {/* Option 3: E-Wallet */}
                                <label className={`flex items-start gap-4 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                                    data.payment_method === 'e_wallet' 
                                    ? 'border-[#2e5a36] bg-[#f0f7f1]/30' 
                                    : 'border-neutral-100 hover:border-neutral-200'
                                }`}>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="e_wallet"
                                        checked={data.payment_method === 'e_wallet'}
                                        onChange={() => setData('payment_method', 'e_wallet')}
                                        className="sr-only"
                                    />
                                    <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-extrabold text-neutral-900">E-Wallet (OVO / GoPay)</h4>
                                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                                            Simulasi pembayaran instan dengan memindai kode QRIS atau memasukkan nomor handphone Anda.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#2e5a36] hover:bg-[#234529] text-white py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Check className="h-5 w-5" /> Bayar & Konfirmasi Transaksi
                        </button>
                    </form>

                    {/* Right: Payment Details Instructions (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Bank Account Info Card */}
                        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-xs">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4">
                                Instruksi Transfer
                            </h3>

                            {data.payment_method === 'reguna_escrow' ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                                        Silakan transfer nominal yang tertera ke rekening penampungan resmi Escrow ReGuna di bawah ini:
                                    </p>
                                    <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 space-y-3">
                                        <div>
                                            <span className="block text-[10px] text-neutral-400 uppercase font-bold">Nama Bank</span>
                                            <span className="text-sm font-extrabold text-neutral-800">Bank Mandiri (ReGuna Bersama)</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-neutral-400 uppercase font-bold">Nomor Rekening</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-base font-extrabold text-[#2e5a36]">133-009-8877-664</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy('1330098877664')}
                                                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Copy className="h-3.5 w-3.5" /> {copied ? 'Tersalin' : 'Salin'}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-neutral-400 uppercase font-bold">Jumlah Bayar</span>
                                            <span className="text-base font-extrabold text-neutral-900">{formatCurrency(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : data.payment_method === 'bank_transfer' ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                                        Virtual Account Mandiri / BCA:
                                    </p>
                                    <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 space-y-3">
                                        <div>
                                            <span className="block text-[10px] text-neutral-400 uppercase font-bold">Virtual Account BCA</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-base font-extrabold text-neutral-800">3901-081234567890</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy('3901081234567890')}
                                                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Copy className="h-3.5 w-3.5" /> Salin
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 text-center py-6">
                                    <div className="h-44 w-44 rounded-2xl bg-white border border-neutral-100 mx-auto p-4 flex items-center justify-center shadow-xs">
                                        {/* Mock QRIS code */}
                                        <div className="border-4 border-[#2e5a36] h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-200 via-neutral-400 to-neutral-800 flex items-center justify-center font-bold text-neutral-700 text-xs">
                                            REGUNA QRIS
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                                        Pindai QRIS di atas untuk membayar
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 flex items-start gap-2 bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                                    <strong>Penting:</strong> Masukkan jumlah bayar hingga digit terakhir dengan tepat untuk mempercepat verifikasi pembayaran otomatis Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
