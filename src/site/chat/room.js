'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/client';
import { formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../sitePreviewPremium.module.css';

const POLL_INTERVAL = 30000; // Fallback polling — SSE is primary
const API_BASE = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_BASE || '') : '';
const TYPING_DEBOUNCE = 2000;

function SystemMessage({ msg }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', color: '#6b7a9a', fontStyle: 'italic' }}>
      {msg.body}
      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>{formatPublicDateTime(msg.createdAt)}</div>
    </div>
  );
}

function ChatBubble({ msg, isOwn, t }) {
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
        {msg.readAt && isOwn && <span style={{ marginLeft: 6 }}>✓ {t('chatRoom.read')}</span>}
      </div>
    </div>
  );
}

function ImageMessage({ msg, isOwn, t }) {
  const lines = (msg.body || '').split('\n');
  const url = lines.find((l) => l.startsWith('http'));
  const caption = lines.filter((l) => !l.startsWith('http')).join(' ').replace(/^📷\s*/, '').trim();
  return (
    <div style={{ maxWidth: '80%', justifySelf: isOwn ? 'end' : 'start' }}>
      <div style={{ fontSize: '0.72rem', opacity: 0.65, marginBottom: 4, fontWeight: 600, color: '#1e2847' }}>{msg.senderName || msg.senderType}</div>
      {url && <img src={url} alt={caption || t('chatRoom.sharedImage')} style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 4 }} />}
      {caption && <div style={{ fontSize: '0.86rem', color: '#53607b' }}>{caption}</div>}
      <div style={{ fontSize: '0.68rem', opacity: 0.45, marginTop: 4 }}>{formatPublicDateTime(msg.createdAt)}</div>
    </div>
  );
}

