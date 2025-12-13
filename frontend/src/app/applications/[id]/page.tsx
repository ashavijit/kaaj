"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Building2,
    User,
    CreditCard,
    PlayCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { LoanApplication, MatchResult, Lender } from "@/types/api";
import { getApplication, getMatches, getLenders, runUnderwriting } from "@/lib/api";
import { toast } from "sonner";
import { MatchResultsDisplay } from "@/components/match-results";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ApplicationDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [application, setApplication] = useState<LoanApplication | null>(null);
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [lenders, setLenders] = useState<Lender[]>([]);
    const [loading, setLoading] = useState(true);
    const [underwriting, setUnderwriting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    async function fetchData() {
        try {
            const [app, lnds] = await Promise.all([
                getApplication(id),
                getLenders(),
            ]);
            setApplication(app);
            setLenders(lnds);

            // Try to get matches if they exist
            try {
                const matchResults = await getMatches(id);
                setMatches(matchResults);
            } catch {
                // No matches yet
                setMatches([]);
            }
        } catch (err) {
            toast.error("Failed to load application");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRunUnderwriting() {
        setUnderwriting(true);
        try {
            const result = await runUnderwriting(id);
            setMatches(result.matches);
            toast.success(`Underwriting complete! ${result.eligible_count}/${result.total_lenders} lenders eligible`);
            // Refresh to update status
            const app = await getApplication(id);
            setApplication(app);
        } catch (err) {
            toast.error("Failed to run underwriting");
            console.error(err);
        } finally {
            setUnderwriting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading application...</div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-medium">Application not found</h2>
                <Button asChild className="mt-4">
                    <Link href="/applications">Back to Applications</Link>
                </Button>
            </div>
        );
    }

    const { borrower } = application;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                    </Badge>
                );
            case "submitted":
                return (
                    <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                        <AlertCircle className="mr-1 h-3 w-3" />
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/applications">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">
                                {borrower.business_name}
                            </h1>
                            {getStatusBadge(application.status)}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Application ID: {application.id}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleRunUnderwriting}
                    disabled={underwriting}
                >
                    {underwriting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Run Underwriting
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="details" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="details">Application Details</TabsTrigger>
                    <TabsTrigger value="matches">
                        Match Results
                        {matches.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {matches.filter((m) => m.eligible).length}/{matches.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Business Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Business Name</p>
                                        <p className="font-medium">{borrower.business_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Industry</p>
                                        <p className="font-medium">{borrower.industry}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">State</p>
                                        <p className="font-medium">{borrower.state}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Years in Business</p>
                                        <p className="font-medium">{borrower.years_in_business}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Annual Revenue</p>
                                        <p className="font-medium">${borrower.annual_revenue.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">PayNet Score</p>
                                        <p className="font-medium">{borrower.paynet_score || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Loan Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                    Loan Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Amount</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ${application.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Term</p>
                                        <p className="font-medium">{application.term_months} months</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Equipment Type</p>
                                        <p className="font-medium">{application.equipment_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Equipment Age</p>
                                        <p className="font-medium">{application.equipment_age_years} years</p>
                                    </div>
                                </div>
                                {application.equipment_description && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="font-medium">{application.equipment_description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Guarantors */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-500" />
                                    Guarantors ({borrower.guarantors.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {borrower.guarantors.map((guarantor) => (
                                        <div
                                            key={guarantor.id}
                                            className="p-4 rounded-lg bg-accent/50 border"
                                        >
                                            <p className="font-medium">{guarantor.name}</p>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">FICO Score</span>
                                                    <span className="font-medium">{guarantor.fico_score}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Bankruptcy</span>
                                                    <span>
                                                        {guarantor.has_bankruptcy ? (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tax Liens</span>
                                                    <span>
                                                        {guarantor.has_open_tax_liens ? (
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="matches">
                    <MatchResultsDisplay matches={matches} lenders={lenders} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
