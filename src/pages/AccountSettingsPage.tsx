
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Mail, Save } from 'lucide-react';

const AccountSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Here you would call your API to update profile
      toast({
        title: "تم حفظ البيانات",
        description: "تم تحديث بيانات الحساب بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقان",
        variant: "destructive"
      });
      return;
    }

    try {
      // Here you would call your API to change password
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح"
      });
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "حدث خطأ أثناء تحديث كلمة المرور",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          بيانات الحساب
        </h1>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسمك"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="h-4 w-4" />
              حفظ التغييرات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="أدخل كلمة المرور الحالية"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleChangePassword} variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              تغيير كلمة المرور
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;
