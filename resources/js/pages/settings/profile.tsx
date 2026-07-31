import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Camera, Loader2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method: 'PATCH',
        name: auth.user.name,
        email: auth.user.email,
        phone: (auth.user.phone as string) ?? '',
        address: (auth.user.address as string) ?? '',
        profile_photo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        setData('profile_photo', file);
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const currentPhoto = photoPreview ?? (auth.user.profile_photo as string | undefined) ?? null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informasi Profil" description="Perbarui nama, email, kontak, dan foto profil Anda" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* --- Avatar Upload --- */}
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <Avatar className="h-20 w-20">
                                    {currentPhoto ? (
                                        <AvatarImage src={currentPhoto} alt={auth.user.name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="bg-neutral-200 text-lg text-black dark:bg-neutral-700 dark:text-white">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute right-0 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-neutral-800 text-white shadow transition hover:bg-neutral-600 dark:bg-neutral-200 dark:text-black dark:hover:bg-neutral-400"
                                    title="Ganti foto profil"
                                >
                                    <Camera className="h-3.5 w-3.5" />
                                </button>
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{auth.user.name}</p>
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="text-muted-foreground mt-0.5 cursor-pointer text-xs underline-offset-2 hover:underline"
                                >
                                    {photoPreview ? 'Foto dipilih – klik Simpan' : 'Ganti foto profil'}
                                </button>
                                {errors.profile_photo && <InputError className="mt-1" message={errors.profile_photo} />}
                            </div>
                        </div>

                        {/* --- Nama --- */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nama lengkap"
                            />
                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        {/* --- Email --- */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Alamat Email</Label>
                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Alamat email"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {/* --- Nomor Telepon --- */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input
                                id="phone"
                                type="tel"
                                className="mt-1 block w-full"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="tel"
                                placeholder="Contoh: 08123456789"
                            />
                            <InputError className="mt-2" message={errors.phone} />
                        </div>

                        {/* --- Alamat --- */}
                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                className="mt-1 block w-full resize-none"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                autoComplete="street-address"
                                placeholder="Jalan, kota, provinsi…"
                            />
                            <InputError className="mt-2" message={errors.address} />
                        </div>

                        {/* --- Email verification notice --- */}
                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Alamat email Anda belum diverifikasi.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="ml-1 rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Kirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Link verifikasi baru telah dikirim ke email Anda.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Tersimpan!</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
