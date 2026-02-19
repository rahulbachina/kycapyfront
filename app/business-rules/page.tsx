"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Table2, Code2, ChevronDown, ChevronRight, Globe, FileText, Shield, Zap, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface RulesData {
    version: string
    description: string
    lastUpdated: string
    schemaVersion: string
    countryRisk: {
        description: string
        source: string
        totalCountries: number
        lowerCount: number
        higherCount: number
        defaultIfUnknown: string
        LOWER: string[]
        HIGHER_note: string
    }
    roleTypes?: {
        description: string
        roles: Array<{ roleMain: string; roleSub: string }>
    }
    roleMapping: {
        description: string
        mappings: Record<string, { roleMain: string; description: string }>
        fallbackRules?: {
            description: string
            rules: Array<{ condition: string; result: string; confidence: string }>
        }
        sicCodeMapping?: Record<string, { description: string; defaultRole: string }>
    }
    rulesMatrix: {
        description: string
        rules: Array<{
            countryRisk: string
            roleMain: string
            roleSub: string
            finalRiskProfile: string
            documentSetCode: string
            cddLevel: string
        }>
    }
    clientClassificationFlags?: {
        description: string
        flags: Array<{ flagCode: string; description: string }>
    }
    tobaCatalog?: {
        description: string
        agreements: Array<{ tobaCode: string; jurisdiction: string; roleMain: string; legalEntity: string; description: string }>
    }
    questionnaireMapping?: {
        description: string
        mappings: Array<{ roleSub: string; questionnaireCode: string }>
    }
    documentSets: Record<string, any>
    validationChecks: Record<string, any>
    fcaEnrichment: Record<string, any>
    companiesHouseEnrichment: Record<string, any>
    goldenRecordSchema: Record<string, any>
    workflowMetadata: Record<string, any>
}

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, id, forceOpen, children }: {
    title: string
    icon: React.ElementType
    defaultOpen?: boolean
    id?: string
    forceOpen?: number
    children: React.ReactNode
}) {
    const [open, setOpen] = useState(defaultOpen)
    useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])
    return (
        <Card className="shadow-sm" id={id}>
            <button
                className="w-full text-left"
                onClick={() => setOpen(!open)}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">{title}</CardTitle>
                        </div>
                        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                </CardHeader>
            </button>
            {open && <CardContent className="pt-0">{children}</CardContent>}
        </Card>
    )
}

