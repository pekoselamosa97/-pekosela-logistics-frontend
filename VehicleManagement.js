import React, { useState, useEffect } from 'react';
import { getVehicles, getDepots, addVehicle, updateVehicle, deleteVehicle } from '../api';
import './VehicleManagement.css';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_type: '',
    capacity: '',
    purchase_date: '',
    depot_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, depotsRes] = await Promise.all([
        getVehicles(),
        getDepots()
      ]);
      setVehicles(vehiclesRes.data);
      setDepots(depotsRes.data);
    } catch (error) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.vehicle_id, formData);
        alert('Vehicle updated successfully');
      } else {
        await addVehicle(formData);
        alert('Vehicle added successfully');
      }
      setShowModal(false);
      setEditingVehicle(null);
      setFormData({
        registration_number: '',
        vehicle_type: '',
        capacity: '',
        purchase_date: '',
        depot_id: ''
      });
      loadData();
    } catch (error) {
      alert('Failed to save vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration_number: vehicle.registration_number,
      vehicle_type: vehicle.vehicle_type || '',
      capacity: vehicle.capacity || '',
      purchase_date: vehicle.purchase_date ? vehicle.purchase_date.split('T')[0] : '',
      depot_id: vehicle.depot_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicle(id);
        alert('Vehicle deleted successfully');
        loadData();
      } catch (error) {
        alert('Failed to delete vehicle');
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header-actions">
          <h2>🚗 Vehicle Management</h2>
          <button className="btn-primary" onClick={() => {
            setEditingVehicle(null);
            setFormData({
              registration_number: '',
              vehicle_type: '',
              capacity: '',
              purchase_date: '',
              depot_id: ''
            });
            setShowModal(true);
          }}>
            + Add Vehicle
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Capacity (kg)</th>
                <th>Purchase Date</th>
                <th>Depot</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.vehicle_id}>
                  <td>{vehicle.vehicle_id}</td>
                  <td><strong>{vehicle.registration_number}</strong></td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.capacity?.toLocaleString()}</td>
                  <td>{vehicle.purchase_date?.split('T')[0]}</td>
                  <td>{vehicle.depot_name || 'Not Assigned'}</td>
                  <td>
                    <button className="btn-primary" onClick={() => handleEdit(vehicle)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(vehicle.vehicle_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} required>
                  <option value="">Select Type</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacity (kg)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Depot</label>
                <select name="depot_id" value={formData.depot_id} onChange={handleInputChange}>
                  <option value="">Select Depot</option>
                  {depots.map(depot => (
                    <option key={depot.depot_id} value={depot.depot_id}>
                      {depot.depot_name} - {depot.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleManagement;