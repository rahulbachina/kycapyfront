"use client"

import { useCase, useDeleteCase } from "@/hooks/useCases"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/cases/StatusBadge"
import { RiskTierBadge } from "@/components/cases/RiskTierBadge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Send,
    Building2,
    User,
    Calendar,
    TrendingUp,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Download,
    ExternalLink,
    Building,
    Mail,
    MapPin,
    Hash,
    FileJson
} from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { ApiInteractionPanel } from "@/components/api-testing/shared/ApiInteractionPanel"
import { JsonViewerDialog } from "@/components/cases/JsonViewerDialog"
import { api } from "@/lib/api/client"

export default function CaseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { data: caseDetail, isLoading, error } = useCase(id)
    const deleteMutation = useDeleteCase()
    const [apiInteraction, setApiInteraction] = useState<{
        request: any;
        response: any;
        timestamp: string;
    } | null>(null)
    const [showPasJson, setShowPasJson] = useState(false)
    const [pasJsonData, setPasJsonData] = useState<any>(null)
    const [isConvertingToPas, setIsConvertingToPas] = useState(false)
    const [showGoldenRecord, setShowGoldenRecord] = useState(false)

    // Safe date formatter
    const formatDate = (dateString: string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string | null => {
        if (!dateString) return null
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return null
            return format(date, formatStr)
        } catch {
            return null
        }
    }

    // Track API interactions when case data changes
    useEffect(() => {
        if (caseDetail) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'
            setApiInteraction({
                request: {
                    url: `${baseUrl}/kyc-records/${id}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                response: {
                    status: 200,
                    statusText: 'OK',
                    body: caseDetail
                },
                timestamp: new Date().toISOString()
            })
        }
    }, [caseDetail, id])

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-[300px]" />
                <Skeleton className="h-[200px] w-full" />
            </div>
        )
    }

    if (error || !caseDetail) {
        return (
            <div className="p-8">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive">
                            <XCircle className="h-5 w-5" />
                            <span className="font-medium">Error loading case details.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id)
            toast.success("Case deleted successfully")
            router.push("/kyc-records")
        } catch (error) {
            toast.error("Failed to delete case")
        }
    }

    const handleConvertToPas = async () => {
        setIsConvertingToPas(true)
        try {
            const pasData = await api.cases.convertToPas(id)
            setPasJsonData(pasData)
            setShowPasJson(true)
            toast.success("Successfully converted to PAS format")
        } catch (error: any) {
            console.error("Convert to PAS error:", error)
            const errorMessage = error.response?.data?.detail
                || error.message
                || "Failed to convert to PAS format"
            toast.error(errorMessage)
        } finally {
            setIsConvertingToPas(false)
        }
    }

    const getAutomationStatusIcon = (status?: string) => {
        switch (status) {
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />
            case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
            case 'failed': return <XCircle className="h-5 w-5 text-red-600" />
            case 'not_applicable': return <AlertCircle className="h-5 w-5 text-gray-400" />
            default: return <Clock className="h-5 w-5 text-gray-400" />
        }
    }

    const getAutomationStatusColor = (status?: string) => {
        switch (status) {
            case 'success': return 'bg-green-50 border-green-200'
            case 'pending': return 'bg-yellow-50 border-yellow-200'
            case 'failed': return 'bg-red-50 border-red-200'
            case 'not_applicable': return 'bg-gray-50 border-gray-200'
            default: return 'bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Header Section */}
            <div className="space-y-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
                </Button>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    {caseDetail.entity?.legalName || caseDetail.beForm?.legalName || caseDetail.entityName || 'Unknown Entity'}
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <span className="font-mono">Case ID: {caseDetail.caseId || caseDetail._id?.substring(0, 12)}</span>
                                    {caseDetail.clientRef && <span>• Client Ref: {caseDetail.clientRef}</span>}
                                    {formatDate(caseDetail.createdAt) && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Created: {formatDate(caseDetail.createdAt)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={caseDetail.status} />
                            <RiskTierBadge riskTier={caseDetail.riskTier} />
                            <Badge variant="outline" className="gap-1">
                                <Building className="h-3 w-3" />
                                {caseDetail.businessUnit}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <User className="h-3 w-3" />
                                {caseDetail.assignedUser}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/kyc-records/${id}/edit`)}
                            className="shadow-sm"
                        >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="shadow-sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the case
                                        and all associated data.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button
                            variant="outline"
                            onClick={() => setShowGoldenRecord(true)}
                            className="shadow-sm border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500"
                        >
                            🏆 View Golden Record
                        </Button>
                    </div>
                </div>
            </div>

            {/* Case Details Section */}
            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Business Unit
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{caseDetail.relationship?.systemRequired || caseDetail.businessUnit || 'N/A'}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Jurisdiction
                            </CardTitle>
                            <User className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{caseDetail.entity?.jurisdiction || caseDetail.beForm?.country || 'N/A'}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Role Type
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{caseDetail.role?.primary || caseDetail.beForm?.roleType || caseDetail.riskTier || 'N/A'}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Days Open
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{caseDetail.daysOpen ?? 0}</div>
                            {formatDate(caseDetail.createdAt) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Since {formatDate(caseDetail.createdAt)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Company Information */}
                <Card className="shadow-md border-t-4 border-t-purple-500">
                    <CardHeader className="bg-purple-50/50 border-b">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Building className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="text-purple-900">Entity & Contact Information</CardTitle>
                                <CardDescription>Detailed company and contact information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Building className="h-5 w-5 text-purple-600" />
                                        Company Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Legal Name:</span>
                                            <span className="font-medium">{caseDetail.entity?.legalName || caseDetail.beForm?.legalName || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Trading Name:</span>
                                            <span className="font-medium">{caseDetail.beForm?.tradingName || caseDetail.entity?.legalName || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span className="text-muted-foreground min-w-[120px]">Registration No:</span>
                                            <span className="font-medium font-mono">{caseDetail.enrichment?.companiesHouse?.companyNumber || caseDetail.beForm?.registrationNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <span className="text-muted-foreground min-w-[120px]">Jurisdiction:</span>
                                            <span className="font-medium">{caseDetail.entity?.jurisdiction || caseDetail.beForm?.country || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Role:</span>
                                            <span className="font-medium">{caseDetail.role?.primary || caseDetail.beForm?.roleType || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Sub Type:</span>
                                            <span className="font-medium">{caseDetail.role?.subType || caseDetail.beForm?.customerType || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-purple-600" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Contact Email:</span>
                                            {(caseDetail.entity?.contactEmail || caseDetail.beForm?.statementEmail) ? (
                                                <a href={`mailto:${caseDetail.entity?.contactEmail || caseDetail.beForm?.statementEmail}`} className="font-medium text-blue-600 hover:underline">
                                                    {caseDetail.entity?.contactEmail || caseDetail.beForm?.statementEmail}
                                                </a>
                                            ) : (
                                                <span className="font-medium">N/A</span>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Address:</span>
                                            <div className="font-medium">
                                                {caseDetail.enrichment?.companiesHouse?.registeredAddress ? (
                                                    <>
                                                        {caseDetail.enrichment.companiesHouse.registeredAddress.line1}
                                                        <br />
                                                        {caseDetail.enrichment.companiesHouse.registeredAddress.city}, {caseDetail.enrichment.companiesHouse.registeredAddress.postcode}
                                                        <br />
                                                        {caseDetail.enrichment.companiesHouse.registeredAddress.country}
                                                    </>
                                                ) : caseDetail.beForm?.addressLine1 ? (
                                                    <>
                                                        {caseDetail.beForm.addressLine1}
                                                        {caseDetail.beForm.addressLine2 && <>, {caseDetail.beForm.addressLine2}</>}
                                                        {caseDetail.beForm.city && caseDetail.beForm.postcode && (
                                                            <>
                                                                <br />
                                                                {caseDetail.beForm.city}, {caseDetail.beForm.postcode}
                                                            </>
                                                        )}
                                                    </>
                                                ) : 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">Relationship:</span>
                                            <span className="font-medium">{caseDetail.relationship?.type || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-muted-foreground min-w-[140px]">System:</span>
                                            <span className="font-medium">{caseDetail.relationship?.systemRequired || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                {/* Automation Results */}
                <Card className="shadow-md border-t-4 border-t-green-500">
                        <CardHeader className="bg-green-50/50 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-green-900">Automation Results</CardTitle>
                                    <CardDescription>External data verification status</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {caseDetail.enrichment || caseDetail.automationResults ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(caseDetail.enrichment?.companiesHouse || caseDetail.automationResults?.companiesHouse) && (
                                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${getAutomationStatusColor(caseDetail.enrichment?.companiesHouse?.status || caseDetail.automationResults?.companiesHouse?.status)} transition-all hover:shadow-md`}>
                                            <div className="flex items-center gap-3">
                                                {getAutomationStatusIcon(caseDetail.enrichment?.companiesHouse?.status || caseDetail.automationResults?.companiesHouse?.status)}
                                                <div>
                                                    <div className="font-semibold">Companies House</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{caseDetail.enrichment?.companiesHouse?.status || caseDetail.automationResults?.companiesHouse?.status || 'N/A'}</div>
                                                    {caseDetail.enrichment?.companiesHouse?.companyNumber && (
                                                        <div className="text-xs text-muted-foreground">Reg: {caseDetail.enrichment.companiesHouse.companyNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(caseDetail.enrichment?.fca || caseDetail.automationResults?.fca) && (
                                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${getAutomationStatusColor(caseDetail.enrichment?.fca?.status || caseDetail.automationResults?.fca?.status)} transition-all hover:shadow-md`}>
                                            <div className="flex items-center gap-3">
                                                {getAutomationStatusIcon(caseDetail.enrichment?.fca?.status || caseDetail.automationResults?.fca?.status)}
                                                <div>
                                                    <div className="font-semibold">FCA</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{caseDetail.enrichment?.fca?.status || caseDetail.automationResults?.fca?.status || 'N/A'}</div>
                                                    {caseDetail.enrichment?.fca?.firmReferenceNumber && (
                                                        <div className="text-xs text-muted-foreground">FRN: {caseDetail.enrichment.fca.firmReferenceNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(caseDetail.enrichment?.dnb || caseDetail.automationResults?.dAndB) && (
                                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${getAutomationStatusColor(caseDetail.enrichment?.dnb?.status || caseDetail.automationResults?.dAndB?.status)} transition-all hover:shadow-md`}>
                                            <div className="flex items-center gap-3">
                                                {getAutomationStatusIcon(caseDetail.enrichment?.dnb?.status || caseDetail.automationResults?.dAndB?.status)}
                                                <div>
                                                    <div className="font-semibold">D&B</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{caseDetail.enrichment?.dnb?.status || caseDetail.automationResults?.dAndB?.status || 'N/A'}</div>
                                                    {caseDetail.enrichment?.dnb?.dunsNumber && (
                                                        <div className="text-xs text-muted-foreground">DUNS: {caseDetail.enrichment.dnb.dunsNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(caseDetail.enrichment?.lexisNexis || caseDetail.automationResults?.lexisNexis) && (
                                        <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${getAutomationStatusColor(caseDetail.enrichment?.lexisNexis?.status || caseDetail.automationResults?.lexisNexis?.status)} transition-all hover:shadow-md`}>
                                            <div className="flex items-center gap-3">
                                                {getAutomationStatusIcon(caseDetail.enrichment?.lexisNexis?.status || caseDetail.automationResults?.lexisNexis?.status)}
                                                <div>
                                                    <div className="font-semibold">LexisNexis</div>
                                                    <div className="text-sm text-muted-foreground capitalize">{caseDetail.enrichment?.lexisNexis?.status || caseDetail.automationResults?.lexisNexis?.status || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="font-medium">No enrichment data available</p>
                                    <p className="text-sm">Enrichment checks have not been run for this record</p>
                                </div>
                            )}
                        </CardContent>
                </Card>

                {/* Attachments */}
                <Card className="shadow-md border-t-4 border-t-orange-500">
                        <CardHeader className="bg-orange-50/50 border-b">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Download className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-orange-900">Attachments</CardTitle>
                                    <CardDescription>
                                        {caseDetail.attachments?.length || 0} file(s) attached
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {caseDetail.attachments && caseDetail.attachments.length > 0 ? (
                                <div className="grid gap-3">
                                    {caseDetail.attachments.map(att => (
                                        <div
                                            key={att.id}
                                            className="flex items-center justify-between p-4 rounded-lg border-2 border-orange-100 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-200 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{att.fileName}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {att.fileType} • Uploaded by {att.uploadedBy || 'System'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (att.downloadUrl && att.downloadUrl.startsWith('http')) {
                                                        window.open(att.downloadUrl, '_blank');
                                                    } else {
                                                        // If no valid download URL, show a message
                                                        alert(`Download URL not available for ${att.fileName}`);
                                                    }
                                                }}
                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="font-medium">No attachments found</p>
                                    <p className="text-sm">Files will appear here when added to the case</p>
                                </div>
                            )}
                    </CardContent>
                </Card>
            </div>

            {/* PAS Actions */}
            <div className="flex justify-end gap-3 pt-6">
                <Button
                    onClick={handleConvertToPas}
                    size="lg"
                    variant="outline"
                    disabled={isConvertingToPas}
                    className="shadow-md hover:shadow-lg transition-all"
                >
                    <FileJson className="mr-2 h-5 w-5" />
                    {isConvertingToPas ? "Converting..." : "Convert to PAS JSON"}
                </Button>
                <Button
                    onClick={() => router.push(`/kyc-records/${id}/send-to-pas`)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                >
                    <Send className="mr-2 h-5 w-5" />
                    Send to PAS
                </Button>
            </div>

            {/* API Request/Response Panel */}
            {apiInteraction && (
                <ApiInteractionPanel
                    request={apiInteraction.request}
                    response={apiInteraction.response}
                    timestamp={apiInteraction.timestamp}
                />
            )}

            {/* PAS JSON Viewer Dialog */}
            <JsonViewerDialog
                open={showPasJson}
                onOpenChange={setShowPasJson}
                title="PAS Client Process JSON"
                description="This is the generated PAS format for this KYC record"
                data={pasJsonData}
            />

            {/* Golden Record Viewer Dialog */}
            <JsonViewerDialog
                open={showGoldenRecord}
                onOpenChange={setShowGoldenRecord}
                title="🏆 Golden Record"
                description="Raw MongoDB record for this KYC case"
                data={caseDetail}
            />
        </div>
    )
}
