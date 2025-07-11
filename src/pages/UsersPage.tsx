/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Eye, UserCheck, Shield, Trash2 } from 'lucide-react';
import { useUsers, useDeleteUser } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import CreateUserForm from '@/components/forms/CreateUserForm';
import EditUserForm from '@/components/forms/EditUserForm';
import UserDetailsModal from '@/components/modals/UserDetailsModal';

const UsersPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: users = [], isLoading, error } = useUsers();
  const { mutate: deleteUser } = useDeleteUser();

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  const handleViewUser = (userData: User) => {
    setSelectedUser(userData);
    setDetailsModalOpen(true);
  };

  const handleEditUser = (userData: User) => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t('users.title')}
          </h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t('users.title')}
          </h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">Error loading users: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          {t('users.title')}
        </h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('users.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('users.create')}</DialogTitle>
            </DialogHeader>
            <CreateUserForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((userData: User) => {
          const RoleIcon = getRoleIcon(userData.role);
          return (
            <Card key={userData._id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <RoleIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{userData.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('users.role')}:</span>
                  <Badge className={getRoleColor(userData.role)}>
                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {userData.role === 'admin' ? 'Full Access' : 'Limited Access'}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleViewUser(userData)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditUser(userData)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {userData.role !== 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteUser(userData._id, userData.role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">{t('common.noData')}</p>
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

export default UsersPage;
