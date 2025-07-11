
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Package, CheckCircle, Clock, DollarSign, TrendingUp, RotateCcw, Users, Star } from 'lucide-react';
import { useAnalytics, useOrders, useClients } from '@/hooks/useApi';
import OrderDetailsModal from '@/components/modals/OrderDetailsModal';
import { Order } from '@/types';

const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useAnalytics();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useOrders();
  const { data: clients, isLoading: clientsLoading } = useClients();

  const isLoading = analyticsLoading || ordersLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (analyticsError || ordersError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600">
              Error loading dashboard: {analyticsError?.message || ordersError?.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate revenue without delivery fees
  const totalRevenueWithoutDelivery = orders 
    ? orders
        .filter((order: any) => order.status === 'delivered')
        .reduce((sum: number, order: any) => sum + (order.total - order.deliveryFees), 0)
    : 0;

  // Get the most recent orders (max 5)
  const recentOrders = orders ? orders
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5) : [];

  // Get top clients by orders count
  const topClients = clients ? clients
    .sort((a: any, b: any) => {
      const aOrdersCount = orders?.filter((order: any) => 
        (typeof order.clientId === 'object' ? order.clientId._id : order.clientId) === a._id
      ).length || 0;
      const bOrdersCount = orders?.filter((order: any) => 
        (typeof order.clientId === 'object' ? order.clientId._id : order.clientId) === b._id
      ).length || 0;
      
      if (aOrdersCount !== bOrdersCount) return bOrdersCount - aOrdersCount;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 5) : [];

  const handleCardClick = (type: string) => {
    switch(type) {
      case 'totalOrders':
        navigate('/orders');
        break;
      case 'deliveredOrders':
        navigate('/orders?status=delivered');
        break;
      case 'pendingOrders':
        navigate('/orders?status=pending');
        break;
      case 'returnedOrders':
        navigate('/orders?status=returned');
        break;
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const statCards = [
    {
      title: t('dashboard.totalOrders'),
      value: analytics?.totalOrders?.toLocaleString() || '0',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      clickHandler: () => handleCardClick('totalOrders')
    },
    {
      title: t('dashboard.deliveredOrders'),
      value: analytics?.deliveredOrders?.toLocaleString() || '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      clickHandler: () => handleCardClick('deliveredOrders')
    },
    {
      title: t('dashboard.pendingOrders'),
      value: analytics?.pendingOrders?.toLocaleString() || '0',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      clickHandler: () => handleCardClick('pendingOrders')
    },
    {
      title: 'إجمالي الإيرادات (بدون شحن)',
      value: `${totalRevenueWithoutDelivery?.toLocaleString() || '0'} EGP`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: t('dashboard.netProfit'),
      value: `${analytics?.netProfit?.toLocaleString() || '0'} EGP`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    },
    {
      title: t('dashboard.returnedOrders'),
      value: analytics?.returnedOrders?.toLocaleString() || '0',
      icon: RotateCcw,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
      clickHandler: () => handleCardClick('returnedOrders')
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'shipped':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      case 'returned':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'تم التسليم';
      case 'pending':
        return 'في الانتظار';
      case 'shipped':
        return 'تم الشحن';
      case 'cancelled':
        return 'ملغي';
      case 'returned':
        return 'مرتجع';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <div className="text-sm text-muted-foreground">
          Current Month Overview
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`transition-all duration-200 hover:shadow-lg ${stat.clickHandler ? 'cursor-pointer hover:bg-muted/50' : ''}`}
              onClick={stat.clickHandler}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <div 
                    key={order._id} 
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded p-2"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div>
                      <div className="font-medium">{order.trackId}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.clientId?.name || 'Unknown Client'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{order.total?.toLocaleString() || '0'} EGP</div>
                      <div className={`text-sm ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent orders found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.length > 0 ? (
                topClients.map((client: any) => {
                  const clientOrdersCount = orders?.filter((order: any) => 
                    (typeof order.clientId === 'object' ? order.clientId._id : order.clientId) === client._id
                  ).length || 0;
                  
                  return (
                    <div key={client._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {clientOrdersCount} orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{client.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No clients found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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

export default DashboardPage;