function SimpleTable({ headers, rows, colWidths }: {
    headers: string[]
    rows: (string | null | undefined)[][]
    colWidths?: string[]
}) {
    return (
        <div className="rounded-lg border overflow-x-auto">
            <table className={`w-full text-sm${colWidths ? ' table-fixed' : ''}`}>
                {colWidths && (
                    <colgroup>
                        {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                    </colgroup>
                )}
                <thead>
                    <tr className="bg-muted/40 border-b">
                        {headers.map(h => (
                            <th key={h} className="text-left p-3 font-semibold text-muted-foreground align-top">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="p-3 text-sm text-left align-top">{cell ?? "—"}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function InlineCollapsible({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="rounded-lg border overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                onClick={() => setOpen(!open)}
            >
                <span className="text-sm font-medium">
                    {title}{count !== undefined && <span className="ml-1.5 text-xs text-muted-foreground">({count})</span>}
                </span>
                {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {open && <div>{children}</div>}
        </div>
    )
}

function VisualiseTab({ data }: { data: RulesData }) {
    const [openCountryRisk, setOpenCountryRisk] = useState(0)
    const [openDocSets, setOpenDocSets] = useState(0)

    const scrollTo = (id: string, setter: React.Dispatch<React.SetStateAction<number>>) => {
        setter(n => n + 1)
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    const higherCountries = (() => {
        const note = data.countryRisk.HIGHER_note || ""
        const match = note.match(/to:\s*(.+)$/)
        if (!match) return []
        return match[1].split(",").map(s => s.trim()).filter(Boolean)
    })()
    return (
        <div className="space-y-6">
            {/* Rules Matrix - Primary Table */}
            <Card className="shadow-md border-t-4 border-t-blue-500">
                <CardHeader className="bg-blue-50/50 border-b">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Table2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <CardTitle className="text-blue-900">Rules Matrix</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 border-b">
                                    {["Country Risk", "Introducer Type", "Introducer Sub Type", "Final Risk Profile", "Document Set Code", "CDD Level"].map(h => (
                                        <th key={h} className="text-left p-3 font-semibold text-muted-foreground">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.rulesMatrix.rules.map((r, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                        <td className="p-3 text-sm text-left">
                                            <button
                                                className="text-blue-600 hover:underline hover:text-blue-800 font-medium"
                                                onClick={() => scrollTo('section-country-risk', setOpenCountryRisk)}
                                            >
                                                {r.countryRisk}
                                            </button>
                                        </td>
                                        <td className="p-3 text-sm text-left">{r.roleMain}</td>
                                        <td className="p-3 text-sm text-left">{r.roleSub}</td>
                                        <td className="p-3 text-sm text-left">{r.finalRiskProfile}</td>
                                        <td className="p-3 text-sm text-left">
                                            <button
                                                className="text-blue-600 hover:underline hover:text-blue-800 font-medium font-mono text-xs"
                                                onClick={() => scrollTo('section-document-sets', setOpenDocSets)}
                                            >
                                                {r.documentSetCode}
                                            </button>
                                        </td>
                                        <td className="p-3 text-sm text-left">{r.cddLevel}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Country Risk */}
            <CollapsibleSection title={`Country Risk (${data.countryRisk.totalCountries} countries)`} icon={Globe} id="section-country-risk" forceOpen={openCountryRisk}>
                <div className="space-y-4">
                    <SimpleTable
                        headers={["Metric", "Value"]}
                        rows={[
                            ["Total Countries", String(data.countryRisk.totalCountries)],
                            ["Lower Risk Count", String(data.countryRisk.lowerCount)],
                            ["Higher Risk Count", String(data.countryRisk.higherCount)],
                            ["Default (if unknown)", data.countryRisk.defaultIfUnknown],
                            ["Source", data.countryRisk.source],
                        ]}
                    />
                    <InlineCollapsible title="Lower Risk Countries" count={data.countryRisk.lowerCount}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/40 border-b">
                                    <th className="text-left p-3 font-semibold text-muted-foreground">Country</th>
                                    <th className="text-left p-3 font-semibold text-muted-foreground">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.countryRisk.LOWER.map(country => (
                                    <tr key={country} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                        <td className="p-3 text-sm text-left">{country}</td>
                                        <td className="p-3 text-sm text-left">LOWER</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </InlineCollapsible>
                    <InlineCollapsible title="Higher Risk Countries" count={higherCountries.length || data.countryRisk.higherCount}>
                        {higherCountries.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/40 border-b">
                                        <th className="text-left p-3 font-semibold text-muted-foreground">Country</th>
                                        <th className="text-left p-3 font-semibold text-muted-foreground">Risk Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {higherCountries.map(country => (
                                        <tr key={country} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                                            <td className="p-3 text-sm text-left">{country}</td>
                                            <td className="p-3 text-sm text-left">HIGHER</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-3 text-sm text-muted-foreground">
                                Any country not in the Lower Risk list is classified as HIGHER risk.
                            </p>
                        )}
                    </InlineCollapsible>
                </div>
            </CollapsibleSection>

            {/* Introducer Types and Sub Types */}
            {data.roleTypes && (
                <CollapsibleSection title={`Introducer Types and Sub Types (${data.roleTypes.roles.length})`} icon={Shield}>
                    <SimpleTable
                        headers={["Introducer Type", "Introducer Sub Type"]}
                        rows={data.roleTypes.roles.map(r => [r.roleMain, r.roleSub])}
                    />
                </CollapsibleSection>
            )}

            {/* Role Mapping */}
            <CollapsibleSection title="Role Mapping" icon={Shield}>
                <SimpleTable
                    headers={["Client Role Type", "Maps To (roleMain)", "Description"]}
                    rows={Object.entries(data.roleMapping.mappings).map(([key, val]) => [key, val.roleMain, val.description])}
                />
            </CollapsibleSection>

            {/* Validation Checks */}
            <CollapsibleSection title="Validation Checks" icon={Shield}>
                <div className="space-y-6">
                    {Object.entries(data.validationChecks)
                        .filter(([k]) => k !== 'description')
                        .map(([key, checks]: [string, any]) => {
                            if (!Array.isArray(checks) || checks.length === 0) return null
                            const label = key.replace(/([A-Z])/g, ' $1').trim()
                            return (
                                <div key={key}>
                                    <p className="text-sm font-semibold mb-2 capitalize">{label}</p>
                                    <SimpleTable
                                        headers={["Check Code", "Description", "Pass Condition", "Fail Condition", "Source", "Status", "Phase"]}
                                        colWidths={["13%", "19%", "24%", "24%", "10%", "6%", "4%"]}
                                        rows={checks.map((c: any) => [
                                            c.checkCode,
                                            c.description,
                                            c.passCondition ?? null,
                                            c.failCondition ?? null,
                                            c.source ?? null,
                                            c.status ?? null,
                                            c.phase != null ? String(c.phase) : null,
                                        ])}
                                    />
                                </div>
                            )
                        })}
                </div>
            </CollapsibleSection>

            {/* Fallback Rules */}
            {data.roleMapping.fallbackRules?.rules && (
                <CollapsibleSection title="Fallback Rules" icon={Shield}>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{data.roleMapping.fallbackRules.description}</p>
                        <SimpleTable
                            headers={["Condition", "Result", "Confidence"]}
                            rows={data.roleMapping.fallbackRules.rules.map((r: any) => [r.condition, r.result, r.confidence])}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {/* SIC Code Mapping */}
            {data.roleMapping.sicCodeMapping && (
                <CollapsibleSection title="SIC Code Mapping" icon={Shield}>
                    <SimpleTable
                        headers={["SIC Code", "Description", "Default Role"]}
                        rows={Object.entries(data.roleMapping.sicCodeMapping).map(([code, val]: [string, any]) => [code, val.description, val.defaultRole])}
                    />
                </CollapsibleSection>
            )}

            {/* Client Classification Flags */}
            {data.clientClassificationFlags && (
                <CollapsibleSection title="Client Classification Flags" icon={Shield}>
                    <SimpleTable
                        headers={["Flag Code", "Description"]}
                        rows={data.clientClassificationFlags.flags.map(f => [f.flagCode, f.description])}
                    />
                </CollapsibleSection>
            )}

            {/* TOBA Catalog */}
            {data.tobaCatalog && (
                <CollapsibleSection title="TOBA Catalog" icon={FileText}>
                    <SimpleTable
                        headers={["TOBA Code", "Jurisdiction", "Role", "Legal Entity", "Description"]}
                        rows={data.tobaCatalog.agreements.map(a => [a.tobaCode, a.jurisdiction, a.roleMain, a.legalEntity, a.description])}
                    />
                </CollapsibleSection>
            )}

            {/* Questionnaire Mapping */}
            {data.questionnaireMapping && (
                <CollapsibleSection title="Questionnaire Mapping" icon={FileText}>
                    <SimpleTable
                        headers={["Role Sub-Type", "Questionnaire Code"]}
                        rows={data.questionnaireMapping.mappings.map(m => [m.roleSub, m.questionnaireCode])}
                    />
                </CollapsibleSection>
            )}

            {/* Document Sets */}
            <CollapsibleSection title="Document Sets" icon={FileText} id="section-document-sets" forceOpen={openDocSets}>
                <div className="space-y-6">
                    {Object.entries(data.documentSets).map(([code, docSet]: [string, any]) => (
                        <div key={code}>
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-sm font-semibold">{code}</p>
                                {docSet.name && <span className="text-sm text-muted-foreground">{docSet.name}</span>}
                            </div>
                            {docSet.documents && Array.isArray(docSet.documents) && (
                                <SimpleTable
                                    headers={["Document Name", "Mandatory", "Automated", "Notes"]}
                                    rows={docSet.documents.map((doc: any) =>
                                        typeof doc === 'string'
                                            ? [doc, "—", "—", "—"]
                                            : [
                                                doc.documentName || doc.name || doc.document || "—",
                                                doc.mandatory !== undefined ? (doc.mandatory ? "Yes" : "No") : "—",
                                                doc.automated !== undefined ? (doc.automated ? "Yes" : "No") : "—",
                                                doc.notes || "—",
                                            ]
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </CollapsibleSection>

            {/* Workflow Metadata */}
            <CollapsibleSection title="Workflow Metadata" icon={Zap}>
                <SimpleTable
                    headers={["Property", "Value"]}
                    rows={Object.entries(data.workflowMetadata)
                        .filter(([, v]) => typeof v !== 'object')
                        .map(([key, val]) => [key.replace(/([A-Z])/g, ' $1').trim(), String(val)])}
                />
            </CollapsibleSection>

            {/* Agents */}
            {Array.isArray(data.workflowMetadata.agents) && (
                <CollapsibleSection title={`Agents (${data.workflowMetadata.agents.length})`} icon={Zap}>
                    <SimpleTable
                        headers={["Agent Name", "Purpose"]}
                        rows={data.workflowMetadata.agents.map((a: any) => [a.name, a.purpose])}
                    />
                </CollapsibleSection>
            )}
        </div>
    )
}

export default function BusinessRulesPage() {
    const [activeTab, setActiveTab] = useState<"visualise" | "raw">("visualise")
    const [data, setData] = useState<RulesData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetch('/business_rules.json')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [])

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleDownload = () => {
        if (!data) return
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'business_rules.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                Loading business rules...
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-8 text-destructive">
                Failed to load business rules: {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Business Rules</h2>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {data.description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">v{data.version}</Badge>
                        <Badge variant="outline">{data.schemaVersion}</Badge>
                        <Badge variant="outline">Updated {data.lastUpdated}</Badge>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Download JSON
                    </button>
                </div>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("visualise")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === "visualise"
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Table2 className="h-4 w-4" />
                    Visualise
                </button>
                <button
                    onClick={() => setActiveTab("raw")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === "raw"
                            ? "bg-white shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Code2 className="h-4 w-4" />
                    Raw JSON
                </button>
            </div>

            {/* Content */}
            {activeTab === "visualise" ? (
                <VisualiseTab data={data} />
            ) : (
                <Card className="shadow-md">
                    <CardHeader className="border-b flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base">Raw JSON</CardTitle>
                        <button
                            onClick={handleCopy}
                            className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted transition-colors"
                        >
                            {copied ? "Copied!" : "Copy JSON"}
                        </button>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <pre className="text-xs bg-muted/30 rounded-lg p-4 overflow-auto max-h-[75vh] font-mono whitespace-pre-wrap break-all">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
