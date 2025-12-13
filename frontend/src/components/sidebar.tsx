"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Building2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Applications",
        href: "/applications",
        icon: FileText,
    },
    {
        title: "Lenders",
        href: "/lenders",
        icon: Building2,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "sticky top-0 h-screen flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 shrink-0">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                            <span className="text-lg font-bold text-primary-foreground">K</span>
                        </div>
                        <span className="text-lg font-semibold truncate">
                            Kaaj
                        </span>
                    </Link>
                )}
                {collapsed && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary mx-auto shrink-0">
                        <span className="text-lg font-bold text-primary-foreground">K</span>
                    </div>
                )}
            </div>

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                collapsed && "justify-center px-2"
                            )}
                            title={collapsed ? item.title : undefined}
                        >
                            <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                            {!collapsed && <span className="truncate">{item.title}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Theme Toggle & Collapse */}
            <div className="p-2 space-y-2 shrink-0 border-t border-border">
                <div className={cn("flex", collapsed ? "justify-center" : "justify-between items-center px-2")}>
                    {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
                    <ThemeToggle />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            <span className="text-xs">Collapse</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="border-t border-border p-4 shrink-0">
                    <p className="text-xs text-muted-foreground text-center">
                        Lender Matching Platform
                    </p>
                </div>
            )}
        </aside>
    );
}