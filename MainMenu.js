import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MainMenu.css';

function MainMenu() {
  const navigate = useNavigate();

  const menuItems = [
    { title: '🚗 Vehicle Management', path: '/vehicles', description: 'Add, edit, and manage fleet vehicles', icon: '🚗' },
    { title: '👨‍✈️ Driver Management', path: '/drivers', description: 'Manage drivers and their assignments', icon: '👨‍✈️' },
    { title: '📦 Trip Management', path: '/trips', description: 'Create and manage deliveries', icon: '📦' },
    { title: '📊 Reports', path: '/reports', description: 'View active deliveries and driver workload', icon: '📊' },
  ];

  return (
    <div className="container">
      <div className="card">
        <h2>📋 Main Menu</h2>
        <p className="welcome-text">Select an option to manage the logistics system</p>
        
        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="menu-card"
              onClick={() => navigate(item.path)}
            >
              <div className="menu-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainMenu;