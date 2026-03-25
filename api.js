import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = (username, password) => api.post('/login', { username, password });

// Vehicle endpoints
export const getVehicles = () => api.get('/vehicles');
export const getDepots = () => api.get('/depots');
export const addVehicle = (vehicle) => api.post('/vehicles', vehicle);
export const updateVehicle = (id, vehicle) => api.put(`/vehicles/${id}`, vehicle);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);

// Driver endpoints
export const getDrivers = () => api.get('/drivers');
export const addDriver = (driver) => api.post('/drivers', driver);

// Delivery endpoints
export const getDeliveries = () => api.get('/deliveries');
export const getClients = () => api.get('/clients');
export const addDelivery = (delivery) => api.post('/deliveries', delivery);
export const updateDeliveryStatus = (id, status) => api.put(`/deliveries/${id}/status`, { delivery_status: status });
export const assignDriverToDelivery = (deliveryId, person_id, role, hours_worked) => 
  api.post(`/deliveries/${deliveryId}/assign-driver`, { person_id, role, hours_worked });

// Report endpoints
export const getActiveDeliveries = () => api.get('/reports/active-deliveries');
export const getDriverWorkload = () => api.get('/reports/driver-workload');
export const getVehicleMaintenanceCost = (vehicleId) => api.get(`/reports/vehicle-maintenance/${vehicleId}`);

export default api;