"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CaseListItem } from "@/lib/api/client"
import { StatusBadge } from "./StatusBadge"
import { RiskTierBadge } from "./RiskTierBadge"
import { useRouter } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit2, Building2, User, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface CasesTableProps {
    cases: CaseListItem[]
    isLoading: boolean
    onSort: (field: string) => void
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export function CasesTable({ cases, isLoading, onSort, sortBy, sortOrder }: CasesTableProps) {
    const router = useRouter()

    const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => {
        const isActive = sortBy === field
        return (
            <Button
                variant="ghost"
                onClick={() => onSort(field)}
                className={cn(
                    "h-8 font-semibold hover:bg-muted/50",
                    isActive && "bg-muted"
                )}
            >
                {children}
                {isActive ? (
                    sortOrder === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
            </Button>
        )
    }

    if (isLoading) {
        return (
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="w-[120px] font-semibold">Case ID</TableHead>
                            <TableHead className="font-semibold">Entity Name</TableHead>
                            <TableHead className="font-semibold">Business Unit</TableHead>
                            <TableHead className="w-[110px] font-semibold">Risk Tier</TableHead>
                            <TableHead className="w-[170px] font-semibold">Status</TableHead>
                            <TableHead className="w-[130px] font-semibold">Assigned To</TableHead>
                            <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }

    return (
        <div className="rounded-lg border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableHead className="w-[120px] font-semibold">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Case ID
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                            <SortButton field="entityName">Entity Name</SortButton>
                        </TableHead>
                        <TableHead className="font-semibold">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Business Unit
                            </div>
                        </TableHead>
                        <TableHead className="w-[110px] font-semibold">
                            <SortButton field="riskTier">Risk Tier</SortButton>
                        </TableHead>
                        <TableHead className="w-[170px] font-semibold">
                            <SortButton field="status">Status</SortButton>
                        </TableHead>
                        <TableHead className="w-[130px] font-semibold">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Assigned To
                            </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <FileText className="h-12 w-12 mb-2 opacity-20" />
                                    <p className="font-medium">No cases found</p>
                                    <p className="text-sm">Try adjusting your filters or create a new case</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        cases.map((c) => (
                            <TableRow
                                key={c.id}
                                className="cursor-pointer hover:bg-muted/30 transition-colors group"
                                onClick={() => router.push(`/kyc-records/${c.id}`)}
                            >
                                <TableCell className="font-mono text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary">{c.id.substring(0, 8)}</span>
                                        <span className="text-muted-foreground">...</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="max-w-[300px] truncate" title={c.entityName || 'N/A'}>
                                        {c.entityName && c.entityName !== 'string' ? c.entityName : (
                                            <span className="text-muted-foreground italic">No entity name</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-sm">
                                            {c.businessUnit && c.businessUnit !== 'string' ? c.businessUnit : (
                                                <span className="text-muted-foreground italic">N/A</span>
                                            )}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RiskTierBadge riskTier={c.riskTier} />
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={c.status} />
                                </TableCell>
                                <TableCell className="text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-xs font-medium text-primary">
                                                {c.assignedUser?.charAt(0)?.toUpperCase() || "?"}
                                            </span>
                                        </div>
                                        <span>{c.assignedUser || "Unassigned"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/kyc-records/${c.id}`);
                                            }}
                                            className="h-8"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/kyc-records/${c.id}/edit`);
                                            }}
                                            className="h-8"
                                        >
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
