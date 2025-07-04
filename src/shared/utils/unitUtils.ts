export function getFuelUnit(vehicleType?: string): string {
  return vehicleType === 'EV' ? 'kWh' : 'L';
}

export function getFuelUnitPrice(vehicleType?: string): string {
  return vehicleType === 'EV' ? 'kWh' : 'L';
}
