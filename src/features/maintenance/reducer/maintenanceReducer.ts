import type {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';

export type Action = {
  type:
    | 'setDate'
    | 'setMaintenanceItem'
    | 'setCost'
    | 'setMileage'
    | 'setShop'
    | 'setMemo'
    | 'setPaymentMethod'
    | 'setVehicleId'
    | 'setIsDiy';
  data: UpdateMaintenanceRecordData;
};

export const reducer = (
  state: CreateMaintenanceRecordData | UpdateMaintenanceRecordData,
  action: Action,
) => {
  switch (action.type) {
    case 'setDate':
      return { ...state, date: action.data.date };
    case 'setMaintenanceItem':
      return { ...state, maintenanceItemId: action.data.maintenanceItemId };
    case 'setCost':
      return { ...state, cost: action.data.cost };
    case 'setMileage':
      return { ...state, odometer: action.data.odometer };
    case 'setShop':
      return {
        ...state,
        shopName: action.data.shopName,
        shopId: action.data.shopId,
        isDiy: false,
      };
    case 'setMemo':
      return { ...state, memo: action.data.memo };
    case 'setVehicleId':
      return { ...state, vehicleId: action.data.vehicleId };
    case 'setPaymentMethod':
      return {
        ...state,
        paymentMethodId: action.data.paymentMethodId,
        paymentName: action.data.paymentName,
        paymentType: action.data.paymentType,
      };
    case 'setIsDiy':
      return {
        ...state,
        isDiy: action.data.isDiy,
        shopName: action.data.shopName,
        shopId: action.data.shopId,
      };
    default:
      return state;
  }
};
