'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/client';
import { formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const POLL_INTERVAL = 8000;

function SystemMessage({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', color: '#6b7a9a', fontStyle: 'italic' }}>
      {msg.body}
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>{formatPublicDateTime(msg.createdAt)}</div>
    </div>
  );
}

function ChatBubble({ msg, isOwn }) {
  return (
    <div style={{
      maxWidth: '80%',
      justifySelf: isOwn ? 'end' : 'start',
      padding: '12px 16px',
      borderRadius: 16,
      borderBottomRightRadius: isOwn ? 4 : 16,
      borderBottomLeftRadius: isOwn ? 16 : 4,
      background: isOwn ? 'linear-gradient(135deg, #8752FE, #6d3df2)' : 'rgba(135,82,254,.06)',
      color: isOwn ? '#fff' : '#1e2847',
      boxShadow: isOwn ? '0 4px 14px rgba(110,73,255,.2)' : 'none',
    }}>
      <div style={{ fontSize: '0.72rem', opacity: 0.65, marginBottom: 4, fontWeight: 600 }}>
        {msg.senderName || msg.senderType}
      </div>
      <div style={{ fontSize: '0.92rem', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{msg.body}</div>
      <div style={{ fontSize: '0.68rem', opacity: 0.45, marginTop: 4, textAlign: 'right' }}>
        {formatPublicDateTime(msg.createdAt)}
        {msg.readAt && isOwn && <span style={{ marginLeft: 6 }}>✓ read</span>}
      </div>
    </div>
  );
}

export default function TripChatRoom() {
  const params = useParams();
  const token = params?.token;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [pickupForm, setPickupForm] = useState({ address: '', instructions: '' });
  const [showPickup, setShowPickup] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportForm, setReportForm] = useState({ issueType: 'SERVICE', description: '' });
  const [reportMsg, setReportMsg] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  async function loadRoom() {
    try {
      const data = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}`, { bypassCache: true });
      setRoom(data);
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to load chat');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadRoom();
    // Mark as read
    api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/read`, { method: 'POST' }).catch(() => {});
    // Poll for new messages
    pollRef.current = setInterval(() => {
      api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}`, { bypassCache: true })
        .then((data) => setRoom(data))
        .catch(() => {});
    }, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages?.length]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const msg = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: newMsg.trim() })
      });
      setRoom((r) => r ? { ...r, messages: [...(r.messages || []), msg] } : r);
      setNewMsg('');
    } catch (err) {
      setError(err?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  }

  async function sendHotAction(action) {
    try {
      const msg = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/action`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setRoom((r) => r ? { ...r, messages: [...(r.messages || []), msg] } : r);
    } catch (err) {
      setError(err?.message || 'Unable to send');
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!reportForm.description.trim()) { setReportMsg('Please describe the issue'); return; }
    try {
      const result = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/report-issue`, {
        method: 'POST',
        body: JSON.stringify(reportForm)
      });
      setReportMsg(`Issue reported — Ticket #${result.ticketRef}`);
      setShowReport(false);
      loadRoom();
    } catch (err) {
      setReportMsg(err?.message || 'Unable to report issue');
    }
  }

  async function savePickupDetails(e) {
    e.preventDefault();
    try {
      await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/pickup`, {
        method: 'PATCH',
        body: JSON.stringify({
          pickupAddress: pickupForm.address,
          pickupInstructions: pickupForm.instructions,
        })
      });
      setShowPickup(false);
      loadRoom();
    } catch (err) {
      setError(err?.message || 'Unable to update pickup details');
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>Loading your trip chat...</div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px' }}>
        <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!room) return null;

  const isHost = room.role === 'HOST';
  const otherName = isHost ? room.guestName : room.hostName;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 18px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
      {/* Header */}
      <div className="glass card-lg" style={{ padding: '18px 22px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="eyebrow">Trip Chat</span>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#1e2847' }}>
              {room.tripCode || 'Trip Chat'}
            </h1>
            <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 4 }}>
              {room.vehicleLabel || room.listingTitle}
              {room.scheduledPickupAt && ` · Pickup: ${formatPublicDateTime(room.scheduledPickupAt)}`}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>
              Chatting with <strong>{otherName}</strong>
              {isHost && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 99, background: 'rgba(110,73,255,.1)', color: '#6e49ff', fontSize: '0.72rem', fontWeight: 700 }}>HOST</span>}
            </div>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: room.tripStatus === 'CONFIRMED' ? 'rgba(15,176,216,.18)' : room.tripStatus === 'IN_PROGRESS' ? 'rgba(80,200,120,.18)' : 'rgba(136,151,211,.14)', color: '#1e2847' }}>
            {room.tripStatus?.replace(/_/g, ' ') || 'Active'}
          </span>
        </div>
      </div>

      {/* Pickup details card */}
      {(room.pickupAddress || room.pickupInstructions) && (
        <div style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(22,163,74,.15)', background: 'rgba(22,163,74,.04)', marginBottom: 12, fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700, color: '#047857', marginBottom: 4 }}>📍 Pickup Details</div>
          {room.pickupAddress && <div style={{ color: '#1e2847' }}>{room.pickupAddress}</div>}
          {room.pickupInstructions && <div style={{ color: '#53607b', marginTop: 4 }}>{room.pickupInstructions}</div>}
        </div>
      )}

      {/* Host: share pickup details */}
      {isHost && !showPickup && (
        <button onClick={() => { setShowPickup(true); setPickupForm({ address: room.pickupAddress || '', instructions: room.pickupInstructions || '' }); }} style={{ alignSelf: 'flex-start', marginBottom: 12, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.06)', color: '#047857', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          📍 {room.pickupAddress ? 'Update' : 'Share'} Pickup Details
        </button>
      )}
      {isHost && showPickup && (
        <form onSubmit={savePickupDetails} style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(110,73,255,.1)', background: 'rgba(110,73,255,.03)', marginBottom: 12, display: 'grid', gap: 10 }}>
          <div><div className="label">Pickup address</div><input value={pickupForm.address} onChange={(e) => setPickupForm((f) => ({ ...f, address: e.target.value }))} placeholder="123 Airport Blvd, San Juan, PR" /></div>
          <div><div className="label">Instructions for guest</div><textarea rows={2} value={pickupForm.instructions} onChange={(e) => setPickupForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="Meet at the parking lot by Terminal B. Look for the white Toyota..." style={{ width: '100%', resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className={styles.checkoutPrimaryButton} style={{ fontSize: '0.82rem', padding: '8px 18px' }}>Save Pickup Details</button>
            <button type="button" onClick={() => setShowPickup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontWeight: 600, fontSize: '0.82rem' }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Hot action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {!isHost && (
          <>
            <button onClick={() => sendHotAction('ARRIVED_PICKUP')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(15,176,216,.2)', background: 'rgba(15,176,216,.06)', color: '#0e7490', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>📍 I'm at pickup</button>
            <button onClick={() => sendHotAction('ARRIVED_RETURN')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(110,73,255,.2)', background: 'rgba(110,73,255,.06)', color: '#6e49ff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>📍 I'm at return</button>
            <button onClick={() => sendHotAction('RUNNING_LATE')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(245,158,11,.2)', background: 'rgba(245,158,11,.06)', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>⏰ Running late</button>
            <button onClick={() => sendHotAction('NEED_HELP')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🆘 Need help</button>
          </>
        )}
        {isHost && (
          <>
            <button onClick={() => sendHotAction('VEHICLE_READY')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.06)', color: '#047857', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>✅ Vehicle ready</button>
            <button onClick={() => sendHotAction('VEHICLE_INSPECTED')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(110,73,255,.2)', background: 'rgba(110,73,255,.06)', color: '#6e49ff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🔍 Inspection done</button>
            <button onClick={() => sendHotAction('RUNNING_LATE')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(245,158,11,.2)', background: 'rgba(245,158,11,.06)', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>⏰ Running late</button>
            <button onClick={() => setShowReport(true)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🎫 Report Issue</button>
          </>
        )}
      </div>

      {/* Host: report issue form */}
      {isHost && showReport && (
        <form onSubmit={submitReport} style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(255,80,80,.15)', background: 'rgba(255,80,80,.03)', marginBottom: 12, display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.92rem' }}>Report an Issue</div>
          <div style={{ fontSize: '0.82rem', color: '#6b7a9a' }}>The full chat transcript will be attached to the ticket automatically.</div>
          <div>
            <div className="label">Issue type</div>
            <select value={reportForm.issueType} onChange={(e) => setReportForm((f) => ({ ...f, issueType: e.target.value }))}>
              <option value="VEHICLE_DAMAGE">Vehicle Damage</option>
              <option value="BILLING">Billing Issue</option>
              <option value="SERVICE">Service Issue</option>
              <option value="SAFETY">Safety Concern</option>
              <option value="NO_SHOW">Guest No-Show</option>
              <option value="LATE_RETURN">Late Return</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <div className="label">Describe the issue</div>
            <textarea rows={3} value={reportForm.description} onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))} placeholder="What happened? Be specific so our support team can help..." style={{ width: '100%', resize: 'vertical' }} />
          </div>
          {reportMsg && <div style={{ fontSize: '0.84rem', color: reportMsg.includes('reported') ? '#047857' : '#991b1b' }}>{reportMsg}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#991b1b', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Submit Issue Report</button>
            <button type="button" onClick={() => { setShowReport(false); setReportMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontWeight: 600, fontSize: '0.82rem' }}>Cancel</button>
          </div>
        </form>
      )}

      {error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', marginBottom: 12, fontSize: '0.86rem' }}>{error}</div>}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 8, alignContent: 'start', padding: '8px 0', maxHeight: 'calc(100vh - 450px)', minHeight: 200 }}>
        {(room.messages || []).map((msg) => {
          if (msg.messageType === 'SYSTEM' || msg.senderType === 'SYSTEM') {
            return <SystemMessage key={msg.id} msg={msg} />;
          }
          const isOwn = (isHost && msg.senderType === 'HOST') || (!isHost && msg.senderType === 'GUEST');
          return <ChatBubble key={msg.id} msg={msg} isOwn={isOwn} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Compose */}
      {!room.closedAt ? (
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid rgba(135,82,254,.08)' }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, fontSize: '0.92rem' }}
          />
          <button
            type="submit"
            className={styles.checkoutPrimaryButton}
            disabled={sending || !newMsg.trim()}
            style={{ fontSize: '0.85rem', padding: '10px 22px', whiteSpace: 'nowrap' }}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7a9a', fontSize: '0.88rem' }}>
          This chat has been closed.
        </div>
      )}
    </div>
  );
}
