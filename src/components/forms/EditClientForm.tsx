
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useUpdateClient } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';

interface EditClientFormProps {
  client: Client;
  onSuccess: () => void;
}

interface ClientFormData {
  name: string;
  defaultAddress: string;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onSuccess }) => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(client.phoneNumbers);
  const [addresses, setAddresses] = useState<string[]>(client.addresses);
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      name: client.name,
      defaultAddress: client.defaultAddress
    }
  });

  const { mutate: updateClient, isPending } = useUpdateClient();
  const { toast } = useToast();

  const addPhone = () => {
    if (newPhone.trim()) {
      setPhoneNumbers([...phoneNumbers, newPhone.trim()]);
      setNewPhone('');
    }
  };

  const removePhone = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const addAddress = () => {
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress.trim()]);
      setNewAddress('');
    }
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ClientFormData) => {
    const updatedData = {
      ...data,
      phoneNumbers,
      addresses
    };

    updateClient({ id: client._id, data: updatedData }, {
      onSuccess: () => {
        toast({
          title: "تم تحديث العميل بنجاح",
          description: "تم حفظ التغييرات"
        });
        onSuccess();
      },
      onError: (error: any) => {
        toast({
          title: "خطأ في تحديث العميل",
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
        <Label htmlFor="defaultAddress">العنوان الافتراضي</Label>
        <Input
          id="defaultAddress"
          {...register('defaultAddress', { required: 'العنوان الافتراضي مطلوب' })}
          placeholder="أدخل العنوان الافتراضي"
        />
        {errors.defaultAddress && <p className="text-red-500 text-sm">{errors.defaultAddress.message}</p>}
      </div>

      <div>
        <Label>أرقام الهاتف</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="أضف رقم هاتف"
          />
          <Button type="button" onClick={addPhone} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {phoneNumbers.map((phone, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {phone}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removePhone(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>العناوين</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="أضف عنوان"
          />
          <Button type="button" onClick={addAddress} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {addresses.map((address, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {address}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeAddress(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'جاري التحديث...' : 'حفظ التغييرات'}
      </Button>
    </form>
  );
};

export default EditClientForm;
