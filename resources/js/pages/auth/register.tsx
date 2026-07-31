import InputError from '@/components/input-error';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BarChart2,
    BadgeCheck,
    CheckCircle2,
    Leaf,
    Lock,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    ShoppingBag,
    Store,
    User,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Role = 'buyer' | 'seller';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    address: string;
    role: Role;
    agree: boolean;
};

const STEPS = ['Pilih Peran', 'Informasi Akun', 'Profil Bisnis'];

const SELLER_CATEGORIES = [
    'Restoran & Katering',
    'Toko Roti & Pastry',
    'Pasar & Supermarket',
    'Pabrik Pengolahan Pangan',
    'Rumah Tangga',
    'Lainnya',
];

// Left panel shared across all steps
function LeftPanel() {
    const features = [
        { icon: ShoppingBag, text: 'Akses ribuan produk limbah pangan berkualitas' },
        { icon: ShieldCheck, text: 'Negosiasi harga langsung dengan supplier' },
        { icon: BadgeCheck, text: 'Pembayaran aman dengan sistem escrow' },
        { icon: BarChart2, text: 'Dashboard analitik bisnis real-time' },
        { icon: CheckCircle2, text: 'Verifikasi bisnis gratis & terpercaya' },
    ];

    return (
        <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#2e5a36] p-10 text-white lg:flex lg:w-[45%]">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-green-700/20 blur-3xl" />
            <div className="absolute left-[20%] top-[40%] h-64 w-64 rounded-full bg-white/5 blur-2xl" />

            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-2 hover:opacity-85 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <Leaf className="h-6 w-6 text-green-300" />
                </div>
                <span className="text-2xl font-bold tracking-tight">ReGuna</span>
            </Link>

            {/* Main text */}
            <div className="relative z-10 my-auto flex flex-col gap-8 max-w-md">
                <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Bergabung & <br /> Mulai Berdampak
                </h2>
                <p className="text-base leading-relaxed text-green-100/90">
                    Daftar gratis dan jadilah bagian dari gerakan ekonomi sirkular terbesar di Indonesia.
                </p>
                <ul className="flex flex-col gap-4">
                    {features.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                                <Icon className="h-3.5 w-3.5 text-green-300" />
                            </div>
                            <span className="text-sm text-green-100/90">{text}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Bottom link */}
            <div className="relative z-10 text-center">
                <p className="text-xs text-green-200/60">Sudah punya akun?</p>
                <Link href={route('login')} className="text-sm font-semibold text-white hover:underline">
                    Masuk sekarang →
                </Link>
            </div>
        </div>
    );
}

