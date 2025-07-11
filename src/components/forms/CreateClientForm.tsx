
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClient } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

interface CreateClientFormProps {
  onSuccess: () => void;
}

interface ClientFormData {
  name: string;
  defaultAddress: string;
  governorate: string;
  phoneNumbers: string[];
  addresses: string[];
}

const egyptianGovernorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم',
  'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد',
  'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

const CreateClientForm: React.FC<CreateClientFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      defaultAddress: '',
      governorate: '',
      phoneNumbers: [''],
      addresses: ['']
    }
  });

  const { mutate: createClient, isPending } = useCreateClient();
  const { toast } = useToast();

  const phoneNumbers = watch('phoneNumbers');
  const addresses = watch('addresses');

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phone) || 'رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم';
  };

  const addPhoneNumber = () => {
    setValue('phoneNumbers', [...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = phoneNumbers.filter((_, i) => i !== index);
    setValue('phoneNumbers', newPhones);
  };

  const addAddress = () => {
    setValue('addresses', [...addresses, '']);
  };

  const removeAddress = (index: number) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setValue('addresses', newAddresses);
  };

  const onSubmit = (data: ClientFormData) => {
    const filteredData = {
      ...data,
      name: data.name.trim(),
      defaultAddress: data.defaultAddress.trim(),
      phoneNumbers: data.phoneNumbers.filter(phone => phone.trim() !== '').map(phone => phone.trim()),
      addresses: [data.defaultAddress.trim(), ...data.addresses.filter(addr => addr.trim() !== '').map(addr => addr.trim())]
    };

    createClient(filteredData, {
      onSuccess: () => {
        toast({
          title: "تم إنشاء العميل بنجاح",
          description: "تم إضافة العميل الجديد إلى قاعدة البيانات"
        });
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: "خطأ في إنشاء العميل",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم العميل</Label>
        <Input
          id="name"
          {...register('name', { required: 'اسم العميل مطلوب' })}
          placeholder="أدخل اسم العميل"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="governorate">المحافظة</Label>
        <Select onValueChange={(value) => setValue('governorate', value)}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المحافظة" />
          </SelectTrigger>
          <SelectContent>
            {egyptianGovernorates.map((gov) => (
              <SelectItem key={gov} value={gov}>
                {gov}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.governorate && <p className="text-red-500 text-sm">المحافظة مطلوبة</p>}
      </div>

      <div>
        <Label htmlFor="defaultAddress">العنوان التفصيلي</Label>
        <Input
          id="defaultAddress"
          {...register('defaultAddress', { required: 'العنوان الافتراضي مطلوب' })}
          placeholder="أدخل العنوان التفصيلي"
        />
        {errors.defaultAddress && <p className="text-red-500 text-sm">{errors.defaultAddress.message}</p>}
      </div>

      <div>
        <Label>أرقام الهاتف</Label>
        {phoneNumbers.map((_, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              {...register(`phoneNumbers.${index}`, { 
                required: 'رقم الهاتف مطلوب',
                validate: validatePhoneNumber
              })}
              placeholder="01012345678"
              maxLength={11}
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                target.value = target.value.replace(/[^0-9]/g, '');
              }}
            />
            {phoneNumbers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePhoneNumber(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {phoneNumbers.map((_, index) => (
          errors.phoneNumbers?.[index] && (
            <p key={index} className="text-red-500 text-sm mt-1">
              {errors.phoneNumbers[index]?.message}
            </p>
          )
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addPhoneNumber}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة رقم هاتف
        </Button>
      </div>

      <div>
        <Label>عناوين إضافية</Label>
        {addresses.map((_, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <Input
              {...register(`addresses.${index}`)}
              placeholder="أدخل عنوان إضافي"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeAddress(index)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addAddress}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة عنوان
        </Button>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'جاري الإنشاء...' : 'إنشاء العميل'}
      </Button>
    </form>
  );
};

export default CreateClientForm;
