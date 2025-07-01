import { database } from '@/database';
import PaymentMethod from '@/shared/models/PaymentMethod';
import { useEffect, useState } from 'react';

export const usePaymentMethods = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const paymentMethodsData = await database
        .get<PaymentMethod>('payment_methods')
        .query()
        .fetch();
      setPaymentMethods(paymentMethodsData ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const refetch = () => {
    return fetchPaymentMethods();
  };

  return {
    isLoading,
    paymentMethods,
    refetch,
  };
};
