import React, { useState } from 'react';
import { Smartphone, ShieldCheck, KeyRound, ArrowRight, UserCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthPage({ apiUrl, onAuthSuccess }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Step 1: Send OTP via Backend (Minimoth API)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!phone || phone.trim().length < 8) {
      setError('Please provide a valid phone number (e.g. +91 9876543210).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setInfoMessage(data.message || 'OTP sent successfully! Please check WhatsApp/SMS.');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Error communicating with authentication server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP via Backend (Minimoth API)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the verification code you received.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: otp.trim(),
          name: name.trim() || undefined
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Please check the code.');
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-card">
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div className="otp-icon-header">
          {step === 'phone' ? <Smartphone size={28} /> : <KeyRound size={28} />}
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
          {step === 'phone' ? 'Office Sign In' : 'Enter Verification Code'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {step === 'phone'
            ? 'Access the inventory portal via instant WhatsApp/SMS OTP.'
            : `We sent a one-time code to ${phone}`}
        </p>

        {error && (
          <div className="alert alert-error" style={{ textAlign: 'left' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{error}</div>
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-success" style={{ textAlign: 'left' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{infoMessage}</div>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Full Name (Optional for sign in)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                Include country code (e.g. +91 for India, +1 for US/Canada)
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-icon" /> Sending OTP...
                </>
              ) : (
                <>
                  Send OTP Code <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center' }}>
                6-Digit OTP Code
              </label>
              <input
                type="text"
                className="form-input"
                style={{
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  letterSpacing: '0.3em',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin-icon" /> Verifying...
                </>
              ) : (
                <>
                  <UserCheck size={16} /> Verify & Access Tracker
                </>
              )}
            </button>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary btn-sm btn"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
              >
                Change Phone
              </button>

              <button
                type="button"
                className="btn-secondary btn-sm btn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.775rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem'
        }}>
          <ShieldCheck size={14} color="#3b82f6" />
          <span>Secured by Minimoth WhatsApp & SMS Authentication</span>
        </div>
      </div>
    </div>
  );
}
