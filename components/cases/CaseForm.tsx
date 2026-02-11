"use client"

import { useForm } from "react-hook-form"
import type { FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { caseSchema, CaseFormValues } from "@/schemas/case.schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

interface CaseFormProps {
    defaultValues?: Partial<CaseFormValues>
    onSubmit: (data: CaseFormValues) => void
    isLoading?: boolean
    isEdit?: boolean
}

export function CaseForm({ defaultValues, onSubmit, isLoading, isEdit }: CaseFormProps) {
    const router = useRouter()

    const initialDefaults: CaseFormValues = {
        entityName: "",
        status: "ONBOARDING_COMPLETE",
        riskTier: "Lower Risk",
        assignedUser: "",
        businessUnit: "",
        beForm: {
            legalName: "",
            tradingName: "",
            country: "",
            roleType: "",
            addressLine1: "",
            city: "",
            postcode: "",
            registrationNumber: "",
            customerType: "Medium",
            statementEmail: "",
            creditControllerEmail: "",
            bankDetailsRequired: false,
            addressLine2: null,
            bankName: null,
            bankAccountNumber: null,
            bankSortCode: null,
        },
        automationResults: {
            companiesHouse: { status: "pending" },
            fca: { status: "pending" },
            dAndB: { status: "pending" },
            lexisNexis: { status: "pending" }
        },
        attachments: []
    }

    const form = useForm<CaseFormValues>({
        resolver: zodResolver(caseSchema) as any,
        defaultValues: {
            ...initialDefaults,
            ...defaultValues,
        } as any,
    })

    const findFirstErrorPath = (errors: FieldErrors<CaseFormValues>, parent = ""): string | null => {
        for (const key in errors) {
            const fieldError = errors[key as keyof typeof errors] as any
            const path = parent ? `${parent}.${key}` : key

            if (fieldError?.message) {
                return path
            }

            if (fieldError && typeof fieldError === "object") {
                const nestedPath = findFirstErrorPath(fieldError, path)
                if (nestedPath) {
                    return nestedPath
                }
            }
        }

        return null
    }

    const handleInvalidSubmit = (errors: FieldErrors<CaseFormValues>) => {
        const firstErrorPath = findFirstErrorPath(errors)
        if (firstErrorPath) {
            form.setFocus(firstErrorPath as any)

            const field = document.querySelector(`[name="${firstErrorPath}"]`)
            field?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-8 pb-12">
                {Object.keys(form.formState.errors).length > 0 && (
                    <p className="text-sm font-medium text-destructive">
                        Please correct the highlighted fields before continuing.
                    </p>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Case Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-8 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="entityName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entity Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Corp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="assignedUser"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned User</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="businessUnit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select business unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper" sideOffset={4}>
                                            <SelectItem value="Ardonagh Specialty">Ardonagh Specialty</SelectItem>
                                            <SelectItem value="Price Forbes">Price Forbes</SelectItem>
                                            <SelectItem value="Bishopsgate">Bishopsgate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="riskTier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Risk Tier</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select risk tier" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper" sideOffset={4}>
                                            <SelectItem value="Lower Risk">Lower Risk</SelectItem>
                                            <SelectItem value="Higher Risk">Higher Risk</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isEdit && (
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent position="popper" sideOffset={4}>
                                                <SelectItem value="ONBOARDING_COMPLETE">Onboarding Complete</SelectItem>
                                                <SelectItem value="AUTOMATION_IN_PROGRESS">Automation In Progress</SelectItem>
                                                <SelectItem value="AWAITING_KYC_REVIEW">Awaiting KYC Review</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>BE Form Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-8 md:grid-cols-2">
                            <FormField control={form.control} name="beForm.legalName" render={({ field }) => (
                                <FormItem><FormLabel>Legal Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.tradingName" render={({ field }) => (
                                <FormItem><FormLabel>Trading Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.registrationNumber" render={({ field }) => (
                                <FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.customerType" render={({ field }) => (
                                <FormItem><FormLabel>Customer Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent position="popper" sideOffset={4}>
                                            <SelectItem value="Micro">Micro</SelectItem>
                                            <SelectItem value="Small">Small</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Large">Large</SelectItem>
                                            <SelectItem value="Consumer">Consumer</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.roleType" render={({ field }) => (
                                <FormItem><FormLabel>Role Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.addressLine1" render={({ field }) => (
                                <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.postcode" render={({ field }) => (
                                <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.statementEmail" render={({ field }) => (
                                <FormItem><FormLabel>Statement Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="beForm.creditControllerEmail" render={({ field }) => (
                                <FormItem><FormLabel>Credit Controller Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : isEdit ? "Update Case" : "Create Case"}</Button>
                </div>
            </form>
        </Form>
    )
}
