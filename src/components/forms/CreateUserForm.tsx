
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUser } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

interface CreateUserFormProps {
  onSuccess: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'employee';
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee'
    }
  });

  const { mutate: createUser, isPending } = useCreateUser();
  const { toast } = useToast();

  const onSubmit = (data: UserFormData) => {
    createUser(data, {
      onSuccess: () => {
        toast({
          title: "تم إنشاء المستخدم بنجاح",
          description: "تم إضافة المستخدم الجديد إلى النظام"
        });
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: "خطأ في إنشاء المستخدم",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          {...register('name', { required: 'الاسم مطلوب' })}
          placeholder="أدخل اسم المستخدم"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { 
            required: 'البريد الإلكتروني مطلوب',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'البريد الإلكتروني غير صحيح'
            }
          })}
          placeholder="أدخل البريد الإلكتروني"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          {...register('password', { 
            required: 'كلمة المرور مطلوبة',
            minLength: {
              value: 6,
              message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            }
          })}
          placeholder="أدخل كلمة المرور"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="role">الدور</Label>
        <Select onValueChange={(value: 'admin' | 'employee') => setValue('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">موظف</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
      </Button>
    </form>
  );
};

export default CreateUserForm;
