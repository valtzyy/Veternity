import { Breadcrumbs } from '@/components/breadcrumbs';
import { useSidebar } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Leaf } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { toggleSidebar } = useSidebar();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-3">
                {/* ReGuna Logo Trigger - Visible on mobile/tablet, hidden on desktop */}
                <button
                    onClick={toggleSidebar}
                    className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-[#2e5a36] text-white hover:bg-[#234529] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                    aria-label="Toggle Sidebar"
                >
                    <Leaf className="h-5 w-5" />
                </button>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
