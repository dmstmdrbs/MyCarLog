// Base Repository
export { BaseRepository, type IRepository } from './BaseRepository';

// Vehicle Repository
export {
  VehicleRepository,
  vehicleRepository,
  type IVehicleRepository,
  type CreateVehicleData,
  type UpdateVehicleData,
} from './VehicleRepository';

// FuelRecord Repository
export {
  FuelRecordRepository,
  fuelRecordRepository,
  type IFuelRecordRepository,
  type CreateFuelRecordData,
  type UpdateFuelRecordData,
} from './FuelRecordRepository';

// PaymentMethod Repository
export {
  PaymentMethodRepository,
  paymentMethodRepository,
  type IPaymentMethodRepository,
  type CreatePaymentMethodData,
  type UpdatePaymentMethodData,
} from './PaymentMethodRepository';

// Station Repository
export {
  StationRepository,
  stationRepository,
  type IStationRepository,
  type CreateStationData,
  type UpdateStationData,
} from './StationRepository';

// MaintenanceItem Repository
export {
  MaintenanceItemRepository,
  maintenanceItemRepository,
  type IMaintenanceItemRepository,
  type CreateMaintenanceItemData,
  type UpdateMaintenanceItemData,
} from './MaintenanceItemRepository';

// MaintenanceRecord Repository
export {
  maintenanceRecordRepository,
  type IMaintenanceRecordRepository,
} from './MaintenanceRecordRepository';

// MaintenancePlan Repository
export {
  maintenancePlanRepository,
  type IMaintenancePlanRepository,
  type CreateMaintenancePlanData,
  type UpdateMaintenancePlanData,
} from './MaintenancePlanRepository';

// Shop Repository
export {
  shopRepository,
  type IShopRepository,
  type CreateShopData,
  type UpdateShopData,
} from './ShopRepository';
