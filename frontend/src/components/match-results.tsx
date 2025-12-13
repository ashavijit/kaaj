"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    CheckCircle2,
    XCircle,
    ChevronDown,
    Trophy,
    AlertTriangle,
    Building2,
} from "lucide-react";
import { MatchResult, Lender } from "@/types/api";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MatchResultsDisplayProps {
    matches: MatchResult[];
    lenders: Lender[];
}

export function MatchResultsDisplay({ matches, lenders }: MatchResultsDisplayProps) {
    const getLenderName = (lenderId: string) => {
        const lender = lenders.find((l) => l.id === lenderId);
        return lender?.name || "Unknown Lender";
    };

    const getProgramName = (lenderId: string, policyId: string) => {
        const lender = lenders.find((l) => l.id === lenderId);
        const policy = lender?.policies.find((p) => p.id === policyId);
        return policy?.program_name || "Unknown Program";
    };

    const eligibleMatches = matches.filter((m) => m.eligible);
    const ineligibleMatches = matches.filter((m) => !m.eligible);

    if (matches.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Match Results</h3>
                    <p className="text-muted-foreground">
                        Run underwriting to see which lenders match this application.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{matches.length}</p>
                            <p className="text-sm text-muted-foreground">Total Lenders Evaluated</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{eligibleMatches.length}</p>
                            <p className="text-sm text-muted-foreground">Eligible Lenders</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{ineligibleMatches.length}</p>
                            <p className="text-sm text-muted-foreground">Ineligible Lenders</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Eligible Matches */}
            {eligibleMatches.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Eligible Lenders ({eligibleMatches.length})
                    </h3>
                    <div className="space-y-3">
                        {eligibleMatches
                            .sort((a, b) => b.fit_score - a.fit_score)
                            .map((match, index) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    lenderName={getLenderName(match.lender_id)}
                                    programName={getProgramName(match.lender_id, match.policy_id)}
                                    isTop={index === 0}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Ineligible Matches */}
            {ineligibleMatches.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle className="h-5 w-5" />
                        Ineligible Lenders ({ineligibleMatches.length})
                    </h3>
                    <div className="space-y-3">
                        {ineligibleMatches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                lenderName={getLenderName(match.lender_id)}
                                programName={getProgramName(match.lender_id, match.policy_id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface MatchCardProps {
    match: MatchResult;
    lenderName: string;
    programName: string;
    isTop?: boolean;
}

function MatchCard({ match, lenderName, programName, isTop }: MatchCardProps) {
    const [open, setOpen] = useState(isTop);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <Card
                className={cn(
                    "transition-all",
                    match.eligible
                        ? "hover:border-green-500/30"
                        : "hover:border-red-500/30",
                    isTop && "ring-2 ring-green-500/30"
                )}
            >
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isTop && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                                        <Trophy className="h-4 w-4 text-amber-500" />
                                    </div>
                                )}
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {lenderName}
                                        {match.eligible ? (
                                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                                                Eligible
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
                                                Ineligible
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">{programName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {match.eligible && (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Fit Score</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            {match.fit_score.toFixed(1)}
                                        </p>
                                    </div>
                                )}
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 text-muted-foreground transition-transform",
                                        open && "rotate-180"
                                    )}
                                />
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Criteria Met */}
                            {match.criteria_met && match.criteria_met.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Criteria Met ({match.criteria_met.length})
                                    </h4>
                                    <div className="space-y-1">
                                        {match.criteria_met.map((c, i) => (
                                            <div
                                                key={i}
                                                className="text-sm p-2 rounded bg-green-500/10 border border-green-500/20"
                                            >
                                                <span className="font-medium">{c.criteria}</span>
                                                {c.value !== undefined && c.required && (
                                                    <span className="text-muted-foreground">
                                                        : {c.value} (required: {c.required})
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Criteria Failed */}
                            {match.criteria_failed && match.criteria_failed.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                        <XCircle className="h-4 w-4" />
                                        Criteria Failed ({match.criteria_failed.length})
                                    </h4>
                                    <div className="space-y-1">
                                        {match.criteria_failed.map((c, i) => (
                                            <div
                                                key={i}
                                                className="text-sm p-2 rounded bg-red-500/10 border border-red-500/20"
                                            >
                                                <span className="font-medium">{c.criteria}</span>
                                                {c.reason && (
                                                    <p className="text-muted-foreground text-xs mt-1">
                                                        {c.reason}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Rejection Reasons */}
                        {match.rejection_reasons && match.rejection_reasons.length > 0 && (
                            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20">
                                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mb-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Rejection Reasons
                                </h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    {match.rejection_reasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
