import React, { useState } from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [loading, setLoading] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [driverRoleType, setDriverRoleType] = useState('fulltime');
  
  const [depots, setDepots] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const fetchDropdownData = async () => {
    try {
      const [depotsRes, clientsRes, vehiclesRes] = await Promise.all([
        fetch('http://localhost:5000/api/depots', { headers: { 'x-username': username } }),
        fetch('http://localhost:5000/api/clients', { headers: { 'x-username': username } }),
        fetch('http://localhost:5000/api/vehicles', { headers: { 'x-username': username } })
      ]);
      setDepots(await depotsRes.json());
      setClients(await clientsRes.json());
      setVehicles(await vehiclesRes.json());
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const result = await response.json();
      if (result.success) {
        setLoggedIn(true);
        setUserRole(result.role);
        setMessage(`Welcome ${username}! Role: ${result.role.toUpperCase()}`);
        fetchDropdownData();
        loadVehicles();
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      setMessage('Connection error');
    }
    setLoading(false);
  };

  const loadVehicles = async () => {
    setLoading(true);
    setActiveTab('vehicles');
    try {
      const response = await fetch('http://localhost:5000/api/vehicles', {
        headers: { 'x-username': username }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Failed to load vehicles');
    }
    setLoading(false);
  };

  const loadDrivers = async () => {
    setLoading(true);
    setActiveTab('drivers');
    try {
      const response = await fetch('http://localhost:5000/api/drivers', {
        headers: { 'x-username': username }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Failed to load drivers');
    }
    setLoading(false);
  };

  const loadDeliveries = async () => {
    setLoading(true);
    setActiveTab('deliveries');
    try {
      const response = await fetch('http://localhost:5000/api/deliveries', {
        headers: { 'x-username': username }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Failed to load deliveries');
    }
    setLoading(false);
  };

  const loadActiveDeliveries = async () => {
    setLoading(true);
    setActiveTab('activeDeliveries');
    try {
      const response = await fetch('http://localhost:5000/api/reports/active-deliveries', {
        headers: { 'x-username': username }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Failed to load active deliveries');
    }
    setLoading(false);
  };

  const loadDriverWorkload = async () => {
    setLoading(true);
    setActiveTab('driverWorkload');
    try {
      const response = await fetch('http://localhost:5000/api/reports/driver-workload', {
        headers: { 'x-username': username }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      setMessage('Failed to load driver workload');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    if (activeTab === 'vehicles') {
      setFormData({ registration_number: '', vehicle_type: '', capacity: '', purchase_date: '', depot_id: '' });
      setModalType('vehicle');
      setEditingItem(null);
      setShowModal(true);
    } else if (activeTab === 'drivers') {
      setDriverRoleType('fulltime');
      setFormData({
        full_name: '',
        address: '',
        phone: '',
        date_of_birth: '',
        role_type: 'fulltime',
        role_data: {
          employee_number: '',
          salary: '',
          hire_date: ''
        }
      });
      setModalType('driver');
      setEditingItem(null);
      setShowModal(true);
    } else if (activeTab === 'deliveries') {
      setFormData({ delivery_date: '', origin: '', destination: '', delivery_status: 'Pending', client_id: '', vehicle_id: '' });
      setModalType('delivery');
      setEditingItem(null);
      setShowModal(true);
    }
  };

  const handleDriverRoleChange = (role) => {
    setDriverRoleType(role);
    if (role === 'fulltime') {
      setFormData({
        ...formData,
        role_type: 'fulltime',
        role_data: { employee_number: '', salary: '', hire_date: '' }
      });
    } else if (role === 'contract') {
      setFormData({
        ...formData,
        role_type: 'contract',
        role_data: { contract_number: '', hourly_rate: '' }
      });
    } else if (role === 'manager') {
      setFormData({
        ...formData,
        role_type: 'manager',
        role_data: { manager_level: '', office_number: '' }
      });
    }
  };

  const handleDriverInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDriverRoleDataChange = (e) => {
    setFormData({
      ...formData,
      role_data: {
        ...formData.role_data,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleEdit = (item) => {
    if (activeTab === 'vehicles') {
      setFormData({
        registration_number: item.registration_number,
        vehicle_type: item.vehicle_type || '',
        capacity: item.capacity || '',
        purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
        depot_id: item.depot_id || ''
      });
      setModalType('vehicle');
      setEditingItem(item);
      setShowModal(true);
    } else if (activeTab === 'deliveries') {
      setFormData({
        delivery_date: item.delivery_date ? item.delivery_date.split('T')[0] : '',
        origin: item.origin || '',
        destination: item.destination || '',
        delivery_status: item.delivery_status,
        client_id: item.client_id,
        vehicle_id: item.vehicle_id
      });
      setModalType('delivery');
      setEditingItem(item);
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        let url = '';
        if (activeTab === 'vehicles') {
          url = `http://localhost:5000/api/vehicles/${id}`;
        } else if (activeTab === 'deliveries') {
          url = `http://localhost:5000/api/deliveries/${id}`;
        } else {
          alert('Cannot delete this type of item');
          return;
        }
        
        const response = await fetch(url, { 
          method: 'DELETE',
          headers: { 
            'x-username': username 
          }
        });
        
        if (response.ok) {
          alert('✅ Deleted successfully');
          if (activeTab === 'vehicles') {
            loadVehicles();
          } else if (activeTab === 'deliveries') {
            loadDeliveries();
          }
        } else {
          const error = await response.text();
          alert('❌ Delete failed: ' + error);
        }
      } catch (error) {
        alert('❌ Error deleting: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/deliveries/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': username
        },
        body: JSON.stringify({ delivery_status: newStatus })
      });
      if (response.ok) {
        alert('✅ Status updated');
        loadDeliveries();
      } else {
        alert('❌ Status update failed');
      }
    } catch (error) {
      alert('❌ Error updating status');
    }
  };

  const handleAssignDriver = async (deliveryId, personId, role, hours) => {
    if (!personId) {
      alert('Please enter a driver ID');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/deliveries/${deliveryId}/assign-driver`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-username': username
        },
        body: JSON.stringify({ person_id: parseInt(personId), role, hours_worked: parseFloat(hours) })
      });
      if (response.ok) {
        alert('✅ Driver assigned successfully');
        loadDeliveries();
      } else {
        const error = await response.json();
        alert('❌ Assignment failed: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Error assigning driver');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = '';
      let method = '';
      let body = {};
      
      if (modalType === 'vehicle') {
        if (editingItem) {
          url = `http://localhost:5000/api/vehicles/${editingItem.vehicle_id}`;
          method = 'PUT';
          body = formData;
        } else {
          url = 'http://localhost:5000/api/vehicles';
          method = 'POST';
          body = formData;
        }
      } else if (modalType === 'driver') {
        url = 'http://localhost:5000/api/drivers';
        method = 'POST';
        body = {
          full_name: formData.full_name,
          address: formData.address,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          role_type: formData.role_type,
          role_data: formData.role_data
        };
      } else if (modalType === 'delivery') {
        if (editingItem) {
          url = `http://localhost:5000/api/deliveries/${editingItem.delivery_id}/status`;
          method = 'PUT';
          body = { delivery_status: formData.delivery_status };
        } else {
          url = 'http://localhost:5000/api/deliveries';
          method = 'POST';
          body = formData;
        }
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'x-username': username
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        alert(editingItem ? '✅ Updated successfully' : '✅ Added successfully');
        setShowModal(false);
        if (activeTab === 'vehicles') loadVehicles();
        if (activeTab === 'drivers') loadDrivers();
        if (activeTab === 'deliveries') loadDeliveries();
        fetchDropdownData();
      } else {
        const error = await response.json();
        alert('❌ Operation failed: ' + (error.error || error.message));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getRoleBadge = () => {
    if (userRole === 'admin') return { background: '#28a745', text: '👑 Admin', color: 'white' };
    if (userRole === 'insert') return { background: '#ffc107', text: '✏️ Editor', color: '#333' };
    return { background: '#17a2b8', text: '👁️ Viewer', color: 'white' };
  };

  if (!loggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>🚚 Pekosela Logistics</h1>
          <h3 style={styles.subtitle}>Database Systems Management</h3>
          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
            </div>
            <button type="submit" style={styles.loginBtn} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            {message && <p style={styles.errorMsg}>{message}</p>}
          </form>
          <div style={styles.demoUsers}>
            <p><strong>Demo Users:</strong></p>
            <p>👁️ view_user1 / ViewPass123 (View Only)</p>
            <p>✏️ insert_user1 / InsertPass123 (Insert Only)</p>
            <p>👑 admin_user1 / AdminPass123 (Full Access)</p>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge();
  
  const renderTable = () => {
    if (activeTab === 'vehicles') {
      return (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Registration</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Purchase Date</th>
              <th>Depot</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.vehicle_id}>
                <td>{item.vehicle_id}</td>
                <td><strong>{item.registration_number}</strong></td>
                <td>{item.vehicle_type || '-'}</td>
                <td>{item.capacity?.toLocaleString() || '-'}</td>
                <td>{item.purchase_date?.split('T')[0] || '-'}</td>
                <td>{item.depot_name || 'Not Assigned'}</td>
                {userRole === 'admin' && (
                  <td>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(item.vehicle_id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'drivers') {
      return (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Details</th>
              <th>Deliveries</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => {
              let role = 'Staff', details = '';
              if (item.employee_number) { role = 'Full Time'; details = `${item.employee_number} | M${item.salary}`; }
              else if (item.contract_number) { role = 'Contract'; details = `${item.contract_number} | M${item.hourly_rate}/hr`; }
              else if (item.manager_level) { role = 'Manager'; details = `Level ${item.manager_level} | Office ${item.office_number}`; }
              return (
                <tr key={item.person_id}>
                  <td>{item.person_id}</td>
                  <td><strong>{item.full_name}</strong></td>
                  <td>{item.phone || '-'}</td>
                  <td><span style={styles.roleTag}>{role}</span></td>
                  <td>{details}</td>
                  <td>{item.total_deliveries || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } else if (activeTab === 'deliveries') {
      return (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Client</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Assign</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.delivery_id}>
                <td>{item.delivery_id}</td>
                <td>{item.delivery_date?.split('T')[0] || '-'}</td>
                <td>{item.origin || '-'}</td>
                <td>{item.destination || '-'}</td>
                <td>{item.client_name}</td>
                <td>{item.registration_number}</td>
                <td>
                  {userRole === 'admin' ? (
                    <select value={item.delivery_status} onChange={(e) => handleStatusChange(item.delivery_id, e.target.value)} style={styles.statusSelect}>
                      <option>Pending</option><option>Scheduled</option><option>In Transit</option><option>Completed</option>
                    </select>
                  ) : <span style={styles.statusBadge}>{item.delivery_status}</span>}
                </td>
                <td>
                  <button style={styles.assignBtn} onClick={() => { 
                    const driver = prompt('Enter driver ID (1-20):'); 
                    const hours = prompt('Enter hours:'); 
                    if(driver && hours) handleAssignDriver(item.delivery_id, driver, 'main driver', hours); 
                  }}>Assign</button>
                </td>
                {userRole === 'admin' && (
                  <td>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(item.delivery_id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'activeDeliveries') {
      return (
        <table style={styles.table}>
          <thead>
            <tr><th>ID</th><th>Date</th><th>Client</th><th>Vehicle</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.delivery_id}>
                <td>{item.delivery_id}</td>
                <td>{item.delivery_date?.split('T')[0] || '-'}</td>
                <td>{item.client_name}</td>
                <td>{item.vehicle_registration}</td>
                <td><span style={styles.statusBadge}>{item.delivery_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (activeTab === 'driverWorkload') {
      return (
        <table style={styles.table}>
          <thead>
            <tr><th>ID</th><th>Driver</th><th>Deliveries</th><th>Hours</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.person_id}>
                <td>{item.person_id}</td>
                <td><strong>{item.driver_name}</strong></td>
                <td>{item.number_of_deliveries}</td>
                <td>{item.total_hours_worked} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.header}>
        <h1>🚚 Pekosela Logistics Management System</h1>
        <div style={styles.userInfo}>
          <span>Welcome, <strong>{username}</strong>!</span>
          <span style={{ ...styles.roleBadge, background: roleBadge.background, color: roleBadge.color }}>{roleBadge.text}</span>
          <button onClick={() => setLoggedIn(false)} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.menuBar}>
        <button onClick={loadVehicles} style={activeTab === 'vehicles' ? styles.activeBtn : styles.menuBtn}>🚗 Vehicles</button>
        <button onClick={loadDrivers} style={activeTab === 'drivers' ? styles.activeBtn : styles.menuBtn}>👨‍✈️ Drivers</button>
        <button onClick={loadDeliveries} style={activeTab === 'deliveries' ? styles.activeBtn : styles.menuBtn}>📦 Deliveries</button>
        <button onClick={loadActiveDeliveries} style={activeTab === 'activeDeliveries' ? styles.activeBtn : styles.menuBtn}>📊 Active Deliveries</button>
        <button onClick={loadDriverWorkload} style={activeTab === 'driverWorkload' ? styles.activeBtn : styles.menuBtn}>📊 Driver Workload</button>
        
        {(userRole === 'insert' || userRole === 'admin') && (
          <button onClick={handleAdd} style={styles.addBtn}>➕ Add New</button>
        )}
      </div>

      <div style={styles.contentCard}>
        <h2 style={styles.sectionTitle}>
          {activeTab === 'vehicles' && '🚗 Vehicle Management'}
          {activeTab === 'drivers' && '👨‍✈️ Driver Management'}
          {activeTab === 'deliveries' && '📦 Trip Management'}
          {activeTab === 'activeDeliveries' && '📊 Active Deliveries'}
          {activeTab === 'driverWorkload' && '📊 Driver Workload'}
        </h2>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : data.length === 0 ? (
          <p style={styles.noData}>No data found</p>
        ) : (
          <div style={styles.tableContainer}>
            {renderTable()}
          </div>
        )}
        <p style={styles.totalCount}>Total: <strong>{data.length}</strong> records</p>
      </div>

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>{editingItem ? 'Edit' : 'Add'} {modalType === 'vehicle' ? 'Vehicle' : modalType === 'driver' ? 'Driver' : 'Delivery'}</h3>
            <form onSubmit={handleSubmit}>
              {modalType === 'vehicle' && (
                <>
                  <input name="registration_number" placeholder="Registration Number" value={formData.registration_number || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <select name="vehicle_type" value={formData.vehicle_type || ''} onChange={handleInputChange} style={styles.modalInput} required>
                    <option value="">Select Type</option><option value="Truck">Truck</option><option value="Van">Van</option><option value="Pickup">Pickup</option>
                  </select>
                  <input name="capacity" type="number" placeholder="Capacity (kg)" value={formData.capacity || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <input name="purchase_date" type="date" value={formData.purchase_date || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <select name="depot_id" value={formData.depot_id || ''} onChange={handleInputChange} style={styles.modalInput}>
                    <option value="">Select Depot</option>{depots.map(d => <option key={d.depot_id} value={d.depot_id}>{d.depot_name}</option>)}
                  </select>
                </>
              )}
              
              {modalType === 'driver' && (
                <>
                  <input name="full_name" placeholder="Full Name" value={formData.full_name || ''} onChange={handleDriverInputChange} style={styles.modalInput} required />
                  <input name="address" placeholder="Address" value={formData.address || ''} onChange={handleDriverInputChange} style={styles.modalInput} />
                  <input name="phone" placeholder="Phone" value={formData.phone || ''} onChange={handleDriverInputChange} style={styles.modalInput} required />
                  <input name="date_of_birth" type="date" value={formData.date_of_birth || ''} onChange={handleDriverInputChange} style={styles.modalInput} required />
                  
                  <label style={{ marginTop: '10px', fontWeight: 'bold' }}>Driver Type:</label>
                  <select value={driverRoleType} onChange={(e) => handleDriverRoleChange(e.target.value)} style={styles.modalInput}>
                    <option value="fulltime">Full Time Driver</option>
                    <option value="contract">Contract Driver</option>
                    <option value="manager">Fleet Manager</option>
                  </select>
                  
                  {driverRoleType === 'fulltime' && (
                    <>
                      <input name="employee_number" placeholder="Employee Number" value={formData.role_data?.employee_number || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                      <input name="salary" type="number" placeholder="Salary" value={formData.role_data?.salary || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                      <input name="hire_date" type="date" placeholder="Hire Date" value={formData.role_data?.hire_date || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                    </>
                  )}
                  
                  {driverRoleType === 'contract' && (
                    <>
                      <input name="contract_number" placeholder="Contract Number" value={formData.role_data?.contract_number || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                      <input name="hourly_rate" type="number" placeholder="Hourly Rate" value={formData.role_data?.hourly_rate || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                    </>
                  )}
                  
                  {driverRoleType === 'manager' && (
                    <>
                      <input name="manager_level" type="number" placeholder="Manager Level (1-5)" value={formData.role_data?.manager_level || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                      <input name="office_number" placeholder="Office Number" value={formData.role_data?.office_number || ''} onChange={handleDriverRoleDataChange} style={styles.modalInput} required />
                    </>
                  )}
                </>
              )}
              
              {modalType === 'delivery' && !editingItem && (
                <>
                  <input name="delivery_date" type="date" value={formData.delivery_date || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <input name="origin" placeholder="Origin" value={formData.origin || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <input name="destination" placeholder="Destination" value={formData.destination || ''} onChange={handleInputChange} style={styles.modalInput} required />
                  <select name="client_id" value={formData.client_id || ''} onChange={handleInputChange} style={styles.modalInput} required>
                    <option value="">Select Client</option>{clients.map(c => <option key={c.client_id} value={c.client_id}>{c.client_name}</option>)}
                  </select>
                  <select name="vehicle_id" value={formData.vehicle_id || ''} onChange={handleInputChange} style={styles.modalInput} required>
                    <option value="">Select Vehicle</option>{vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration_number}</option>)}
                  </select>
                  <select name="delivery_status" value={formData.delivery_status || 'Pending'} onChange={handleInputChange} style={styles.modalInput}>
                    <option>Pending</option><option>Scheduled</option><option>In Transit</option><option>Completed</option>
                  </select>
                </>
              )}
              {modalType === 'delivery' && editingItem && (
                <select name="delivery_status" value={formData.delivery_status || ''} onChange={handleInputChange} style={styles.modalInput}>
                  <option>Pending</option><option>Scheduled</option><option>In Transit</option><option>Completed</option>
                </select>
              )}
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  loginCard: { background: 'white', borderRadius: '10px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', color: '#333', marginBottom: '0.5rem' },
  subtitle: { textAlign: 'center', color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' },
  formGroup: { marginBottom: '1rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px', fontSize: '1rem', marginTop: '0.25rem' },
  loginBtn: { width: '100%', padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' },
  errorMsg: { color: '#dc3545', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' },
  demoUsers: { marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '5px', fontSize: '0.8rem', textAlign: 'center' },
  appContainer: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roleBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  logoutBtn: { padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  menuBar: { display: 'flex', gap: '0.5rem', padding: '1rem 2rem', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flexWrap: 'wrap' },
  menuBtn: { padding: '0.5rem 1rem', background: '#f0f0f0', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  activeBtn: { padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  addBtn: { padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  contentCard: { margin: '2rem', background: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  sectionTitle: { marginBottom: '1rem', color: '#333', borderBottom: '2px solid #667eea', paddingBottom: '0.5rem' },
  loading: { textAlign: 'center', padding: '2rem', color: '#666' },
  noData: { textAlign: 'center', padding: '2rem', color: '#999' },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  totalCount: { marginTop: '1rem', textAlign: 'right', color: '#666' },
  editBtn: { padding: '0.25rem 0.5rem', background: '#ffc107', color: '#333', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '0.25rem' },
  deleteBtn: { padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  assignBtn: { padding: '0.25rem 0.5rem', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  roleTag: { background: '#667eea', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' },
  statusBadge: { background: '#6c757d', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem' },
  statusSelect: { padding: '0.25rem', border: '1px solid #ddd', borderRadius: '3px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '2rem', borderRadius: '10px', minWidth: '450px', maxWidth: '500px' },
  modalInput: { width: '100%', padding: '0.5rem', margin: '0.5rem 0', border: '1px solid #ddd', borderRadius: '5px' },
  modalButtons: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' },
  cancelBtn: { padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  submitBtn: { padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

export default App;