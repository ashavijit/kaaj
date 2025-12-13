"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    MoreHorizontal,
    Eye,
    Trash2,
    PlayCircle,
    FileText,
} from "lucide-react";
import { LoanApplication } from "@/types/api";
import { getApplications, deleteApplication, runUnderwriting } from "@/lib/api";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

export default function ApplicationsPage() {
    const router = useRouter();
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    async function fetchApplications() {
        try {
            const data = await getApplications();
            setApplications(data);
        } catch (err) {
            toast.error("Failed to load applications");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openDeleteDialog(id: string) {
        setSelectedApp(id);
        setDeleteDialogOpen(true);
    }

    async function handleDelete() {
        if (!selectedApp) return;
        try {
            await deleteApplication(selectedApp);
            toast.success("Application deleted");
            setDeleteDialogOpen(false);
            setSelectedApp(null);
            fetchApplications();
        } catch (err) {
            toast.error("Failed to delete application");
            console.error(err);
        }
    }

    async function handleRunUnderwriting(id: string) {
        try {
            toast.loading("Running underwriting...");
            await runUnderwriting(id);
            toast.dismiss();
            toast.success("Underwriting completed!");
            router.push(`/applications/${id}`);
        } catch (err) {
            toast.dismiss();
            toast.error("Failed to run underwriting");
            console.error(err);
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        Completed
                    </Badge>
                );
            case "submitted":
                return (
                    <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                        Submitted
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground">
                        Draft
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading applications...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        Applications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage loan applications and run underwriting
                    </p>
                </div>
                <Button asChild>
                    <Link href="/applications/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Application
                    </Link>
                </Button>
            </div>

            {/* Applications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                            <p className="mb-4">Create your first loan application to get started</p>
                            <Button asChild>
                                <Link href="/applications/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Application
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Equipment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{app.borrower.business_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {app.borrower.industry} • {app.borrower.state}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ${app.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{app.term_months} months</TableCell>
                                        <TableCell>{app.equipment_type}</TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/applications/${app.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleRunUnderwriting(app.id)}
                                                    >
                                                        <PlayCircle className="mr-2 h-4 w-4" />
                                                        Run Underwriting
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => openDeleteDialog(app.id)}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Application"
                description="Are you sure you want to delete this application? This action cannot be undone."
                confirmText="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />
        </div>
    );
}
