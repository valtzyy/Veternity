import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, ClipboardCheck } from 'lucide-react';
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
    const { auth } = usePage<any>().props;
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
                icon: ClipboardCheck, // Let's use Package or similar if imported, or ClipboardCheck
            },
            {
                title: 'Pesanan',
                url: '/seller/orders',
                icon: BookOpen,
            },
            {
                title: 'Negosiasi',
                url: '/seller/negotiations',
                icon: Users,
            },
            {
                title: 'Analitik',
                url: '/seller/analytics',
                icon: LayoutGrid,
            }
        );
    } else {
        mainNavItems.push({
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        });
    }

    const homeUrl = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';

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
