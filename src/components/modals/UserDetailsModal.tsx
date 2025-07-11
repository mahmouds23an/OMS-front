
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types';
import { User as UserIcon, Mail, Shield, Calendar, Package, Star } from 'lucide-react';
import { useUserOrders } from '@/hooks/useApi';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { data: userOrders = [], isLoading: ordersLoading } = useUserOrders(user?._id || '');

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "returned":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "staff":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin": return "مدير";
      case "staff": return "موظف";
      default: return role;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <UserIcon className="w-6 h-6" />
            {t('users.details')}
          </DialogTitle>
          <Badge className={getRoleColor(user.role)}>
            {getRoleText(user.role)}
          </Badge>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات أساسية */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-lg">المعلومات الأساسية</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">الاسم:</span>
                <p className="font-medium bg-muted p-2 rounded">{user.name}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">الدور:</span>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">تاريخ التسجيل:</span>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* الطلبات المدارة */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-lg">{t('users.managedOrders')} ({userOrders.length})</span>
            </div>

            {ordersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : userOrders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-right p-3 font-medium">{t('orders.trackId')}</th>
                          <th className="text-right p-3 font-medium">{t('orders.client')}</th>
                          <th className="text-right p-3 font-medium">{t('orders.status')}</th>
                          <th className="text-right p-3 font-medium">{t('orders.total')}</th>
                          <th className="text-right p-3 font-medium">{t('clients.rating')}</th>
                          <th className="text-right p-3 font-medium">{t('common.date')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order: any) => {
                          const clientName = typeof order.clientId === 'string' 
                            ? order.clientId 
                            : order.clientId.name;
                          return (
                            <tr key={order._id} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{order.trackId}</td>
                              <td className="p-3">{clientName}</td>
                              <td className="p-3">
                                <Badge className={getStatusColor(order.status)}>
                                  {t(`status.${order.status}`)}
                                </Badge>
                              </td>
                              <td className="p-3 font-medium">{order.total} ج.م</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span>{order.rating}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد طلبات أنشأها هذا المستخدم
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
