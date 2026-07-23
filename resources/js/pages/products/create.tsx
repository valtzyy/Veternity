import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Upload, X, Info, Package, Image as ImageIcon, Tag, CheckCircle2, ArrowRight, ArrowLeft, Check, Layers, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Produk Saya', href: '/seller/products' },
    { title: 'Tambah Produk', href: '/seller/products/create' },
];

interface Category {
    id: number;
    name: string;
}

interface CreateProps {
    categories: Category[];
}

export default function Create({ categories }: CreateProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        reference_price: '',
        minimum_order: '',
        stock: '',
        unit: 'kg' as 'kg' | 'liter' | 'pcs' | 'box',
        category_id: '',
        condition: '', // Will be used for Kesegaran/Masa Simpan
        notes: '', // Will be used for Catatan Tambahan
        location: '',
        province: '',
        availability: 'Harian',
        images: [] as File[],
    });

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        const combined = [...(data.images as File[]), ...files].slice(0, 5);
        setData('images', combined as any);

        const previews = combined.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    }

    function removeImage(index: number) {
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
        post('/seller/products', {
            forceFormData: true,
        });
    }

    const nextStep = () => setCurrentStep((p) => Math.min(4, p + 1));
    const prevStep = () => setCurrentStep((p) => Math.max(1, p - 1));

    const steps = [
        { id: 1, name: 'Info Produk', icon: Package },
        { id: 2, name: 'Foto', icon: ImageIcon },
        { id: 3, name: 'Harga & Stok', icon: Tag },
        { id: 4, name: 'Pratinjau', icon: CheckCircle2 },
    ];

    const inputClass = 'w-full rounded-2xl border-transparent bg-[#f0f7f1] px-4 py-3 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none placeholder-neutral-400';
    const labelClass = 'block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Produk Baru - ReGuna" />

            {/* Use h-screen and overflow-y-auto here so the sticky header stays inside the scrollable container */}
            <div className="flex flex-col h-[calc(100vh-1px)] overflow-y-auto bg-[#f6faf6]">
                {/* Header Section (Sticky) */}
                <div className="bg-white border-b border-neutral-100 pt-8 pb-6 px-6 sm:px-12 z-20 sticky top-0 shadow-sm shrink-0">
                    <div className="max-w-4xl mx-auto w-full">
                        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Upload Produk Baru</h1>
                        <p className="text-sm text-neutral-500 mt-1 mb-8">
                            Isi informasi produk limbah pangan Anda
                        </p>

                        {/* Stepper */}
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-100 -z-10" />
                            {steps.map((step) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;
                                return (
                                    <div key={step.id} className="flex flex-col sm:flex-row items-center gap-3 bg-white px-2">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                                            isActive ? 'bg-[#2e5a36] text-white shadow-md' :
                                            isCompleted ? 'bg-[#e6f4e9] text-[#2e5a36]' :
                                            'bg-neutral-100 text-neutral-400'
                                        }`}>
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <span className={`text-sm font-bold hidden sm:block ${
                                            isActive ? 'text-neutral-900' :
                                            isCompleted ? 'text-neutral-700' :
                                            'text-neutral-400'
                                        }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 px-6 py-8 sm:px-12 w-full">
                    <div className="max-w-4xl mx-auto w-full">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            {/* Step 1 */}
                            {currentStep === 1 && (
                                <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-neutral-100/60">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Package className="h-6 w-6 text-[#2e5a36]" />
                                        <h2 className="text-xl font-bold text-neutral-900">Informasi Produk</h2>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <div>
                                            <label className={labelClass} htmlFor="title">
                                                Nama Produk <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="title"
                                                type="text"
                                                className={inputClass}
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="Contoh: Ampas Tahu Segar Berkualitas"
                                                required
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>

                                        <div>
                                            <label className={labelClass} htmlFor="category_id">
                                                Kategori <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="category_id"
                                                className={inputClass}
                                                value={data.category_id}
                                                onChange={(e) => setData('category_id', e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Pilih kategori...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} className="mt-2" />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className={`${labelClass} mb-0`} htmlFor="description">
                                                    Deskripsi Produk <span className="text-red-500">*</span>
                                                </label>
                                                <span className="text-xs text-neutral-400">{data.description.length}/500</span>
                                            </div>
                                            <textarea
                                                id="description"
                                                rows={5}
                                                maxLength={500}
                                                className={inputClass}
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Jelaskan kondisi produk, asal proses produksi, kadar air, protein, dan keunggulan produk Anda..."
                                                required
                                            />
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelClass} htmlFor="location">Lokasi (Kota)</label>
                                                <input
                                                    id="location"
                                                    type="text"
                                                    className={inputClass}
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                    placeholder="Bogor"
                                                    required
                                                />
                                                <InputError message={errors.location} className="mt-2" />
                                            </div>
                                            <div>
                                                <label className={labelClass} htmlFor="province">Provinsi</label>
                                                <input
                                                    id="province"
                                                    type="text"
                                                    className={inputClass}
                                                    value={data.province}
                                                    onChange={(e) => setData('province', e.target.value)}
                                                    placeholder="Jawa Barat"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Ketersediaan</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['Harian', 'Mingguan', 'Bulanan'].map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => setData('availability', option)}
                                                        className={`rounded-2xl py-3 text-sm font-bold transition-all border ${
                                                            data.availability === option 
                                                            ? 'bg-[#2e5a36] text-white border-[#2e5a36] shadow-md' 
                                                            : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                        }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 */}
                            {currentStep === 2 && (
                                <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-neutral-100/60">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ImageIcon className="h-6 w-6 text-[#2e5a36]" />
                                        <h2 className="text-xl font-bold text-neutral-900">Foto Produk</h2>
                                    </div>
                                    
                                    <p className="text-sm text-neutral-500 mb-8">
                                        Unggah 1–5 foto. Foto pertama akan jadi cover. Format: JPG, PNG. Maks. 5MB/foto.
                                    </p>

                                    <div className="rounded-3xl border-2 border-dashed border-[#e6f4e9] bg-[#f0f7f1]/50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#f0f7f1] transition-colors mb-6" onClick={() => fileInputRef.current?.click()}>
                                        <div className="h-12 w-12 rounded-xl bg-[#e6f4e9] text-[#2e5a36] flex items-center justify-center mb-4">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-base font-bold text-neutral-900 mb-1">Klik atau seret foto ke sini</h3>
                                        <p className="text-sm text-neutral-500">Simulasi: klik untuk tambah foto contoh ({imagePreviews.length}/5)</p>
                                    </div>
                                    
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                                            {imagePreviews.map((src, i) => (
                                                <div key={i} className="relative group aspect-square rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                                                    <img src={src} alt={`preview ${i + 1}`} className="h-full w-full object-cover" />
                                                    {i === 0 && (
                                                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2e5a36]/90 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-bold">
                                                            Cover
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow-sm scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {imagePreviews.length === 0 && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-[#fff8eb] border border-[#fde8c3] p-4 text-[#b97a22]">
                                            <Info className="h-5 w-5 flex-shrink-0" />
                                            <p className="text-sm font-medium">Minimal 1 foto diperlukan untuk melanjutkan.</p>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <InputError message={errors.images} className="mt-4" />
                                </div>
                            )}

                            {/* Step 3 */}
                            {currentStep === 3 && (
                                <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-neutral-100/60">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Tag className="h-6 w-6 text-[#2e5a36]" />
                                        <h2 className="text-xl font-bold text-neutral-900">Harga & Informasi Stok</h2>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass} htmlFor="reference_price">
                                                Harga Per Satuan (Rp) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">Rp</span>
                                                <input
                                                    id="reference_price"
                                                    type="number"
                                                    min="0"
                                                    className={`${inputClass} pl-11`}
                                                    value={data.reference_price}
                                                    onChange={(e) => setData('reference_price', e.target.value)}
                                                    placeholder="850"
                                                    required
                                                />
                                            </div>
                                            <InputError message={errors.reference_price} className="mt-2" />
                                        </div>

                                        <div>
                                            <label className={labelClass} htmlFor="unit">Satuan</label>
                                            <select
                                                id="unit"
                                                className={inputClass}
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value as any)}
                                            >
                                                <option value="kg">kg</option>
                                                <option value="liter">liter</option>
                                                <option value="pcs">pcs</option>
                                                <option value="ton">ton</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass} htmlFor="stock">
                                                Total Stok Tersedia <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="stock"
                                                    type="number"
                                                    min="0"
                                                    className={`${inputClass} pr-12`}
                                                    value={data.stock}
                                                    onChange={(e) => setData('stock', e.target.value)}
                                                    placeholder="500"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">{data.unit}</span>
                                            </div>
                                            <InputError message={errors.stock} className="mt-2" />
                                        </div>

                                        <div>
                                            <label className={labelClass} htmlFor="minimum_order">Min. Order</label>
                                            <div className="relative">
                                                <input
                                                    id="minimum_order"
                                                    type="number"
                                                    min="1"
                                                    className={`${inputClass} pr-12`}
                                                    value={data.minimum_order}
                                                    onChange={(e) => setData('minimum_order', e.target.value)}
                                                    placeholder="100"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">{data.unit}</span>
                                            </div>
                                            <InputError message={errors.minimum_order} className="mt-2" />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClass} htmlFor="condition">Kesegaran / Masa Simpan</label>
                                            <input
                                                id="condition"
                                                type="text"
                                                className={inputClass}
                                                value={data.condition}
                                                onChange={(e) => setData('condition', e.target.value)}
                                                placeholder="Contoh: 2 hari setelah produksi, kadar air ≤85%"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className={labelClass} htmlFor="notes">Catatan Tambahan</label>
                                            <textarea
                                                id="notes"
                                                rows={3}
                                                className={inputClass}
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Contoh: tersedia sertifikat halal, bisa negosiasi harga untuk pembelian bulk..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Pratinjau */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="rounded-3xl bg-white shadow-sm border border-neutral-100/60 overflow-hidden">
                                        <div className="relative h-48 sm:h-64 bg-neutral-200">
                                            {imagePreviews[0] ? (
                                                <img src={imagePreviews[0]} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
                                                    <ImageIcon className="h-8 w-8" />
                                                    <span className="text-sm font-medium">Belum ada foto</span>
                                                </div>
                                            )}
                                            
                                            {/* Tags overlay */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <span className="bg-[#f0f7f1] text-[#2e5a36] px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                                    {categories.find(c => c.id.toString() === data.category_id)?.name || 'Vegetable Waste'}
                                                </span>
                                            </div>
                                            <div className="absolute top-4 right-4">
                                                <span className="bg-white text-neutral-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                                                    <Layers className="h-3 w-3 text-[#2e5a36]" /> Eco Score TBD
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 sm:p-8">
                                            <h2 className="text-2xl font-bold text-neutral-900 capitalize mb-2">{data.title || 'Nama Produk'}</h2>
                                            
                                            <div className="flex items-center gap-3 text-sm text-neutral-500 mb-6 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <div className="h-4 w-4 rounded-full bg-neutral-200 flex items-center justify-center"><Check className="h-2 w-2 text-white" /></div>
                                                    CV. Sari Murni
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {data.location || 'Kota'}, {data.province || 'Provinsi'}
                                                </span>
                                            </div>

                                            <div className="bg-[#f0f7f1] rounded-2xl p-6 mb-6">
                                                <div className="text-2xl font-bold text-[#2e5a36] mb-3">
                                                    Rp {data.reference_price ? Number(data.reference_price).toLocaleString('id-ID') : '0'}/{data.unit}
                                                </div>
                                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                                    <span className="text-neutral-500">Stok: <strong className="text-neutral-900">{data.stock || '0'} {data.unit}</strong></span>
                                                    <span className="text-neutral-500">Min. order: <strong className="text-neutral-900">{data.minimum_order || '0'} {data.unit}</strong></span>
                                                    <span className="text-neutral-500">Tersedia: <strong className="text-neutral-900">{data.availability}</strong></span>
                                                </div>
                                            </div>

                                            <p className="text-neutral-700 text-sm leading-relaxed mb-8">
                                                {data.description || 'Deskripsi belum diisi.'}
                                            </p>

                                            <div className="flex gap-4">
                                                <button type="button" disabled className="flex-1 bg-[#9dbca3] text-white py-3.5 rounded-full font-bold opacity-80 cursor-not-allowed">
                                                    Hubungi Supplier
                                                </button>
                                                <button type="button" disabled className="flex-1 border border-neutral-200 text-neutral-400 py-3.5 rounded-full font-bold cursor-not-allowed">
                                                    Negosiasi
                                                </button>
                                            </div>
                                            <p className="text-center text-xs text-neutral-400 mt-3 font-medium">Pratinjau — tombol tidak aktif</p>
                                        </div>
                                    </div>

                                    {/* Kelengkapan Listing Checklist */}
                                    <div className="rounded-3xl bg-white shadow-sm border border-neutral-100/60 p-6 sm:p-8">
                                        <h3 className="flex items-center gap-2 font-bold text-lg text-neutral-900 mb-6">
                                            <CheckCircle2 className="h-5 w-5 text-[#2e5a36]" /> Kelengkapan Listing
                                        </h3>
                                        <ul className="space-y-4">
                                            {[
                                                { label: 'Nama produk', value: data.title },
                                                { label: 'Kategori', value: data.category_id },
                                                { label: 'Deskripsi', value: data.description },
                                                { label: 'Foto produk', value: imagePreviews.length > 0 },
                                                { label: 'Harga', value: data.reference_price },
                                                { label: 'Stok tersedia', value: data.stock },
                                                { label: 'Lokasi', value: data.location },
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-5 w-5 rounded-full items-center justify-center ${item.value ? 'bg-[#2e5a36]' : 'bg-neutral-200'}`}>
                                                            {item.value ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-white" />}
                                                        </div>
                                                        <span className={`text-sm font-medium ${item.value ? 'text-neutral-700' : 'text-neutral-400'}`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    {!item.value && (
                                                        <span className="text-xs font-bold text-amber-500">Belum diisi</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Nav Buttons */}
                            <div className="flex justify-between items-center mt-4">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-neutral-600 hover:bg-white hover:text-neutral-900 shadow-sm transition-colors border border-neutral-200 bg-white"
                                    >
                                        <ArrowLeft className="h-4 w-4" /> {currentStep === 4 ? 'Edit' : 'Kembali'}
                                    </button>
                                ) : (
                                    <Link
                                        href="/seller/products"
                                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-neutral-600 hover:bg-white hover:text-neutral-900 shadow-sm transition-colors border border-neutral-200 bg-white"
                                    >
                                        Batal
                                    </Link>
                                )}

                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={currentStep === 2 && imagePreviews.length === 0}
                                        className="inline-flex items-center gap-2 bg-[#9dbca3] hover:bg-[#85a68b] disabled:opacity-50 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-colors shadow-md"
                                    >
                                        Lanjut: {steps[currentStep].name} <ArrowRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 bg-[#2e5a36] hover:bg-[#234529] disabled:bg-[#9dbca3] text-white px-10 py-4 rounded-full text-sm font-bold transition-all shadow-lg active:scale-[0.98]"
                                    >
                                        <Upload className="h-4 w-4" /> {processing ? 'Menyimpan...' : 'Publish Produk'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
