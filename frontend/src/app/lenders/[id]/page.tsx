"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Loader2,
    Building2,
    FileText,
} from "lucide-react";
import { Lender, LenderPolicy, LenderPolicyCreate } from "@/types/api";
import { getLender, updateLender, addPolicy, updatePolicy, deletePolicy, deleteLender } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function LenderDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [lender, setLender] = useState<Lender | null>(null);
    const [loading, setLoading] = useState(true);
    const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<LenderPolicy | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteLenderDialogOpen, setDeleteLenderDialogOpen] = useState(false);
    const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

    const [policyForm, setPolicyForm] = useState<LenderPolicyCreate>({
        program_name: "",
        fico_min: null,
        fico_max: null,
        paynet_min: null,
        min_years_in_business: null,
        min_annual_revenue: null,
        min_amount: null,
        max_amount: null,
        min_term: null,
        max_term: null,
        max_equipment_age: null,
        allowed_equipment_types: null,
        allowed_states: null,
        excluded_states: null,
        excluded_industries: null,
        no_bankruptcy: true,
        no_open_tax_liens: true,
    });

    useEffect(() => {
        fetchLender();
    }, [id]);

    async function fetchLender() {
        try {
            const data = await getLender(id);
            setLender(data);
        } catch (err) {
            toast.error("Failed to load lender");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openAddPolicy() {
        setEditingPolicy(null);
        setPolicyForm({
            program_name: "",
            fico_min: null,
            fico_max: null,
            paynet_min: null,
            min_years_in_business: null,
            min_annual_revenue: null,
            min_amount: null,
            max_amount: null,
            min_term: null,
            max_term: null,
            max_equipment_age: null,
            allowed_equipment_types: null,
            allowed_states: null,
            excluded_states: null,
            excluded_industries: null,
            no_bankruptcy: true,
            no_open_tax_liens: true,
        });
        setPolicyDialogOpen(true);
    }

    function openEditPolicy(policy: LenderPolicy) {
        setEditingPolicy(policy);
        setPolicyForm({
            program_name: policy.program_name,
            fico_min: policy.fico_min,
            fico_max: policy.fico_max,
            paynet_min: policy.paynet_min,
            min_years_in_business: policy.min_years_in_business,
            min_annual_revenue: policy.min_annual_revenue,
            min_amount: policy.min_amount,
            max_amount: policy.max_amount,
            min_term: policy.min_term,
            max_term: policy.max_term,
            max_equipment_age: policy.max_equipment_age,
            allowed_equipment_types: policy.allowed_equipment_types,
            allowed_states: policy.allowed_states,
            excluded_states: policy.excluded_states,
            excluded_industries: policy.excluded_industries,
            no_bankruptcy: policy.no_bankruptcy,
            no_open_tax_liens: policy.no_open_tax_liens,
        });
        setPolicyDialogOpen(true);
    }

    async function handleSavePolicy(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingPolicy) {
                await updatePolicy(id, editingPolicy.id, policyForm);
                toast.success("Policy updated");
            } else {
                await addPolicy(id, policyForm);
                toast.success("Policy added");
            }
            setPolicyDialogOpen(false);
            fetchLender();
        } catch (err) {
            toast.error("Failed to save policy");
            console.error(err);
        } finally {
            setSaving(false);
        }
    }

    function openDeletePolicyDialog(policyId: string) {
        setSelectedPolicyId(policyId);
        setDeletePolicyDialogOpen(true);
    }

    async function handleDeletePolicy() {
        if (!selectedPolicyId) return;
        try {
            await deletePolicy(id, selectedPolicyId);
            toast.success("Policy deleted");
            setDeletePolicyDialogOpen(false);
            setSelectedPolicyId(null);
            fetchLender();
        } catch (err) {
            toast.error("Failed to delete policy");
            console.error(err);
        }
    }

    async function handleDeleteLender() {
        try {
            await deleteLender(id);
            toast.success("Lender deleted");
            router.push("/lenders");
        } catch (err) {
            toast.error("Failed to delete lender");
            console.error(err);
        }
    }

    async function toggleActive() {
        if (!lender) return;
        try {
            await updateLender(id, { is_active: !lender.is_active });
            toast.success(`Lender ${!lender.is_active ? "activated" : "deactivated"}`);
            fetchLender();
        } catch (err) {
            toast.error("Failed to update lender");
            console.error(err);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading lender...</div>
            </div>
        );
    }

    if (!lender) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-medium">Lender not found</h2>
                <Button asChild className="mt-4">
                    <Link href="/lenders">Back to Lenders</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/lenders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">
                                    {lender.name}
                                </h1>
                                <Badge
                                    variant={lender.is_active ? "default" : "outline"}
                                    className={
                                        lender.is_active
                                            ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 cursor-pointer"
                                            : "text-muted-foreground cursor-pointer"
                                    }
                                    onClick={toggleActive}
                                >
                                    {lender.is_active ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            {lender.description && (
                                <p className="text-muted-foreground">{lender.description}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => setDeleteLenderDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Lender
                    </Button>
                </div>
            </div>

            {/* Policies */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Policies ({lender.policies.length})
                    </CardTitle>
                    <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={openAddPolicy}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Policy
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPolicy ? "Edit Policy" : "Add New Policy"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSavePolicy} className="space-y-6">
                                {/* Program Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="program_name">Program Name *</Label>
                                    <Input
                                        id="program_name"
                                        value={policyForm.program_name}
                                        onChange={(e) =>
                                            setPolicyForm((prev) => ({ ...prev, program_name: e.target.value }))
                                        }
                                        placeholder="Standard Equipment Finance"
                                        required
                                    />
                                </div>

                                {/* Credit Requirements */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Credit Requirements</h4>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>FICO Min</Label>
                                            <Input
                                                type="number"
                                                min="300"
                                                max="850"
                                                value={policyForm.fico_min ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        fico_min: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="650"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>FICO Max</Label>
                                            <Input
                                                type="number"
                                                min="300"
                                                max="850"
                                                value={policyForm.fico_max ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        fico_max: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="850"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>PayNet Min</Label>
                                            <Input
                                                type="number"
                                                value={policyForm.paynet_min ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        paynet_min: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Requirements */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Business Requirements</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Min Years in Business</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyForm.min_years_in_business ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        min_years_in_business: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="2"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Min Annual Revenue ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyForm.min_annual_revenue ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        min_annual_revenue: e.target.value ? parseFloat(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="500000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Parameters */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Loan Parameters</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Min Amount ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyForm.min_amount ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        min_amount: e.target.value ? parseFloat(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="25000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Amount ($)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyForm.max_amount ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        max_amount: e.target.value ? parseFloat(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="500000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Min Term (months)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={policyForm.min_term ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        min_term: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="12"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Term (months)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={policyForm.max_term ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        max_term: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="84"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Equipment */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Equipment</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Max Equipment Age (years)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyForm.max_equipment_age ?? ""}
                                                onChange={(e) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        max_equipment_age: e.target.value ? parseInt(e.target.value) : null,
                                                    }))
                                                }
                                                placeholder="10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Flags */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-muted-foreground">Eligibility Flags</h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>No Bankruptcy Required</Label>
                                            <Select
                                                value={policyForm.no_bankruptcy ? "true" : "false"}
                                                onValueChange={(value) =>
                                                    setPolicyForm((prev) => ({ ...prev, no_bankruptcy: value === "true" }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Yes</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>No Open Tax Liens Required</Label>
                                            <Select
                                                value={policyForm.no_open_tax_liens ? "true" : "false"}
                                                onValueChange={(value) =>
                                                    setPolicyForm((prev) => ({
                                                        ...prev,
                                                        no_open_tax_liens: value === "true",
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Yes</SelectItem>
                                                    <SelectItem value="false">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setPolicyDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Policy"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {lender.policies.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No policies configured</p>
                            <Button variant="link" className="mt-2" onClick={openAddPolicy}>
                                Add your first policy
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Program</TableHead>
                                    <TableHead>FICO Range</TableHead>
                                    <TableHead>Amount Range</TableHead>
                                    <TableHead>Term Range</TableHead>
                                    <TableHead>Business Req.</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lender.policies.map((policy) => (
                                    <TableRow key={policy.id}>
                                        <TableCell className="font-medium">{policy.program_name}</TableCell>
                                        <TableCell>
                                            {policy.fico_min || policy.fico_max
                                                ? `${policy.fico_min || "N/A"} - ${policy.fico_max || "N/A"}`
                                                : "Any"}
                                        </TableCell>
                                        <TableCell>
                                            {policy.min_amount || policy.max_amount
                                                ? `$${(policy.min_amount || 0).toLocaleString()} - $${(
                                                    policy.max_amount || 999999999
                                                ).toLocaleString()}`
                                                : "Any"}
                                        </TableCell>
                                        <TableCell>
                                            {policy.min_term || policy.max_term
                                                ? `${policy.min_term || 1} - ${policy.max_term || 120} mo`
                                                : "Any"}
                                        </TableCell>
                                        <TableCell>
                                            {policy.min_years_in_business
                                                ? `${policy.min_years_in_business}+ yrs`
                                                : "Any"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditPolicy(policy)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => openDeletePolicyDialog(policy.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Lender Confirmation */}
            <ConfirmDialog
                open={deleteLenderDialogOpen}
                onOpenChange={setDeleteLenderDialogOpen}
                title="Delete Lender"
                description="Are you sure you want to delete this lender? All associated policies will also be deleted. This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDeleteLender}
                variant="destructive"
            />

            {/* Delete Policy Confirmation */}
            <ConfirmDialog
                open={deletePolicyDialogOpen}
                onOpenChange={setDeletePolicyDialogOpen}
                title="Delete Policy"
                description="Are you sure you want to delete this policy? This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDeletePolicy}
                variant="destructive"
            />
        </div>
    );
}
