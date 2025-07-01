import PaymentMethod from '@/shared/models/PaymentMethod';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { database } from '@/database';

export type PaymentMethodsContextType = {
  paymentMethods: PaymentMethod[];
  refetch: () => Promise<void>;
};

const PaymentMethodsContext = createContext<PaymentMethodsContextType | null>(
  null,
);

export const PaymentMethodsProvider = ({
  children,
}: {
  children: React.ReactNode;
  paymentMethods: PaymentMethod[];
}) => {
  const { paymentMethods, refetch } = usePaymentMethods();

  return (
    <PaymentMethodsContext.Provider value={{ paymentMethods, refetch }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethodsContext = () => {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error(
      'usePaymentMethods must be used within a PaymentMethodsProvider',
    );
  }
  return context;
};
