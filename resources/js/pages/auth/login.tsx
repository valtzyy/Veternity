import InputError from '@/components/input-error';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Leaf, Lock, Mail, Star } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen flex-col lg:flex-row">
            <Head title="Masuk ke Akun" />

            {/* Left Column - Green Branding & Info */}
            <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#2e5a36] p-10 text-white lg:flex lg:w-[45%]">
                {/* Decorative background shapes */}
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-green-700/20 blur-3xl"></div>
                <div className="absolute left-[20%] top-[40%] h-64 w-64 rounded-full bg-white/5 blur-2xl"></div>

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-2 hover:opacity-85 transition-opacity">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <Leaf className="h-6 w-6 text-green-300" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">ReGuna</span>
                </Link>

                {/* Welcome Message */}
                <div className="relative z-10 my-auto flex flex-col gap-6 max-w-md">
                    <div className="flex">
                        <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-200">
                            🟢 Platform B2B #1 Indonesia
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
                            Transforming food waste into profit.
                        </h1>
                        <p className="text-base text-green-100/90 leading-relaxed">
                            Jaringan bisnis B2B untuk solusi daur ulang pangan berkelanjutan di seluruh Indonesia. Masuk untuk mulai berkolaborasi.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex flex-1 flex-col justify-center bg-white px-6 py-12 dark:bg-[#0c0f0c] sm:px-12 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    {/* Logo Mobile Only */}
                    <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden hover:opacity-85 transition-opacity">
                        <Leaf className="h-8 w-8 text-[#2e5a36]" />
                        <span className="text-2xl font-bold text-[#2e5a36] dark:text-white">ReGuna</span>
                    </Link>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Masuk ke Akun
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Belum punya akun?{' '}
                            <Link
                                href={route('register')}
                                className="font-semibold text-[#2e5a36] hover:underline dark:text-green-400"
                            >
                                Daftar gratis
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 flex flex-col gap-6" onSubmit={submit}>
                        <div className="flex flex-col gap-5">
                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label
                                    htmlFor="email"
                                    className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                >
                                    Email
                                </label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-4 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@perusahaan.com"
                                        className="w-full rounded-xl border border-gray-200 bg-[#f4f7f4]/60 py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition focus:border-[#2e5a36] focus:ring-1 focus:ring-[#2e5a36] dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-500"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                    >
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-semibold text-[#2e5a36] hover:underline dark:text-green-400"
                                        >
                                            Lupa password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-4 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password"
                                        className="w-full rounded-xl border border-gray-200 bg-[#f4f7f4]/60 py-3 pl-12 pr-12 text-sm text-gray-900 outline-none transition focus:border-[#2e5a36] focus:ring-1 focus:ring-[#2e5a36] dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-white dark:focus:border-green-500 dark:focus:ring-green-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4.5 w-4.5 rounded border-gray-300 text-[#2e5a36] focus:ring-[#2e5a36] dark:border-zinc-800 dark:bg-zinc-900 dark:text-green-500 dark:focus:ring-green-500"
                                />
                                <label
                                    htmlFor="remember"
                                    className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                    Ingat saya selama 30 hari
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2e5a36] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#234529] active:scale-[0.98] disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
                            >
                                {processing ? 'Memproses...' : 'Masuk ke Akun'}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {status && (
                        <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    {/* Footer Policy Text */}
                    <p className="mt-10 text-center text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
                        Dengan masuk, Anda menyetujui{' '}
                        <a href="#" className="hover:underline">
                            Syarat & Ketentuan
                        </a>{' '}
                        dan{' '}
                        <a href="#" className="hover:underline">
                            Kebijakan Privasi ReGuna
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
