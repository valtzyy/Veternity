import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Star, MessageSquare, Calendar, Clock, Check, Edit2, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Review {
    id: number;
    rating: number;
    review: string;
    seller_reply: string | null;
    seller_replied_at: string | null;
    created_at: string;
    product: {
        id: number;
        title: string;
    };
    buyer: {
        id: number;
        name: string;
        profile_photo: string | null;
        avatar: string | null;
    };
}

interface Props {
    reviews: Review[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Ulasan Pembeli', href: '/seller/reviews' },
];

export default function Reviews({ reviews = [] }: Props) {
    const getInitials = useInitials();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Filters state
    const [starFilter, setStarFilter] = useState<number | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unreplied' | 'replied'>('all');

    const { data, setData, post, processing, reset, errors } = useForm({
        seller_reply: '',
    });

    // Compute stats
    const totalCount = reviews.length;
    const unrepliedCount = reviews.filter(r => !r.seller_reply).length;
    const avgRating = totalCount > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
        : '0.0';

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            const matchesStar = starFilter === 'all' || review.rating === starFilter;
            const matchesStatus = statusFilter === 'all' 
                || (statusFilter === 'unreplied' && !review.seller_reply)
                || (statusFilter === 'replied' && review.seller_reply);
            return matchesStar && matchesStatus;
        });
    }, [reviews, starFilter, statusFilter]);

    const handleOpenReplyDialog = (review: Review) => {
        setSelectedReview(review);
        setData('seller_reply', review.seller_reply || '');
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedReview(null);
        reset();
    };

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReview) return;

        post(route('seller.reviews.reply', selectedReview.id), {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseDialog();
            },
        });
    };

    const renderStars = (count: number, className = "h-4 w-4") => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={`${className} ${s <= count ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ulasan Pembeli - ReGuna" />

            <div className="flex flex-col min-h-screen bg-[#f6faf6] p-6 gap-6">
                {/* Header Title */}
                <div>
                    <h1 className="text-2xl font-black text-neutral-900">Ulasan Pembeli</h1>
                    <p className="text-sm text-neutral-500 mt-1">Kelola dan tanggapi masukan serta ulasan dari pembeli produk Anda.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-[#e6f4e9] text-[#2e5a36] flex items-center justify-center">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-neutral-900">{totalCount}</p>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Total Ulasan</p>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-neutral-900">{unrepliedCount}</p>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Belum Dibalas</p>
                        </div>
                    </div>

                    <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-neutral-900">{avgRating}</p>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Rata-rata Rating</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white border border-neutral-100 shadow-sm rounded-3xl overflow-hidden">
                    {/* Filters Bar */}
                    <div className="border-b border-neutral-100 p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="flex flex-wrap gap-2">
                            {/* Rating Filters */}
                            <button
                                onClick={() => setStarFilter('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    starFilter === 'all'
                                        ? 'bg-[#2e5a36] text-white shadow-sm'
                                        : 'bg-[#f6faf6] hover:bg-[#e6f4e9] text-neutral-700 border border-neutral-100'
                                }`}
                            >
                                Semua Bintang
                            </button>
                            {[5, 4, 3, 2, 1].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStarFilter(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        starFilter === s
                                            ? 'bg-[#2e5a36] text-white shadow-sm'
                                            : 'bg-[#f6faf6] hover:bg-[#e6f4e9] text-neutral-700 border border-neutral-100'
                                    }`}
                                >
                                    {s} <Star className="h-3 w-3 fill-current" />
                                </button>
                            ))}
                        </div>

                        {/* Status filter select dropdown */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex-shrink-0">Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unreplied' | 'replied')}
                                className="w-full sm:w-auto text-xs font-bold text-neutral-700 bg-[#f6faf6] border border-neutral-100 rounded-xl px-4 py-2 focus:ring-[#2e5a36]/20 focus:border-[#2e5a36] outline-none"
                            >
                                <option value="all">Semua Status</option>
                                <option value="unreplied">Belum Dibalas</option>
                                <option value="replied">Sudah Dibalas</option>
                            </select>
                        </div>
                    </div>

                    {/* Review List */}
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-500 font-semibold">Tidak ditemukan ulasan yang cocok dengan kriteria filter.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {filteredReviews.map((review) => {
                                const buyerAvatar = review.buyer.profile_photo || review.buyer.avatar;
                                return (
                                    <div key={review.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                                        {/* Buyer Column */}
                                        <div className="flex items-center gap-3 w-full md:w-56 flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
                                                {buyerAvatar ? (
                                                    <img src={buyerAvatar} alt={review.buyer.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#e6f4e9] text-[#2e5a36] font-bold text-sm uppercase">
                                                        {getInitials(review.buyer.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-neutral-900 text-sm truncate">{review.buyer.name}</p>
                                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-0.5">Pembeli</span>
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.rating)}
                                                    <span className="text-neutral-300">|</span>
                                                    <span className="text-xs font-bold text-neutral-500 capitalize">
                                                        Produk: <span className="text-neutral-800">{review.product?.title || 'Limbah Organik'}</span>
                                                    </span>
                                                </div>
                                                <span className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(review.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            
                                            {/* Review Text */}
                                            <p className="text-neutral-700 text-sm whitespace-pre-line leading-relaxed">
                                                {review.review || <span className="text-neutral-400 italic">"Pembeli tidak menyertakan ulasan tertulis."</span>}
                                            </p>

                                            {/* Seller Reply Box */}
                                            {review.seller_reply ? (
                                                <div className="bg-[#f6faf6] border-l-4 border-[#2e5a36] rounded-r-2xl p-4 space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs font-bold">
                                                        <span className="text-[#2e5a36] flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Tanggapan Anda</span>
                                                        {review.seller_replied_at && (
                                                            <span className="text-neutral-400 font-semibold">
                                                                {new Date(review.seller_replied_at).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-neutral-700 text-xs leading-relaxed whitespace-pre-line">
                                                        {review.seller_reply}
                                                    </p>
                                                    <div className="pt-2">
                                                        <button
                                                            onClick={() => handleOpenReplyDialog(review)}
                                                            className="text-[10px] font-bold text-[#2e5a36] hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Edit2 className="h-3 w-3" /> Ubah Balasan
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="pt-2">
                                                    <Button
                                                        onClick={() => handleOpenReplyDialog(review)}
                                                        className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" /> Balas Ulasan
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Dialog Modal */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-neutral-900">
                            {selectedReview?.seller_reply ? 'Ubah Balasan Ulasan' : 'Balas Ulasan Pembeli'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-neutral-500 font-semibold mt-1">
                            Tuliskan tanggapan ramah dan profesional terhadap ulasan yang diberikan oleh pembeli.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedReview && (
                        <div className="bg-[#f6faf6]/60 border border-neutral-100 rounded-2xl p-4 my-2 text-xs text-neutral-700">
                            <p className="font-bold mb-1">{selectedReview.buyer.name} memberikan bintang {selectedReview.rating}:</p>
                            <p className="italic">"{selectedReview.review || 'Tanpa ulasan tertulis.'}"</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmitReply} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <label htmlFor="replyText" className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                Isi Balasan Anda
                            </label>
                            <Textarea
                                id="replyText"
                                rows={4}
                                placeholder="Terima kasih telah berbelanja di toko kami! Semoga limbah organiknya bermanfaat..."
                                value={data.seller_reply}
                                onChange={(e) => setData('seller_reply', e.target.value)}
                                className="w-full resize-none text-sm text-neutral-800"
                                required
                            />
                            {errors.seller_reply && (
                                <p className="text-xs text-red-500 font-semibold mt-1">{errors.seller_reply}</p>
                            )}
                        </div>

                        <DialogFooter className="flex gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseDialog}
                                className="border border-neutral-200 text-neutral-700 font-bold"
                            >
                                Batal
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-[#2e5a36] hover:bg-[#234529] text-white font-bold"
                            >
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kirim Balasan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
