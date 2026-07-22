import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, BarChart2, CheckCircle2, Leaf, Mail, ShoppingBag, Store } from 'lucide-react';

interface Props {
    user: {
        name: string;
        email: string;
        role: 'buyer' | 'seller';
    };
}

export default function RegisterSuccess({ user }: Props) {
    const isSeller = user.role === 'seller';

    const steps = isSeller
        ? [
              { icon: BadgeCheck, label: 'Akun dibuat', desc: 'Informasi Anda telah tersimpan' },
              { icon: Mail, label: 'Cek email konfirmasi', desc: 'Kami telah mengirim email ke ' + user.email },
              { icon: BarChart2, label: 'Verifikasi bisnis', desc: 'Tim kami memverifikasi dalam 1×24 jam' },
          ]
        : [
              { icon: BadgeCheck, label: 'Akun dibuat', desc: 'Informasi Anda telah tersimpan' },
              { icon: Mail, label: 'Cek email konfirmasi', desc: 'Kami telah mengirim email ke ' + user.email },
              { icon: ShoppingBag, label: 'Mulai belanja', desc: 'Temukan produk limbah pangan terbaik' },
          ];

    return (
        <div className="relative flex min-h-screen flex-col lg:flex-row">
            <Head title="Pendaftaran Berhasil" />

            {/* Left panel */}
            <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#2e5a36] p-10 text-white lg:flex lg:w-[45%]">
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-green-700/20 blur-3xl" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <Leaf className="h-6 w-6 text-green-300" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">ReGuna</span>
                </div>

                {/* Illustration */}
                <div className="relative z-10 my-auto flex flex-col items-center gap-6">
                    {/* Animated circle */}
                    <div className="relative flex h-36 w-36 items-center justify-center">
                        <div className="absolute inset-0 animate-ping rounded-full bg-green-400/20" />
                        <div className="absolute inset-3 animate-pulse rounded-full bg-green-400/10" />
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                            <CheckCircle2 className="h-12 w-12 text-green-300" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold leading-tight">
                            Selamat Bergabung, <br />
                            <span className="text-green-300">{user.name.split(' ')[0]}!</span>
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-green-100/80">
                            {isSeller
                                ? 'Akun supplier Anda sedang diverifikasi. Kami akan menghubungi Anda segera.'
                                : 'Akun buyer Anda siap digunakan. Selamat berbelanja!'}
                        </p>
                    </div>
                </div>

                {/* Bottom */}
                <div className="relative z-10 text-center text-xs text-green-200/50">
                    &copy; {new Date().getFullYear()} ReGuna Marketplace
                </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <Leaf className="h-8 w-8 text-[#2e5a36]" />
                        <span className="text-2xl font-bold text-[#2e5a36]">ReGuna</span>
                    </div>

                    {/* Badge */}
                    <div className="mb-6 flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f7f1]">
                            {isSeller ? (
                                <Store className="h-5 w-5 text-[#2e5a36]" />
                            ) : (
                                <ShoppingBag className="h-5 w-5 text-[#2e5a36]" />
                            )}
                        </div>
                        <span className="rounded-full bg-[#f0f7f1] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2e5a36]">
                            {isSeller ? 'Akun Supplier' : 'Akun Buyer'}
                        </span>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        Pendaftaran Berhasil! 🎉
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Halo <strong className="text-gray-700">{user.name}</strong>, akun Anda telah berhasil dibuat. Berikut langkah selanjutnya:
                    </p>

                    {/* Steps */}
                    <div className="mt-8 flex flex-col gap-4">
                        {steps.map(({ icon: Icon, label, desc }, i) => (
                            <div
                                key={label}
                                className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#fafafa] p-4 transition-all hover:border-[#2e5a36]/20 hover:bg-[#f0f7f1]/50"
                            >
                                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                                    <Icon className="h-5 w-5 text-[#2e5a36]" />
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#2e5a36] text-[10px] font-bold text-white">
                                        {i + 1}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                                    {/* Show done badge for step 1 */}
                                    {i === 0 && (
                                        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-[#2e5a36]">
                                            <CheckCircle2 className="h-3 w-3" /> Selesai
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Email info box */}
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-[#f0f7f1] px-4 py-3">
                        <Mail className="h-5 w-5 shrink-0 text-[#2e5a36]" />
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Email konfirmasi dikirim ke{' '}
                            <strong className="break-all text-[#2e5a36]">{user.email}</strong>
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            href={route('dashboard')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e5a36] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98]"
                        >
                            Buka Dashboard Saya
                        </Link>
                        <Link
                            href={route('home')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
                        >
                            Jelajahi Marketplace
                        </Link>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        Butuh bantuan?{' '}
                        <a href="mailto:support@reguna.id" className="font-semibold text-[#2e5a36] hover:underline">
                            Hubungi Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
