"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context";
import { useToast } from "../../components/ui/use-toast";
import { adminService } from "../../services/admin";
import { User } from "../../services/auth";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Spinner } from "../../components/ui/spinner";
import { PageTransition } from "../../components/animations";
import Footer from "../../components/common/Footer";
import { AlertTriangle, Shield, Trash2, User as UserIcon, Users } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin dashboard.",
        variant: "destructive",
      });
    } else if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user, loading, router]);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId: number) => {
    try {
      setIsDeleting(true);
      await adminService.deleteUser(userId);
      
      setUsers(users.filter(u => u.id !== userId));
      setUserToDelete(null);
      
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    return null; // Will be redirected by useEffect
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500">Manage users and platform settings</p>
        </header>
        
        <section className="bg-white rounded-lg shadow-md mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5" />
            User Management
          </h2>
          
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'freelancer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                      `}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>${user.balance.toFixed(2)}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setUserToDelete(user)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-8 text-gray-500">
              <UserIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No users found</p>
            </div>
          )}
        </section>
        
        {/* Delete User Dialog */}
        <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the user <span className="font-medium">{userToDelete?.name}</span>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                disabled={isDeleting}
              >
                {isDeleting ? <Spinner className="mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </PageTransition>
  );
} 