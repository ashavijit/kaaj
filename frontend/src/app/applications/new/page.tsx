"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { createApplication } from "@/lib/api";
import { LoanApplicationCreate, US_STATES, EQUIPMENT_TYPES, INDUSTRIES } from "@/types/api";
import { toast } from "sonner";

export default function NewApplicationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<LoanApplicationCreate>({
        borrower: {
            business_name: "",
            industry: "",
            state: "",
            years_in_business: 0,
            annual_revenue: 0,
            paynet_score: null,
            guarantors: [
                {
                    name: "",
                    fico_score: 0,
                    has_bankruptcy: 0,
                    has_open_tax_liens: 0,
                },
            ],
        },
        amount: 0,
        term_months: 12,
        equipment_type: "",
        equipment_age_years: 0,
        equipment_description: "",
    });

    const updateBorrower = (field: string, value: string | number | null) => {
        setFormData((prev) => ({
            ...prev,
            borrower: {
                ...prev.borrower,
                [field]: value,
            },
        }));
    };

    const updateGuarantor = (index: number, field: string, value: string | number) => {
        setFormData((prev) => {
            const guarantors = [...prev.borrower.guarantors];
            guarantors[index] = { ...guarantors[index], [field]: value };
            return {
                ...prev,
                borrower: {
                    ...prev.borrower,
                    guarantors,
                },
            };
        });
    };

    const addGuarantor = () => {
        setFormData((prev) => ({
            ...prev,
            borrower: {
                ...prev.borrower,
                guarantors: [
                    ...prev.borrower.guarantors,
                    { name: "", fico_score: 0, has_bankruptcy: 0, has_open_tax_liens: 0 },
                ],
            },
        }));
    };

    const removeGuarantor = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            borrower: {
                ...prev.borrower,
                guarantors: prev.borrower.guarantors.filter((_, i) => i !== index),
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createApplication(formData);
            toast.success("Application created successfully!");
            router.push(`/applications/${result.id}`);
        } catch (err) {
            toast.error("Failed to create application");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/applications">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        New Application
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new loan application
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                1
                            </span>
                            Borrower Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="business_name">Business Name *</Label>
                                <Input
                                    id="business_name"
                                    value={formData.borrower.business_name}
                                    onChange={(e) => updateBorrower("business_name", e.target.value)}
                                    placeholder="ABC Construction LLC"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry *</Label>
                                <Select
                                    value={formData.borrower.industry}
                                    onValueChange={(value) => updateBorrower("industry", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDUSTRIES.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Select
                                    value={formData.borrower.state}
                                    onValueChange={(value) => updateBorrower("state", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {US_STATES.map((state) => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="years_in_business">Years in Business *</Label>
                                <Input
                                    id="years_in_business"
                                    type="number"
                                    min="0"
                                    value={formData.borrower.years_in_business || ""}
                                    onChange={(e) =>
                                        updateBorrower("years_in_business", parseInt(e.target.value) || 0)
                                    }
                                    placeholder="5"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="annual_revenue">Annual Revenue ($) *</Label>
                                <Input
                                    id="annual_revenue"
                                    type="number"
                                    min="0"
                                    value={formData.borrower.annual_revenue || ""}
                                    onChange={(e) =>
                                        updateBorrower("annual_revenue", parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="1500000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paynet_score">PayNet Score</Label>
                                <Input
                                    id="paynet_score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.borrower.paynet_score || ""}
                                    onChange={(e) =>
                                        updateBorrower(
                                            "paynet_score",
                                            e.target.value ? parseInt(e.target.value) : null
                                        )
                                    }
                                    placeholder="720"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guarantor Information */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                2
                            </span>
                            Guarantor Information
                        </CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addGuarantor}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Guarantor
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {formData.borrower.guarantors.map((guarantor, index) => (
                            <div key={index} className="space-y-4">
                                {index > 0 && <Separator />}
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Guarantor {index + 1}</h4>
                                    {formData.borrower.guarantors.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeGuarantor(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Name *</Label>
                                        <Input
                                            value={guarantor.name}
                                            onChange={(e) => updateGuarantor(index, "name", e.target.value)}
                                            placeholder="John Smith"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>FICO Score *</Label>
                                        <Input
                                            type="number"
                                            min="300"
                                            max="850"
                                            value={guarantor.fico_score || ""}
                                            onChange={(e) =>
                                                updateGuarantor(index, "fico_score", parseInt(e.target.value) || 0)
                                            }
                                            placeholder="720"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bankruptcy</Label>
                                        <Select
                                            value={String(guarantor.has_bankruptcy)}
                                            onValueChange={(value) =>
                                                updateGuarantor(index, "has_bankruptcy", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No</SelectItem>
                                                <SelectItem value="1">Yes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Open Tax Liens</Label>
                                        <Select
                                            value={String(guarantor.has_open_tax_liens)}
                                            onValueChange={(value) =>
                                                updateGuarantor(index, "has_open_tax_liens", parseInt(value))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No</SelectItem>
                                                <SelectItem value="1">Yes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Loan Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                                3
                            </span>
                            Loan Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Loan Amount ($) *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    value={formData.amount || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            amount: parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    placeholder="150000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="term_months">Term (Months) *</Label>
                                <Input
                                    id="term_months"
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={formData.term_months || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            term_months: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    placeholder="60"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="equipment_type">Equipment Type *</Label>
                                <Select
                                    value={formData.equipment_type}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, equipment_type: value }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select equipment type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EQUIPMENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="equipment_age_years">Equipment Age (Years)</Label>
                                <Input
                                    id="equipment_age_years"
                                    type="number"
                                    min="0"
                                    value={formData.equipment_age_years || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            equipment_age_years: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    placeholder="2"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="equipment_description">Equipment Description</Label>
                                <Input
                                    id="equipment_description"
                                    value={formData.equipment_description || ""}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            equipment_description: e.target.value,
                                        }))
                                    }
                                    placeholder="Caterpillar Excavator 320"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild>
                        <Link href="/applications">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Application
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
