import { database } from '@/database';

import { usePaymentMethodsContext } from '@shared/contexts/paymentMethods';
import PaymentMethod from '@shared/models/PaymentMethod';

export const usePaymentMethodsMutation = () => {
  const { refetch } = usePaymentMethodsContext();

  const addPaymentMethod = async (
    paymentMethod: Pick<PaymentMethod, 'name' | 'type'>,
  ) => {
    await database.write(async () => {
      const collection = database.get<PaymentMethod>('payment_methods');
      await collection.create((item) => {
        item.name = paymentMethod.name;
        item.type = paymentMethod.type;
      });
    });
    await refetch();
  };

  const updatePaymentMethod = async (
    paymentMethod: Pick<PaymentMethod, 'id' | 'name' | 'type'>,
  ) => {
    await database.write(async () => {
      const currentPaymentMethod = await database
        .get<PaymentMethod>('payment_methods')
        .find(paymentMethod.id);

      if (!currentPaymentMethod) {
        throw new Error('Payment method not found');
      }

      await currentPaymentMethod.update((item) => {
        item.name = paymentMethod.name;
        item.type = paymentMethod.type;
      });
    });
    await refetch();
  };

  const deletePaymentMethod = async (id: string) => {
    await database.write(async () => {
      const paymentMethod = await database
        .get<PaymentMethod>('payment_methods')
        .find(id);
      if (paymentMethod) {
        await paymentMethod.destroyPermanently();
      }
    });
    await refetch();
  };

  return { addPaymentMethod, updatePaymentMethod, deletePaymentMethod };
};
