import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Leaf, MapPin, BadgeCheck, ShieldCheck, Calendar, MessageSquare, CreditCard, ChevronRight, Phone, MessageCircle, Star, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useInitials } from '@/hooks/use-initials';

interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
}

interface Rating {
    id: number;
    rating: number;
    review: string;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
    buyer: {
        id: number;
        name: string;
        profile_photo: string | null;
        avatar: string | null;
    };
}

interface Product {
    id: number;
    title: string;
    description: string;
    reference_price: string;
    minimum_order: number;
    stock: number;
    unit: string;
    location: string;
    condition: string;
    seller: { 
        id: number; 
        name: string; 
        is_verified: boolean; 
        address: string | null; 
        profile_photo?: string;
        average_rating?: string | number;
        total_reviews?: number;
    };
    category: { id: number; name: string } | null;
    images: ProductImage[];
    ratings?: Rating[];
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
    isFavorited: boolean;
}

export default function Show({ product, relatedProducts, isFavorited }: Props) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number; name: string; role: string } | null } };
    const currentUser = auth?.user;
    const getInitials = useInitials();

    const ratings = product.ratings || [];
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0 
        ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings).toFixed(1)
        : '0.0';

    // Count star distribution
    const starCounts = [0, 0, 0, 0, 0]; // index 0 for 1 star, 4 for 5 stars
    ratings.forEach(r => {
        const starIdx = Math.min(5, Math.max(1, r.rating)) - 1;
        starCounts[starIdx]++;
    });

    const renderStars = (count: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={`h-4.5 w-4.5 ${s <= count ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                    />
                ))}
            </div>
        );
    };

    const images = product.images.length > 0 
        ? product.images 
        : [{ id: 1, image_url: '/images/placeholder.jpg', is_primary: true }];

    const [activeImage, setActiveImage] = useState<string>(
        images.find(img => img.is_primary)?.image_url || images[0].image_url
    );

    const handleToggleFavorite = () => {
        router.post(route('products.favorite', product.id), {}, {
            preserveScroll: true,
        });
    };

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
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 capitalize">{product.title}</h1>
                            {currentUser && currentUser.role === 'buyer' && (
                                <button 
                                    onClick={handleToggleFavorite}
                                    className="h-8 w-8 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                                    title={isFavorited ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                                >
                                    <Star className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                                </button>
                            )}
                        </div>
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

                        {/* Reviews Section */}
                        <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-neutral-900 mb-6">Ulasan Pembeli ({totalRatings})</h2>
                            
                            {totalRatings === 0 ? (
                                <div className="text-center py-10 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                                    <Star className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-500 font-semibold">Belum ada ulasan untuk produk ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Stats header block */}
                                    <div className="flex flex-col md:flex-row items-center gap-6 bg-[#f6faf6]/50 border border-neutral-100 rounded-2xl p-6">
                                        <div className="text-center md:border-r md:border-neutral-100 md:pr-8 flex-shrink-0">
                                            <div className="text-4xl font-black text-neutral-900">{avgRating}</div>
                                            <div className="flex justify-center my-1.5">{renderStars(Math.round(Number(avgRating)))}</div>
                                            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Rata-rata Rating</div>
                                        </div>
                                        
                                        {/* Progress bars */}
                                        <div className="flex-1 w-full space-y-2">
                                            {[5, 4, 3, 2, 1].map((star) => {
                                                const count = starCounts[star - 1];
                                                const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-3 text-xs font-semibold">
                                                        <span className="w-3 text-neutral-500">{star}</span>
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                                                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="w-8 text-right text-neutral-400">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Reviews List */}
                                    <div className="divide-y divide-neutral-100 pt-2">
                                        {ratings.map((rating) => {
                                            const buyerAvatar = rating.buyer.profile_photo || rating.buyer.avatar;
                                            return (
                                                <div key={rating.id} className="py-6 first:pt-0 last:pb-0">
                                                    <div className="flex items-start gap-4">
                                                        {/* Avatar */}
                                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                                                            {buyerAvatar ? (
                                                                <img src={buyerAvatar} alt={rating.buyer.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-[#e6f4e9] text-[#2e5a36] font-bold text-sm uppercase">
                                                                    {getInitials(rating.buyer.name)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Details */}
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-bold text-neutral-900 text-sm">{rating.buyer.name}</p>
                                                                <span className="text-[10px] font-bold text-neutral-400 uppercase">
                                                                    {new Date(rating.created_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="mb-2">{renderStars(rating.rating)}</div>
                                                            <p className="text-neutral-700 text-sm whitespace-pre-line leading-relaxed">
                                                                {rating.review}
                                                            </p>
                                                            
                                                            {/* Seller Reply */}
                                                            {rating.seller_reply && (
                                                                <div className="mt-4 bg-[#f6faf6] border-l-4 border-[#2e5a36] rounded-r-2xl p-4 space-y-1">
                                                                    <div className="flex items-center justify-between text-xs font-bold">
                                                                        <span className="text-[#2e5a36]">Balasan Penjual</span>
                                                                        {rating.seller_replied_at && (
                                                                            <span className="text-neutral-400 font-medium">
                                                                                {new Date(rating.seller_replied_at).toLocaleDateString('id-ID', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    year: 'numeric',
                                                                                })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-neutral-700 text-xs leading-relaxed whitespace-pre-line">
                                                                        {rating.seller_reply}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
                                        <span className="text-sm font-extrabold text-neutral-900">
                                            {product.seller.average_rating ? Number(product.seller.average_rating).toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                    <div className="border-l border-neutral-100">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Ulasan</span>
                                        <span className="text-sm font-extrabold text-neutral-900">{product.seller.total_reviews || 0}</span>
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
