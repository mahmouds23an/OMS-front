
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { Star, Package, MapPin, Phone, Calendar, DollarSign, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUsers } from '@/hooks/useApi';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { data: users = [] } = useUsers();

  if (!order) return null;

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "قيد الانتظار";
      case "processing": return "قيد المعالجة";
      case "shipped": return "تم الشحن";
      case "delivered": return "تم التسليم";
      case "cancelled": return "ملغي";
      case "returned": return "مرتجع";
      default: return status;
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find((u: any) => u._id === userId);
    return foundUser ? foundUser.name : 'غير معروف';
  };

  const clientName = typeof order.clientId === 'string' ? order.clientId : order.clientId.name;
  const clientData = typeof order.clientId === 'object' ? order.clientId : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl md:text-2xl font-bold">
            تفاصيل الطلب #{order.trackId}
          </DialogTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </Badge>
            {order.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{order.rating}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">معلومات الطلب</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الطلب:</span>
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم التتبع:</span>
                  <span className="font-medium">{order.trackId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العميل:</span>
                  <span className="font-medium">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">أنشأ بواسطة:</span>
                  <span className="font-medium">{getUserName(order.createdBy)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">التواريخ</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ الإنشاء:</span>
                  <span className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">آخر تحديث:</span>
                  <span className="font-medium">
                    {new Date(order.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* بيانات العميل */}
          {clientData && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-lg">بيانات العميل</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* أرقام الهاتف */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">أرقام الهاتف:</span>
                    </div>
                    {order.clientPhoneNumber && (
                      <div className="bg-muted p-2 rounded">
                        <span className="text-sm">الهاتف المسجل مع الطلب: {order.clientPhoneNumber}</span>
                      </div>
                    )}
                    {clientData.phoneNumbers && clientData.phoneNumbers.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">أرقام أخرى للعميل:</span>
                        {clientData.phoneNumbers.map((phone: string, index: number) => (
                          <div key={index} className="bg-muted/50 p-2 rounded text-sm">
                            {phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* العناوين */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">العناوين:</span>
                    </div>
                    {order.clientAddress && (
                      <div className="bg-muted p-2 rounded">
                        <span className="text-sm">العنوان المسجل مع الطلب:</span>
                        <p className="text-sm font-medium">{order.clientAddress}</p>
                      </div>
                    )}
                    {clientData.defaultAddress && (
                      <div className="bg-muted/50 p-2 rounded">
                        <span className="text-xs text-muted-foreground">العنوان الافتراضي للعميل:</span>
                        <p className="text-sm">{clientData.defaultAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* العناصر */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-lg">عناصر الطلب</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">العنصر</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">الكمية</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">السعر</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-2 font-medium">{item.name}</td>
                      <td className="py-3 px-2">{item.quantity}</td>
                      <td className="py-3 px-2">{item.price.toFixed(2)} ج.م</td>
                      <td className="py-3 px-2 font-medium">
                        {(item.quantity * item.price).toFixed(2)} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* المالية */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium text-lg">المعلومات المالية</span>
            </div>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>إجمالي العناصر:</span>
                <span>{(order.total - order.deliveryFees).toFixed(2)} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>رسوم التوصيل:</span>
                <span>{order.deliveryFees.toFixed(2)} ج.م</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>الإجمالي النهائي:</span>
                <span>{order.total.toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>

          {/* الملاحظات */}
          {order.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <span className="font-medium">الملاحظات:</span>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {order.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
