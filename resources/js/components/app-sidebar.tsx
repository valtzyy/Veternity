import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, ClipboardCheck, ShoppingBag, MessageSquare, Star, UserCircle2 } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth, unread_negotiations_count, active_orders_count } = usePage().props as unknown as {
        auth: { user: { role: string } };
        unread_negotiations_count?: number;
        active_orders_count?: number;
    };
    const userRole = auth?.user?.role;
    const { toggleSidebar } = useSidebar();

    const mainNavItems: NavItem[] = [];

    if (userRole === 'admin') {
        mainNavItems.push(
            {
                title: 'Admin Dashboard',
                url: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Manage Users',
                url: '/admin/users',
                icon: Users,
            },
            {
                title: 'Moderate Products',
                url: '/admin/products',
                icon: ClipboardCheck,
            },
            {
                title: 'Profil',
                url: '/settings/profile',
                icon: UserCircle2,
            }
        );
    } else if (userRole === 'seller') {
        mainNavItems.push(
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Produk Saya',
                url: '/seller/products',
                icon: ClipboardCheck,
            },
            {
                title: 'Pesanan',
                url: '/seller/orders',
                icon: BookOpen,
                badge: active_orders_count,
                badgeColor: 'bg-blue-600',
            },
            {
                title: 'Negosiasi',
                url: '/negotiations',
                icon: MessageSquare,
                badge: unread_negotiations_count,
                badgeColor: 'bg-amber-50', // Yellow badge
            },
            {
                title: 'Ulasan Pembeli',
                url: '/seller/reviews',
                icon: Star,
            },
            {
                title: 'Analitik',
                url: '/seller/analytics',
                icon: LayoutGrid,
            },
            {
                title: 'Profil',
                url: '/settings/profile',
                icon: UserCircle2,
            }
        );
    } else {
        mainNavItems.push(
            {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Marketplace',
                url: '/marketplace',
                icon: ShoppingBag,
            },
            {
                title: 'Pesanan Saya',
                url: '/buyer/orders',
                icon: ClipboardCheck,
                badge: active_orders_count,
                badgeColor: 'bg-blue-600',
            },
            {
                title: 'Favorit',
                url: '/buyer/favorites',
                icon: Star,
            },
            {
                title: 'Profil',
                url: '/settings/profile',
                icon: UserCircle2,
            }
        );
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" onClick={toggleSidebar} className="cursor-pointer">
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
