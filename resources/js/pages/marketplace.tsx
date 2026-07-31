import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Leaf, Search, SlidersHorizontal, MapPin, BadgeCheck, ChevronRight, Layers } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marketplace', href: '/marketplace' },
];

interface Product {
    id: number;
    title: string;
    description: string;
    reference_price: string;
    stock: number;
    unit: string;
    location: string;
    condition: string;
    seller: { id: number; name: string; is_verified: boolean; address: string | null };
    category: { id: number; name: string } | null;
    images: { id: number; image_url: string; is_primary: boolean }[];
    knowledge?: {
        province?: string;
        availability?: string;
        custom_condition?: string;
        notes?: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    products: {
        data: Product[];
        total: number;
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        verified_only?: boolean;
    };
}

export default function Marketplace({ products, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState<string>(filters.category_id || '');
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(filters.verified_only || false);
    const [ecoScore, setEcoScore] = useState<number>(Number(filters.eco_score) || 0);
    const [sortBy, setSortBy] = useState<string>(filters.sort_by || 'Terbaru');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search, category_id: selectedCategory, verified_only: verifiedOnly, eco_score: ecoScore, sort_by: sortBy });
    };

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id);
        applyFilters({ search, category_id: id, verified_only: verifiedOnly, eco_score: ecoScore, sort_by: sortBy });
    };

    const handleVerifiedToggle = (checked: boolean) => {
        setVerifiedOnly(checked);
        applyFilters({ search, category_id: selectedCategory, verified_only: checked, eco_score: ecoScore, sort_by: sortBy });
    };

    const handleEcoScoreChange = (val: number) => {
        setEcoScore(val);
    };

    const handleEcoScoreRelease = (val: number) => {
        applyFilters({ search, category_id: selectedCategory, verified_only: verifiedOnly, eco_score: val, sort_by: sortBy });
    };

    const handleSortChange = (val: string) => {
        setSortBy(val);
        applyFilters({ search, category_id: selectedCategory, verified_only: verifiedOnly, eco_score: ecoScore, sort_by: val });
    };

    const applyFilters = (newFilters: any) => {
        const cleanFilters: any = {};
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key] !== '' && newFilters[key] !== null && newFilters[key] !== undefined && newFilters[key] !== false && newFilters[key] !== 0) {
                cleanFilters[key] = newFilters[key];
            }
        });

        router.get(route('marketplace'), cleanFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const getCategoryTag = (catName: string) => {
        const name = catName.toLowerCase();
        if (name.includes('tahu') || name.includes('susu') || name.includes('grade')) return 'Food Grade';
        if (name.includes('kopi') || name.includes('premium')) return 'Premium';
        if (name.includes('jagung') || name.includes('kelapa') || name.includes('organik')) return 'Organic';
        return 'Bulk';
    };

    const getEcoScore = (id: number) => {
        const scores = [94, 88, 97, 91, 85, 92, 89, 96];
        return scores[id % scores.length];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marketplace — ReGuna" />

            <div className="flex flex-col min-h-screen bg-[#f6faf6] p-6 gap-6">
                {/* Header Content */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-[#2e5a36] font-bold tracking-tight text-2xl">Marketplace</h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            {products.total} produk tersedia dari supplier terverifikasi
                        </p>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk limbah pangan..."
                                className="w-full rounded-2xl border-transparent bg-white px-4 py-3 pl-11 text-sm text-neutral-900 focus:border-[#2e5a36] focus:ring-2 focus:ring-[#2e5a36]/20 transition-all outline-none placeholder-neutral-400 font-medium shadow-xs"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        </div>
                    </form>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Left Sidebar Filter */}
                    <div className="lg:col-span-1">
                        <div className="rounded-3xl bg-white border border-neutral-100/60 p-6 shadow-sm">
                            <div className="flex items-center gap-2 font-extrabold text-neutral-900 text-xs tracking-wider uppercase mb-6">
                                <SlidersHorizontal className="h-4 w-4 text-[#2e5a36]" /> Filter
                            </div>

                            {/* Categories Filter */}
                            <div className="mb-6">
                                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Kategori</h4>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategorySelect('')}
                                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            selectedCategory === '' 
                                            ? 'bg-[#f0f7f1] text-[#2e5a36]' 
                                            : 'text-neutral-600 hover:bg-neutral-50'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat.id.toString())}
                                            className={`w-full text-left px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                selectedCategory === cat.id.toString() 
                                                ? 'bg-[#f0f7f1] text-[#2e5a36]' 
                                                : 'text-neutral-600 hover:bg-neutral-50'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Supplier Filter */}
                            <div className="mb-6 border-t border-neutral-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Supplier</h4>
                                        <span className="text-xs text-neutral-500 font-semibold mt-1 block">Terverifikasi</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={verifiedOnly}
                                            onChange={(e) => handleVerifiedToggle(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2e5a36]"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Eco Score Slider */}
                            <div className="border-t border-neutral-100 pt-6">
                                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Eco Score Min.</h4>
                                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold mb-2">
                                    <span>0</span>
                                    <span className="text-[#2e5a36] font-bold text-sm bg-[#f0f7f1] px-2 py-0.5 rounded-md">{ecoScore}+</span>
                                    <span>100</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={ecoScore}
                                    onChange={(e) => handleEcoScoreChange(Number(e.target.value))}
                                    onMouseUp={(e) => handleEcoScoreRelease(Number((e.target as HTMLInputElement).value))}
                                    onTouchEnd={(e) => handleEcoScoreRelease(Number((e.target as HTMLInputElement).value))}
                                    className="w-full accent-[#2e5a36] h-1 bg-neutral-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-6 text-sm text-neutral-500 font-semibold">
                            <span>{products.total} produk ditemukan</span>
                            <div className="flex items-center gap-2">
                                <span>Urutkan:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-white border border-neutral-200/80 rounded-xl px-3 py-1.5 text-neutral-800 outline-none font-bold cursor-pointer"
                                >
                                    <option value="Terbaru">Terbaru</option>
                                    <option value="Harga terendah">Harga terendah</option>
                                    <option value="Harga tertinggi">Harga tertinggi</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            {products.data.map((prod) => {
                                const primaryImg = prod.images.find(img => img.is_primary)?.image_url || '/images/placeholder.jpg';
                                const catTag = prod.category ? getCategoryTag(prod.category.name) : 'Bulk';
                                const simulatedEco = getEcoScore(prod.id);
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

                                            {/* Labels */}
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    catTag === 'Food Grade' ? 'bg-[#e6f4e9] text-[#2e5a36]' :
                                                    catTag === 'Premium' ? 'bg-amber-50 text-amber-700' :
                                                    catTag === 'Organic' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-blue-50 text-blue-700'
                                                }`}>
                                                    {catTag}
                                                </span>
                                            </div>

                                            <div className="absolute top-3 right-3">
                                                <span className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-neutral-700 shadow-sm flex items-center gap-1">
                                                    <Leaf className="h-3 w-3 text-[#2e5a36]" /> Eco {simulatedEco}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-extrabold text-base text-neutral-900 line-clamp-1 mb-2 capitalize">{prod.title}</h3>
                                            
                                            <div className="space-y-1 text-xs text-neutral-500 font-medium mb-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="truncate">{prod.seller.name}</span>
                                                    {prod.seller.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-[#2e5a36] fill-[#e6f4e9] flex-shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                                    <span className="truncate">{prod.location}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[#2e5a36] font-extrabold text-sm sm:text-base">
                                                        Rp {Number(prod.reference_price).toLocaleString('id-ID')}/{prod.unit}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                                                        {prod.stock} {prod.unit} tersedia
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('products.show', prod.id)}
                                                    className="bg-[#f0f7f1] hover:bg-[#e6f4e9] text-[#2e5a36] font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1"
                                                >
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Simple Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-10">
                                {products.links.map((link, i) => {
                                    if (link.url === null) return null;
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                link.active 
                                                ? 'bg-[#2e5a36] text-white shadow-sm' 
                                                : 'bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-50'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
