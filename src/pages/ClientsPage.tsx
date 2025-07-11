
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Eye, Phone, MapPin, Trash2, Star, Package } from 'lucide-react';
import { useClients, useDeleteClient, useOrders } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';
import CreateClientForm from '@/components/forms/CreateClientForm';
import EditClientForm from '@/components/forms/EditClientForm';
import ClientDetailsModal from '@/components/modals/ClientDetailsModal';

const ClientsPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: clients = [], isLoading, error } = useClients();
  const { data: orders = [] } = useOrders();

  // Calculate client statistics
  const clientStats = clients.map((client: Client) => {
    const clientOrders = orders.filter((order: any) => {
      const orderClientId = typeof order.clientId === 'string' ? order.clientId : order.clientId?._id;
      return orderClientId === client._id;
    });
    
    const totalOrders = clientOrders.length;
    const totalValue = clientOrders
      .filter((order: any) => order.status === 'delivered')
      .reduce((sum: number, order: any) => sum + order.total, 0);
    
    return {
      ...client,
      totalOrders,
      totalValue,
      // Sort by: total value first, then by total orders, then by rating
      sortValue: totalValue * 1000 + totalOrders * 100 + client.rating
    };
  });

  // Sort clients by importance (highest total value and orders first)
  const sortedClients = clientStats.sort((a, b) => b.sortValue - a.sortValue);

  const filteredClients = sortedClients.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.defaultAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNumbers.some((phone: string) => phone.includes(searchTerm))
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditDialogOpen(true);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteClient(clientId, {
        onSuccess: () => {
          toast({
            title: "تم حذف العميل بنجاح",
            description: "تم حذف العميل من النظام"
          });
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في حذف العميل",
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
          <h1 className="text-3xl font-bold text-foreground">العملاء</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">العملاء</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">خطأ في تحميل العملاء: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">العملاء</h1>
        {user?.role === 'admin' && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              <CreateClientForm onSuccess={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في العملاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredClients.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي العملاء</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredClients.reduce((sum: number, client: any) => sum + client.totalOrders, 0)}
            </div>
            <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {filteredClients.reduce((sum: number, client: any) => sum + client.totalValue, 0).toFixed(2)} ج.م
            </div>
            <p className="text-sm text-muted-foreground">إجمالي القيمة</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client: any) => (
          <Card key={client._id} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${getRatingColor(client.rating)}`}>
                      {client.rating.toFixed(1)}
                    </span>
                    <span className={`text-sm ${getRatingColor(client.rating)}`}>
                      {renderStars(client.rating)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-xs">
                    {client.phoneNumbers.length} هاتف
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {client.totalOrders} طلب
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">إجمالي الطلبات: {client.totalOrders}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">إجمالي القيمة: {client.totalValue.toFixed(2)} ج.م</span>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{client.governorate}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{client.defaultAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {client.phoneNumbers.slice(0, 2).map((phone: string, index: number) => (
                    <p key={index} className="text-sm text-muted-foreground">{phone}</p>
                  ))}
                  {client.phoneNumbers.length > 2 && (
                    <p className="text-xs text-muted-foreground">+{client.phoneNumbers.length - 2} أرقام أخرى</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  انضم {new Date(client.createdAt).toLocaleDateString('ar-EG')}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleViewClient(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user?.role === 'admin' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClient(client._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">لا توجد عملاء</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <EditClientForm 
              client={selectedClient} 
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedClient(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      <ClientDetailsModal
        client={selectedClient}
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedClient(null);
        }}
      />
    </div>
  );
};

export default ClientsPage;
