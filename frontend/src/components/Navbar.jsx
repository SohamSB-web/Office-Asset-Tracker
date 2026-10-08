import React from 'react';
import { Layers, PlusCircle, LogOut, ShieldCheck, Box } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="nav-brand" onClick={() => setCurrentPage('assets')}>
          <div className="brand-icon-box">
            <Layers size={20} />
          </div>
          <div>
            <span>Office Asset Tracker</span>
          </div>
        </div>

        <nav className="nav-links">
          {user ? (
            <>
              <button
                className={`nav-item ${currentPage === 'assets' ? 'active' : ''}`}
                onClick={() => setCurrentPage('assets')}
              >
                <Box size={16} />
                <span>Inventory</span>
              </button>

              <button
                className={`nav-item ${currentPage === 'add-asset' ? 'active' : ''}`}
                onClick={() => setCurrentPage('add-asset')}
              >
                <PlusCircle size={16} />
                <span>Add Asset</span>
              </button>

              <div className="user-badge" title={`Role: ${user.role || 'Staff'}`}>
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name || user.phone}</span>
                <button
                  className="logout-btn"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <button
              className={`nav-item ${currentPage === 'auth' ? 'active' : ''}`}
              onClick={() => setCurrentPage('auth')}
            >
              <ShieldCheck size={16} />
              <span>Sign In</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
