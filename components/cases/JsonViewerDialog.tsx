"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface JsonViewerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    data: any
}

export function JsonViewerDialog({ open, onOpenChange, title, description, data }: JsonViewerDialogProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            setCopied(true)
            toast.success("JSON copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Failed to copy to clipboard")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="flex justify-end mb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy JSON
                            </>
                        )}
                    </Button>
                </div>
                <div className="flex-1 overflow-auto border rounded-lg bg-slate-950 p-4">
                    <pre className="text-sm text-slate-50 font-mono">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    )
}
