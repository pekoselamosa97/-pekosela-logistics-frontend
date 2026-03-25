import React, { useState, useEffect } from 'react';
import { getDeliveries, getClients, getVehicles, getDrivers, addDelivery, updateDeliveryStatus, assignDriverToDelivery } from '../api';
import './TripManagement.css';

function TripManagement() {
  const [deliveries, setDeliveries] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [formData, setFormData] = useState({
    delivery_date: '',
    origin: '',
    destination: '',
    delivery_status: 'Pending',
    client_id: '',
    vehicle_id: ''
  });
  const [assignData, setAssignData] = useState({
    person_id: '',
    role: 'main driver',
    hours_worked: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deliveriesRes, clientsRes, vehiclesRes, driversRes] = await Promise.all([
        getDeliveries(),
        getClients(),
        getVehicles(),
        getDrivers()
      ]);
      setDeliveries(deliveriesRes.data);
      setClients(clientsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAssignChange = (e) => {
    setAssignData({ ...assignData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDelivery(formData);
      alert('Delivery created successfully');
      setShowModal(false);
      setFormData({
        delivery_date: '',
        origin: '',
        destination: '',
        delivery_status: 'Pending',
        client_id: '',
        vehicle_id: ''
      });
      loadData();
    } catch (error) {
      alert('Failed to create delivery');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDeliveryStatus(id, status);
      alert('Status updated successfully');
      loadData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    try {
      await assignDriverToDelivery(selectedDelivery.delivery_id, assignData.person_id, assignData.role, assignData.hours_worked);
      alert('Driver assigned successfully');
      setShowAssignModal(false);
      setAssignData({ person_id: '', role: 'main driver', hours_worked: '' });
      loadData();
    } catch (error) {
      alert('Failed to assign driver');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Completed': 'status-completed',
      'In Transit': 'status-transit',
      'Pending': 'status-pending',
      'Scheduled': 'status-scheduled'
    };
    return <span className={`status-badge ${statusColors[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header-actions">
          <h2>📦 Trip Management</h2>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Create Delivery
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Client</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(delivery => (
                <tr key={delivery.delivery_id}>
                  <td>{delivery.delivery_id}</td>
                  <td>{delivery.delivery_date?.split('T')[0]}</td>
                  <td>{delivery.origin}</td>
                  <td>{delivery.destination}</td>
                  <td>{delivery.client_name}</td>
                  <td>{delivery.registration_number}</td>
                  <td>{getStatusBadge(delivery.delivery_status)}</td>
                  <td>
                    <select 
                      onChange={(e) => handleStatusUpdate(delivery.delivery_id, e.target.value)}
                      value={delivery.delivery_status}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button 
                      className="btn-primary assign-btn"
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign Driver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Delivery Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Delivery</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Delivery Date</label>
                <input type="date" name="delivery_date" value={formData.delivery_date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Origin</label>
                <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Client</label>
                <select name="client_id" value={formData.client_id} onChange={handleInputChange} required>
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.client_id} value={client.client_id}>{client.client_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle</label>
                <select name="vehicle_id" value={formData.vehicle_id} onChange={handleInputChange} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                      {vehicle.registration_number} - {vehicle.vehicle_type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="delivery_status" value={formData.delivery_status} onChange={handleInputChange}>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign Driver to Delivery #{selectedDelivery.delivery_id}</h3>
            <form onSubmit={handleAssignDriver}>
              <div className="form-group">
                <label>Driver</label>
                <select name="person_id" value={assignData.person_id} onChange={handleAssignChange} required>
                  <option value="">Select Driver</option>
                  {drivers.filter(d => d.employee_number || d.contract_number).map(driver => (
                    <option key={driver.person_id} value={driver.person_id}>
                      {driver.full_name} - {driver.employee_number || driver.contract_number}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={assignData.role} onChange={handleAssignChange}>
                  <option value="main driver">Main Driver</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hours Worked</label>
                <input type="number" step="0.5" name="hours_worked" value={assignData.hours_worked} onChange={handleAssignChange} required />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripManagement;