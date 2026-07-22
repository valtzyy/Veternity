import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    BarChart2,
    Coffee,
    Droplet,
    Egg,
    Leaf,
    MapPin,
    Package,
    Recycle,
    ShoppingBag,
    Star,
    TrendingUp,
    Upload,
    Users,
    Utensils,
    Vegan,
    Zap,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
interface Category {
    id: number;
    name: string;
    description: string;
    icon: string;
    products_count: number;
    products_sum_stock: number | null;
}

interface Product {
    id: number;
    title: string;
    reference_price: string;
    stock: number;
    unit: string;
    location: string;
    condition: string;
    seller: { id: number; name: string; address: string | null };
    category: { id: number; name: string } | null;
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

/* ─── Icon map for category icons ───────────────────────── */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    coffee: <Coffee className="h-7 w-7" />,
    'apple-slice': <Vegan className="h-7 w-7" />,
    droplet: <Droplet className="h-7 w-7" />,
    carrot: <Utensils className="h-7 w-7" />,
    egg: <Egg className="h-7 w-7" />,
    'trash-2': <Recycle className="h-7 w-7" />,
};

const CATEGORY_COLORS = [
    'bg-amber-50 text-amber-700',
    'bg-green-50 text-green-700',
    'bg-yellow-50 text-yellow-700',
    'bg-emerald-50 text-emerald-700',
    'bg-orange-50 text-orange-700',
    'bg-teal-50 text-teal-700',
];

/* ─── Condition badge ────────────────────────────────────── */
function ConditionBadge({ condition }: { condition: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        fresh: { label: 'Segar', cls: 'bg-green-100 text-green-700' },
        usable: { label: 'Layak Pakai', cls: 'bg-blue-100 text-blue-700' },
        processed: { label: 'Terproses', cls: 'bg-purple-100 text-purple-700' },
    };
    const badge = map[condition] ?? { label: condition, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}>
            {badge.label}
        </span>
    );
}

/* ─── Format price ───────────────────────────────────────── */
function formatPrice(price: string | number) {
    return 'Rp ' + Number(price).toLocaleString('id-ID');
}

/* ─── Floating product cards for hero ───────────────────── */
function HeroOrbit({ categories }: { categories: Category[] }) {
    const shown = categories.slice(0, 4);
    const positions = [
        'top-[8%] right-[10%]',
        'top-[28%] left-[2%]',
        'bottom-[28%] left-[6%]',
        'bottom-[12%] right-[6%]',
    ];

    return (
        <div className="relative mx-auto h-[480px] w-full max-w-xl">
            {/* Orbit circles */}
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#2e5a36]/20" />
            <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#2e5a36]/15" />

            {/* Center logo */}
            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#2e5a36] shadow-xl">
                <Leaf className="h-10 w-10 text-white" />
                <span className="mt-0.5 text-[10px] font-bold text-white/80">ReGuna</span>
            </div>

            {/* CO₂ badge */}
            <div className="absolute bottom-[22%] right-[22%] z-10 flex items-center gap-1.5 rounded-full bg-[#2e5a36] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <Leaf className="h-3.5 w-3.5" /> -{(stats_placeholder.total_stock / 1000).toFixed(1)}t CO₂
            </div>

            {/* Category cards */}
            {shown.map((cat, i) => (
                <div
                    key={cat.id}
                    className={`absolute ${positions[i]} z-10 flex w-44 flex-col gap-1.5 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-xl`}
                >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}>
                        {CATEGORY_ICONS[cat.icon] ?? <Package className="h-5 w-5" />}
                    </div>
                    <p className="text-sm font-bold leading-tight text-gray-800 line-clamp-1">{cat.name}</p>
                    <p className="text-[11px] text-gray-500">
                        {cat.products_sum_stock ? `${cat.products_sum_stock} ${cat.products_sum_stock > 1000 ? 'kg' : 'kg'} tersedia` : 'Stok beragam'}
                    </p>
                    <span className="w-fit rounded-full bg-[#f0f7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e5a36]">
                        {cat.products_count} Produk
                    </span>
                </div>
            ))}
        </div>
    );
}