export default function TripChatRoom() {
  const { t } = useTranslation();
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
  const [otherTyping, setOtherTyping] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const typingRef = useRef(null);
  const sseRef = useRef(null);

  async function loadRoom() {
    try {
      const data = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}`, { bypassCache: true });
      setRoom(data);
      setError('');
    } catch (err) {
      setError(err?.message || t('chatRoom.unableToLoadChat'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadRoom();
    api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/read`, { method: 'POST' }).catch(() => {});

    // SSE for real-time updates
    let sseConnected = false;
    try {
      const sseUrl = `${API_BASE}/api/public/booking/trip-chat/${encodeURIComponent(token)}/stream`;
      const es = new EventSource(sseUrl);
      sseRef.current = es;

      es.addEventListener('message', (e) => {
        try {
          const msg = JSON.parse(e.data);
          setRoom((r) => r ? { ...r, messages: [...(r.messages || []), msg] } : r);
        } catch {}
      });

      es.addEventListener('typing', () => {
        setOtherTyping(true);
        setTimeout(() => setOtherTyping(false), 3000);
      });

      es.addEventListener('connected', () => { sseConnected = true; });
      es.onerror = () => {
        sseConnected = false;
        es.close();
      };
    } catch { sseConnected = false; }

    // Fallback polling (slower when SSE is active)
    pollRef.current = setInterval(() => {
      if (sseConnected) return;
      api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}`, { bypassCache: true })
        .then((data) => setRoom(data))
        .catch(() => {});
    }, POLL_INTERVAL);

    // Load templates for host
    api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/templates`).then((t) => {
      if (Array.isArray(t)) setTemplates(t);
    }).catch(() => {});

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (sseRef.current) sseRef.current.close();
    };
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
      setError(err?.message || t('chatRoom.unableToSendMessage'));
    } finally {
      setSending(false);
    }
  }

  function handleInputChange(value) {
    setNewMsg(value);
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/typing`, { method: 'POST' }).catch(() => {});
    }, 500);
  }

  async function sendTemplate(templateId) {
    try {
      const msg = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/template`, {
        method: 'POST', body: JSON.stringify({ templateId })
      });
      setRoom((r) => r ? { ...r, messages: [...(r.messages || []), msg] } : r);
      setShowTemplates(false);
    } catch (err) {
      setError(err?.message || t('chatRoom.unableToSendTemplate'));
    }
  }

  async function sendImage() {
    const url = prompt(t('chatRoom.pasteImageUrl'));
    if (!url || !url.startsWith('http')) return;
    const caption = prompt(t('chatRoom.captionOptional')) || '';
    try {
      const msg = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/image`, {
        method: 'POST', body: JSON.stringify({ imageUrl: url, caption })
      });
      setRoom((r) => r ? { ...r, messages: [...(r.messages || []), msg] } : r);
    } catch (err) {
      setError(err?.message || t('chatRoom.unableToSendImage'));
    }
  }

  async function blockChat() {
    if (!confirm(t('chatRoom.confirmEndChat'))) return;
    try {
      await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/block`, { method: 'POST' });
      loadRoom();
    } catch (err) {
      setError(err?.message || t('chatRoom.unableToBlock'));
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
      setError(err?.message || t('chatRoom.unableToSend'));
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    if (!reportForm.description.trim()) { setReportMsg(t('chatRoom.pleaseDescribeIssue')); return; }
    try {
      const result = await api(`/api/public/booking/trip-chat/${encodeURIComponent(token)}/report-issue`, {
        method: 'POST',
        body: JSON.stringify(reportForm)
      });
      setReportMsg(t('chatRoom.issueReported', { ticketRef: result.ticketRef }));
      setShowReport(false);
      loadRoom();
    } catch (err) {
      setReportMsg(err?.message || t('chatRoom.unableToReportIssue'));
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
      setError(err?.message || t('chatRoom.unableToUpdatePickup'));
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="surface-note" style={{ color: '#6b7a9a' }}>{t('chatRoom.loadingChat')}</div>
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
            <span className="eyebrow">{t('chatRoom.tripChat')}</span>
            <h1 style={{ margin: '4px 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#1e2847' }}>
              {room.tripCode || t('chatRoom.tripChat')}
            </h1>
            <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 4 }}>
              {room.vehicleLabel || room.listingTitle}
              {room.scheduledPickupAt && ` · ${t('chatRoom.pickup')}: ${formatPublicDateTime(room.scheduledPickupAt)}`}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 2 }}>
              {t('chatRoom.chattingWith')} <strong>{otherName}</strong>
              {isHost && <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 99, background: 'rgba(110,73,255,.1)', color: '#6e49ff', fontSize: '0.72rem', fontWeight: 700 }}>HOST</span>}
            </div>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', background: room.tripStatus === 'CONFIRMED' ? 'rgba(15,176,216,.18)' : room.tripStatus === 'IN_PROGRESS' ? 'rgba(80,200,120,.18)' : 'rgba(136,151,211,.14)', color: '#1e2847' }}>
            {room.tripStatus?.replace(/_/g, ' ') || t('chatRoom.active')}
          </span>
        </div>
      </div>

      {/* Pickup details card */}
      {(room.pickupAddress || room.pickupInstructions) && (
        <div style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(22,163,74,.15)', background: 'rgba(22,163,74,.04)', marginBottom: 12, fontSize: '0.88rem' }}>
          <div style={{ fontWeight: 700, color: '#047857', marginBottom: 4 }}>📍 {t('chatRoom.pickupDetails')}</div>
          {room.pickupAddress && <div style={{ color: '#1e2847' }}>{room.pickupAddress}</div>}
          {room.pickupInstructions && <div style={{ color: '#53607b', marginTop: 4 }}>{room.pickupInstructions}</div>}
        </div>
      )}

      {/* Host: share pickup details */}
      {isHost && !showPickup && (
        <button onClick={() => { setShowPickup(true); setPickupForm({ address: room.pickupAddress || '', instructions: room.pickupInstructions || '' }); }} style={{ alignSelf: 'flex-start', marginBottom: 12, padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.06)', color: '#047857', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
          📍 {room.pickupAddress ? t('chatRoom.updatePickupDetails') : t('chatRoom.sharePickupDetails')}
        </button>
      )}
      {isHost && showPickup && (
        <form onSubmit={savePickupDetails} style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(110,73,255,.1)', background: 'rgba(110,73,255,.03)', marginBottom: 12, display: 'grid', gap: 10 }}>
          <div><div className="label">{t('chatRoom.pickupAddress')}</div><input value={pickupForm.address} onChange={(e) => setPickupForm((f) => ({ ...f, address: e.target.value }))} placeholder={t('chatRoom.pickupAddressPlaceholder')} /></div>
          <div><div className="label">{t('chatRoom.instructionsForGuest')}</div><textarea rows={2} value={pickupForm.instructions} onChange={(e) => setPickupForm((f) => ({ ...f, instructions: e.target.value }))} placeholder={t('chatRoom.instructionsPlaceholder')} style={{ width: '100%', resize: 'vertical' }} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className={styles.checkoutPrimaryButton} style={{ fontSize: '0.82rem', padding: '8px 18px' }}>{t('chatRoom.savePickupDetails')}</button>
            <button type="button" onClick={() => setShowPickup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontWeight: 600, fontSize: '0.82rem' }}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {/* Hot action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {!isHost && (
          <>
            <button onClick={() => sendHotAction('ARRIVED_PICKUP')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(15,176,216,.2)', background: 'rgba(15,176,216,.06)', color: '#0e7490', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>📍 {t('chatRoom.imAtPickup')}</button>
            <button onClick={() => sendHotAction('ARRIVED_RETURN')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(110,73,255,.2)', background: 'rgba(110,73,255,.06)', color: '#6e49ff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>📍 {t('chatRoom.imAtReturn')}</button>
            <button onClick={() => sendHotAction('RUNNING_LATE')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(245,158,11,.2)', background: 'rgba(245,158,11,.06)', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>⏰ {t('chatRoom.runningLate')}</button>
            <button onClick={() => sendHotAction('NEED_HELP')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🆘 {t('chatRoom.needHelp')}</button>
          </>
        )}
        {isHost && (
          <>
            <button onClick={() => sendHotAction('VEHICLE_READY')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(22,163,74,.2)', background: 'rgba(22,163,74,.06)', color: '#047857', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>✅ {t('chatRoom.vehicleReady')}</button>
            <button onClick={() => sendHotAction('VEHICLE_INSPECTED')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(110,73,255,.2)', background: 'rgba(110,73,255,.06)', color: '#6e49ff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🔍 {t('chatRoom.inspectionDone')}</button>
            <button onClick={() => sendHotAction('RUNNING_LATE')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(245,158,11,.2)', background: 'rgba(245,158,11,.06)', color: '#b45309', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>⏰ {t('chatRoom.runningLate')}</button>
            <button onClick={() => setShowReport(true)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,80,80,.2)', background: 'rgba(255,80,80,.06)', color: '#991b1b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>🎫 {t('chatRoom.reportIssue')}</button>
          </>
        )}
      </div>

      {/* Host: report issue form */}
      {isHost && showReport && (
        <form onSubmit={submitReport} style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(255,80,80,.15)', background: 'rgba(255,80,80,.03)', marginBottom: 12, display: 'grid', gap: 10 }}>
          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.92rem' }}>{t('chatRoom.reportAnIssue')}</div>
          <div style={{ fontSize: '0.82rem', color: '#6b7a9a' }}>{t('chatRoom.chatTranscriptAttached')}</div>
          <div>
            <div className="label">{t('chatRoom.issueType')}</div>
            <select value={reportForm.issueType} onChange={(e) => setReportForm((f) => ({ ...f, issueType: e.target.value }))}>
              <option value="VEHICLE_DAMAGE">{t('chatRoom.vehicleDamage')}</option>
              <option value="BILLING">{t('chatRoom.billingIssue')}</option>
              <option value="SERVICE">{t('chatRoom.serviceIssue')}</option>
              <option value="SAFETY">{t('chatRoom.safetyConcern')}</option>
              <option value="NO_SHOW">{t('chatRoom.guestNoShow')}</option>
              <option value="LATE_RETURN">{t('chatRoom.lateReturn')}</option>
              <option value="OTHER">{t('chatRoom.other')}</option>
            </select>
          </div>
          <div>
            <div className="label">{t('chatRoom.describeIssue')}</div>
            <textarea rows={3} value={reportForm.description} onChange={(e) => setReportForm((f) => ({ ...f, description: e.target.value }))} placeholder={t('chatRoom.describeIssuePlaceholder')} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          {reportMsg && <div style={{ fontSize: '0.84rem', color: reportMsg.includes('Ticket') ? '#047857' : '#991b1b' }}>{reportMsg}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#991b1b', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>{t('chatRoom.submitIssueReport')}</button>
            <button type="button" onClick={() => { setShowReport(false); setReportMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7a9a', fontWeight: 600, fontSize: '0.82rem' }}>{t('common.cancel')}</button>
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
          if (msg.messageType === 'IMAGE') {
            const isOwn = (isHost && msg.senderType === 'HOST') || (!isHost && msg.senderType === 'GUEST');
            return <ImageMessage key={msg.id} msg={msg} isOwn={isOwn} t={t} />;
          }
          const isOwn = (isHost && msg.senderType === 'HOST') || (!isHost && msg.senderType === 'GUEST');
          return <ChatBubble key={msg.id} msg={msg} isOwn={isOwn} t={t} />;
        })}
        {otherTyping && (
          <div style={{ fontSize: '0.8rem', color: '#6b7a9a', fontStyle: 'italic', padding: '4px 8px' }}>
            {t('chatRoom.isTyping', { name: isHost ? room.guestName : room.hostName })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action bar */}
      {!room.closedAt && (
        <div style={{ display: 'flex', gap: 6, padding: '6px 0', flexWrap: 'wrap' }}>
          <button onClick={sendImage} style={{ background: 'none', border: '1px solid rgba(110,73,255,.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#6e49ff', fontSize: '0.76rem', fontWeight: 600 }}>📷 {t('chatRoom.photo')}</button>
          {isHost && templates.length > 0 && (
            <button onClick={() => setShowTemplates(!showTemplates)} style={{ background: 'none', border: '1px solid rgba(110,73,255,.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#6e49ff', fontSize: '0.76rem', fontWeight: 600 }}>💬 {t('chatRoom.templates')}</button>
          )}
          <button onClick={blockChat} style={{ marginLeft: 'auto', background: 'none', border: '1px solid rgba(255,80,80,.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#991b1b', fontSize: '0.76rem', fontWeight: 600 }}>{t('chatRoom.endChat')}</button>
        </div>
      )}

      {/* Template selector */}
      {showTemplates && templates.length > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(110,73,255,.1)', background: 'rgba(110,73,255,.03)', marginBottom: 8, display: 'grid', gap: 6 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e2847' }}>{t('chatRoom.quickMessages')}</div>
          {templates.map((t) => (
            <button key={t.id} onClick={() => sendTemplate(t.id)} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(110,73,255,.08)', background: 'rgba(110,73,255,.02)', cursor: 'pointer', fontSize: '0.82rem' }}>
              <strong style={{ color: '#6e49ff' }}>{t.label}</strong>
              <div style={{ color: '#6b7a9a', fontSize: '0.78rem', marginTop: 2 }}>{t.body.slice(0, 80)}...</div>
            </button>
          ))}
        </div>
      )}

      {/* Compose */}
      {!room.closedAt ? (
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid rgba(135,82,254,.08)' }}>
          <input
            value={newMsg}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('chatRoom.typeMessage')}
            maxLength={5000}
            style={{ flex: 1, fontSize: '0.92rem' }}
          />
          <button
            type="submit"
            className={styles.checkoutPrimaryButton}
            disabled={sending || !newMsg.trim()}
            style={{ fontSize: '0.85rem', padding: '10px 22px', whiteSpace: 'nowrap' }}
          >
            {sending ? t('common.sending') : t('common.send')}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7a9a', fontSize: '0.88rem' }}>
          {t('chatRoom.chatClosed')}
        </div>
      )}
    </div>
  );
}
