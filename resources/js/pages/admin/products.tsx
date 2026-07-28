import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, X, ShieldAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Moderate Products',
        href: '/admin/products',
    },
];

interface Product {
    id: number;
    title: string;
    description: string;
    reference_price: string;
    stock: number;
    unit: string;
    condition: string;
    status: 'pending_review' | 'available' | 'inactive';
    seller?: {
        name: string;
    };
    category?: {
        name: string;
    };
}

interface ProductsProps {
    products: {
        data: Product[];
        links: any[];
    };
}

export default function Products({ products }: ProductsProps) {
    const handleApprove = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menyetujui produk ini agar tampil di marketplace?')) {
            router.patch(route('admin.products.approve', id));
        }
    };

    const handleReject = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menolak produk ini?')) {
            router.patch(route('admin.products.reject', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderasi Produk - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-emerald-800 dark:text-emerald-300">
                        Moderasi Produk
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Verifikasi deskripsi, kelayakan kondisi sampah organik, dan harga wajar sebelum dipublikasi.
                    </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Nama Produk & Kategori</th>
                                    <th className="px-6 py-4">Penjual</th>
                                    <th className="px-6 py-4">Kondisi & Stok</th>
                                    <th className="px-6 py-4">Harga Referensi</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">
                                            Tidak ada produk untuk dimoderasi saat ini.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-950/50">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-neutral-900 dark:text-white">{product.title}</div>
                                                <div className="text-xs text-neutral-500">{product.category?.name || 'Uncategorized'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">
                                                {product.seller?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-semibold capitalize text-neutral-700 dark:text-neutral-300">
                                                    {product.condition}
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    Stok: {product.stock} {product.unit}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-700 dark:text-emerald-400">
                                                Rp {parseFloat(product.reference_price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    product.status === 'available'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : product.status === 'pending_review'
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                }`}>
                                                    {product.status === 'pending_review' ? 'Pending Review' : product.status === 'available' ? 'Tersedia' : 'Ditolak'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {product.status === 'pending_review' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(product.id)}
                                                            title="Setujui Produk"
                                                            className="rounded-lg p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 transition-colors cursor-pointer"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(product.id)}
                                                            title="Tolak Produk"
                                                            className="rounded-lg p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 transition-colors cursor-pointer"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-neutral-400 dark:text-neutral-500">Selesai dimoderasi</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
