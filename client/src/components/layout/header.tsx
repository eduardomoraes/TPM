import { useState } from "react";
import { Search, Bell, Plus, Filter, Calendar, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PromotionForm from "@/components/promotions/promotion-form";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  accountFilter?: string;
  onAccountFilterChange?: (account: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export default function Header({ 
  searchQuery = "",
  onSearchChange,
  dateRange = "all",
  onDateRangeChange,
  accountFilter = "all",
  onAccountFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
}: HeaderProps) {
  const [isNewPromotionOpen, setIsNewPromotionOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Monitor your trade promotion performance and activities</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Global Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search promotions, accounts..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Filter Button */}
          {onSearchChange && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select value={dateRange} onValueChange={onDateRangeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Account</label>
                    <Select value={accountFilter} onValueChange={onAccountFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        <SelectItem value="walmart">Walmart</SelectItem>
                        <SelectItem value="kroger">Kroger</SelectItem>
                        <SelectItem value="target">Target</SelectItem>
                        <SelectItem value="amazon">Amazon Fresh</SelectItem>
                        <SelectItem value="costco">Costco</SelectItem>
                        <SelectItem value="wholefoods">Whole Foods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onDateRangeChange?.("all");
                        onAccountFilterChange?.("all");
                        onStatusFilterChange?.("all");
                        onSearchChange?.("");
                      }}
                    >
                      Clear All
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center p-0">
              3
            </Badge>
          </button>

          {/* Quick Actions */}
          <Dialog open={isNewPromotionOpen} onOpenChange={setIsNewPromotionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Promotion</DialogTitle>
              </DialogHeader>
              <PromotionForm onSuccess={() => setIsNewPromotionOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