// Step indicator
function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-2">
            {STEPS.map((label, i) => {
                const idx = i + 1;
                const done = idx < current;
                const active = idx === current;
                return (
                    <div key={label} className="flex items-center gap-2">
                        <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                                done
                                    ? 'border-[#2e5a36] bg-[#2e5a36] text-white'
                                    : active
                                      ? 'border-[#2e5a36] bg-white text-[#2e5a36]'
                                      : 'border-gray-300 bg-white text-gray-400'
                            }`}
                        >
                            {done ? <CheckCircle2 className="h-4 w-4" /> : idx}
                        </div>
                        <span
                            className={`text-xs font-medium ${
                                active ? 'text-[#2e5a36]' : done ? 'text-gray-500' : 'text-gray-400'
                            }`}
                        >
                            {label}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div className={`h-px w-8 ${done ? 'bg-[#2e5a36]' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function inputClass(hasError?: boolean) {
    return `w-full rounded-xl border ${hasError ? 'border-red-400' : 'border-gray-200'} bg-[#f4f7f4]/60 py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2e5a36] focus:ring-1 focus:ring-[#2e5a36]`;
}

export default function Register() {
    const [step, setStep] = useState(1);
    const [sellerCategory, setSellerCategory] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        role: 'buyer',
        agree: false,
    });

    // Called only on step 2 form submission — sends data to server
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password'),
        });
    };

    const roleOptions: { value: Role; icon: React.ReactNode; label: string; desc: string }[] = [
        {
            value: 'buyer',
            icon: <ShoppingBag className="h-6 w-6 text-[#2e5a36]" />,
            label: 'Buyer',
            desc: 'Mencari bahan baku organik untuk bisnis saya',
        },
        {
            value: 'seller',
            icon: <Store className="h-6 w-6 text-gray-500" />,
            label: 'Supplier',
            desc: 'Menjual limbah pangan dari usaha produksi saya',
        },
    ];

    const isSeller = data.role === 'seller';

    return (
        <div className="relative flex min-h-screen flex-col lg:flex-row">
            <Head title="Daftar Akun Baru" />
            <LeftPanel />

            {/* Right Panel */}
            <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-lg">
                    {/* Mobile Logo */}
                    <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden hover:opacity-85 transition-opacity">
                        <Leaf className="h-8 w-8 text-[#2e5a36]" />
                        <span className="text-2xl font-bold text-[#2e5a36]">ReGuna</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-1">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Buat Akun Baru</h2>
                        <p className="text-sm text-gray-500">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="font-semibold text-[#2e5a36] hover:underline">
                                Masuk
                            </Link>
                        </p>
                    </div>

                    <StepIndicator current={step} />

                    <div className="mt-8">
                        {/* ── STEP 1: Pilih Peran ─────────────────────────── */}
                        {step === 1 && (
                            <div className="flex flex-col gap-6">
                                <p className="text-sm font-semibold text-gray-700">Saya mendaftar sebagai:</p>

                                <div className="grid grid-cols-2 gap-4">
                                    {roleOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData('role', opt.value)}
                                            className={`relative flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all ${
                                                data.role === opt.value
                                                    ? 'border-[#2e5a36] bg-[#f0f7f1]'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            {data.role === opt.value && (
                                                <span className="absolute right-3 top-3">
                                                    <CheckCircle2 className="h-5 w-5 text-[#2e5a36]" />
                                                </span>
                                            )}
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                                                {opt.icon}
                                            </div>
                                            <p className="font-bold text-gray-800">{opt.label}</p>
                                            <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e5a36] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98]"
                                >
                                    Lanjutkan sebagai {data.role === 'buyer' ? 'Buyer' : 'Supplier'}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* ── STEP 2: Informasi Akun ──────────────────────── */}
                        {step === 2 && (
                            <form onSubmit={submit} className="flex flex-col gap-5">
                                {/* Nama */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Nama lengkap Anda"
                                            className={inputClass(!!errors.name)}
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email & Telepon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="nama@email.com"
                                                className={inputClass(!!errors.email)}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            No. Telepon
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="08xx-xxxx-xxxx"
                                                className={inputClass(!!errors.phone)}
                                            />
                                        </div>
                                        <InputError message={errors.phone} />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            minLength={8}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Min. 8 karakter"
                                            className={inputClass(!!errors.password)}
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* ── Informasi Bisnis (Seller only) ── */}
                                {isSeller && (
                                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            Informasi Bisnis
                                        </p>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                Industri
                                            </label>
                                            <select
                                                value={sellerCategory}
                                                onChange={(e) => setSellerCategory(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 bg-[#f4f7f4]/60 px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#2e5a36] focus:ring-1 focus:ring-[#2e5a36]"
                                            >
                                                <option value="">Pilih kategori</option>
                                                {SELLER_CATEGORIES.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                Alamat Usaha
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="Kota, Provinsi"
                                                    className={inputClass(!!errors.address)}
                                                />
                                            </div>
                                            <InputError message={errors.address} />
                                        </div>
                                    </div>
                                )}

                                {/* Agree */}
                                <div className="flex items-start gap-3">
                                    <input
                                        id="agree"
                                        type="checkbox"
                                        checked={data.agree}
                                        onChange={(e) => setData('agree', e.target.checked)}
                                        required
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#2e5a36] focus:ring-[#2e5a36]"
                                    />
                                    <label htmlFor="agree" className="cursor-pointer text-xs leading-relaxed text-gray-600">
                                        Saya menyetujui{' '}
                                        <a href="#" className="font-semibold text-[#2e5a36] hover:underline">
                                            Syarat & Ketentuan
                                        </a>{' '}
                                        serta{' '}
                                        <a href="#" className="font-semibold text-[#2e5a36] hover:underline">
                                            Kebijakan Privasi
                                        </a>{' '}
                                        ReGuna.
                                    </label>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e5a36] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                                    <ArrowRight className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Kembali
                                </button>

                                {/* Role field error */}
                                <InputError message={errors.role} />
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
