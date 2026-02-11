"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    FolderOpen,
    PlusCircle,
    FileText,
    CheckCircle2,
    Settings,
    LayoutDashboard,
    Package,
    Zap,
    Users,
    ShieldCheck
} from "lucide-react"

const menuItems = [
    {
        title: "Cases",
        items: [
            { name: "All Cases", href: "/cases", icon: FolderOpen },
            { name: "Create Case", href: "/cases/new", icon: PlusCircle },
        ]
    },
    {
        title: "Operations",
        items: [
            { name: "BE Pack", href: "/be-pack", icon: Package },
            { name: "Automation", href: "/automation", icon: Zap },
            { name: "KYC Review", href: "/kyc-review", icon: CheckCircle2 },
        ]
    },
    {
        title: "Management",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Users", href: "/users", icon: Users },
            { name: "Settings", href: "/settings", icon: Settings },
        ]
    }
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-white shadow-sm overflow-y-auto">
            <div className="p-4 space-y-6">
                {/* Logo/Brand Section */}
                <div className="flex items-center gap-3 px-2 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-gray-900">Vantage KYC</h2>
                        <p className="text-xs text-gray-600">Case Management</p>
                    </div>
                </div>

                {/* Menu Sections */}
                {menuItems
                    .filter((section) => section.title !== "Operations" && section.title !== "Management")
                    .map((section) => (
                    <div key={section.title} className="space-y-2">
                        <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {section.title}
                        </h3>
                        <nav className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className={cn(
                                            "h-5 w-5 flex-shrink-0",
                                            isActive ? "text-white" : "text-gray-500"
                                        )} />
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                ))}
            </div>
        </aside>
    )
}
