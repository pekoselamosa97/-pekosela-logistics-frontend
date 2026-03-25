import React, { useState, useEffect } from 'react';
import { getActiveDeliveries, getDriverWorkload, getVehicleMaintenanceCost, getVehicles } from '../api';
import './Reports.css';

function Reports() {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [driverWorkload, setDriverWorkload] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceCost, setMaintenanceCost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('deliveries');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [activeRes, workloadRes, vehiclesRes] = await Promise.all([
        getActiveDeliveries(),
        getDriverWorkload(),
        getVehicles()
      ]);
      setActiveDeliveries(activeRes.data);
      setDriverWorkload(workloadRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicleId) => {
    setSelectedVehicle(vehicleId);
    try {
      const response = await getVehicleMaintenanceCost(vehicleId);
      setMaintenanceCost(response.data.total_cost);
    } catch (error) {
      alert('Failed to load maintenance cost');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>📊 Reports Dashboard</h2>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveTab('deliveries')}
          >
            Active Deliveries
          </button>
          <button 
            className={`tab ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            Driver Workload
          </button>
          <button 
            className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            Vehicle Maintenance
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {activeTab === 'deliveries' && (
          <div className="report-section">
            <h3>🚚 Active Deliveries (Not Completed)</h3>
            {activeDeliveries.length === 0 ? (
              <p>No active deliveries</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDeliveries.map(delivery => (
                    <tr key={delivery.delivery_id}>
                      <td>{delivery.delivery_id}</td>
                      <td>{delivery.delivery_date?.split('T')[0]}</td>
                      <td>{delivery.client_name}</td>
                      <td>{delivery.vehicle_registration}</td>
                      <td>
                        <span className={`status-badge status-${delivery.delivery_status.toLowerCase().replace(' ', '-')}`}>
                          {delivery.delivery_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="report-section">
            <h3>👨‍✈️ Driver Workload Summary</h3>
            {driverWorkload.length === 0 ? (
              <p>No driver data available</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Driver ID</th>
                    <th>Driver Name</th>
                    <th>Number of Deliveries</th>
                    <th>Total Hours Worked</th>
                  </tr>
                </thead>
                <tbody>
                  {driverWorkload.map(driver => (
                    <tr key={driver.person_id}>
                      <td>{driver.person_id}</td>
                      <td><strong>{driver.driver_name}</strong></td>
                      <td>{driver.number_of_deliveries}</td>
                      <td>{driver.total_hours_worked} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="report-section">
            <h3>🔧 Vehicle Maintenance Cost</h3>
            <div className="maintenance-selector">
              <select 
                onChange={(e) => handleVehicleSelect(e.target.value)}
                value={selectedVehicle || ''}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                    {vehicle.registration_number} - {vehicle.vehicle_type}
                  </option>
                ))}
              </select>
              
              {selectedVehicle && maintenanceCost !== null && (
                <div className="maintenance-result">
                  <h4>Total Maintenance Cost for Vehicle {selectedVehicle}</h4>
                  <div className="cost-display">
                    M {maintenanceCost.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;