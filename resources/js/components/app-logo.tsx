import { Leaf } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-[#2e5a36] shadow-sm">
                <Leaf className="size-4 text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate font-extrabold leading-none tracking-tight text-[#2e5a36] dark:text-emerald-400">
                    ReGuna
                </span>
            </div>
        </>
    );
}

