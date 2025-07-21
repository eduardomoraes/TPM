import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Building2, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Save
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  department: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

interface Department {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export default function AdminUsers() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading2, setIsLoading2] = useState(false);

  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "Sales Manager",
    department: "",
    phone: "",
  });

  // Check if current user is Admin
  const isAdmin = (user as any)?.email === "eduardodmoraes@gmail.com";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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

    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  // Mock data for demonstration - in real app this would come from API
  const mockUsers: UserProfile[] = [
    {
      id: "14792220",
      email: "eduardodmoraes@gmail.com",
      firstName: "Eduardo",
      lastName: "Moraes",
      role: "Admin",
      department: "IT",
      phone: "+1 (555) 123-4567",
      isActive: true,
      lastLogin: "2025-01-21T20:00:00Z",
      createdAt: "2024-01-01T00:00:00Z",
      permissions: ["all"],
    },
    {
      id: "2",
      email: "sarah.johnson@company.com",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "Sales Manager",
      department: "Sales",
      phone: "+1 (555) 234-5678",
      isActive: true,
      lastLogin: "2025-01-21T18:30:00Z",
      createdAt: "2024-02-15T00:00:00Z",
      permissions: ["promotions", "calendar", "budget_view"],
    },
    {
      id: "3",
      email: "mike.chen@company.com",
      firstName: "Mike",
      lastName: "Chen",
      role: "Finance Analyst",
      department: "Finance",
      phone: "+1 (555) 345-6789",
      isActive: true,
      lastLogin: "2025-01-21T17:45:00Z",
      createdAt: "2024-03-10T00:00:00Z",
      permissions: ["budget", "analytics", "deductions"],
    },
    {
      id: "4",
      email: "jennifer.davis@company.com",
      firstName: "Jennifer",
      lastName: "Davis",
      role: "Trade Development",
      department: "Marketing",
      phone: "+1 (555) 456-7890",
      isActive: false,
      lastLogin: "2025-01-15T14:20:00Z",
      createdAt: "2024-04-20T00:00:00Z",
      permissions: ["forecasting", "promotions", "analytics_view"],
    },
    {
      id: "5",
      email: "robert.wilson@company.com",
      firstName: "Robert",
      lastName: "Wilson",
      role: "Executive",
      department: "Executive",
      phone: "+1 (555) 567-8901",
      isActive: true,
      lastLogin: "2025-01-21T16:00:00Z",
      createdAt: "2024-05-05T00:00:00Z",
      permissions: ["dashboard", "analytics", "reports"],
    },
  ];

  const mockDepartments: Department[] = [
    { id: "1", name: "IT", description: "Information Technology", userCount: 1 },
    { id: "2", name: "Sales", description: "Sales and Account Management", userCount: 1 },
    { id: "3", name: "Finance", description: "Financial Analysis and Budgeting", userCount: 1 },
    { id: "4", name: "Marketing", description: "Trade Marketing and Development", userCount: 1 },
    { id: "5", name: "Executive", description: "Executive Leadership", userCount: 1 },
  ];

  const mockRoles: Role[] = [
    {
      id: "1",
      name: "Admin",
      description: "Full system access and user management",
      permissions: ["all"],
      userCount: 1,
    },
    {
      id: "2",
      name: "Sales Manager",
      description: "Promotion planning and account management",
      permissions: ["promotions", "calendar", "budget_view"],
      userCount: 1,
    },
    {
      id: "3",
      name: "Finance Analyst",
      description: "Budget management and financial analysis",
      permissions: ["budget", "analytics", "deductions"],
      userCount: 1,
    },
    {
      id: "4",
      name: "Trade Development",
      description: "Forecasting and promotional strategy",
      permissions: ["forecasting", "promotions", "analytics_view"],
      userCount: 1,
    },
    {
      id: "5",
      name: "Executive",
      description: "High-level reporting and analytics",
      permissions: ["dashboard", "analytics", "reports"],
      userCount: 1,
    },
  ];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === "all" || user.department === selectedDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleCreateUser = async () => {
    setIsLoading2(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Created",
        description: `User ${newUser.firstName} ${newUser.lastName} has been created successfully.`,
      });
      
      setIsCreateDialogOpen(false);
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        role: "Sales Manager",
        department: "",
        phone: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading2(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading2(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Updated",
        description: `User ${selectedUser.firstName} ${selectedUser.lastName} has been updated successfully.`,
      });
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading2(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "User Deleted",
        description: `User ${userName} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: isActive ? "User Activated" : "User Deactivated",
        description: `User has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800";
      case "Executive": return "bg-purple-100 text-purple-800";
      case "Sales Manager": return "bg-blue-100 text-blue-800";
      case "Finance Analyst": return "bg-green-100 text-green-800";
      case "Trade Development": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-neutral">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-neutral">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  User Management
                </h2>
                <p className="text-sm text-gray-600">Manage users, roles, and departments</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={newUser.firstName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            value={newUser.lastName}
                            onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john.doe@company.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                              <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                              <SelectItem value="Trade Development">Trade Development</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Input
                            value={newUser.department}
                            onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                            placeholder="Sales"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Phone (Optional)</Label>
                        <Input
                          value={newUser.phone}
                          onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isLoading2}>
                        {isLoading2 ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Create User
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Users ({filteredUsers.length})</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                            <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                            <SelectItem value="Trade Development">Trade Development</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="IT">IT</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback>
                                    {user.firstName[0]}{user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                              <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUserStatus(user.id, !user.isActive)}
                                >
                                  {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                                {user.role !== "Admin" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockRoles.map((role) => (
                    <Card key={role.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <Badge variant="secondary">{role.userCount} users</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Permissions:</Label>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Departments Tab */}
              <TabsContent value="departments">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockDepartments.map((department) => (
                    <Card key={department.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            {department.name}
                          </CardTitle>
                          <Badge variant="secondary">{department.userCount} users</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{department.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={selectedUser.firstName}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={selectedUser.lastName}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select 
                          value={selectedUser.role} 
                          onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, role: value } : null)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                            <SelectItem value="Finance Analyst">Finance Analyst</SelectItem>
                            <SelectItem value="Trade Development">Trade Development</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input
                          value={selectedUser.department}
                          onChange={(e) => setSelectedUser(prev => prev ? { ...prev, department: e.target.value } : null)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={selectedUser.phone || ""}
                        onChange={(e) => setSelectedUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser} disabled={isLoading2}>
                    {isLoading2 ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}