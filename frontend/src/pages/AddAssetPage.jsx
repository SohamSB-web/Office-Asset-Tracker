import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AddAssetPage({ apiUrl, user, onBack, onAssetCreated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('HQ - Main Storage');
  const [assignedTo, setAssignedTo] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please provide an asset name.');
      return;
    }
    if (!serialNumber.trim()) {
      setError('Please provide a unique serial number or asset tag.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          serialNumber: serialNumber.trim(),
          location: location.trim(),
          assignedTo: assignedTo.trim(),
          createdBy: user?.name || user?.phone || 'Admin'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add asset.');
      }

      setSuccess('Asset registered successfully!');
      setTimeout(() => {
        onAssetCreated();
      }, 700);
    } catch (err) {
      setError(err.message || 'Error creating asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={onBack}
        style={{ marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={14} /> Back to Inventory
      </button>

      <div className="glass-card">
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Register New Asset</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Add new equipment or hardware to your company inventory directory.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Asset Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MacBook Pro 16-inch M3 Max"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Monitor">Monitor / Display</option>
                <option value="Furniture">Furniture / Chair</option>
                <option value="Tablet">Tablet / iPad</option>
                <option value="Peripherals">Peripherals / Audio</option>
                <option value="Other">Other Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number / Asset Tag *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MBP-2024-9102"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office Location / Department</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. HQ Floor 3 - Engineering Pod"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Assignment (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Leave empty if asset is available in storage"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              If assigned, status will automatically be set to "Assigned". Otherwise, it will be "Available".
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onBack}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-icon" /> Saving...
                </>
              ) : (
                <>
                  <PlusCircle size={16} /> Register Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
