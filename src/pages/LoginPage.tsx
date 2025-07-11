/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLanguageToggle = () => {
    const newLang = language.code === 'en' ? 'ar' : 'en';
    const languages = [
      { code: 'en', name: 'English', direction: 'ltr' },
      { code: 'ar', name: 'العربية', direction: 'rtl' },
    ];
    const found = languages.find(lang => lang.code === newLang);
    if (found) {
      setLanguage(found as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLanguageToggle}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language.code === 'en' ? 'العربية' : 'English'}
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">
              {t('auth.welcome')}
            </CardTitle>
            <CardDescription>
              {t('auth.signin')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  placeholder="admin@admin.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                    placeholder="admin123"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('common.loading')}
                  </div>
                ) : (
                  t('auth.login')
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo Credentials:</strong><br />
                Email: admin@admin.com<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
