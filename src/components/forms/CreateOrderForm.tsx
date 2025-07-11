
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateOrder, useClients, useCreateClient } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, User, Package } from 'lucide-react';

interface CreateOrderFormProps {
  onSuccess: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size: string;
}

interface CreateOrderFormData {
  clientType: 'existing' | 'new';
  existingClientId?: string;
  selectedPhone?: string;
  selectedAddress?: string;
  newPhone?: string;
  newAddress?: string;
  newClient?: {
    name: string;
    phoneNumbers: string[];
    address: string;
    governorate: string;
    addresses: string[];
  };
  trackId: string;
  items: OrderItem[];
  deliveryFees: number;
  profit: number;
  notes: string;
}

const egyptianGovernorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم',
  'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد',
  'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'
];

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({ onSuccess }) => {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateOrderFormData>({
    defaultValues: {
      clientType: 'existing',
      items: [{ name: '', quantity: 1, price: 0, size: '' }],
      deliveryFees: 0,
      profit: 0,
      notes: '',
      trackId: '',
      newClient: {
        name: '',
        phoneNumbers: [''],
        address: '',
        governorate: '',
        addresses: ['']
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'newClient.phoneNumbers'
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'newClient.addresses'
  });

  const { data: clients = [] } = useClients();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const { mutate: createClient } = useCreateClient();
  const { toast } = useToast();

  const clientType = watch('clientType');
  const selectedClientId = watch('existingClientId');
  const items = watch('items');
  const deliveryFees = watch('deliveryFees');
  const profit = watch('profit');

  const selectedClient = clients.find((client: any) => client._id === selectedClientId);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(010|011|012|015)\d{8}$/;
    return phoneRegex.test(phone) || 'رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقم';
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return itemsTotal + (deliveryFees || 0);
  };

  const onSubmit = async (data: CreateOrderFormData) => {
    try {
      let clientId = data.existingClientId;
      let finalPhone = data.selectedPhone;
      let finalAddress = data.selectedAddress;

      // إذا كان عميل جديد
      if (data.clientType === 'new' && data.newClient) {
        const newClientData = {
          name: data.newClient.name.trim(),
          defaultAddress: data.newClient.addresses[0].trim(),
          governorate: data.newClient.governorate,
          phoneNumbers: data.newClient.phoneNumbers.filter(phone => phone.trim() !== '').map(phone => phone.trim()),
          addresses: data.newClient.addresses.filter(addr => addr.trim() !== '').map(addr => addr.trim())
        };

        await new Promise((resolve, reject) => {
          createClient(newClientData, {
            onSuccess: (client: any) => {
              clientId = client._id;
              resolve(client);
            },
            onError: (error: any) => {
              reject(error);
            }
          });
        });
      } else if (data.clientType === 'existing') {
        // إذا كان عميل موجود وأضاف رقم جديد أو عنوان جديد
        if (data.newPhone && data.newPhone.trim()) {
          finalPhone = data.newPhone.trim();
        }
        if (data.newAddress && data.newAddress.trim()) {
          finalAddress = data.newAddress.trim();
        }
      }

      // إنشاء الطلب
      const orderData = {
        clientId,
        trackId: data.trackId.trim(),
        items: data.items.filter(item => item.name.trim() !== ''),
        deliveryFees: data.deliveryFees || 0,
        profit: data.profit || 0,
        notes: data.notes.trim(),
        clientPhone: finalPhone,
        clientAddress: finalAddress
      };

      createOrder(orderData, {
        onSuccess: () => {
          toast({
            title: "تم إنشاء الطلب بنجاح",
            description: "تم إضافة الطلب الجديد إلى النظام"
          });
          onSuccess();
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في إنشاء الطلب",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء العميل",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto space-y-6 p-1" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              بيانات العميل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={clientType} onValueChange={(value: 'existing' | 'new') => setValue('clientType', value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">عميل موجود</TabsTrigger>
                <TabsTrigger value="new">عميل جديد</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4">
                <div>
                  <Label htmlFor="existingClient">اختر العميل</Label>
                  <Select onValueChange={(value) => setValue('existingClientId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client: any) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name} - {client.phoneNumbers?.[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.existingClientId && <p className="text-red-500 text-sm">يجب اختيار عميل</p>}
                </div>

                {selectedClient && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>رقم الهاتف</Label>
                        <Select onValueChange={(value) => setValue('selectedPhone', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر رقم الهاتف" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedClient.phoneNumbers?.map((phone: string, index: number) => (
                              <SelectItem key={index} value={phone}>
                                {phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          <Label>أو أضف رقم جديد</Label>
                          <Input
                            {...register('newPhone', { 
                              validate: (value) => !value || validatePhoneNumber(value) === true || validatePhoneNumber(value)
                            })}
                            placeholder="01012345678"
                            maxLength={11}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>العنوان</Label>
                        <Select onValueChange={(value) => setValue('selectedAddress', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العنوان" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedClient.addresses?.map((address: string, index: number) => (
                              <SelectItem key={index} value={address}>
                                {address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-2">
                          <Label>أو أضف عنوان جديد</Label>
                          <Input
                            {...register('newAddress')}
                            placeholder="أدخل العنوان الجديد"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="new" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newClientName">اسم العميل</Label>
                      <Input
                        id="newClientName"
                        {...register('newClient.name', { required: clientType === 'new' ? 'اسم العميل مطلوب' : false })}
                        placeholder="أدخل اسم العميل"
                      />
                      {errors.newClient?.name && <p className="text-red-500 text-sm">{errors.newClient.name.message}</p>}
                    </div>
                    
                    <div>
                      <Label htmlFor="newClientGovernorate">المحافظة</Label>
                      <Select onValueChange={(value) => setValue('newClient.governorate', value)}>
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
                      {errors.newClient?.governorate && <p className="text-red-500 text-sm">المحافظة مطلوبة</p>}
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div>
                    <Label>أرقام الهاتف</Label>
                    {phoneFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 mt-2">
                        <Input
                          {...register(`newClient.phoneNumbers.${index}`, { 
                            required: index === 0 ? 'رقم الهاتف مطلوب' : false,
                            validate: (value) => !value || validatePhoneNumber(value) === true || validatePhoneNumber(value)
                          })}
                          placeholder="01012345678"
                          maxLength={11}
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, '');
                          }}
                        />
                        {phoneFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhone(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendPhone('')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة رقم هاتف
                    </Button>
                  </div>

                  {/* Addresses */}
                  <div>
                    <Label>العناوين</Label>
                    {addressFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 mt-2">
                        <Input
                          {...register(`newClient.addresses.${index}`, { 
                            required: index === 0 ? 'العنوان مطلوب' : false
                          })}
                          placeholder="أدخل العنوان التفصيلي"
                        />
                        {addressFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAddress(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendAddress('')}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة عنوان
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              تفاصيل الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Track ID */}
            <div>
              <Label htmlFor="trackId">رقم التتبع (اختياري)</Label>
              <Input
                id="trackId"
                {...register('trackId')}
                placeholder="مثال: 123456"
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/[^0-9]/g, '');
                }}
              />
              <p className="text-sm text-muted-foreground mt-1">
                سيتم تنسيقه تلقائياً كـ EB[رقم]EG - يمكنك تركه فارغاً وإضافته لاحقاً
              </p>
            </div>

            {/* Items */}
            <div>
              <Label className="mb-4 block">المنتجات</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 border rounded-lg mb-4">
                  <div>
                    <Label htmlFor={`item-name-${index}`}>اسم المنتج</Label>
                    <Input
                      id={`item-name-${index}`}
                      {...register(`items.${index}.name`, { required: 'اسم المنتج مطلوب' })}
                      placeholder="أدخل اسم المنتج"
                      className="text-base"
                    />
                    {errors.items?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.items[index]?.name?.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`item-size-${index}`}>المقاس</Label>
                      <Input
                        id={`item-size-${index}`}
                        {...register(`items.${index}.size`)}
                        placeholder="مثال: XL، L، M"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`item-quantity-${index}`}>الكمية</Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        {...register(`items.${index}.quantity`, { 
                          required: 'الكمية مطلوبة',
                          min: { value: 1, message: 'الكمية يجب أن تكون 1 على الأقل' },
                          valueAsNumber: true 
                        })}
                        placeholder="1"
                        min="1"
                        style={{ appearance: 'textfield' }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`item-price-${index}`}>السعر (جنيه)</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        {...register(`items.${index}.price`, { 
                          required: 'السعر مطلوب',
                          min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكثر' },
                          valueAsNumber: true 
                        })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        style={{ appearance: 'textfield' }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      {errors.items?.[index]?.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.items[index]?.price?.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف المنتج
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: '', quantity: 1, price: 0, size: '' })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج جديد
              </Button>
            </div>

            {/* Delivery Fees and Profit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryFees">رسوم التوصيل (جنيه)</Label>
                <Input
                  id="deliveryFees"
                  type="number"
                  {...register('deliveryFees', { valueAsNumber: true })}
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                  style={{ appearance: 'textfield' }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  رسوم الشحن والتوصيل
                </p>
              </div>
              <div>
                <Label htmlFor="profit">ربحية الطلب (جنيه)</Label>
                <Input
                  id="profit"
                  type="number"
                  {...register('profit', { valueAsNumber: true })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  style={{ appearance: 'textfield' }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  اختياري - يمكن إضافته لاحقاً
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="أدخل أي ملاحظات خاصة بالطلب (اختياري)"
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium text-lg">إجمالي الطلب: {calculateTotal().toFixed(2)} جنيه</p>
              <p className="text-sm text-muted-foreground mt-1">
                يشمل قيمة المنتجات + رسوم التوصيل
              </p>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
        </Button>
      </form>
    </div>
  );
};

export default CreateOrderForm;
