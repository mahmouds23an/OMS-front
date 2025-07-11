
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUser } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface EditUserFormProps {
  user: User;
  onSuccess: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSuccess }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserFormData>({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  const { mutate: updateUser, isPending } = useUpdateUser();
  const { toast } = useToast();

  const onSubmit = (data: UserFormData) => {
    updateUser({ id: user._id, data }, {
      onSuccess: () => {
        toast({
          title: "تم تحديث المستخدم بنجاح",
          description: "تم حفظ التغييرات"
        });
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: "خطأ في تحديث المستخدم",
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
        <Label htmlFor="role">الدور</Label>
        <Select onValueChange={(value: 'admin' | 'employee') => setValue('role', value)} defaultValue={user.role}>
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
        {isPending ? 'جاري التحديث...' : 'حفظ التغييرات'}
      </Button>
    </form>
  );
};

export default EditUserForm;
