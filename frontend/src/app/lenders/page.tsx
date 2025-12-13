"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Plus,
  Building2,
  Search,
  ArrowRight,
  Loader2,
  MoreHorizontal,
  Power
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Lender, LenderCreate } from "@/types/api";
import { getLenders, createLender, updateLender } from "@/lib/api";
import { toast } from "sonner";

export default function LendersPage() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLender, setNewLender] = useState<LenderCreate>({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchLenders();
  }, []);

  async function fetchLenders() {
    try {
      const data = await getLenders();
      setLenders(data);
    } catch (err) {
      toast.error("Failed to load lenders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLender(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await createLender(newLender);
      toast.success("Lender created successfully");
      setDialogOpen(false);
      setNewLender({ name: "", description: "", is_active: true });
      fetchLenders();
    } catch (err) {
      toast.error("Failed to create lender");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(lender: Lender) {
    // Optimistic update
    const originalLenders = [...lenders];
    setLenders(lenders.map(l => l.id === lender.id ? { ...l, is_active: !l.is_active } : l));

    try {
      await updateLender(lender.id, { is_active: !lender.is_active });
      toast.success(`${lender.name} is now ${!lender.is_active ? "active" : "inactive"}`);
    } catch (err) {
      setLenders(originalLenders); // Revert on failure
      toast.error("Failed to update status");
    }
  }

  const filteredLenders = lenders.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lenders</h1>
          <p className="text-muted-foreground mt-1">
            Manage your network of financial partners.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Lender
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lender</DialogTitle>
              <DialogDescription>
                Configure the basic details for a new lending partner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLender} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Lender Name</Label>
                <Input
                  id="name"
                  value={newLender.name}
                  onChange={(e) => setNewLender((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Chase Bank"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newLender.description || ""}
                  onChange={(e) => setNewLender((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Commercial real estate specialist"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lender
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lenders by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LendersSkeleton />
      ) : filteredLenders.length === 0 ? (
        <EmptyState 
           searchMode={lenders.length > 0} 
           onReset={() => setSearch("")} 
           onAdd={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredLenders.map((lender) => (
            <Card key={lender.id} className="group relative flex flex-col transition-all hover:shadow-md border-border/60">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => toggleActive(lender)}>
                          <Power className="mr-2 h-4 w-4" />
                          {lender.is_active ? "Deactivate" : "Activate"}
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1 mt-4">
                  <CardTitle className="line-clamp-1">{lender.name}</CardTitle>
                  <CardDescription className="line-clamp-2 h-10">
                    {lender.description || "No description provided."}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                 <div className="flex gap-2">
                    <Badge variant={lender.is_active ? "default" : "secondary"} className={lender.is_active ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-0" : ""}>
                      {lender.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                       {lender.policies.length} Policies
                    </Badge>
                 </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full group-hover:border-primary/50 transition-colors" asChild>
                  <Link href={`/lenders/${lender.id}`}>
                    Manage Rules <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Subcomponents ---

function LendersSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ searchMode, onReset, onAdd }: { searchMode: boolean, onReset: () => void, onAdd: () => void }) {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center animate-in fade-in-50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Building2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {searchMode ? "No lenders found" : "No lenders configured"}
      </h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
        {searchMode 
          ? "We couldn't find any lenders matching your search. Try checking for typos or clear filters." 
          : "Get started by adding your first lending partner to the platform."}
      </p>
      {searchMode ? (
        <Button variant="outline" onClick={onReset}>
           Clear Search
        </Button>
      ) : (
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lender
        </Button>
      )}
    </div>
  );
}