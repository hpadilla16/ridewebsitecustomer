'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, TOKEN_KEY, USER_KEY } from '../../lib/client';

const MAX_INLINE_PDF_BYTES = 350 * 1024;

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Could not read ${file?.name || 'file'}`));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not process image'));
    image.src = dataUrl;
  });
}

async function compressImageFile(file, { maxWidth = 1400, maxHeight = 1400, quality = 0.72 } = {}) {
  const raw = await fileToDataUrl(file);
  const image = await loadImage(raw);
  let width = image.width || maxWidth;
  let height = image.height || maxHeight;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

async function toCompactUploadPayload(file) {
  if (!file) return '';
  if (String(file.type || '').startsWith('image/')) return compressImageFile(file);
  if (String(file.type || '').includes('pdf')) {
    if (Number(file.size || 0) > MAX_INLINE_PDF_BYTES) {
      throw new Error(`PDF "${file.name}" is too large. Please keep PDFs under ${Math.round(MAX_INLINE_PDF_BYTES / 1024)} KB.`);
    }
    return fileToDataUrl(file);
  }
  return fileToDataUrl(file);
}

const EMPTY_FORM = {
  tenantSlug: '',
  fullName: '',
  displayName: '',
  legalName: '',
  email: '',
  phone: '',
  password: '',
  vehicleTypeId: '',
  preferredLocationId: '',
  pickupSpotLabel: '',
  pickupSpotAddress1: '',
  pickupSpotAddress2: '',
  pickupSpotCity: '',
  pickupSpotState: '',
  pickupSpotPostalCode: '',
  pickupSpotCountry: 'Puerto Rico',
  pickupSpotInstructions: '',
  year: '',
  make: '',
  model: '',
  color: '',
  vin: '',
  plate: '',
  mileage: '',
  fulfillmentMode: 'PICKUP_ONLY',
  baseDailyRate: '',
  cleaningFee: '',
  pickupFee: '',
  deliveryFee: '',
  deliveryRadiusMiles: '',
  deliveryAreasText: '',
  deliveryNotes: '',
  securityDeposit: '',
  minTripDays: '1',
  maxTripDays: '',
  shortDescription: '',
  description: '',
  tripRules: '',
  photos: [],
  insuranceDocumentUrl: '',
  registrationDocumentUrl: '',
  initialInspectionDocumentUrl: '',
  initialInspectionNotes: ''
};

function deliveryEnabled(mode) {
  return String(mode || 'PICKUP_ONLY').toUpperCase() !== 'PICKUP_ONLY';
}

function deliveryToggleValue(mode) {
  return deliveryEnabled(mode) ? 'YES' : 'NO';
}

function enableDeliveryMode(mode) {
  return String(mode || '').toUpperCase() === 'DELIVERY_ONLY' ? 'DELIVERY_ONLY' : 'PICKUP_OR_DELIVERY';
}

const COMMON_DELIVERY_AREA_SUGGESTIONS = [
  'San Juan', 'Isla Verde', 'Condado', 'Miramar', 'Old San Juan',
  'Carolina', 'Guaynabo', 'Bayamon', 'Dorado', 'Caguas'
];

function parseDeliveryAreas(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((row) => row.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function buildDeliveryAreaSuggestions(...values) {
  const seen = new Set();
  const suggestions = [];
  values
    .flatMap((value) => String(value || '').split(/\r?\n|,/))
    .map((value) => value.trim())
    .filter(Boolean)
    .concat(COMMON_DELIVERY_AREA_SUGGESTIONS)
    .forEach((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      suggestions.push(value);
    });
  return suggestions.slice(0, 10);
}

function appendDeliveryArea(text, area) {
  const next = parseDeliveryAreas(text);
  const key = String(area || '').trim().toLowerCase();
  if (!key || next.some((value) => value.toLowerCase() === key)) return text;
  return [...next, area.trim()].join('\n');
}

// ─── Wizard step definitions ──────────────────────────────────────────────────
const WIZARD_STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Vehicle' },
  { id: 3, label: 'Pickup' },
  { id: 4, label: 'Docs' },
];

// ─── Progress indicator ───────────────────────────────────────────────────────
function StepProgress({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, padding: '0 4px' }}>
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.id} style={{ display: 'contents' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: current > s.id
                ? 'var(--brand-purple)'
                : current === s.id
                  ? 'var(--brand-purple)'
                  : 'rgba(135,82,254,.1)',
              color: current >= s.id ? '#fff' : '#a090c8',
              fontWeight: 800, fontSize: current > s.id ? 16 : 14,
              border: current === s.id ? '2.5px solid var(--brand-purple)' : '1.5px solid rgba(135,82,254,.2)',
              boxShadow: current === s.id ? '0 4px 16px rgba(135,82,254,.32)' : 'none',
              transition: 'all 0.25s ease',
            }}>
              {current > s.id ? '✓' : s.id}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
              color: current >= s.id ? 'var(--brand-purple)' : '#a090c8',
              transition: 'color 0.25s',
            }}>
              {s.label}
            </span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2.5, borderRadius: 2, marginBottom: 18, margin: '0 8px 18px',
              background: current > s.id
                ? 'linear-gradient(90deg, var(--brand-purple), rgba(135,82,254,.5))'
                : 'rgba(135,82,254,.12)',
              transition: 'background 0.35s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
function Field({ label, hint, children, required }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#6f668f', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {label}{required && <span style={{ color: '#8752FE', marginLeft: 3 }}>*</span>}
        </span>
        {children}
      </label>
      {hint && <span style={{ fontSize: 12, color: '#9990b0', lineHeight: 1.5 }}>{hint}</span>}
    </div>
  );
}

// ─── Nav buttons ──────────────────────────────────────────────────────────────
const primaryBtn = {
  padding: '14px 32px', borderRadius: 14, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, #8752FE, #6d3df2)',
  color: '#fff', fontWeight: 800, fontSize: '0.97rem', letterSpacing: '.01em',
  boxShadow: '0 6px 20px rgba(135,82,254,.36)',
  transition: 'opacity 0.2s, transform 0.15s',
};
const ghostBtn = {
  padding: '14px 20px', borderRadius: 14, border: '1.5px solid rgba(135,82,254,.2)', cursor: 'pointer',
  background: 'transparent', color: '#6d3df2', fontWeight: 700, fontSize: '0.94rem',
  transition: 'background 0.2s',
};

// ─── Input / select / textarea base styles ────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid rgba(135,82,254,.18)',
  background: 'rgba(255,255,255,.7)',
  color: '#1f1f28', fontSize: '0.96rem', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

// ─── Landing hero ─────────────────────────────────────────────────────────────
function LandingSection({ onStart, loading }) {
  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(145deg, #f5f0ff 0%, #faf7ff 40%, #f0fbf8 100%)',
        borderBottom: '1px solid rgba(135,82,254,.1)',
        padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 80px)',
        display: 'grid',
        gap: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -80, right: -100, width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(135,82,254,.13) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -80, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(31,199,170,.09) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,520px)', gap: 48, alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 28 }}>
            <div>
              <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 999, background: 'rgba(135,82,254,.1)', border: '1px solid rgba(135,82,254,.2)', color: '#6d3df2', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 18 }}>
                Ride Car Sharing
              </span>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 900, lineHeight: 1.04, letterSpacing: '-.03em', color: '#1a1230', marginBottom: 20 }}>
                Earn money<br />sharing your car
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.18rem)', color: '#5f567e', lineHeight: 1.72, maxWidth: 480 }}>
                Set your schedule. Keep your keys. List your car in minutes and start earning — we handle the platform, payments, and guest support.
              </p>
            </div>

            {/* Earnings highlight */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 16, padding: '16px 22px',
              borderRadius: 18, background: 'rgba(255,255,255,.86)',
              border: '1px solid rgba(135,82,254,.16)',
              boxShadow: '0 8px 28px rgba(135,82,254,.1)',
              maxWidth: 420,
            }}>
              <div style={{ fontSize: '2rem', lineHeight: 1 }}>💵</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.22rem', color: '#1a1230' }}>$500–$2,000 / month</div>
                <div style={{ fontSize: 13, color: '#6f668f', marginTop: 2 }}>Typical host earnings in Puerto Rico</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={onStart}
                disabled={loading}
                style={{ ...primaryBtn, padding: '16px 36px', fontSize: '1.02rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Loading...' : 'List your car — it\'s free'}
              </button>
              <Link href="/host-login" style={{ ...ghostBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Already a host? Sign in →
              </Link>
            </div>
          </div>

          {/* Feature cards — right column */}
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { icon: '🛡️', title: '$1M protection plan', body: 'Every trip includes liability coverage and physical damage protection for your vehicle.' },
              { icon: '📅', title: 'You control the schedule', body: 'Block off dates whenever you want. Your car is available only when you say so.' },
              { icon: '⚡', title: 'Fast approval, faster earnings', body: 'Submit your vehicle today. Our review team aims to approve listings within 48 hours.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                padding: '18px 20px', borderRadius: 18,
                background: 'rgba(255,255,255,.9)', border: '1px solid rgba(135,82,254,.1)',
                boxShadow: '0 6px 18px rgba(135,82,254,.07)',
              }}>
                <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a1230', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '0.88rem', color: '#6f668f', lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works strip */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 80px)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', fontWeight: 850, letterSpacing: '-.02em', color: '#1a1230', marginBottom: 40 }}>
          How hosting works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { step: '01', title: 'Create your account', body: 'Set up your host profile with your name, contact info, and login credentials.' },
            { step: '02', title: 'Add your vehicle', body: 'Describe your car, set your daily rate, and choose whether you offer delivery.' },
            { step: '03', title: 'Set a pickup spot', body: 'Choose a tenant-approved hub or define your own guest handoff point.' },
            { step: '04', title: 'Upload documents', body: 'Insurance, registration, and an initial inspection photo. We keep everything secure.' },
          ].map(({ step, title, body }) => (
            <div key={step} style={{ display: 'grid', gap: 12, padding: '24px 20px', borderRadius: 20, background: 'rgba(255,255,255,.88)', border: '1px solid rgba(135,82,254,.1)', boxShadow: '0 4px 14px rgba(135,82,254,.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8752FE' }}>{step}</div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a1230' }}>{title}</div>
              <div style={{ fontSize: '0.88rem', color: '#6f668f', lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <button onClick={onStart} disabled={loading} style={{ ...primaryBtn, padding: '16px 44px', fontSize: '1.02rem', opacity: loading ? 0.7 : 1 }}>
            Get started
          </button>
        </div>
      </section>
    </main>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ createdHost }) {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '40px 20px' }}>
      <div className="glass card-lg" style={{ maxWidth: 540, width: '100%', padding: '48px 40px', textAlign: 'center', display: 'grid', gap: 24 }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(135,82,254,.16), rgba(31,199,170,.12))',
          border: '2px solid rgba(135,82,254,.24)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem',
        }}>
          🎉
        </div>

        <div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-.02em', color: '#1a1230', marginBottom: 12 }}>
            You&apos;re on your way!
          </h1>
          <p style={{ color: '#5f567e', lineHeight: 1.72, fontSize: '1.02rem' }}>
            Your vehicle has been submitted for review.
            {createdHost?.hostProfile?.displayName && (
              <> Welcome, <strong style={{ color: '#1a1230' }}>{createdHost.hostProfile.displayName}</strong>!</>
            )}
          </p>
        </div>

        {createdHost?.submission?.status && (
          <div className="surface-note" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#433b63' }}>Submission status</span>
              <span style={{
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(135,82,254,.1)', color: '#6d3df2',
                fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase',
              }}>
                {createdHost.submission.status}
              </span>
            </div>
            <p style={{ marginTop: 10, fontSize: '0.88rem', color: '#6f668f', lineHeight: 1.65 }}>
              Our review team will reach out within 48 hours. Once approved, your listing goes live and guests can start booking.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          <Link
            href="/host-status"
            style={{ ...primaryBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}
          >
            Track your submission →
          </Link>
          <a
            href="https://ridefleetmanager.com/host"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...ghostBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            Open Host App ↗
          </a>
          <Link
            href="/contact"
            style={{ ...ghostBtn, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Contact onboarding team
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Main wizard component ────────────────────────────────────────────────────
function BecomeAHostPageInner() {
  const searchParams = useSearchParams();
  const envTenantSlug = String(process.env.NEXT_PUBLIC_CAR_SHARING_TENANT_SLUG || '').trim().toLowerCase();
  const initialTenantSlug = String(searchParams.get('tenantSlug') || '').trim().toLowerCase() || envTenantSlug;

  const [step, setStep] = useState(0); // 0 = landing, 1–4 = wizard, 5 = success
  const [bootstrap, setBootstrap] = useState({ tenants: [], tenant: null, vehicleTypes: [], locations: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [error, setError] = useState('');
  const [createdHost, setCreatedHost] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM, tenantSlug: initialTenantSlug });

  const selectedTenantSlug = form.tenantSlug || initialTenantSlug;

  useEffect(() => {
    let cancelled = false;
    async function loadBootstrap() {
      try {
        setLoading(true);
        const query = selectedTenantSlug ? `?tenantSlug=${encodeURIComponent(selectedTenantSlug)}` : '';
        const payload = await api(`/api/public/booking/bootstrap${query}`);
        if (cancelled) return;
        setBootstrap(payload || { tenants: [], tenant: null, vehicleTypes: [], locations: [] });
        setForm((current) => ({
          ...current,
          tenantSlug: payload?.tenant?.slug || current.tenantSlug || '',
          vehicleTypeId: payload?.vehicleTypes?.some((row) => row.id === current.vehicleTypeId) ? current.vehicleTypeId : '',
          preferredLocationId: payload?.locations?.some((row) => row.id === current.preferredLocationId) ? current.preferredLocationId : '',
        }));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBootstrap();
    return () => { cancelled = true; };
  }, [selectedTenantSlug]);

  const availableTenants = useMemo(
    () => (bootstrap?.tenants || []).filter((row) => !!row.carSharingEnabled),
    [bootstrap]
  );
  const deliveryAreaSuggestions = buildDeliveryAreaSuggestions(
    form.pickupSpotCity,
    bootstrap?.tenant?.city,
    bootstrap?.locations?.find((row) => row.id === form.preferredLocationId)?.city
  );

  const set = (field) => (e) => setForm((cur) => ({ ...cur, [field]: e.target.value }));

  const handleUpload = async (field, files, multiple = false) => {
    try {
      setUploadingKey(field);
      setError('');
      if (multiple) {
        const payloads = [];
        for (const file of Array.from(files || []).slice(0, 6)) {
          payloads.push(await toCompactUploadPayload(file));
        }
        setForm((cur) => ({ ...cur, [field]: payloads.filter(Boolean) }));
        return;
      }
      const file = files?.[0];
      const payload = await toCompactUploadPayload(file);
      setForm((cur) => ({ ...cur, [field]: payload }));
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingKey('');
    }
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...form,
        tenantSlug: selectedTenantSlug,
        photosJson: JSON.stringify(form.photos || []),
      };
      const out = await api('/api/public/booking/host-signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      try { if (out?.token) localStorage.setItem(TOKEN_KEY, out.token); } catch { /* storage unavailable */ }
      try { if (out?.user) localStorage.setItem(USER_KEY, JSON.stringify(out.user)); } catch { /* storage unavailable */ }
      setCreatedHost(out);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  function validate(currentStep) {
    if (currentStep === 1) {
      if (!form.fullName.trim()) return 'Please enter your full name.';
      if (!form.email.trim()) return 'Please enter your email address.';
      if (!form.phone.trim()) return 'Please enter your phone number.';
      if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
    }
    if (currentStep === 2) {
      if (!form.vehicleTypeId) return 'Please select a vehicle type.';
      if (!form.year) return 'Please enter the vehicle year.';
      if (!form.make.trim()) return 'Please enter the vehicle make.';
      if (!form.model.trim()) return 'Please enter the vehicle model.';
    }
    if (currentStep === 4) {
      if (!form.photos.length) return 'Please upload at least one vehicle photo.';
      if (!form.insuranceDocumentUrl) return 'Please upload your insurance document.';
      if (!form.registrationDocumentUrl) return 'Please upload your registration document.';
    }
    return '';
  }

  function handleNext() {
    const err = validate(step);
    if (err) { setError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setError('');
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setError('');
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleFinalSubmit() {
    const err = validate(4);
    if (err) { setError(err); return; }
    await submit();
  }

  // Landing
  if (step === 0) {
    return <LandingSection onStart={() => { setError(''); setStep(1); }} loading={loading} />;
  }

  // Success
  if (step === 5) {
    return <SuccessScreen createdHost={createdHost} />;
  }

  // Wizard shell
  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(28px, 5vw, 52px) clamp(16px, 4vw, 24px) 60px' }}>
      {/* Back to overview */}
      <button
        onClick={step === 1 ? () => setStep(0) : handleBack}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d3df2', fontWeight: 700, fontSize: '0.9rem', padding: '0 0 24px', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        ← {step === 1 ? 'Back to overview' : 'Back'}
      </button>

      <StepProgress current={step} />

      {/* Error banner */}
      {error && (
        <div style={{
          padding: '14px 18px', borderRadius: 14, marginBottom: 20,
          background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.2)',
          color: '#991b1b', fontWeight: 600, fontSize: '0.93rem',
        }}>
          {error}
        </div>
      )}

      {/* ── Step 1: Account ── */}
      {step === 1 && (
        <div className="glass card-lg" style={{ display: 'grid', gap: 28, padding: 'clamp(24px, 4vw, 36px)' }}>
          <div>
            <span className="eyebrow">Step 1 of 4</span>
            <h2 style={{ marginTop: 6, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 850, color: '#1a1230' }}>
              Create your host account
            </h2>
            <p style={{ color: '#6f668f', marginTop: 8, lineHeight: 1.65 }}>
              Your login gives you full access to the Ride Host App once your vehicle is approved.
            </p>
          </div>

          {/* Tenant selector — only when not env-scoped */}
          {!envTenantSlug && (
            <Field label="Platform" required>
              <select value={form.tenantSlug} onChange={set('tenantSlug')} required style={inputStyle}>
                <option value="">Select a platform</option>
                {availableTenants.map((t) => (
                  <option key={t.id} value={t.slug}>{t.name}</option>
                ))}
              </select>
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Full name" required>
              <input value={form.fullName} onChange={set('fullName')} placeholder="Jane Smith" required style={inputStyle} />
            </Field>
            <Field label="Display name" hint="How guests will see you">
              <input value={form.displayName} onChange={set('displayName')} placeholder="Jane S." style={inputStyle} />
            </Field>
            <Field label="Legal name" hint="Optional — for contracts">
              <input value={form.legalName} onChange={set('legalName')} style={inputStyle} />
            </Field>
            <Field label="Phone number" required>
              <input value={form.phone} onChange={set('phone')} placeholder="(800) 676-5764" required style={inputStyle} />
            </Field>
            <Field label="Email address" required>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle} />
            </Field>
            <Field label="Password" required hint="Minimum 8 characters">
              <input type="password" value={form.password} onChange={set('password')} minLength={8} required style={inputStyle} />
            </Field>
          </div>

          <div className="surface-note" style={{ fontSize: '0.87rem' }}>
            🔒 Your information is encrypted and never shared with guests without your permission.
          </div>
        </div>
      )}

      {/* ── Step 2: Vehicle ── */}
      {step === 2 && (
        <div className="glass card-lg" style={{ display: 'grid', gap: 28, padding: 'clamp(24px, 4vw, 36px)' }}>
          <div>
            <span className="eyebrow">Step 2 of 4</span>
            <h2 style={{ marginTop: 6, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 850, color: '#1a1230' }}>
              Tell us about your car
            </h2>
            <p style={{ color: '#6f668f', marginTop: 8, lineHeight: 1.65 }}>
              Be as detailed as possible — this helps guests find your listing and speeds up the review process.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <Field label="Vehicle type" required>
              <select value={form.vehicleTypeId} onChange={set('vehicleTypeId')} required style={inputStyle}>
                <option value="">Select type</option>
                {(bootstrap?.vehicleTypes || []).map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Year" required>
              <input type="number" value={form.year} onChange={set('year')} placeholder="2021" min="1990" max="2030" required style={inputStyle} />
            </Field>
            <Field label="Make" required>
              <input value={form.make} onChange={set('make')} placeholder="Toyota" required style={inputStyle} />
            </Field>
            <Field label="Model" required>
              <input value={form.model} onChange={set('model')} placeholder="Camry" required style={inputStyle} />
            </Field>
            <Field label="Color">
              <input value={form.color} onChange={set('color')} placeholder="Silver" style={inputStyle} />
            </Field>
            <Field label="Mileage">
              <input type="number" value={form.mileage} onChange={set('mileage')} placeholder="45000" style={inputStyle} />
            </Field>
            <Field label="VIN">
              <input value={form.vin} onChange={set('vin')} placeholder="1HGCM82633A123456" style={inputStyle} />
            </Field>
            <Field label="License plate">
              <input value={form.plate} onChange={set('plate')} placeholder="ABC-1234" style={inputStyle} />
            </Field>
          </div>

          {/* Pricing */}
          <div style={{ borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 24, display: 'grid', gap: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Pricing</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Daily rate (USD)" hint="You keep ~85% of each booking">
                <input type="number" step="0.01" value={form.baseDailyRate} onChange={set('baseDailyRate')} placeholder="75.00" style={inputStyle} />
              </Field>
              <Field label="Cleaning fee (USD)" hint="Optional — charged once per trip">
                <input type="number" step="0.01" value={form.cleaningFee} onChange={set('cleaningFee')} placeholder="25.00" style={inputStyle} />
              </Field>
              <Field label="Min trip days">
                <input type="number" value={form.minTripDays} onChange={set('minTripDays')} min="1" style={inputStyle} />
              </Field>
              <Field label="Max trip days" hint="Leave blank for no limit">
                <input type="number" value={form.maxTripDays} onChange={set('maxTripDays')} placeholder="30" style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Delivery */}
          <div style={{ borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 24, display: 'grid', gap: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Delivery</h3>
            <Field label="Offer delivery to guests?">
              <select
                value={deliveryToggleValue(form.fulfillmentMode)}
                onChange={(e) => setForm((cur) => ({
                  ...cur,
                  fulfillmentMode: e.target.value === 'YES' ? enableDeliveryMode(cur.fulfillmentMode) : 'PICKUP_ONLY',
                }))}
                style={inputStyle}
              >
                <option value="NO">No — pickup only</option>
                <option value="YES">Yes — offer delivery</option>
              </select>
            </Field>

            {deliveryEnabled(form.fulfillmentMode) ? (
              <>
                <Field label="Delivery style">
                  <select value={form.fulfillmentMode} onChange={set('fulfillmentMode')} style={inputStyle}>
                    <option value="PICKUP_OR_DELIVERY">Pickup or delivery (guest chooses)</option>
                    <option value="DELIVERY_ONLY">Delivery only</option>
                  </select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <Field label="Delivery fee (USD)">
                    <input type="number" step="0.01" value={form.deliveryFee} onChange={set('deliveryFee')} placeholder="20.00" style={inputStyle} />
                  </Field>
                  <Field label="Delivery radius (miles)">
                    <input type="number" value={form.deliveryRadiusMiles} onChange={set('deliveryRadiusMiles')} placeholder="15" style={inputStyle} />
                  </Field>
                </div>
                <Field label="Delivery areas" hint="One area per line — guests will see these">
                  <textarea
                    rows={3}
                    value={form.deliveryAreasText}
                    onChange={set('deliveryAreasText')}
                    placeholder={'San Juan\nIsla Verde\nCondado'}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {deliveryAreaSuggestions.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setForm((cur) => ({ ...cur, deliveryAreasText: appendDeliveryArea(cur.deliveryAreasText, area) }))}
                        style={{ padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(135,82,254,.2)', background: 'rgba(135,82,254,.07)', color: '#6d3df2', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                      >
                        + {area}
                      </button>
                    ))}
                  </div>
                </Field>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '0.88rem', color: '#6d3df2', fontWeight: 700, userSelect: 'none' }}>
                    Advanced delivery options
                  </summary>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 16 }}>
                    <Field label="Return pickup fee (USD)">
                      <input type="number" step="0.01" value={form.pickupFee} onChange={set('pickupFee')} style={inputStyle} />
                    </Field>
                    <Field label="Delivery notes">
                      <input value={form.deliveryNotes} onChange={set('deliveryNotes')} placeholder="Airport, hotel, neighborhood notes" style={inputStyle} />
                    </Field>
                  </div>
                </details>
              </>
            ) : (
              <div className="surface-note" style={{ fontSize: '0.88rem' }}>
                Guests will pick up the vehicle at your configured pickup spot. You can enable delivery at any time after approval.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3: Pickup Spot ── */}
      {step === 3 && (
        <div className="glass card-lg" style={{ display: 'grid', gap: 28, padding: 'clamp(24px, 4vw, 36px)' }}>
          <div>
            <span className="eyebrow">Step 3 of 4</span>
            <h2 style={{ marginTop: 6, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 850, color: '#1a1230' }}>
              Where will guests pick up?
            </h2>
            <p style={{ color: '#6f668f', marginTop: 8, lineHeight: 1.65 }}>
              Choose an approved hub or define your own handoff point. You can update this after approval.
            </p>
          </div>

          {(bootstrap?.locations || []).length > 0 && (
            <Field label="Approved pickup hub" hint="Optional — anchor your listing to an existing branch location">
              <select value={form.preferredLocationId} onChange={set('preferredLocationId')} style={inputStyle}>
                <option value="">I&apos;ll set my own pickup spot below</option>
                {(bootstrap.locations || []).map((row) => (
                  <option key={row.id} value={row.id}>
                    {[row.name, row.city, row.state].filter(Boolean).join(', ')}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div style={{ borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 24, display: 'grid', gap: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>
              Custom pickup spot <span style={{ fontWeight: 400, color: '#9990b0', fontSize: '0.88rem' }}>(optional)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <Field label="Spot label" hint='e.g. "Condado Guest Pickup"'>
                <input value={form.pickupSpotLabel} onChange={set('pickupSpotLabel')} placeholder="Condado Guest Pickup" style={inputStyle} />
              </Field>
              <Field label="Street address">
                <input value={form.pickupSpotAddress1} onChange={set('pickupSpotAddress1')} placeholder="123 Ashford Ave" style={inputStyle} />
              </Field>
              <Field label="Apt / Unit / Suite">
                <input value={form.pickupSpotAddress2} onChange={set('pickupSpotAddress2')} style={inputStyle} />
              </Field>
              <Field label="City">
                <input value={form.pickupSpotCity} onChange={set('pickupSpotCity')} placeholder="San Juan" style={inputStyle} />
              </Field>
              <Field label="State">
                <input value={form.pickupSpotState} onChange={set('pickupSpotState')} placeholder="PR" style={inputStyle} />
              </Field>
              <Field label="Postal code">
                <input value={form.pickupSpotPostalCode} onChange={set('pickupSpotPostalCode')} placeholder="00907" style={inputStyle} />
              </Field>
              <Field label="Country">
                <input value={form.pickupSpotCountry} onChange={set('pickupSpotCountry')} style={inputStyle} />
              </Field>
              <Field label="Pickup instructions" hint="Gate code, landmark, where to meet">
                <input value={form.pickupSpotInstructions} onChange={set('pickupSpotInstructions')} placeholder="Meet at the lobby, call on arrival" style={inputStyle} />
              </Field>
            </div>
          </div>

          <div className="surface-note" style={{ fontSize: '0.87rem' }}>
            💡 Your pickup spot is separate from tenant operational branches. Guests only see the guest-facing handoff location.
          </div>
        </div>
      )}

      {/* ── Step 4: Docs & Listing ── */}
      {step === 4 && (
        <div className="glass card-lg" style={{ display: 'grid', gap: 28, padding: 'clamp(24px, 4vw, 36px)' }}>
          <div>
            <span className="eyebrow">Step 4 of 4</span>
            <h2 style={{ marginTop: 6, fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 850, color: '#1a1230' }}>
              Documents &amp; listing details
            </h2>
            <p style={{ color: '#6f668f', marginTop: 8, lineHeight: 1.65 }}>
              Upload required documents and write your listing description. Photos and insurance are required to go live.
            </p>
          </div>

          {/* Photos */}
          <div style={{ display: 'grid', gap: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>
              Vehicle photos <span style={{ color: '#8752FE', fontSize: '0.85rem' }}>*</span>
            </h3>
            <div style={{
              border: '2px dashed rgba(135,82,254,.25)', borderRadius: 16, padding: '28px 24px', textAlign: 'center',
              background: 'rgba(135,82,254,.03)', cursor: 'pointer', position: 'relative',
              transition: 'border-color 0.2s',
            }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUpload('photos', e.target.files, true)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>📷</div>
              <div style={{ fontWeight: 700, color: '#1a1230', marginBottom: 6 }}>
                {uploadingKey === 'photos' ? 'Processing photos...' : form.photos.length > 0 ? `${form.photos.length} photo(s) ready` : 'Click or drag to add photos'}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#9990b0' }}>Up to 6 photos — exterior, interior, and trunk recommended</div>
            </div>
          </div>

          {/* Documents */}
          <div style={{ display: 'grid', gap: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Required documents</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { key: 'insuranceDocumentUrl', label: 'Insurance', icon: '🛡️', hint: 'Current insurance card or policy' },
                { key: 'registrationDocumentUrl', label: 'Registration', icon: '📋', hint: 'Vehicle registration certificate' },
                { key: 'initialInspectionDocumentUrl', label: 'Inspection', icon: '🔍', hint: 'Photo or PDF of pre-listing inspection' },
              ].map(({ key, label, icon, hint }) => (
                <div key={key} style={{
                  padding: '16px 18px', borderRadius: 14, border: `1.5px solid ${form[key] ? 'rgba(31,199,170,.4)' : 'rgba(135,82,254,.18)'}`,
                  background: form[key] ? 'rgba(31,199,170,.04)' : 'rgba(255,255,255,.7)',
                  position: 'relative', transition: 'all 0.2s',
                }}>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    onChange={(e) => handleUpload(key, e.target.files)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1230' }}>{label}</div>
                      <div style={{ fontSize: '0.8rem', color: uploadingKey === key ? '#8752FE' : form[key] ? '#1fc7aa' : '#9990b0', marginTop: 2 }}>
                        {uploadingKey === key ? 'Uploading...' : form[key] ? '✓ Ready' : hint}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Field label="Inspection notes" hint="Anything the review team should know before approval">
              <textarea
                rows={3}
                value={form.initialInspectionNotes}
                onChange={set('initialInspectionNotes')}
                placeholder="Scratch on rear bumper noted prior to listing. All systems functional."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
          </div>

          {/* Listing copy */}
          <div style={{ borderTop: '1px solid rgba(135,82,254,.1)', paddingTop: 24, display: 'grid', gap: 18 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1230', margin: 0 }}>Listing details</h3>
            <Field label="Short description" hint="One line shown in search results">
              <input value={form.shortDescription} onChange={set('shortDescription')} placeholder="Clean SUV with airport-friendly pickup in Isla Verde" style={inputStyle} />
            </Field>
            <Field label="Full description" hint="Tell guests what makes your car a great choice">
              <textarea
                rows={5}
                value={form.description}
                onChange={set('description')}
                placeholder="My 2021 Toyota Camry is meticulously maintained and detailed before every trip. Perfect for business travelers and families..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <Field label="Trip rules" hint="What guests need to know">
              <input value={form.tripRules} onChange={set('tripRules')} placeholder="No smoking · No pets · Return with full tank" style={inputStyle} />
            </Field>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 }}>
        <button
          type="button"
          onClick={step === 1 ? () => setStep(0) : handleBack}
          style={ghostBtn}
        >
          ← Back
        </button>

        {step < 4 ? (
          <button type="button" onClick={handleNext} style={primaryBtn}>
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={submitting}
            style={{ ...primaryBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer', minWidth: 200 }}
          >
            {submitting ? 'Submitting...' : 'Submit listing'}
          </button>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.84rem', color: '#9990b0' }}>
        Already approved?{' '}
        <Link href="/host-login" style={{ color: '#6d3df2', fontWeight: 700 }}>
          Sign in to the host app →
        </Link>
      </p>
    </main>
  );
}

export default function BecomeAHostPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="glass card-lg" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#6f668f' }}>Loading host onboarding...</p>
        </div>
      </main>
    }>
      <BecomeAHostPageInner />
    </Suspense>
  );
}
