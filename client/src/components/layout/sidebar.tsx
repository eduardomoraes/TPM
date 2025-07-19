import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Calendar, DollarSign, BarChart3, Receipt, Settings, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [currentRole, setCurrentRole] = useState("Sales Manager");

  const navigation = [
    { name: "Dashboard", href: "/", icon: TrendingUp, current: location === "/" },
    { name: "Promotion Calendar", href: "/promotions", icon: Calendar, current: location === "/promotions" },
    { name: "Budget Management", href: "/budget", icon: DollarSign, current: location === "/budget" },
    { name: "Forecasting", href: "/forecasting", icon: BarChart3, current: location === "/forecasting" },
    { name: "Deductions", href: "/deductions", icon: Receipt, current: location === "/deductions" },
    { name: "Analytics & ROI", href: "/analytics", icon: Target, current: location === "/analytics" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo and Company */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white text-lg" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">TPM Platform</h1>
            <p className="text-sm text-gray-500">Trade Promotion Mgmt</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "text-white bg-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>

        {/* Role Switcher */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Current Role
          </label>
          <Select value={currentRole} onValueChange={setCurrentRole}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales Manager">Sales Manager</SelectItem>
              <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
              <SelectItem value="Trade Development">Trade Development</SelectItem>
              <SelectItem value="Executive">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{currentRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
