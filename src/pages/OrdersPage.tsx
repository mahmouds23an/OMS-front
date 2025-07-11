
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Eye, Trash2, Star, ArrowUpDown } from "lucide-react";
import { useOrders, useDeleteOrder, useUsers, useUpdateOrder } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/types";
import CreateOrderForm from "@/components/forms/CreateOrderForm";
import EditOrderForm from "@/components/forms/EditOrderForm";
import OrderDetailsModal from "@/components/modals/OrderDetailsModal";

const OrdersPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quickEditDialogOpen, setQuickEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [quickEditNotes, setQuickEditNotes] = useState("");
  const [quickEditRating, setQuickEditRating] = useState<number>(0);

  const { data: orders = [], isLoading, error } = useOrders();
  const { data: users = [] } = useUsers();
  const { mutate: deleteOrder } = useDeleteOrder();
  const { mutate: updateOrder } = useUpdateOrder();

  useEffect(() => {
    if (searchParams.get('status')) {
      setStatusFilter(searchParams.get('status') || "all");
    }
  }, [searchParams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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

  const getUserName = (userId: string) => {
    const foundUser = users.find((u: any) => u._id === userId);
    return foundUser ? foundUser.name : "غير معروف";
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order: Order) => {
      const clientName =
        typeof order.clientId === "string" ? order.clientId : order.clientId.name;
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a: Order, b: Order) => {
      let aValue: any = a[sortField as keyof Order];
      let bValue: any = b[sortField as keyof Order];

      if (sortField === 'clientId') {
        aValue = typeof a.clientId === "string" ? a.clientId : a.clientId.name;
        bValue = typeof b.clientId === "string" ? b.clientId : b.clientId.name;
      }

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    if (order.status === 'delivered' || order.status === 'returned') {
      // Quick edit for delivered/returned orders
      setSelectedOrder(order);
      setQuickEditNotes(order.notes || '');
      setQuickEditRating(order.rating || 0);
      setQuickEditDialogOpen(true);
    } else {
      // Full edit for other orders
      setSelectedOrder(order);
      setEditDialogOpen(true);
    }
  };

  const handleQuickEditSubmit = () => {
    if (!selectedOrder) return;

    updateOrder({
      id: selectedOrder._id,
      data: {
        notes: quickEditNotes,
        rating: quickEditRating || undefined
      }
    }, {
      onSuccess: () => {
        toast({
          title: "تم تحديث الطلب بنجاح",
          description: "تم حفظ الملاحظات والتقييم"
        });
        setQuickEditDialogOpen(false);
        setSelectedOrder(null);
      },
      onError: (error: any) => {
        toast({
          title: "خطأ في تحديث الطلب",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      deleteOrder(orderId, {
        onSuccess: () => {
          toast({
            title: "تم حذف الطلب بنجاح",
            description: "تم حذف الطلب من النظام",
          });
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في حذف الطلب",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t("orders.title")}
          </h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">
            {t("orders.title")}
          </h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">
              خطأ في تحميل الطلبات: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          {t("orders.title")}
        </h1>
        {user?.role === "admin" && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("orders.create")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("orders.create")}</DialogTitle>
              </DialogHeader>
              <CreateOrderForm onSuccess={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("common.filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="shipped">{t("status.shipped")}</SelectItem>
                <SelectItem value="delivered">
                  {t("status.delivered")}
                </SelectItem>
                <SelectItem value="cancelled">
                  {t("status.cancelled")}
                </SelectItem>
                <SelectItem value="returned">{t("status.returned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات ({filteredAndSortedOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('trackId')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("orders.trackId")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('clientId')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("orders.client")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("orders.total")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("orders.status")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    {t("orders.createdBy")}
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("orders.createdAt")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('rating')}
                      className="flex items-center gap-1 p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("clients.rating")}
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    {t("orders.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedOrders.map((order: Order) => {
                  const clientName =
                    typeof order.clientId === "string"
                      ? order.clientId
                      : order.clientId.name;
                  const canFullEdit = order.status !== 'delivered' && order.status !== 'returned';
                  
                  return (
                    <tr
                      key={order._id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-2 font-mono">{order.trackId}</td>
                      <td className="py-3 px-2">{clientName}</td>
                      <td className="py-3 px-2 font-medium">
                        {order.total} ج.م
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(order.status)}>
                          {t(`status.${order.status}`)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {getUserName(order.createdBy)}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="py-3 px-2 font-medium flex items-center gap-1">
                        {order.rating || 0}
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditOrder(order)}
                            title={canFullEdit ? "تعديل الطلب" : "إضافة ملاحظات وتقييم"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("orders.edit")}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <EditOrderForm
              order={selectedOrder}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedOrder(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Edit Dialog for Delivered/Returned Orders */}
      <Dialog open={quickEditDialogOpen} onOpenChange={setQuickEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظات وتقييم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">التقييم (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={quickEditRating || ''}
                onChange={(e) => setQuickEditRating(Number(e.target.value))}
                placeholder="اختياري"
              />
            </div>
            <div>
              <label className="text-sm font-medium">الملاحظات</label>
              <Textarea
                value={quickEditNotes}
                onChange={(e) => setQuickEditNotes(e.target.value)}
                placeholder="أدخل ملاحظاتك هنا..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleQuickEditSubmit} className="flex-1">
                حفظ
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setQuickEditDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrdersPage;
