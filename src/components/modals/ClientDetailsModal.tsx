
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { User, MapPin, Phone, Star, Package, Eye } from 'lucide-react';
import { useClientOrders } from '@/hooks/useApi';
import { useLanguage } from '@/contexts/LanguageContext';
import OrderDetailsModal from './OrderDetailsModal';

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { data: clientOrders = [], isLoading: ordersLoading } = useClientOrders(client?._id || '');
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = React.useState(false);

  if (!client) return null;

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

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Get all unique addresses (default + additional)
  const allAddresses = [
    { address: client.defaultAddress, isDefault: true },
    ...client.addresses
      .filter(addr => addr !== client.defaultAddress)
      .map(addr => ({ address: addr, isDefault: false }))
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6" />
              تفاصيل العميل
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">التقييم: {client.rating}</span>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* معلومات أساسية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-lg">المعلومات الأساسية</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">الاسم:</span>
                  <p className="font-medium bg-muted p-2 rounded">{client.name}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">المحافظة:</span>
                  <p className="font-medium bg-muted p-2 rounded">{client.governorate}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">تاريخ الانضمام:</span>
                  <p className="font-medium bg-muted p-2 rounded">
                    {new Date(client.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* أرقام الهاتف */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-lg">أرقام الهاتف</span>
              </div>
              {client.phoneNumbers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {client.phoneNumbers.map((phone, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted p-3 rounded-lg"
                    >
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{phone}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد أرقام هاتف مسجلة</p>
              )}
            </div>

            <Separator />

            {/* العناوين */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-lg">العناوين</span>
              </div>
              
              {allAddresses.length > 0 ? (
                <div className="space-y-3">
                  {allAddresses.map((addressObj, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {addressObj.isDefault && (
                          <Badge variant="secondary">افتراضي</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {addressObj.isDefault ? 'العنوان الرئيسي' : `عنوان إضافي ${index}`}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <span>{addressObj.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">لا توجد عناوين مسجلة</p>
              )}
            </div>

            <Separator />

            {/* تاريخ الطلبات */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-lg">تاريخ الطلبات ({clientOrders.length})</span>
              </div>

              {ordersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : clientOrders.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-right p-3 font-medium">رقم التتبع</th>
                            <th className="text-right p-3 font-medium">الحالة</th>
                            <th className="text-right p-3 font-medium">الإجمالي</th>
                            <th className="text-right p-3 font-medium">التقييم</th>
                            <th className="text-right p-3 font-medium">التاريخ</th>
                            <th className="text-right p-3 font-medium">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientOrders.map((order: any) => (
                            <tr key={order._id} className="border-b hover:bg-muted/30">
                              <td className="p-3 font-medium">{order.trackId || 'لا يوجد'}</td>
                              <td className="p-3">
                                <Badge className={getStatusColor(order.status)}>
                                  {t(`status.${order.status}`)}
                                </Badge>
                              </td>
                              <td className="p-3 font-medium">{order.total} ج.م</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span>{order.rating || 'لا يوجد'}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات لهذا العميل
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={orderDetailsOpen}
        onClose={() => {
          setOrderDetailsOpen(false);
          setSelectedOrder(null);
        }}
      />
    </>
  );
};

export default ClientDetailsModal;
