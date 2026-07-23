import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Upload, X, ImagePlus, Info } from 'lucide-react';
import { useRef, useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
}

interface Product {
    id: number;
    title: string;
    description: string;
    reference_price: string;
    minimum_order: number;
    stock: number;
    unit: 'kg' | 'liter' | 'pcs' | 'box';
    category_id: number;
    condition: 'fresh' | 'usable' | 'near_expired';
    location: string;
    images: ProductImage[];
}

interface EditProps {
    product: Product;
    categories: Category[];
}

export default function Edit({ product, categories }: EditProps) {
    const existingImages = product.images ?? [];
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: product.title,
        description: product.description,
        reference_price: product.reference_price,
        minimum_order: String(product.minimum_order),
        stock: String(product.stock),
        unit: product.unit,
        category_id: String(product.category_id),
        condition: product.condition,
        location: product.location,
        images: [] as File[],
    });

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const combined = [...(data.images as File[]), ...files].slice(0, 5);
        setData('images', combined as any);
        setImagePreviews(combined.map((file) => URL.createObjectURL(file)));
    }

    function removeNewImage(index: number) {
        const updated = [...(data.images as File[])];
        updated.splice(index, 1);
        setData('images', updated as any);
        setImagePreviews((prev) => {
            const p = [...prev];
            p.splice(index, 1);
            return p;
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/seller/products/${product.id}`, { forceFormData: true });
    }

    const inputClass =
        'w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-xs outline-none ring-0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-emerald-400';
    const labelClass = 'block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Produk Saya', href: '/seller/products' },
        { title: 'Edit Produk', href: `/seller/products/${product.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${product.title} - ReGuna`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">Edit Produk</h1>
                    <p className="text-sm text-neutral-500 mt-1">Perbarui informasi produk limbah pangan kamu.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Section: Informasi Dasar */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-5">Informasi Dasar</h2>
                        <div className="flex flex-col gap-5">
                            <div>
                                <label className={labelClass} htmlFor="title">Nama Produk</label>
                                <input id="title" type="text" className={inputClass} value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                <InputError message={errors.title} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="description">Deskripsi Produk</label>
                                <textarea id="description" rows={4} className={inputClass} value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                                <InputError message={errors.description} className="mt-1" />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass} htmlFor="category_id">Kategori</label>
                                    <select id="category_id" className={inputClass} value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} required>
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.category_id} className="mt-1" />
                                </div>

                                <div>
                                    <label className={labelClass} htmlFor="condition">Kondisi</label>
                                    <select id="condition" className={inputClass} value={data.condition} onChange={(e) => setData('condition', e.target.value as any)} required>
                                        <option value="fresh">Segar (Fresh)</option>
                                        <option value="usable">Masih Layak (Usable)</option>
                                        <option value="near_expired">Mendekati Kedaluwarsa</option>
                                    </select>
                                    <InputError message={errors.condition} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="location">Lokasi</label>
                                <input id="location" type="text" className={inputClass} value={data.location} onChange={(e) => setData('location', e.target.value)} required />
                                <InputError message={errors.location} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Harga & Stok */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-5">Harga & Stok</h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass} htmlFor="reference_price">Harga Referensi (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-neutral-400 font-medium">Rp</span>
                                    <input id="reference_price" type="number" min="0" step="100" className={`${inputClass} pl-10`} value={data.reference_price} onChange={(e) => setData('reference_price', e.target.value)} required />
                                </div>
                                <InputError message={errors.reference_price} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="stock">Jumlah Stok</label>
                                <div className="flex gap-2">
                                    <input id="stock" type="number" min="0" className={`${inputClass} flex-1`} value={data.stock} onChange={(e) => setData('stock', e.target.value)} required />
                                    <select className={`${inputClass} w-28`} value={data.unit} onChange={(e) => setData('unit', e.target.value as any)}>
                                        <option value="kg">kg</option>
                                        <option value="liter">liter</option>
                                        <option value="pcs">pcs</option>
                                        <option value="box">box</option>
                                    </select>
                                </div>
                                <InputError message={errors.stock} className="mt-1" />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="minimum_order">Minimum Pemesanan</label>
                                <div className="flex gap-2">
                                    <input id="minimum_order" type="number" min="1" className={`${inputClass} flex-1`} value={data.minimum_order} onChange={(e) => setData('minimum_order', e.target.value)} required />
                                    <div className={`${inputClass} w-28 text-neutral-400`}>{data.unit}</div>
                                </div>
                                <InputError message={errors.minimum_order} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Section: Foto Produk */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-1">Foto Produk</h2>
                        <p className="text-xs text-neutral-500 mb-5">
                            {imagePreviews.length > 0 ? 'Upload foto baru akan menggantikan semua foto lama.' : 'Foto produk saat ini ditampilkan di bawah. Upload baru untuk mengganti.'}
                        </p>

                        {/* Existing images when no new ones are selected */}
                        {imagePreviews.length === 0 && existingImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                                {existingImages.map((img) => (
                                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border-2 border-neutral-200 dark:border-neutral-700">
                                        <img src={img.image_url} alt="Foto produk" className="h-full w-full object-cover" />
                                        {img.is_primary && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/80 text-white text-[10px] font-semibold text-center py-0.5">
                                                Utama
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New image previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-emerald-400">
                                        <img src={src} alt={`preview ${i + 1}`} className="h-full w-full object-cover" />
                                        {i === 0 && (
                                            <span className="absolute bottom-0 left-0 right-0 bg-emerald-600/80 text-white text-[10px] font-semibold text-center py-0.5">Utama</span>
                                        )}
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length < 5 && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                        <ImagePlus className="h-5 w-5" />
                                        <span className="text-xs">Tambah</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-xs"
                        >
                            <Upload className="h-4 w-4" />
                            {imagePreviews.length > 0 ? 'Ganti Foto' : 'Upload Foto Baru'}
                        </button>

                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        <InputError message={errors.images} className="mt-2" />

                        {imagePreviews.length > 0 && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-800 dark:text-amber-300">
                                    Foto baru yang kamu pilih akan menggantikan semua foto lama saat disimpan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <a
                            href="/seller/products"
                            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 transition-colors"
                        >
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-xs"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
