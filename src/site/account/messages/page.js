'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGuestAuth, guestApi } from '@/lib/useGuestAuth';
import { formatPublicDateTime } from '@/site/sitePreviewShared';
import styles from '../../sitePreviewPremium.module.css';

export default function GuestMessagesPage() {
  const { customer, ready } = useGuestAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);

  async function loadConversations() {
    if (!customer?.id) return;
    try {
      const data = await guestApi('/list', { method: 'POST', body: JSON.stringify({ customerId: customer.id }) });
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Unable to load messages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !customer?.id) return;
    loadConversations();
  }, [ready, customer?.id]);

  async function openConversation(conv) {
    setActiveConv(conv);
    // Mark as read
    if (conv.unreadGuestCount > 0) {
      try {
        await guestApi(`/${conv.id}/read`, { method: 'POST', body: JSON.stringify({ customerId: customer.id }) });
      } catch { /* ignore */ }
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const msg = await guestApi(`/${activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          customerId: customer.id,
          senderName: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Guest',
          body: newMsg.trim()
        })
      });
      setActiveConv((c) => ({
        ...c,
        messages: [...(c.messages || []), msg],
        lastMessageText: msg.body,
        lastMessageAt: msg.createdAt
      }));
      setNewMsg('');
    } catch (err) {
      setError(err?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  }

  if (!ready) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Link href="/account" style={{ fontSize: '0.82rem', color: '#6e49ff' }}>← My Trips</Link>
      <h1 style={{ margin: '4px 0 20px', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1e2847' }}>Messages</h1>

      {loading && <div className="surface-note" style={{ textAlign: 'center', color: '#6b7a9a' }}>Loading conversations...</div>}
      {error && <div className="surface-note" style={{ borderColor: 'rgba(255,80,80,0.28)', background: 'rgba(255,60,60,0.07)', marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: activeConv ? '280px 1fr' : '1fr', gap: 16, minHeight: 400 }}>
        {/* Conversation list */}
        <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
          {!loading && !conversations.length && (
            <div className="surface-note" style={{ color: '#6b7a9a', fontSize: '0.88rem' }}>No conversations yet. Messages with your host will appear here.</div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 12, border: activeConv?.id === conv.id ? '2px solid #6e49ff' : '1px solid rgba(135,82,254,.1)',
                background: activeConv?.id === conv.id ? 'rgba(110,73,255,.06)' : 'rgba(135,82,254,.02)',
                cursor: 'pointer', display: 'grid', gap: 4
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#1e2847', fontSize: '0.9rem' }}>{conv.hostDisplayName || 'Host'}</span>
                {conv.unreadGuestCount > 0 && (
                  <span style={{ padding: '2px 8px', borderRadius: 99, background: '#6e49ff', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>{conv.unreadGuestCount}</span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7a9a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessageText || conv.subject || 'No messages'}</div>
              {conv.lastMessageAt && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{formatPublicDateTime(conv.lastMessageAt)}</div>}
            </button>
          ))}
        </div>

        {/* Active conversation */}
        {activeConv && (
          <section className="glass card-lg" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 14, borderBottom: '1px solid rgba(135,82,254,.08)', paddingBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#1e2847', fontSize: '1rem' }}>{activeConv.hostDisplayName || 'Host'}</div>
              {activeConv.tripCode && <div style={{ fontSize: '0.82rem', color: '#6b7a9a' }}>Trip: {activeConv.tripCode}</div>}
              {activeConv.subject && <div style={{ fontSize: '0.84rem', color: '#53607b' }}>{activeConv.subject}</div>}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: 10, alignContent: 'start', maxHeight: 400, marginBottom: 14 }}>
              {(activeConv.messages || []).map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    maxWidth: '80%',
                    justifySelf: msg.senderType === 'GUEST' ? 'end' : 'start',
                    padding: '10px 14px',
                    borderRadius: 14,
                    background: msg.senderType === 'GUEST' ? 'linear-gradient(135deg, #8752FE, #6d3df2)' : 'rgba(135,82,254,.06)',
                    color: msg.senderType === 'GUEST' ? '#fff' : '#1e2847',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 4 }}>{msg.senderName || msg.senderType}</div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.body}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: 4, textAlign: 'right' }}>{formatPublicDateTime(msg.createdAt)}</div>
                </div>
              ))}
            </div>

            {/* Compose */}
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10 }}>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className={styles.checkoutPrimaryButton}
                disabled={sending || !newMsg.trim()}
                style={{ fontSize: '0.85rem', padding: '10px 20px', whiteSpace: 'nowrap' }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
