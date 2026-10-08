import React, { useState, useEffect } from 'react';
import {
  Search,
  Laptop,
  Monitor,
  Armchair,
  Tablet,
  Box,
  MapPin,
  User,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit3,
  X
} from 'lucide-react';

export default function AssetsPage({ apiUrl, onNavigateToAdd }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // State for Status Update Modal
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [newStatus, setNewStatus] = useState('Available');
  const [assignedToInput, setAssignedToInput] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch Assets
  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`${apiUrl}/assets?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch inventory.');
      }
      setAssets(data.assets || []);
    } catch (err) {
      setError(err.message || 'Error loading assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter]);

  // Handle Quick Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssets();
  };

  // Open Status Edit Modal
  const openStatusModal = (asset) => {
    setSelectedAsset(asset);
    setNewStatus(asset.status);
    setAssignedToInput(asset.assignedTo || '');
    setActionNote('');
  };

  // Save Status / Assignment Update (calls PATCH /api/assets/:id/status)
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setUpdating(true);
    try {
      const res = await fetch(`${apiUrl}/assets/${selectedAsset.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedTo: newStatus === 'Available' ? '' : assignedToInput,
          note: actionNote.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update asset status.');
      }

      // Refresh list & close modal
      setSelectedAsset(null);
      await fetchAssets();
    } catch (err) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  // Helper for category icons
  const getCategoryIcon = (category = '') => {
    const cat = category.toLowerCase();
    if (cat.includes('laptop')) return <Laptop size={18} />;
    if (cat.includes('monitor') || cat.includes('display')) return <Monitor size={18} />;
    if (cat.includes('chair') || cat.includes('furniture')) return <Armchair size={18} />;
    if (cat.includes('tablet') || cat.includes('ipad')) return <Tablet size={18} />;
    return <Box size={18} />;
  };

  // Helper for badge class
  const getStatusBadgeClass = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'available') return 'status-badge available';
    if (s === 'assigned') return 'status-badge assigned';
    return 'status-badge maintenance';
  };

  // Computed summary counts
  const totalCount = assets.length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const assignedCount = assets.filter(a => a.status === 'Assigned').length;
  const maintenanceCount = assets.filter(a => a.status === 'Maintenance').length;

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Office Hardware & Assets</h1>
          <p className="page-subtitle">Manage devices, workstation equipment, and employee assignments</p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateToAdd}>
          <Plus size={16} /> Add New Asset
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL INVENTORY</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalCount}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--status-available-text)', fontWeight: 600 }}>AVAILABLE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-available-text)' }}>
            {availableCount}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--status-assigned-text)', fontWeight: 600 }}>ASSIGNED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-assigned-text)' }}>
            {assignedCount}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--status-maintenance-text)', fontWeight: 600 }}>MAINTENANCE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--status-maintenance-text)' }}>
            {maintenanceCount}
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="assets-controls">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, serial, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="filter-pills">
          {['All', 'Available', 'Assigned', 'Maintenance'].map((tab) => (
            <button
              key={tab}
              className={`filter-pill ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchAssets}
            title="Refresh list"
            style={{ marginLeft: '0.5rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Asset Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading office assets...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Box size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No assets found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            No equipment matches your current filter or search criteria.
          </p>
          <button className="btn btn-primary" onClick={onNavigateToAdd}>
            <Plus size={16} /> Register First Asset
          </button>
        </div>
      ) : (
        <div className="asset-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-card">
              <div>
                <div className="asset-card-top">
                  <span className={getStatusBadgeClass(asset.status)}>
                    <span className="status-dot"></span>
                    {asset.status}
                  </span>
                  <span className="asset-tag">{asset.serialNumber}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ color: 'var(--brand-primary)' }}>
                    {getCategoryIcon(asset.category)}
                  </div>
                  <h3 className="asset-name">{asset.name}</h3>
                </div>

                <div className="asset-meta">
                  <div className="asset-meta-row">
                    <MapPin size={14} color="var(--text-muted)" />
                    <span>{asset.location || 'HQ Office'}</span>
                  </div>
                  <div className="asset-meta-row">
                    <User size={14} color="var(--text-muted)" />
                    <span>
                      {asset.status === 'Assigned' && asset.assignedTo
                        ? asset.assignedTo
                        : 'Not assigned (In storage)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="asset-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => openStatusModal(asset)}
                >
                  <Edit3 size={13} /> Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Status & Assignment Update */}
      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Asset</h3>
              <button className="modal-close" onClick={() => setSelectedAsset(null)}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Updating <strong>{selectedAsset.name}</strong> ({selectedAsset.serialNumber})
            </p>

            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Available">Available (In Storage)</option>
                  <option value="Assigned">Assigned (In Use)</option>
                  <option value="Maintenance">Maintenance (Under Repair)</option>
                  <option value="Retired">Retired / Decommissioned</option>
                </select>
              </div>

              {newStatus === 'Assigned' && (
                <div className="form-group">
                  <label className="form-label">Assigned Employee / Team</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maya Patel (Engineering)"
                    value={assignedToInput}
                    onChange={(e) => setAssignedToInput(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Action Note (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Checked out for remote sprint"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedAsset(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
