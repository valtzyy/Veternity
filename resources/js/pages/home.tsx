import { Head, Link } from '@inertiajs/react';
import { Leaf, ArrowRight, Users, ShoppingBag, ChevronRight } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description: string;
    icon: string;
    products_count: number;
    products_sum_stock: number | null;
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
    stock: number;
    unit: string;
    location: string;
    seller: { id: number; name: string; address: string | null };
    category: { id: number; name: string } | null;
    images: ProductImage[];
}

interface Stats {
    total_products: number;
    total_categories: number;
    total_stock: number;
    total_sellers: number;
}

interface Props {
    categories: Category[];
    latestProducts: Product[];
    stats: Stats;
}

export default function Home({ categories, latestProducts, stats }: Props) {
    
    // Redirect helper to redirect to login
    const redirectToLogin = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = route('login');
    };

    return (
        <div className="min-h-screen bg-[#f6faf6] font-sans text-gray-900 flex flex-col">
            <Head title="ReGuna — Platform Daur Ulang Limbah Pangan" />

            {/* ── NAVBAR ────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shrink-0">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5a36]">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-[#2e5a36]">ReGuna</span>
                    </Link>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('login')}
                            className="text-sm font-semibold text-gray-600 hover:text-[#2e5a36] px-4 py-2"
                        >
                            Masuk
                        </Link>
                        <Link
                            href={route('register')}
                            className="rounded-full bg-[#2e5a36] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98]"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── SCREEN 1: HERO (FULL SCREEN HEIGHT) ──────── */}
            <section className="min-h-[calc(100vh-73px)] bg-white flex flex-col justify-center items-center py-12 px-6 shadow-xs relative">
                <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-6">
                    <span className="bg-[#f0f7f1] text-[#2e5a36] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#2e5a36]/10">
                        Platform Daur Ulang Limbah Pangan
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black text-neutral-900 leading-tight tracking-tight max-w-3xl">
                        Ubah Limbah Pangan Menjadi <span className="text-[#2e5a36] block sm:inline">Bahan Baku Bernilai</span>
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-500 max-w-2xl leading-relaxed">
                        ReGuna menghubungkan industri makanan, pasar, dan hotel selaku pemasok limbah pangan organik dengan bisnis daur ulang kreatif, pakan ternak, dan pupuk organik.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                        <Link
                            href={route('register')}
                            className="bg-[#2e5a36] hover:bg-[#234529] text-white px-8 py-3.5 rounded-full text-xs font-bold transition-all shadow-md active:scale-[0.98]"
                        >
                            Daftar Gratis
                        </Link>
                        <a
                            href="#marketplace-section"
                            className="bg-[#f0f7f1] hover:bg-[#e6f4e9] text-[#2e5a36] px-8 py-3.5 rounded-full text-xs font-bold transition-all shadow-xs"
                        >
                            Lihat Produk
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 mt-6 pt-6 border-t border-neutral-100 w-full max-w-md">
                        <div className="flex items-center gap-2">
                            <Users className="h-4.5 w-4.5 text-[#2e5a36]" />
                            <span className="text-xs font-bold text-neutral-700">{stats.total_sellers}+ Bisnis Bergabung</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4.5 w-4.5 text-[#2e5a36]" />
                            <span className="text-xs font-bold text-neutral-700">{stats.total_products}+ Produk Aktif</span>
                        </div>
                    </div>
                </div>

                {/* Animated down-scroll indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-neutral-400">
                    <span className="text-[10px] font-bold tracking-widest uppercase">Scroll Kebawah</span>
                    <div className="w-1.5 h-1.5 bg-[#2e5a36] rounded-full animate-bounce" />
                </div>
            </section>

            {/* ── SCREEN 2: MARKETPLACE LISTING ────────────── */}
            <section id="marketplace-section" className="bg-[#f6faf6] min-h-screen w-full px-6 py-20 flex flex-col justify-center border-t border-neutral-100">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Marketplace ReGuna</h2>
                            <p className="text-xs sm:text-sm text-neutral-400 mt-1">Temukan berbagai limbah organik pilihan</p>
                        </div>
                        <button
                            onClick={redirectToLogin}
                            className="text-xs font-bold text-[#2e5a36] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {latestProducts.length === 0 ? (
                        <div className="bg-white rounded-3xl border border-neutral-100/60 p-12 text-center flex flex-col items-center justify-center gap-3 text-neutral-400">
                            <Leaf className="h-10 w-10 text-neutral-200" />
                            <p className="text-sm font-semibold">Belum ada produk terdaftar saat ini.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {latestProducts.map((prod) => {
                                const primaryImg = prod.images.find(img => img.is_primary)?.image_url || '/images/placeholder.jpg';
                                return (
                                    <div 
                                        key={prod.id} 
                                        onClick={redirectToLogin}
                                        className="group rounded-3xl bg-white border border-neutral-100/60 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition-all cursor-pointer"
                                    >
                                        {/* Image Overlay */}
                                        <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                                            <img 
                                                src={primaryImg} 
                                                alt={prod.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/90 backdrop-blur-xs text-[#2e5a36] px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs">
                                                    {prod.category?.name || 'Limbah'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                            <div>
                                                <h3 className="font-extrabold text-sm text-neutral-900 group-hover:text-[#2e5a36] transition-colors line-clamp-1 capitalize">
                                                    {prod.title}
                                                </h3>
                                                <p className="text-[10px] text-neutral-400 font-bold mt-1 block">
                                                    {prod.seller.name}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
                                                <span className="text-[#2e5a36] font-extrabold text-xs sm:text-sm">
                                                    Rp {Number(prod.reference_price).toLocaleString('id-ID')}/{prod.unit}
                                                </span>
                                                
                                                <span className="text-[10px] font-bold text-neutral-400 group-hover:text-[#2e5a36] transition-colors flex items-center gap-0.5">
                                                    Lihat Detail <ChevronRight className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────── */}
            <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center text-xs text-neutral-400 font-semibold shrink-0">
                <p>© {new Date().getFullYear()} ReGuna. Semua Hak Dilindungi.</p>
            </footer>
        </div>
    );
}