// Placeholder for inline use inside component
const stats_placeholder = { total_stock: 0 };

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function Home({ categories, latestProducts, stats }: Props) {
    // Override placeholder
    stats_placeholder.total_stock = stats.total_stock;

    const statCards = [
        { icon: Recycle, value: `${(stats.total_stock / 1000).toFixed(1)}t`, label: 'Stok Tersedia' },
        { icon: Users, value: `${stats.total_sellers}+`, label: 'Bisnis Bergabung' },
        { icon: TrendingUp, value: `${stats.total_products}+`, label: 'Produk Aktif' },
        { icon: Leaf, value: `${stats.total_categories}`, label: 'Kategori Produk' },
    ];

    const howItWorks = [
        {
            icon: Upload,
            step: '01',
            title: 'Supplier Upload Produk',
            desc: 'Supplier mendaftarkan limbah pangan mereka lengkap dengan foto, kuantitas, lokasi, dan harga yang kompetitif.',
        },
        {
            icon: ShoppingBag,
            step: '02',
            title: 'Buyer Temukan Material',
            desc: 'Bisnis mencari bahan baku organik yang dibutuhkan menggunakan filter kategori, lokasi, dan kuantitas.',
        },
        {
            icon: BadgeCheck,
            step: '03',
            title: 'Negosiasi & Transaksi',
            desc: 'Negosiasi harga langsung di platform, lakukan pembayaran aman, dan atur pengiriman dengan mudah.',
        },
    ];

    const benefits = [
        { icon: Zap, title: 'Efisiensi Biaya', desc: 'Dapatkan bahan baku organik berkualitas dengan harga jauh lebih hemat.' },
        { icon: BadgeCheck, title: 'Terverifikasi', desc: 'Semua supplier terverifikasi untuk menjamin kualitas dan keamanan transaksi.' },
        { icon: BarChart2, title: 'Analitik Real-time', desc: 'Pantau performa bisnis Anda lewat dashboard analitik komprehensif.' },
        { icon: Leaf, title: 'Dampak Lingkungan', desc: 'Setiap transaksi berkontribusi langsung mengurangi limbah dan emisi CO₂.' },
    ];

    return (
        <div className="min-h-screen bg-[#f6faf6] font-sans text-gray-900">
            <Head title="ReGuna — Platform Daur Ulang Limbah Pangan" />

            {/* ── NAVBAR ────────────────────────────────────── */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href={route('home')} className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2e5a36]">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-[#2e5a36]">ReGuna</span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden items-center gap-8 md:flex">
                        {[
                            { label: 'Beranda', href: route('home'), active: true },
                            { label: 'Marketplace', href: '#marketplace' },
                            { label: 'Cara Kerja', href: '#how-it-works' },
                            { label: 'Tentang', href: '#about' },
                        ].map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`text-sm font-medium transition hover:text-[#2e5a36] ${
                                    item.active ? 'rounded-full bg-[#f0f7f1] px-4 py-1.5 text-[#2e5a36]' : 'text-gray-600'
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('login')}
                            className="hidden text-sm font-semibold text-gray-600 hover:text-[#2e5a36] md:block"
                        >
                            Masuk
                        </Link>
                        <Link
                            href={route('register')}
                            className="rounded-xl bg-[#2e5a36] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98]"
                        >
                            Daftar Gratis
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── HERO ──────────────────────────────────────── */}
            <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                {/* Left */}
                <div className="flex flex-col gap-7">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#2e5a36]">
                            Platform #1 Daur Ulang Limbah Pangan
                        </span>
                    </div>

                    <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 xl:text-6xl">
                        Transform Food <br />Waste Into <br />
                        <span className="text-[#2e5a36]">Economic Value</span>
                    </h1>

                    <p className="max-w-md text-base leading-relaxed text-gray-600">
                        Hubungkan supplier limbah pangan dengan bisnis yang membutuhkan bahan baku berkelanjutan. Efisien,
                        transparan, dan berdampak nyata.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="#marketplace"
                            className="flex items-center gap-2 rounded-xl bg-[#2e5a36] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#234529] active:scale-[0.98]"
                        >
                            Jelajahi Marketplace <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route('register')}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
                        >
                            <Upload className="h-4 w-4" /> Jadi Supplier
                        </Link>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {['🧑', '👩', '👨'].map((e, i) => (
                                <div
                                    key={i}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#e8f5e9] text-base shadow-sm"
                                >
                                    {e}
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">Dipercaya {stats.total_sellers}+ bisnis di Indonesia</span>
                        </div>
                    </div>
                </div>

                {/* Right — orbit */}
                <div className="hidden lg:block">
                    <div className="relative mx-auto h-[480px] w-full max-w-xl">
                        {/* Outer glow bg */}
                        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-100/60 blur-3xl" />

                        {/* Orbit circles */}
                        <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#2e5a36]/20" />
                        <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#2e5a36]/15" />

                        {/* Center logo */}
                        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#2e5a36] shadow-xl">
                            <Leaf className="h-10 w-10 text-white" />
                            <span className="mt-0.5 text-[10px] font-bold text-white/80">ReGuna</span>
                        </div>

                        {/* CO₂ badge */}
                        <div className="absolute bottom-[28%] right-[18%] z-10 flex items-center gap-1.5 rounded-full bg-[#2e5a36] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                            <Leaf className="h-3.5 w-3.5" /> -{(stats.total_stock / 1000).toFixed(1)}t CO₂
                        </div>

                        {/* Category cards floating */}
                        {categories.slice(0, 4).map((cat, i) => {
                            const positions = [
                                'top-[5%] right-[5%]',
                                'top-[35%] left-[0%]',
                                'bottom-[30%] left-[3%]',
                                'bottom-[8%] right-[3%]',
                            ];
                            return (
                                <div
                                    key={cat.id}
                                    className={`absolute ${positions[i]} z-10 flex w-40 flex-col gap-1.5 rounded-2xl bg-white p-3.5 shadow-lg ring-1 ring-black/5`}
                                >
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                                    >
                                        <span className="text-base">{cat.icon === 'coffee' ? '☕' : cat.icon === 'apple-slice' ? '🍌' : cat.icon === 'droplet' ? '🛢️' : cat.icon === 'carrot' ? '🥕' : cat.icon === 'egg' ? '🥚' : '♻️'}</span>
                                    </div>
                                    <p className="text-xs font-bold leading-tight text-gray-800 line-clamp-2">{cat.name}</p>
                                    <span className="w-fit rounded-full bg-[#f0f7f1] px-2 py-0.5 text-[10px] font-semibold text-[#2e5a36]">
                                        {cat.products_count} Produk
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── STATS ─────────────────────────────────────── */}
            <section className="border-y border-gray-100 bg-white py-16">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
                    {statCards.map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-[#f6faf6] p-6 transition hover:shadow-md">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2e5a36]">
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                            <p className="text-sm text-gray-500">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CATEGORIES ───────────────────────────────── */}
            <section id="marketplace" className="py-20">
                <div className="mx-auto max-w-7xl px-6">
                    {/* Header */}
                    <div className="mb-12 flex flex-col items-center gap-3 text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#2e5a36]">Kategori Produk</span>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Temukan Bahan Baku Organik</h2>
                        <p className="max-w-md text-sm leading-relaxed text-gray-500">
                            Berbagai jenis limbah pangan berkualitas dari supplier terverifikasi di seluruh Indonesia.
                        </p>
                    </div>

                    {/* Category grid */}
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
                        {categories.map((cat, i) => {
                            const emojiMap: Record<string, string> = {
                                coffee: '☕',
                                'apple-slice': '🍌',
                                droplet: '🛢️',
                                carrot: '🥕',
                                egg: '🥚',
                                'trash-2': '♻️',
                            };
                            return (
                                <a
                                    key={cat.id}
                                    href="#"
                                    className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#2e5a36]/30 hover:shadow-lg"
                                >
                                    <div className="text-4xl">{emojiMap[cat.icon] ?? '📦'}</div>
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-[#2e5a36]">{cat.name}</p>
                                        <p className="mt-0.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
                                            {cat.products_sum_stock
                                                ? `${cat.products_sum_stock.toLocaleString('id-ID')} kg stok tersedia`
                                                : 'Stok beragam'}
                                        </p>
                                    </div>
                                    <span className={`w-fit text-xs font-bold ${cat.products_count >= 5 ? 'text-[#2e5a36]' : 'text-gray-500'}`}>
                                        {cat.products_count} Produk
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── LATEST PRODUCTS ──────────────────────────── */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-10 flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#2e5a36]">Produk Unggulan</span>
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Penawaran Terbaru</h2>
                        </div>
                        <Link
                            href="#"
                            className="flex items-center gap-1 text-sm font-semibold text-[#2e5a36] hover:underline"
                        >
                            Lihat Semua <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {latestProducts.slice(0, 8).map((product) => (
                            <div
                                key={product.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                {/* Image placeholder */}
                                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7f1] to-green-50">
                                    <div className="text-6xl">
                                        {product.category?.name?.includes('Minyak') ? '🛢️' :
                                         product.category?.name?.includes('Kulit') || product.category?.name?.includes('Buah') ? '🍌' :
                                         product.category?.name?.includes('Sayur') ? '🥕' :
                                         product.category?.name?.includes('Cangkang') ? '🥚' :
                                         product.category?.name?.includes('Organik') ? '♻️' : '☕'}
                                    </div>
                                    {/* Badges */}
                                    <div className="absolute left-3 top-3 flex gap-2">
                                        <ConditionBadge condition={product.condition} />
                                    </div>
                                    {product.category && (
                                        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-600 shadow-sm">
                                            {product.category.name}
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="flex flex-1 flex-col gap-3 p-5">
                                    <div>
                                        <h3 className="font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-[#2e5a36]">
                                            {product.title}
                                        </h3>
                                        <div className="mt-1.5 flex flex-col gap-1">
                                            <p className="flex items-center gap-1 text-xs text-gray-500">
                                                <span className="font-medium text-gray-700">{product.seller.name}</span>
                                            </p>
                                            <p className="flex items-center gap-1 text-xs text-gray-400">
                                                <MapPin className="h-3 w-3" /> {product.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-col gap-3">
                                        <div>
                                            <p className="text-lg font-extrabold text-gray-900">
                                                {formatPrice(product.reference_price)}
                                                <span className="text-sm font-normal text-gray-400">/{product.unit}</span>
                                            </p>
                                            <p className="flex items-center gap-1 text-xs text-gray-500">
                                                <Package className="h-3 w-3" />
                                                {product.stock.toLocaleString('id-ID')} {product.unit} tersedia
                                            </p>
                                        </div>
                                        <button className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#2e5a36] hover:bg-[#f0f7f1] hover:text-[#2e5a36]">
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────── */}
            <section id="how-it-works" className="bg-[#2e5a36] py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-14 flex flex-col items-center gap-3 text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-green-300">Cara Kerja</span>
                        <h2 className="text-4xl font-extrabold tracking-tight text-white">Mudah, Transparan, Terpercaya</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {howItWorks.map(({ icon: Icon, step, title, desc }) => (
                            <div
                                key={step}
                                className="relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-white/10 p-8 backdrop-blur-sm transition hover:bg-white/15"
                            >
                                <span className="absolute right-5 top-5 text-6xl font-extrabold text-white/10 select-none">
                                    {step}
                                </span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="mb-2 font-bold text-white">{title}</h3>
                                    <p className="text-sm leading-relaxed text-green-100/80">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ─────────────────────────────────── */}
            <section id="about" className="py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-14 flex flex-col items-center gap-3 text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#2e5a36]">Manfaat</span>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Mengapa Memilih ReGuna?</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map(({ icon: Icon, title, desc }) => (
                            <div
                                key={title}
                                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-7 transition hover:shadow-lg"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f7f1]">
                                    <Icon className="h-6 w-6 text-[#2e5a36]" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-bold text-gray-900">{title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────── */}
            <section className="bg-[#f0f7f1] py-20">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900">
                        Siap Bergabung? <br />
                        <span className="text-[#2e5a36]">Mulai Gratis Sekarang</span>
                    </h2>
                    <p className="mb-8 text-base leading-relaxed text-gray-500">
                        Daftarkan bisnis Anda dan mulai bertransaksi dalam hitungan menit. Tanpa biaya setup.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href={route('register')}
                            className="flex items-center gap-2 rounded-xl bg-[#2e5a36] px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#234529] active:scale-[0.98]"
                        >
                            Daftar Gratis <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route('login')}
                            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                            Masuk ke Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ───────────────────────────────────── */}
            <footer className="bg-[#1a3a20] py-12 text-white">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                                <Leaf className="h-5 w-5 text-green-300" />
                            </div>
                            <span className="text-xl font-extrabold">ReGuna</span>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed text-green-200/70">
                            Platform #1 daur ulang limbah pangan Indonesia. Menghubungkan supplier dengan bisnis yang berkelanjutan.
                        </p>
                        <p className="text-xs text-green-200/40">&copy; {new Date().getFullYear()} ReGuna Marketplace. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
