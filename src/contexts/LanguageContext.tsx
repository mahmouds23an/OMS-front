import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'en', name: 'English', direction: 'ltr' },
];

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.orders': 'الطلبات',
    'nav.clients': 'العملاء',
    'nav.settings': 'الإعدادات',
    'nav.analytics': 'التحليلات',
    'nav.logout': 'تسجيل الخروج',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.welcome': 'مرحباً بك في نظام إدارة الطلبات',
    'auth.signin': 'سجل دخولك إلى حسابك',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.overview': 'نظرة عامة',
    'dashboard.totalOrders': 'إجمالي الطلبات',
    'dashboard.deliveredOrders': 'الطلبات المسلمة',
    'dashboard.pendingOrders': 'الطلبات المعلقة',
    'dashboard.totalRevenue': 'إجمالي الإيرادات',
    'dashboard.netProfit': 'صافي الربح',
    'dashboard.returnedOrders': 'الطلبات المرتجعة',
    
    // Orders
    'orders.title': 'الطلبات',
    'orders.orderId': 'رقم الطلب',
    'orders.trackId': 'رقم التتبع',
    'orders.client': 'العميل',
    'orders.total': 'الإجمالي',
    'orders.status': 'الحالة',
    'orders.createdAt': 'تاريخ الإنشاء',
    'orders.actions': 'الإجراءات',
    'orders.create': 'إنشاء طلب',
    'orders.edit': 'تعديل الطلب',
    'orders.view': 'عرض الطلب',
    'orders.createdBy': 'أنشأ بواسطة',
    'orders.clientOrders': 'طلبات العميل',
    'orders.userOrders': 'طلبات المستخدم',
    
    // Status
    'status.pending': 'قيد التحضير',
    'status.processing': 'في بريد المنصورة',
    'status.shipped': 'تم الشحن من المنصورة',
    'status.onTheWay': 'مع مندوب الشحن',
    'status.delivered': 'تم التسليم',
    'status.cancelled': 'ملغي',
    'status.returned': 'مرتجع',
    
    // Clients
    'clients.title': 'العملاء',
    'clients.name': 'الاسم',
    'clients.email': 'البريد الإلكتروني',
    'clients.phone': 'الهاتف',
    'clients.address': 'العنوان',
    'clients.rating': 'التقييم',
    'clients.create': 'إنشاء عميل',
    'clients.edit': 'تعديل العميل',
    'clients.details': 'تفاصيل العميل',
    'clients.orderHistory': 'تاريخ الطلبات',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.general': 'الإعدادات العامة',
    'settings.theme': 'المظهر',
    'settings.language': 'اللغة',
    'settings.users': 'إدارة المستخدمين',
    
    // Common
    'common.actions': 'الإجراءات',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.loading': 'جاري التحميل...',
    'common.noData': 'لا توجد بيانات متاحة',
    'common.close': 'إغلاق',
    'common.confirm': 'تأكيد',
    'common.date': 'التاريخ',
    'common.price': 'السعر',
    'common.quantity': 'الكمية',
    'common.total': 'الإجمالي',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.clients': 'Clients',
    'nav.settings': 'Settings',
    'nav.analytics': 'Analytics',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.welcome': 'Welcome to Order Management System',
    'auth.signin': 'Sign in to your account',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.totalOrders': 'Total Orders',
    'dashboard.deliveredOrders': 'Delivered Orders',
    'dashboard.pendingOrders': 'Pending Orders',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.netProfit': 'Net Profit',
    'dashboard.returnedOrders': 'Returned Orders',
    
    // Orders
    'orders.title': 'Orders',
    'orders.orderId': 'Order ID',
    'orders.trackId': 'Track ID',
    'orders.client': 'Client',
    'orders.total': 'Total',
    'orders.status': 'Status',
    'orders.createdAt': 'Created At',
    'orders.actions': 'Actions',
    'orders.create': 'Create Order',
    'orders.edit': 'Edit Order',
    'orders.view': 'View Order',
    'orders.createdBy': 'Created By',
    'orders.clientOrders': 'Client Orders',
    'orders.userOrders': 'User Orders',
    
    // Status
    'status.pending': 'Pending',
    'status.processing': 'Processing',
    'status.shipped': 'Shipped',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled',
    'status.returned': 'Returned',
    
    // Clients
    'clients.title': 'Clients',
    'clients.name': 'Name',
    'clients.email': 'Email',
    'clients.phone': 'Phone',
    'clients.address': 'Address',
    'clients.rating': 'Rating',
    'clients.create': 'Create Client',
    'clients.edit': 'Edit Client',
    'clients.details': 'Client Details',
    'clients.orderHistory': 'Order History',
    
    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.users': 'User Management',
    
    // Common
    'common.actions': 'Actions',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.noData': 'No data available',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.date': 'Date',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(languages[0]); // Default to Arabic

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      const found = languages.find(lang => lang.code === savedLang);
      if (found) {
        setLanguage(found);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language.code);
    document.documentElement.dir = language.direction;
    document.documentElement.lang = language.code;
  }, [language]);

  const t = (key: string): string => {
    return translations[language.code]?.[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { languages };
