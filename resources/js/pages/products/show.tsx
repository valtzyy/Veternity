import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Leaf, MapPin, BadgeCheck, ShieldCheck, Calendar, MessageSquare, CreditCard, ChevronRight, Phone, MessageCircle, Layers, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

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
    stock: number;
    unit: string;
    location: string;
    condition: string;
    seller: { id: number; name: string; is_verified: boolean; address: string | null; profile_photo?: string };
    category: { id: number; name: string } | null;
    images: ProductImage[];
    knowledge?: {
        province?: string;
        availability?: string;
        custom_condition?: string;
        notes?: string;
    };
}

interface Props {
    product: Product;
    relatedProducts: Product[];
}

export default function Show({ product, relatedProducts }: Props) {
    const { auth } = usePage().props as any;
    const currentUser = auth?.user;

    const images = product.images.length > 0 
        ? product.images 
        : [{ id: 1, image_url: '/images/placeholder.jpg', is_primary: true }];

    const [activeImage, setActiveImage] = useState<string>(
        images.find(img => img.is_primary)?.image_url || images[0].image_url
    );

    const getEcoScore = (id: number) => {
        const scores = [94, 88, 97, 91, 85, 92, 89, 96];
        return scores[id % scores.length];
    };

    const simulatedEco = getEcoScore(product.id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Marketplace', href: '/marketplace' },
        { title: product.title, href: `/products/${product.id}` },
    ];

    const handleNegotiate = () => {
        if (!currentUser) {
            router.get(route('login'));
            return;
        }

        if (currentUser.role !== 'buyer') {
            alert('Hanya akun Pembeli (buyer) yang dapat memulai negosiasi.');
            return;
        }

        if (currentUser.id === product.seller.id) {
            alert('Anda tidak bisa melakukan negosiasi pada produk Anda sendiri.');
            return;
        }

        router.post(route('negotiations.store'), {
            product_id: product.id,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${product.title} - ReGuna`} />

            <div className="flex flex-col min-h-screen bg-[#f6faf6] p-6 gap-6">
                {/* Upper Breadcrumbs details section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 capitalize">{product.title}</h1>
                        <p className="text-sm text-neutral-500 mt-1">Detail produk limbah pangan terpilih</p>
                    </div>
                    <Link
                        href={route('marketplace')}
                        className="inline-flex items-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-neutral-50"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Marketplace
                    </Link>
                </div>

                {/* Primary grid details */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left: Images */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-100 shadow-sm bg-neutral-100">
                            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
                            
                            {/* Badges overlay */}
                            <div className="absolute top-4 left-4">
                                <span className="bg-[#f0f7f1] text-[#2e5a36] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                    {product.category?.name || 'Food Grade'}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className="bg-white text-neutral-700 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                                    <Leaf className="h-3.5 w-3.5 text-[#2e5a36]" /> Eco Score {simulatedEco}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4">
                                {images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(img.image_url)}
                                        className={`w-20 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                                            activeImage === img.image_url 
                                            ? 'border-[#2e5a36] ring-2 ring-[#2e5a36]/20' 
                                            : 'border-transparent hover:border-neutral-300'
                                        }`}
                                    >
                                        <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Primary Info */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Harga Penawaran</span>
                                <span className="bg-[#e6f4e9] text-[#2e5a36] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                    Aktif
                                </span>
                            </div>
                            <div className="text-3xl font-extrabold text-[#2e5a36] mb-6">
                                Rp {Number(product.reference_price).toLocaleString('id-ID')}/{product.unit}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 border-b border-neutral-100 pb-6 mb-6">
                                <div>
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Min. Order</span>
                                    <span className="text-base font-extrabold text-[#2e5a36]">{product.minimum_order} {product.unit}</span>
                                </div>
                                <div className="border-l border-neutral-100 pl-4">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Tersedia</span>
                                    <span className="text-base font-extrabold text-[#2e5a36]">{product.stock} {product.unit}</span>
                                </div>
                                <div className="border-l border-neutral-100 pl-4">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Total Nego</span>
                                    <span className="text-base font-extrabold text-neutral-500">Rp {(product.minimum_order * Number(product.reference_price)).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <button className="flex-1 bg-[#2e5a36] hover:bg-[#234529] text-white py-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer">
                                    <CreditCard className="h-5 w-5" /> Bayar Sekarang
                                </button>
                                <button 
                                    onClick={handleNegotiate}
                                    className="flex-1 border border-neutral-200 bg-white hover:bg-neutral-50 text-[#2e5a36] py-4 rounded-2xl font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <MessageSquare className="h-5 w-5" /> Negosiasi
                                </button>
                            </div>

                            {/* Badges */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-[#f6faf6] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5">
                                    <ShieldCheck className="h-5 w-5 text-[#2e5a36]" />
                                    <span className="text-[10px] font-bold text-neutral-600 leading-tight">Pembayaran Aman</span>
                                </div>
                                <div className="bg-[#f6faf6] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5">
                                    <Calendar className="h-5 w-5 text-[#2e5a36]" />
                                    <span className="text-[10px] font-bold text-neutral-600 leading-tight">Jadwal Pickup</span>
                                </div>
                                <div className="bg-[#f6faf6] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5">
                                    <BadgeCheck className="h-5 w-5 text-[#2e5a36]" />
                                    <span className="text-[10px] font-bold text-neutral-600 leading-tight">Supplier Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Specs Table */}
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6">
                            <div className="divide-y divide-neutral-100 text-sm font-semibold">
                                <div className="flex justify-between py-3">
                                    <span className="text-neutral-400">Kategori</span>
                                    <span className="text-neutral-900">{product.category?.name || 'Ampas Tahu'}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-neutral-400">Kondisi</span>
                                    <span className="text-neutral-900">{product.knowledge?.custom_condition || 'Segar'}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-neutral-400">Kadar Air</span>
                                    <span className="text-neutral-900">-</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-neutral-400">Ketersediaan</span>
                                    <span className="text-neutral-900">{product.knowledge?.availability || 'Harian'}</span>
                                </div>
                                <div className="flex justify-between py-3">
                                    <span className="text-neutral-400">Lokasi</span>
                                    <span className="text-neutral-900">{product.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Description & Supplier Location */}
                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left: Description & Location */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Description */}
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4">Deskripsi Produk</h2>
                            <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>

                        {/* Location details */}
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[#2e5a36]" /> Lokasi Supplier
                            </h2>
                            <div className="bg-[#f6faf6] border border-neutral-100 rounded-2xl p-6 flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-[#e6f4e9] text-[#2e5a36] flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-neutral-955 text-sm">Alamat Penjemputan</p>
                                    <p className="text-xs text-neutral-500 font-semibold mt-1">
                                        {product.seller.address || 'Jl. Industri Kecil No. 12, Bogor Tengah, Bogor, Jawa Barat 16111'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Seller Profile Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full overflow-hidden bg-neutral-200 border-2 border-[#e6f4e9] shadow-sm mb-4">
                                    {product.seller.profile_photo ? (
                                        <img src={product.seller.profile_photo} alt={product.seller.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#e6f4e9] text-[#2e5a36] font-extrabold text-2xl uppercase">
                                            {product.seller.name.substring(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-extrabold text-lg text-neutral-955 mb-1 flex items-center gap-1.5 justify-center">
                                    {product.seller.name}
                                </h3>
                                <span className="text-xs font-bold text-[#2e5a36] flex items-center gap-1 mb-6">
                                    <BadgeCheck className="h-3.5 w-3.5 text-[#2e5a36]" /> Supplier Terverifikasi
                                </span>

                                {/* Seller stats */}
                                <div className="grid grid-cols-3 gap-2 w-full border-b border-t border-neutral-100 py-4 mb-6">
                                    <div>
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Rating</span>
                                        <span className="text-sm font-extrabold text-neutral-900">4.9</span>
                                    </div>
                                    <div className="border-l border-neutral-100">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Transaksi</span>
                                        <span className="text-sm font-extrabold text-neutral-900">156</span>
                                    </div>
                                    <div className="border-l border-neutral-100">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Bergabung</span>
                                        <span className="text-sm font-extrabold text-neutral-900">2021</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full">
                                    <button className="w-full bg-[#2e5a36] hover:bg-[#234529] text-white py-3.5 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2">
                                        <MessageCircle className="h-5 w-5" /> Chat
                                    </button>
                                    <button className="w-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                                        <Phone className="h-5 w-5" /> Telepon
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Similar Products */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-neutral-100 pt-8">
                        <h2 className="text-xl font-extrabold text-neutral-900 mb-6">Produk Serupa</h2>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {relatedProducts.map((prod) => {
                                const primaryImg = prod.images.find(img => img.is_primary)?.image_url || '/images/placeholder.jpg';
                                return (
                                    <div key={prod.id} className="rounded-3xl bg-white border border-neutral-100/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                                        <div className="relative aspect-video bg-neutral-100">
                                            {prod.images.length > 0 ? (
                                                <img src={primaryImg} alt={prod.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-[#f0f7f1]/50">
                                                    <Leaf className="h-8 w-8 text-[#2e5a36]/30" />
                                                    <span className="text-xs">No Photo</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-extrabold text-sm text-neutral-900 line-clamp-1 mb-1 capitalize">{prod.title}</h3>
                                            <span className="text-xs text-neutral-400 font-bold mb-4">{prod.seller.name}</span>
                                            
                                            <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between">
                                                <span className="text-[#2e5a36] font-extrabold text-sm">
                                                    Rp {Number(prod.reference_price).toLocaleString('id-ID')}/{prod.unit}
                                                </span>
                                                <Link
                                                    href={route('products.show', prod.id)}
                                                    className="text-neutral-500 hover:text-[#2e5a36] font-bold text-xs flex items-center gap-0.5"
                                                >
                                                    Detail <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
