import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Leaf, ArrowLeft, Printer, CheckCircle2, MapPin, Phone, User, Store, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import React from 'react';

interface Product {
    id: number;
    title: string;
    reference_price: string;
    unit: string;
    images?: { image_url: string }[];
}

interface Invoice {
    id: number;
    invoice_number: string;
    order_number: string;
    gross_amount: string;
    final_amount: string;
    payment_method: string;
    generated_at: string;
    paid_at?: string;
}

interface Order {
    id: number;
    order_number: string;
    final_price: string;
    final_quantity: number;
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    notes?: string;
    negotiation_id: number;
}

interface Buyer {
    id: number;
    name: string;
    email: string;
}

interface Seller {
    id: number;
    name: string;
}

interface Props {
    invoice: Invoice;
    order: Order;
    product: Product;
    buyer: Buyer;
    seller: Seller;
}

export default function InvoicePage({ invoice, order, product, buyer, seller }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Negosiasi', href: '/negotiations' },
        { title: 'Detail Chat', href: `/negotiations/${order.negotiation_id}` },
        { title: 'Bukti Pembayaran', href: '#' },
    ];

    const formatCurrency = (val: string | number) => {
        return 'Rp ' + Number(val).toLocaleString('id-ID');
    };

    const methodLabel = {
        bank_transfer: 'Transfer Bank (VA)',
        e_wallet: 'E-Wallet (QRIS)',
        reguna_escrow: 'Rekening Bersama ReGuna',
    }[invoice.payment_method] ?? 'Online';

    const grandTotal = Number(invoice.final_amount);
    const subtotal = Number(invoice.gross_amount);
    const shippingFee = 15000;
    const serviceFee = 2500;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bukti Pembayaran ${invoice.invoice_number}`} />

            <div className="mx-auto max-w-[800px] p-6 space-y-6">
                {/* Actions Header (hidden in print) */}
                <div className="flex items-center justify-between print:hidden">
                    <Link
                        href={route('negotiations.show', order.negotiation_id)}
                        className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-neutral-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Chat
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                        <Printer className="h-3.5 w-3.5" /> Cetak Bukti
                    </button>
                </div>

                {/* Printable Invoice Page */}
                <div className="bg-white border border-neutral-100 rounded-3xl p-8 sm:p-10 shadow-sm print:border-0 print:shadow-none print:p-0">
                    {/* Top Branding Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-6 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-[#2e5a36] text-white flex items-center justify-center">
                                <Leaf className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-extrabold text-[#2e5a36]">ReGuna</span>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="bg-[#e6f4e9] text-[#2e5a36] px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xs inline-flex items-center gap-1.5 uppercase">
                                <CheckCircle2 className="h-4 w-4" /> Lunas / Paid
                            </span>
                            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2.5">
                                Kode Invoice: {invoice.invoice_number}
                            </div>
                        </div>
                    </div>

                    {/* Metadata columns */}
                    <div className="grid grid-cols-2 gap-6 border-b border-neutral-100 pb-6 mb-6 text-xs text-neutral-600 font-medium">
                        <div>
                            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Info Transaksi</span>
                            <div className="space-y-1">
                                <div><span className="font-bold text-neutral-800">No. Order:</span> {invoice.order_number}</div>
                                <div>
                                    <span className="font-bold text-neutral-800">Tanggal Bayar:</span>{' '}
                                    {invoice.paid_at 
                                        ? new Date(invoice.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                                        : '-'
                                    }
                                </div>
                                <div><span className="font-bold text-neutral-800">Metode:</span> {methodLabel}</div>
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Informasi Partner</span>
                            <div className="space-y-1">
                                <div><span className="font-bold text-neutral-800">Pembeli (Buyer):</span> {buyer.name}</div>
                                <div><span className="font-bold text-neutral-800">Penjual (Seller):</span> {seller.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping info */}
                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-100/50 mb-6 text-xs font-medium text-neutral-600">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#2e5a36]" /> Alamat Pengiriman
                        </span>
                        <div className="space-y-1">
                            <div className="font-bold text-neutral-800">{order.receiver_name} ({order.receiver_phone})</div>
                            <div className="leading-relaxed">{order.shipping_address}</div>
                            {order.notes && <div className="mt-2 text-neutral-400 italic">Catatan: "{order.notes}"</div>}
                        </div>
                    </div>

                    {/* Table list */}
                    <div className="border border-neutral-200/80 rounded-2xl overflow-hidden mb-6">
                        <table className="w-full text-left border-collapse text-xs font-medium">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200/80 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                    <th className="px-5 py-3">Nama Item</th>
                                    <th className="px-5 py-3 text-center">Harga Satuan</th>
                                    <th className="px-5 py-3 text-center">Jumlah</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/80 text-neutral-700">
                                <tr>
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-neutral-900 capitalize">{product.title}</div>
                                        <div className="text-[10px] text-neutral-400 font-semibold mt-0.5">Kategori: Organik</div>
                                    </td>
                                    <td className="px-5 py-4 text-center">{formatCurrency(order.final_price)}</td>
                                    <td className="px-5 py-4 text-center">{order.final_quantity} {product.unit || 'kg'}</td>
                                    <td className="px-5 py-4 text-right font-bold text-neutral-900">{formatCurrency(subtotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Total Summary right list */}
                    <div className="flex justify-end font-semibold text-xs text-neutral-500">
                        <div className="w-full sm:w-80 space-y-2.5">
                            <div className="flex justify-between">
                                <span>Subtotal Belanja</span>
                                <span className="text-neutral-800">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Pengiriman</span>
                                <span className="text-neutral-800">{formatCurrency(shippingFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Layanan Escrow</span>
                                <span className="text-neutral-800">{formatCurrency(serviceFee)}</span>
                            </div>
                            <div className="flex justify-between border-t border-neutral-100 pt-2.5 text-sm">
                                <span className="font-bold text-neutral-900">Total Pembayaran</span>
                                <span className="font-extrabold text-[#2e5a36] text-base">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Thank you and warning escrow */}
                    <div className="border-t border-neutral-100 pt-6 mt-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <ShieldCheck className="h-4 w-4 text-[#2e5a36]" /> Escrow Protection Active
                        </div>
                        <div className="text-[10px] text-neutral-400 font-semibold">
                            Dicetak otomatis oleh platform ReGuna Marketplace
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
