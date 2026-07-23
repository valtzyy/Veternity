import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Package, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Produk Saya', href: '/seller/products' },
];

interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    title: string;
    reference_price: string;
    stock: number;
    unit: string;
    condition: string;
    status: 'available' | 'pending_review' | 'inactive';
    category: Category;
    images: ProductImage[];
    created_at: string;
}

interface ProductsIndexProps {
    products: {
        data: Product[];
        links: any[];
    };
}

const statusConfig: Record<string, { label: string; className: string }> = {
    available: {
        label: 'Aktif',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400',
    },
    pending_review: {
        label: 'Pending Review',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400',
    },
    inactive: {
        label: 'Nonaktif',
        className: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400',
    },
};

export default function ProductsIndex({ products }: ProductsIndexProps) {
    function handleDelete(id: number) {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            router.delete(`/seller/products/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk Saya - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Produk Saya</h1>
                        <p className="text-sm text-neutral-500 mt-1">Kelola dan pantau semua produk limbah pangan yang kamu jual.</p>
                    </div>
                    <Link
                        href="/seller/products/create"
                        className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Produk
                    </Link>
                </div>

                {/* Product List */}
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 py-24 gap-4">
                        <div className="rounded-full bg-emerald-50 p-4 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <Package className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Belum ada produk</h3>
                            <p className="text-sm text-neutral-500 mt-1">Upload produk limbah pangan pertamamu sekarang!</p>
                        </div>
                        <Link
                            href="/seller/products/create"
                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                            <Plus className="h-4 w-4" />
                            Upload Produk
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-xs overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Produk</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4">Kondisi</th>
                                        <th className="px-6 py-4">Stok</th>
                                        <th className="px-6 py-4">Harga Referensi</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
                                    {products.data.map((product) => {
                                        const primaryImg = product.images.find((img) => img.is_primary) ?? product.images[0];
                                        const status = statusConfig[product.status] ?? statusConfig.inactive;
                                        return (
                                            <tr key={product.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {primaryImg ? (
                                                            <img
                                                                src={primaryImg.image_url}
                                                                alt={product.title}
                                                                className="h-10 w-10 rounded-lg object-cover border border-neutral-100 dark:border-neutral-700"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-neutral-900 dark:text-white line-clamp-1">{product.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300">{product.category?.name}</td>
                                                <td className="px-6 py-4 capitalize text-neutral-600 dark:text-neutral-300">{product.condition}</td>
                                                <td className="px-6 py-4 font-medium">
                                                    {product.stock} {product.unit}
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-emerald-700 dark:text-emerald-400">
                                                    Rp {parseFloat(product.reference_price).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/seller/products/${product.id}/edit`}
                                                            className="rounded-lg p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 transition-colors"
                                                            title="Edit produk"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="rounded-lg p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 transition-colors"
                                                            title="Hapus produk"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
