<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Negotiation - EcoCycle / ReGuna</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-[#F8FAFC] text-slate-800 min-h-screen flex flex-col antialiased">

    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                    <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
                    </svg>
                </div>
                <span class="text-2xl font-bold text-slate-900 tracking-tight">ReGuna</span>
            </div>

            <!-- Navigation Links -->
            <nav class="hidden md:flex items-center gap-8">
                <a href="#" class="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Home</a>
                <a href="#" class="text-slate-600 hover:text-emerald-600 font-medium transition-colors">Marketplace</a>
                <a href="#" class="text-slate-600 hover:text-emerald-600 font-medium transition-colors">About</a>
                <a href="#" class="text-slate-600 hover:text-emerald-600 font-medium transition-colors">How It Works</a>
            </nav>

            <!-- Auth Buttons -->
            <div class="flex items-center gap-4">
                <a href="#" class="px-5 py-2.5 text-slate-700 hover:text-slate-900 font-semibold transition-colors">Login</a>
                <a href="#" class="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-full shadow-sm transition-all hover:shadow">Daftar Gratis</a>
            </div>
        </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 max-w-[1440px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- Product Sidebar (Left Sidebar) -->
        <aside class="lg:col-span-3 flex flex-col gap-6">
            <!-- Product Card -->
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-4">
                <div class="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100">
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" 
                         alt="Ampas Tahu Premium" 
                         class="w-full h-full object-cover">
                </div>
                <div>
                    <div class="flex items-center justify-between gap-2 mb-1">
                        <h2 class="font-bold text-slate-900 text-lg leading-snug">Ampas Tahu Premium</h2>
                        <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full whitespace-nowrap">Food Grade</span>
                    </div>
                    <p class="text-xs text-slate-500 flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        CV. Sari Murni · Bogor
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-2 bg-[#F6F8FA] p-3 rounded-xl">
                    <div>
                        <span class="text-[11px] text-slate-500 block mb-0.5">Harga Awal</span>
                        <span class="font-bold text-emerald-700 text-sm">Rp 850/kg</span>
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-500 block mb-0.5">Tersedia</span>
                        <span class="font-bold text-slate-800 text-sm">2 ton</span>
                    </div>
                </div>
            </div>

            <!-- Transaction Status Card -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">STATUS TRANSAKSI</h3>
                
                <div class="relative pl-7 flex flex-col gap-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    <!-- Step 1 -->
                    <div class="relative flex items-center justify-between">
                        <div class="absolute -left-7 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center z-10">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <span class="font-semibold text-sm text-slate-800">Menunggu</span>
                    </div>

                    <!-- Step 2 (Active) -->
                    <div class="relative flex items-center justify-between">
                        <div class="absolute -left-7 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-emerald-100 z-10">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <span class="font-bold text-sm text-emerald-700">Negosiasi</span>
                        <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Aktif</span>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative flex items-center justify-between">
                        <div class="absolute -left-7 w-6 h-6 rounded-full bg-white border-2 border-slate-300 z-10"></div>
                        <span class="text-sm text-slate-400 font-medium">Pembayaran</span>
                    </div>

                    <!-- Step 4 -->
                    <div class="relative flex items-center justify-between">
                        <div class="absolute -left-7 w-6 h-6 rounded-full bg-white border-2 border-slate-300 z-10"></div>
                        <span class="text-sm text-slate-400 font-medium">Pickup</span>
                    </div>

                    <!-- Step 5 -->
                    <div class="relative flex items-center justify-between">
                        <div class="absolute -left-7 w-6 h-6 rounded-full bg-white border-2 border-slate-300 z-10"></div>
                        <span class="text-sm text-slate-400 font-medium">Selesai</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions Card -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TINDAKAN CEPAT</h3>
                
                <button type="button" class="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-colors text-sm shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Terima Penawaran
                </button>

                <button type="button" class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full flex items-center justify-center gap-2 transition-colors text-sm">
                    <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    Tolak Negosiasi
                </button>

                <button type="button" class="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full flex items-center justify-center gap-2 transition-colors text-sm">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Laporkan Masalah
                </button>
            </div>
        </aside>

        <!-- Chat Area (Center Main Panel) -->
        <section class="lg:col-span-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[780px] overflow-hidden">
            <!-- Chat Header -->
            <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                             alt="Budi Santoso" 
                             class="w-11 h-11 rounded-full object-cover">
                        <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <div class="flex items-center gap-1.5">
                            <h2 class="font-bold text-slate-900 text-base">Budi Santoso</h2>
                            <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <p class="text-xs text-slate-500 font-medium">Online · CV. Sari Murni, Bogor</p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <span class="px-3 py-1.5 bg-amber-100/70 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Negosiasi Aktif
                    </span>
                    <button class="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                    </button>
                    <button class="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Messages List -->
            <div class="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                <!-- Date Divider -->
                <div class="flex items-center justify-center my-4">
                    <span class="text-xs font-semibold text-slate-400 bg-white border border-slate-100 px-4 py-1 rounded-full shadow-2xs">Rabu, 16 Juli 2025</span>
                </div>

                <!-- Seller Message -->
                <div class="flex items-start gap-3 max-w-[85%]">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                         alt="Budi Santoso" 
                         class="w-8 h-8 rounded-full object-cover mt-1">
                    <div>
                        <div class="bg-amber-50/60 border border-amber-100/60 text-slate-800 p-4 rounded-2xl rounded-tl-xs shadow-2xs leading-relaxed text-sm">
                            Halo, terima kasih sudah menghubungi kami. Ampas tahu kami tersedia 2 ton dengan kualitas food grade. Ada yang bisa saya bantu?
                        </div>
                        <span class="text-[11px] text-slate-400 mt-1.5 block">09:12</span>
                    </div>
                </div>

                <!-- Buyer Message -->
                <div class="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
                    <div class="bg-emerald-800 text-white p-4 rounded-2xl rounded-tr-xs shadow-2xs leading-relaxed text-sm">
                        Selamat pagi! Kami tertarik dengan produk Ampas Tahu Premium Anda. Bisakah harganya lebih fleksibel untuk pembelian 500 kg?
                    </div>
                    <div class="flex items-center gap-1 text-[11px] text-slate-400">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>09:15</span>
                    </div>
                </div>

                <!-- Buyer Offer Card -->
                <div class="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
                    <div class="w-full bg-blue-50/50 border border-blue-100 p-4 rounded-2xl shadow-2xs">
                        <div class="flex items-center gap-1.5 text-blue-600 font-bold text-xs mb-3">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                            Penawaran
                        </div>
                        <p class="text-xs text-slate-500 mb-3">Penawaran awal kami:</p>
                        <div class="grid grid-cols-3 gap-2">
                            <div>
                                <span class="text-[11px] text-slate-400 block">Harga</span>
                                <span class="font-bold text-emerald-700 text-sm">Rp 700/kg</span>
                            </div>
                            <div>
                                <span class="text-[11px] text-slate-400 block">Kuantitas</span>
                                <span class="font-bold text-slate-800 text-sm">500 kg</span>
                            </div>
                            <div>
                                <span class="text-[11px] text-slate-400 block">Total</span>
                                <span class="font-bold text-slate-900 text-sm">Rp 350.000</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 text-[11px] text-slate-400">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>09:16</span>
                    </div>
                </div>
            </div>

            <!-- Input Area -->
            <div class="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                <button type="button" class="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full flex items-center gap-1.5 transition-colors border border-emerald-200/50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3"/>
                    </svg>
                    Tawar
                </button>

                <div class="flex-1 relative flex items-center">
                    <textarea rows="1" 
                              placeholder="Ketik pesan..." 
                              class="w-full bg-[#F4F6F8] text-slate-800 text-sm px-5 py-3 rounded-full border-none focus:ring-2 focus:ring-emerald-500 outline-none resize-none placeholder-slate-400 max-h-32"
                              oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"></textarea>
                </div>

                <button type="button" class="w-11 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105 shrink-0">
                    <svg class="w-5 h-5 transform rotate-45 -translate-x-0.5 translate-y-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- Right Navigation / Conversation List & Quick Floating Links -->
        <aside class="lg:col-span-3 flex flex-col gap-6 relative">
            <!-- Active Negotiations List Panel -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4 min-h-[500px]">
                <div>
                    <h2 class="font-bold text-slate-900 text-base">Negosiasi Aktif</h2>
                    <p class="text-xs text-slate-400 font-medium">4 percakapan</p>
                </div>

                <div class="flex flex-col divide-y divide-slate-100">
                    <!-- Item 1 (Selected/Active) -->
                    <div class="py-3 flex items-start gap-3 cursor-pointer bg-slate-50/80 -mx-2 px-2 rounded-xl">
                        <div class="relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                                 alt="CV. Sari Murni" 
                                 class="w-10 h-10 rounded-full object-cover">
                            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-0.5">
                                <h3 class="font-bold text-slate-900 text-sm truncate">CV. Sari Murni</h3>
                                <span class="text-[11px] text-slate-400">09:28</span>
                            </div>
                            <p class="text-xs font-semibold text-slate-700 truncate">Ampas Tahu Premium</p>
                            <p class="text-xs text-slate-400 truncate">Baik, kami pertimbangkan...</p>
                        </div>
                    </div>

                    <!-- Item 2 -->
                    <div class="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors -mx-2 px-2 rounded-xl">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                             alt="Kopiku Nusantara" 
                             class="w-10 h-10 rounded-full object-cover shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-0.5">
                                <h3 class="font-bold text-slate-900 text-sm truncate">Kopiku Nusantara</h3>
                                <span class="text-[11px] text-slate-400">Kemarin</span>
                            </div>
                            <p class="text-xs font-semibold text-slate-700 truncate">Ampas Kopi Arabika</p>
                            <div class="flex items-center justify-between gap-1">
                                <p class="text-xs text-slate-400 truncate">Harga kami Rp 1.200/kg</p>
                                <span class="w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">2</span>
                            </div>
                        </div>
                    </div>

                    <!-- Item 3 -->
                    <div class="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors -mx-2 px-2 rounded-xl">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" 
                             alt="UD. Berkah Tani" 
                             class="w-10 h-10 rounded-full object-cover shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-0.5">
                                <h3 class="font-bold text-slate-900 text-sm truncate">UD. Berkah Tani</h3>
                                <span class="text-[11px] text-slate-400">Senin</span>
                            </div>
                            <p class="text-xs font-semibold text-slate-700 truncate">Kulit Jagung Kering</p>
                            <p class="text-xs text-slate-400 truncate">Oke siap, kapan pickup?</p>
                        </div>
                    </div>

                    <!-- Item 4 -->
                    <div class="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors -mx-2 px-2 rounded-xl">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                             alt="PT. Agri Mandiri" 
                             class="w-10 h-10 rounded-full object-cover shrink-0">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-0.5">
                                <h3 class="font-bold text-slate-900 text-sm truncate">PT. Agri Mandiri</h3>
                                <span class="text-[11px] text-slate-400">Minggu</span>
                            </div>
                            <p class="text-xs font-semibold text-slate-700 truncate">Dedak Padi Halus</p>
                            <div class="flex items-center justify-between gap-1">
                                <p class="text-xs text-slate-400 truncate">Stok tersedia 5 ton</p>
                                <span class="w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Floating Action Navigation Pill Group (Bottom Right matching Figma) -->
            <div class="flex flex-col items-end gap-2.5 mt-auto pt-4">
                <a href="#" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full shadow-md border border-slate-100 flex items-center gap-2 transition-all hover:shadow-lg">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    Detail Produk
                </a>

                <a href="#" class="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-2 transition-all hover:shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    Pembayaran
                </a>

                <a href="#" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-2 transition-all hover:shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                    Supplier Dashboard
                </a>

                <a href="#" class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-full shadow-md border border-slate-100 flex items-center gap-2 transition-all hover:shadow-lg">
                    <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Beranda
                </a>
            </div>
        </aside>

    </main>

</body>
</html>
