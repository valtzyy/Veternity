import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.url === page.url}
                            className={item.url === page.url ? 'bg-[#2e5a36] text-white' : 'text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'}
                        >
                            <Link href={item.url} prefetch className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                    {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                                    <span>{item.title}</span>
                                </div>
                                {item.badge !== undefined && item.badge !== null && Number(item.badge) > 0 && (
                                    <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black text-white ml-auto shrink-0 ${item.badgeColor || 'bg-[#2e5a36]'}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
