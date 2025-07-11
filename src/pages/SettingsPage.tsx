
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Eye, UserCheck, Shield, Trash2, User, Settings as SettingsIcon } from 'lucide-react';
import { useUsers, useDeleteUser } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { User as UserType } from '@/types';
import CreateUserForm from '@/components/forms/CreateUserForm';
import EditUserForm from '@/components/forms/EditUserForm';
import UserDetailsModal from '@/components/modals/UserDetailsModal';
import { Input } from '@/components/ui/input';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: users = [], isLoading, error } = useUsers();
  const { mutate: deleteUser } = useDeleteUser();

  const filteredUsers = users.filter((userData: UserType) =>
    userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userData.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  const handleViewUser = (userData: UserType) => {
    setSelectedUser(userData);
    setDetailsModalOpen(true);
  };

  const handleEditUser = (userData: UserType) => {
    setSelectedUser(userData);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (userId: string, userRole: string) => {
    if (userRole === 'admin') {
      toast({
        title: "لا يمكن حذف المدير",
        description: "لا يمكن حذف المستخدمين الذين لديهم صلاحيات مدير",
        variant: "destructive"
      });
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      deleteUser(userId, {
        onSuccess: () => {
          toast({
            title: "تم حذف المستخدم بنجاح",
            description: "تم حذف المستخدم من النظام"
          });
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في حذف المستخدم",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            الإعدادات
          </h1>
        </div>
      </div>

      {/* User Management - Only for Admins */}
      {user?.role === 'admin' && (
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold">إدارة المستخدمين</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    إضافة وتعديل المستخدمين في النظام
                  </div>
                </div>
              </CardTitle>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  </DialogHeader>
                  <CreateUserForm onSuccess={() => setCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/30"
              />
            </div>

            {/* Users List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">جاري تحميل المستخدمين...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">خطأ في تحميل المستخدمين: {error.message}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((userData: UserType) => {
                  const RoleIcon = getRoleIcon(userData.role);
                  return (
                    <div key={userData._id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                          <RoleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{userData.name}</div>
                          <div className="text-sm text-muted-foreground">{userData.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getRoleColor(userData.role)}>
                          {userData.role === 'admin' ? 'مدير' : 'موظف'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewUser(userData)}
                            className="h-9 w-9 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditUser(userData)}
                            className="h-9 w-9 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {userData.role !== 'admin' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(userData._id, userData.role)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد مستخدمين</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm 
              user={selectedUser} 
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedUser(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <UserDetailsModal
        user={selectedUser}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};

export default SettingsPage;
