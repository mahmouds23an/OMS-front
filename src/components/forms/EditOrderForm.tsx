
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateOrder } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package, Star } from 'lucide-react';

interface EditOrderFormProps {
  order: any;
  onSuccess: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size: string;
}

interface EditOrderFormData {
  trackId: string;
  items: OrderItem[];
  deliveryFees: number;
  profit: number;
  status: string;
  notes: string;
  rating: number;
}

const EditOrderForm: React.FC<EditOrderFormProps> = ({ order, onSuccess }) => {
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditOrderFormData>({
    defaultValues: {
      trackId: order.trackId || '',
      items: order.items || [{ name: '', quantity: 1, price: 0, size: '' }],
      deliveryFees: order.deliveryFees || 0,
      profit: order.profit || 0,
      status: order.status || 'pending',
      notes: order.notes || '',
      rating: order.rating || 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const { mutate: updateOrder, isPending } = useUpdateOrder();
  const { toast } = useToast();

  const items = watch('items');
  const deliveryFees = watch('deliveryFees');
  const status = watch('status');

  const isReadOnlyOrder = status === 'delivered' || status === 'returned';

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return itemsTotal + (deliveryFees || 0);
  };

  const onSubmit = (data: EditOrderFormData) => {
    const updateData = {
      ...data,
      trackId: data.trackId.trim(),
      notes: data.notes.trim(),
      total: calculateTotal()
    };

    updateOrder(
      { id: order._id, data: updateData },
      {
        onSuccess: () => {
          toast({
            title: "تم تحديث الطلب بنجاح",
            description: "تم حفظ التغييرات"
          });
          onSuccess();
        },
        onError: (error: any) => {
          toast({
            title: "خطأ في تحديث الطلب",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto space-y-6 p-1" dir="rtl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Order Status and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              معلومات الطلب الأساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trackId">رقم التتبع</Label>
                <Input
                  id="trackId"
                  {...register('trackId')}
                  placeholder="مثال: EB123456EG أو اتركه فارغاً"
                  disabled={isReadOnlyOrder}
                />
              </div>
              <div>
                <Label htmlFor="status">حالة الطلب</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setValue('status', value)}
                  disabled={isReadOnlyOrder}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                    <SelectItem value="returned">مرتجع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`item-name-${index}`}>اسم المنتج</Label>
                    <Input
                      id={`item-name-${index}`}
                      {...register(`items.${index}.name`, { required: 'اسم المنتج مطلوب' })}
                      placeholder="أدخل اسم المنتج"
                      disabled={isReadOnlyOrder}
                      className="text-base"
                    />
                    {errors.items?.[index]?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.items[index]?.name?.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor={`item-size-${index}`}>المقاس</Label>
                      <Select 
                        value={field.size} 
                        onValueChange={(value) => setValue(`items.${index}.size`, value)}
                        disabled={isReadOnlyOrder}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="المقاس" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                          <SelectItem value="XXXL">XXXL</SelectItem>
                        </SelectContent>
                      </Select>
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
                        disabled={isReadOnlyOrder}
                        style={{ appearance: 'textfield' }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`item-price-${index}`}>السعر</Label>
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
                        disabled={isReadOnlyOrder}
                        style={{ appearance: 'textfield' }}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                      {errors.items?.[index]?.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.items[index]?.price?.message}</p>
                      )}
                    </div>
                    <div className="flex items-end">
                      {fields.length > 1 && !isReadOnlyOrder && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {!isReadOnlyOrder && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', quantity: 1, price: 0, size: '' })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة منتج جديد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle>التفاصيل المالية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryFees">رسوم التوصيل</Label>
                <Input
                  id="deliveryFees"
                  type="number"
                  {...register('deliveryFees', { valueAsNumber: true })}
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                  disabled={isReadOnlyOrder}
                  style={{ appearance: 'textfield' }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              </div>
              <div>
                <Label htmlFor="profit">ربحية الطلب</Label>
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
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium text-lg">إجمالي الطلب: {calculateTotal().toFixed(2)} جنيه</p>
            </div>
          </CardContent>
        </Card>

        {/* Notes and Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              ملاحظات وتقييم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="أدخل أي ملاحظات خاصة بالطلب"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="rating">التقييم (من 1 إلى 5)</Label>
              <Select 
                value={watch('rating')?.toString() || ''} 
                onValueChange={(value) => setValue('rating', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - ضعيف</SelectItem>
                  <SelectItem value="2">2 - مقبول</SelectItem>
                  <SelectItem value="3">3 - جيد</SelectItem>
                  <SelectItem value="4">4 - ممتاز</SelectItem>
                  <SelectItem value="5">5 - ممتاز جداً</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'جاري التحديث...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </div>
  );
};

export default EditOrderForm;
