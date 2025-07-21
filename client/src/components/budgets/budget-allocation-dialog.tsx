import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertBudgetAllocationSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const budgetAllocationFormSchema = insertBudgetAllocationSchema;
type BudgetAllocationFormData = z.infer<typeof budgetAllocationFormSchema>;

interface BudgetAllocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BudgetAllocationDialog({ isOpen, onClose }: BudgetAllocationDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [existingBudget, setExistingBudget] = useState<any>(null);
  const [pendingData, setPendingData] = useState<BudgetAllocationFormData | null>(null);

  const { data: accounts } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const form = useForm<BudgetAllocationFormData>({
    resolver: zodResolver(budgetAllocationFormSchema),
    defaultValues: {
      accountId: undefined,
      quarter: "",
      allocatedAmount: "0",
    },
  });

  const createBudgetAllocationMutation = useMutation({
    mutationFn: async (data: BudgetAllocationFormData & { action?: 'replace' | 'add' }) => {
      return await apiRequest("POST", "/api/budgets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets/quarter"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({
        title: "Success",
        description: "Budget allocation updated successfully",
      });
      form.reset();
      setShowDuplicateDialog(false);
      setExistingBudget(null);
      setPendingData(null);
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to create budget allocation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BudgetAllocationFormData) => {
    // Check for existing budget allocation with same account and quarter
    const existing = Array.isArray(budgets) && budgets.find((budget: any) => 
      budget.accountId === data.accountId && budget.quarter === data.quarter
    );

    if (existing) {
      setExistingBudget(existing);
      setPendingData(data);
      setShowDuplicateDialog(true);
    } else {
      createBudgetAllocationMutation.mutate(data);
    }
  };

  const handleDuplicateAction = (action: 'replace' | 'add') => {
    if (pendingData) {
      createBudgetAllocationMutation.mutate({
        ...pendingData,
        action
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const quarters = [
    `Q1-${currentYear}`,
    `Q2-${currentYear}`,
    `Q3-${currentYear}`,
    `Q4-${currentYear}`,
    `Q1-${currentYear + 1}`,
    `Q2-${currentYear + 1}`,
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Allocate Budget</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(accounts) && accounts.map((account: any) => (
                            <SelectItem key={account.id} value={account.id.toString()}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quarter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quarter</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quarter" />
                        </SelectTrigger>
                        <SelectContent>
                          {quarters.map((quarter) => (
                            <SelectItem key={quarter} value={quarter}>
                              {quarter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allocatedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocated Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter budget amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-white hover:bg-blue-700"
                disabled={createBudgetAllocationMutation.isPending}
              >
                {createBudgetAllocationMutation.isPending ? "Creating..." : "Allocate Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Budget Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              A budget allocation for{" "}
              <strong>
                {existingBudget?.account?.name || (Array.isArray(accounts) && accounts.find((a: any) => a.id === existingBudget?.accountId)?.name)}
              </strong>{" "}
              in <strong>{existingBudget?.quarter}</strong> already exists with{" "}
              <strong>${Number(existingBudget?.allocatedAmount || 0).toLocaleString()}</strong>.
              <br /><br />
              Would you like to:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDuplicateAction('add')}
              disabled={createBudgetAllocationMutation.isPending}
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Add to Existing ({Number(existingBudget?.allocatedAmount || 0) + Number(pendingData?.allocatedAmount || 0)})
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => handleDuplicateAction('replace')}
              disabled={createBudgetAllocationMutation.isPending}
            >
              Replace Current
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}