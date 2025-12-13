"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Building2,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Activity,
  CreditCard,
  DollarSign
} from "lucide-react";
import { LoanApplication, Lender } from "@/types/api";
import { getApplications, getLenders } from "@/lib/api";

export default function DashboardPage() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [apps, lnds] = await Promise.all([
          getApplications(),
          getLenders(),
        ]);
        setApplications(apps);
        setLenders(lnds);
      } catch (err) {
        setError("Failed to load dashboard data. Please verify backend connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = {
    totalApplications: applications.length,
    totalVolume: applications.reduce((acc, curr) => acc + curr.amount, 0),
    activeLenders: lenders.filter((l) => l.is_active).length,
    avgRate: "6.5%", // Placeholder for calculated metric
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your lending pipeline and partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/lenders">
              <Building2 className="mr-2 h-4 w-4" />
              Manage Lenders
            </Link>
          </Button>
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Volume" 
          value={formatCurrency(stats.totalVolume)} 
          description="Across all applications"
          icon={DollarSign}
        />
        <StatsCard 
          title="Active Applications" 
          value={stats.totalApplications.toString()} 
          description="In pipeline"
          icon={FileText}
        />
        <StatsCard 
          title="Active Lenders" 
          value={stats.activeLenders.toString()} 
          description={`${lenders.length} total integrated`}
          icon={Building2}
        />
        <StatsCard 
          title="Conversion Rate" 
          value={stats.avgRate} 
          description="Average approval rate"
          icon={Activity}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Recent Applications Table (Span 4) */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest loan requests from borrowers.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/applications">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            {applications.length === 0 ? (
               <EmptyState 
                 icon={FileText} 
                 title="No applications yet" 
                 actionLink="/applications/new" 
                 actionText="Create Application" 
               />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.slice(0, 5).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.borrower.business_name}
                        <div className="text-xs text-muted-foreground hidden md:block">
                          {app.borrower.industry || "General Industry"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(app.amount)}</div>
                        <div className="text-xs text-muted-foreground">{app.term_months} mo</div>
                      </TableCell>
                      <TableCell>
                         <StatusBadge status={app.status} />
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" asChild>
                           <Link href={`/applications/${app.id}`}>View</Link>
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Active Lenders List (Span 3) */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle>Partner Lenders</CardTitle>
              <CardDescription>
                Currently active funding sources.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/lenders">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
             {lenders.length === 0 ? (
               <EmptyState 
                 icon={Building2} 
                 title="No lenders connected" 
                 actionLink="/lenders" 
                 actionText="Add Lender" 
               />
             ) : (
               <div className="space-y-4">
                 {lenders.slice(0, 5).map((lender) => (
                   <div key={lender.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Building2 className="h-5 w-5" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{lender.name}</p>
                            <p className="text-xs text-muted-foreground">{lender.policies.length} Policies Configured</p>
                         </div>
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${lender.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                   </div>
                 ))}
               </div>
             )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// --- Subcomponents for cleaner code ---

function StatsCard({ title, value, description, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    completed: "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200",
    submitted: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200",
    draft: "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200",
    rejected: "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200",
  };
  
  // Default to gray if status unknown
  const className = styles[status as keyof typeof styles] || styles.draft;

  return (
    <Badge variant="outline" className={`capitalize ${className} border-0`}>
      {status}
    </Badge>
  );
}

function EmptyState({ icon: Icon, title, actionLink, actionText }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center h-full">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <Button variant="link" asChild className="mt-2 text-primary">
        <Link href={actionLink}>{actionText}</Link>
      </Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-4" />
        <Skeleton className="h-[400px] w-full rounded-xl lg:col-span-3" />
      </div>
    </div>
  );
}