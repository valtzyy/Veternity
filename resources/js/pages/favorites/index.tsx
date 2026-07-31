import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Leaf, MapPin, BadgeCheck, Star, MessageSquare } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Favorit', href: '/buyer/favorites' },
];

interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
}

interface User {
    id: number;
    name: string;
    is_verified?: boolean;
}

interface Product {
    id: number;
    title: string;
    reference_price: string;
    stock: number;
    unit: string;
    location: string;
    seller: User;
    category?: { id: number; name: string };
    images: ProductImage[];
}

interface Props {
    products: Product[];
}

export default function FavoritesIndex({ products }: Props) {
    
    // Handle unfavoriting (toggling off)
    const handleUnfavorite = (productId: number) => {
        router.post(route('products.favorite', productId), {}, {
            preserveScroll: true,
        });
    };

    // Handle initiating negotiation from favorite card
    const handleNegosiasi = (productId: number) => {
        router.post(route('negotiations.store'), { product_id: productId });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk Favorit - ReGuna" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-[#f6faf6]">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Produk Favorit</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {products.length} produk tersimpan
                    </p>
                </div>

                {/* Product Grid */}
                {products.length === 0 ? (
                    <div className="rounded-3xl bg-white border border-neutral-100/60 p-12 text-center flex flex-col items-center justify-center gap-3 text-neutral-400">
                        <div className="h-12 w-12 rounded-full bg-[#f0f7f1] text-[#2e5a36] flex items-center justify-center shadow-xs">
                            <Star className="h-6 w-6 fill-none" />
                        </div>
                        <h3 className="text-base font-bold text-neutral-900">Belum ada produk favorit</h3>
                        <p className="text-sm text-neutral-500 max-w-xs">
                            Telusuri marketplace dan tandai produk yang Anda minati untuk disimpan di sini.
                        </p>
                        <Link
                            href={route('marketplace')}
                            className="mt-2 bg-[#2e5a36] hover:bg-[#234529] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md"
                        >
                            Ke Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((prod) => {
                            const primaryImg = prod.images.find(img => img.is_primary)?.image_url || '/images/placeholder.jpg';
                            return (
                                <div key={prod.id} className="rounded-3xl bg-white border border-neutral-100/60 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                                    {/* Cover image & Star Toggle */}
                                    <div className="relative aspect-video bg-neutral-100">
                                        <img src={primaryImg} alt={prod.title} className="w-full h-full object-cover" />
                                        
                                        {/* Favorited Star overlay button */}
                                        <button 
                                            onClick={() => handleUnfavorite(prod.id)}
                                            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-sm border border-red-100"
                                            title="Hapus dari Favorit"
                                        >
                                            <Star className="h-4.5 w-4.5 fill-red-500 text-red-500" />
                                        </button>
                                    </div>

                                    {/* Body details */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-extrabold text-base text-neutral-900 line-clamp-1 mb-2 capitalize">
                                            {prod.title}
                                        </h3>
                                        
                                        <div className="space-y-1 text-xs text-neutral-500 font-medium mb-4">
                                            <div className="flex items-center gap-1">
                                                <span className="truncate">{prod.seller.name}</span>
                                                {prod.seller.is_verified && (
                                                    <BadgeCheck className="h-3.5 w-3.5 text-[#2e5a36] fill-[#e6f4e9] flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer Action */}
                                        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                                            <div className="text-[#2e5a36] font-extrabold text-sm sm:text-base">
                                                Rp {Number(prod.reference_price).toLocaleString('id-ID')}/{prod.unit}
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleNegosiasi(prod.id)}
                                                className="bg-[#f0f7f1] hover:bg-[#e6f4e9] text-[#2e5a36] font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                                            >
                                                Negosiasi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
