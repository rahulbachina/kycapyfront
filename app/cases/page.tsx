"use client"

import { useState, useEffect } from "react"
import { useCases } from "@/hooks/useCases"
import { CaseFilters } from "@/components/cases/CaseFilters"
import { CasesTable } from "@/components/cases/CasesTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FolderOpen, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { ApiInteractionPanel } from "@/components/api-testing/shared/ApiInteractionPanel"

export default function CasesPage() {
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        businessUnit: "",
    })
    const [page, setPage] = useState(0)
    const [pageSize] = useState(25)
    const [sortBy, setSortBy] = useState("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
    const [apiInteraction, setApiInteraction] = useState<{
        request: any;
        response: any;
        timestamp: string;
    } | null>(null)

    const queryParams = {
        page,
        pageSize,
        search: filters.search || undefined,
        case_status: filters.status || undefined,
        businessUnit: filters.businessUnit || undefined,
        sortBy,
        sortOrder,
    }

    const { data, isLoading } = useCases(queryParams)

    // Track API interactions when data changes
    useEffect(() => {
        if (data) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
            const queryString = new URLSearchParams(
                Object.entries(queryParams)
                    .filter(([_, v]) => v !== undefined)
                    .map(([k, v]) => [k, String(v)])
            ).toString()

            setApiInteraction({
                request: {
                    url: `${baseUrl}/cases${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                response: {
                    status: 200,
                    statusText: 'OK',
                    body: data
                },
                timestamp: new Date().toISOString()
            })
        }
    }, [data])

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
        setPage(0) // Reset to first page
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(field)
            setSortOrder("desc")
        }
    }

    // Calculate statistics (updated for QueryDog API statuses)
    const totalCases = data?.totalElements || 0
    const activeCases = data?.content?.filter(c =>
        c.status !== "APPROVED" &&
        c.status !== "REJECTED" &&
        c.status !== "ENRICHED"
    ).length || 0
    const completedCases = data?.content?.filter(c =>
        c.status === "APPROVED" ||
        c.status === "ENRICHED"
    ).length || 0
    // Count rejected/under review cases as "high risk" (API doesn't have risk tier field)
    const highRiskCases = data?.content?.filter(c =>
        c.status === "REJECTED" ||
        c.status === "UNDER_REVIEW"
    ).length || 0

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        KYC Automation Core API Test Harness
                    </h2>
                </div>
                <Link href="/cases/new">
                    <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create New Case
                    </Button>
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Cases
                        </CardTitle>
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCases}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All cases in system
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Cases
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCases}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            In progress
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCases}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Successfully closed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            High Risk
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{highRiskCases}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Cases</CardTitle>
                            <CardDescription className="mt-1">
                                View and manage all KYC cases. Click on a case to view details.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <CaseFilters
                            filters={filters}
                            onSearch={(val) => handleFilterChange("search", val)}
                            onStatusChange={(val) => handleFilterChange("status", val)}
                            onBusinessUnitChange={(val) => handleFilterChange("businessUnit", val)}
                        />

                        <CasesTable
                            cases={data?.content || []}
                            isLoading={isLoading}
                            onSort={handleSort}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                        />

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing <span className="font-medium">{((page) * pageSize) + 1}</span> to{" "}
                                <span className="font-medium">
                                    {Math.min((page + 1) * pageSize, totalCases)}
                                </span> of{" "}
                                <span className="font-medium">{totalCases}</span> results
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0 || isLoading}
                                >
                                    Previous
                                </Button>
                                <div className="text-sm font-medium px-4">
                                    Page {page + 1} of {Math.ceil(totalCases / pageSize) || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={isLoading || page >= (Math.ceil(totalCases / pageSize) - 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API Request/Response Panel */}
            {apiInteraction && (
                <ApiInteractionPanel
                    request={apiInteraction.request}
                    response={apiInteraction.response}
                    timestamp={apiInteraction.timestamp}
                />
            )}
        </div>
    )
}
