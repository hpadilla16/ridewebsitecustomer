'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/client';
import styles from '../sitePreviewPremium.module.css';
import { validateGuestInfo } from '../../lib/validation';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { TrustBadges } from '../../components/TrustBadges';
import {
  backendLocationIdsForPublicOption,
  buildPublicLocationOptions,
  fetchBookingBootstrap,
  findPublicLocationOption,
  fmtMoney,
  formatPublicDateTime,
  listingVehicleLabel,
  normalizeImageList,
  normalizePublicLocationSelectionId,
  publicCarSharingTenantSlug,
  publicLocationLabel,
  rentalResultImageList,
  resolveSiteBasePath,
  vehicleTypeLabel,
  withSiteBase
} from '../sitePreviewShared';

const CONFIRMATION_KEY = 'ride_storefront_booking_confirmation';

function buildServiceSelectionState(result) {
  return Object.fromEntries((result?.additionalServices || []).map((service) => [
    service.serviceId,
    { selected: !!service.mandatory, quantity: Math.max(1, Number(service.quantity || 1) || 1) }
  ]));
}

function computeSelectedServices(result, selectedServices, searchMode) {
  if (!result?.additionalServices?.length) return [];
  const days = Math.max(1, Number(searchMode === 'RENTAL' ? result?.quote?.days || 1 : result?.quote?.tripDays || 1));
  return result.additionalServices
    .filter((service) => service.mandatory || selectedServices[service.serviceId]?.selected)
    .map((service) => {
      const quantity = Math.max(1, Number(selectedServices[service.serviceId]?.quantity ?? service.quantity ?? 1) || 1);
      const total = service.pricingMode === 'PER_DAY'
        ? Number(service.rate || 0) * quantity * days
        : Number(service.rate || 0) * quantity;
      return { ...service, quantity, total };
    });
}

function CheckoutStepBar({ step, searchMode }) {
  const labels = searchMode === 'RENTAL'
    ? ['Your info', 'Coverage', 'Review']
    : ['Your info', 'Add-ons', 'Review'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {labels.map((label, i) => (
        <div key={label} style={{ display: 'contents' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i + 1 ? '#7c3aed' : step === i + 1 ? '#7c3aed' : 'rgba(110,73,255,.1)',
              color: step >= i + 1 ? '#fff' : '#a090c8',
              fontWeight: 800, fontSize: step > i + 1 ? 15 : 13,
              border: step === i + 1 ? '2.5px solid #7c3aed' : '1.5px solid rgba(110,73,255,.18)',
              boxShadow: step === i + 1 ? '0 4px 14px rgba(110,73,255,.3)' : 'none',
              transition: 'all 0.22s',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: step >= i + 1 ? '#6e49ff' : '#a090c8' }}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div style={{ flex: 1, height: 2.5, borderRadius: 2, margin: '0 8px 18px', background: step > i + 1 ? '#7c3aed' : 'rgba(110,73,255,.12)', transition: 'background 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckoutInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);
  const searchParams = useSearchParams();

  const searchMode = String(searchParams.get('searchMode') || '').toUpperCase() === 'CAR_SHARING' ? 'CAR_SHARING' : 'RENTAL';
  const requestedTenantSlug = String(searchParams.get('tenantSlug') || '').trim().toLowerCase();
  const defaultCarSharingTenantSlug = publicCarSharingTenantSlug();
  const scopedTenantSlug = searchMode === 'CAR_SHARING'
    ? (requestedTenantSlug || defaultCarSharingTenantSlug)
    : requestedTenantSlug;
  const vehicleTypeId = String(searchParams.get('vehicleTypeId') || '');
  const listingId = String(searchParams.get('listingId') || '');
  const pickupAt = String(searchParams.get('pickupAt') || '');
  const returnAt = String(searchParams.get('returnAt') || '');
  const pickupSelectionId = String(searchParams.get('pickupLocationId') || searchParams.get('locationId') || '');
  const returnSelectionId = String(searchParams.get('returnLocationId') || pickupSelectionId || '');

  const [bootstrap, setBootstrap] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', licenseNumber: '', licenseState: '' });
  const [selectedServices, setSelectedServices] = useState({});
  const [insuranceSelection, setInsuranceSelection] = useState({ selectedPlanCode: '', declinedCoverage: false, usingOwnInsurance: false, liabilityAccepted: false, ownPolicyNumber: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const boot = await fetchBookingBootstrap({ tenantSlug: scopedTenantSlug });
        const locationOptions = buildPublicLocationOptions(boot?.locations || []);
        const pickupPublicId = normalizePublicLocationSelectionId(locationOptions, pickupSelectionId) || locationOptions[0]?.id || '';
        const returnPublicId = normalizePublicLocationSelectionId(locationOptions, returnSelectionId) || pickupPublicId;
        const pickupLocationIds = backendLocationIdsForPublicOption(locationOptions, pickupPublicId);
        const returnLocationIds = backendLocationIdsForPublicOption(locationOptions, returnPublicId);
        if (!pickupLocationIds.length) throw new Error('Pickup location not found');
        const payload = await api(searchMode === 'CAR_SHARING' ? '/api/public/booking/car-sharing-search' : '/api/public/booking/rental-search', {
          method: 'POST',
          body: JSON.stringify({
            tenantSlug: boot?.selectedTenant?.slug || scopedTenantSlug || '',
            pickupLocationId: pickupLocationIds[0],
            pickupLocationIds,
            returnLocationId: (returnLocationIds[0] || pickupLocationIds[0]),
            returnLocationIds: returnLocationIds.length ? returnLocationIds : pickupLocationIds,
            locationId: pickupLocationIds[0],
            locationIds: pickupLocationIds,
            vehicleTypeId: searchMode === 'RENTAL' ? (vehicleTypeId || null) : null,
            pickupAt,
            returnAt
          })
        });
        const match = searchMode === 'CAR_SHARING'
          ? (payload?.results || []).find((row) => String(row?.id || '') === listingId)
          : (payload?.results || []).find((row) => String(row?.vehicleType?.id || '') === vehicleTypeId);
        if (!match) throw new Error(searchMode === 'RENTAL' ? 'This rental class is no longer available for the selected trip window.' : 'This listing is no longer available for the selected trip window.');
        if (ignore) return;
        setBootstrap(boot);
        setSelectedResult(match);
        setSelectedServices(buildServiceSelectionState(match));
        setError('');
      } catch (err) {
        if (!ignore) {
          setSelectedResult(null);
          setError(String(err?.message || 'Unable to load checkout'));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [listingId, pickupAt, pickupSelectionId, returnAt, returnSelectionId, scopedTenantSlug, searchMode, vehicleTypeId]);

  const locationOptions = useMemo(() => buildPublicLocationOptions(bootstrap?.locations || []), [bootstrap]);
  const returnOption = useMemo(() => findPublicLocationOption(locationOptions, returnSelectionId || pickupSelectionId), [locationOptions, pickupSelectionId, returnSelectionId]);
  const selectedInsurancePlan = useMemo(() => (selectedResult?.insurancePlans || []).find((plan) => String(plan.code || '').toUpperCase() === String(insuranceSelection.selectedPlanCode || '').toUpperCase()) || null, [insuranceSelection.selectedPlanCode, selectedResult]);
  const chosenServices = useMemo(() => computeSelectedServices(selectedResult, selectedServices, searchMode), [searchMode, selectedResult, selectedServices]);
  const addOnsTotal = useMemo(() => chosenServices.reduce((sum, service) => sum + Number(service.total || 0), 0), [chosenServices]);
  const insuranceTotal = Number(selectedInsurancePlan?.total || 0);
  const baseTotal = Number(searchMode === 'RENTAL' ? selectedResult?.quote?.estimatedTripTotal || 0 : selectedResult?.quote?.total || 0);
  const estimatedTotal = baseTotal + addOnsTotal + insuranceTotal;
  const estimatedDueNow = Number(
    searchMode === 'RENTAL'
      ? selectedResult?.quote?.dueNow ?? selectedResult?.quote?.depositDueNow ?? selectedResult?.quote?.amountDueNow ?? 0
      : selectedResult?.quote?.dueNow ?? selectedResult?.quote?.amountDueNow ?? selectedResult?.quote?.depositDueNow ?? 0
  );
  const gallery = searchMode === 'RENTAL'
    ? rentalResultImageList(selectedResult)
    : normalizeImageList(selectedResult?.imageUrls?.length ? selectedResult.imageUrls : selectedResult?.primaryImageUrl ? [selectedResult.primaryImageUrl] : []);
  const selectedLocation = selectedResult?.location || findPublicLocationOption(locationOptions, pickupSelectionId)?.locations?.[0] || null;
  const guestInfoComplete = Boolean(customer.firstName.trim() && customer.lastName.trim() && customer.email.trim() && customer.phone.trim());
  function validateAndAdvance(nextStep) {
    if (step === 1) {
      const { success, errors } = validateGuestInfo(customer);
      setFieldErrors(errors);
      if (!success) { setError('Please fix the highlighted fields.'); return; }
    }
    setError('');
    setStep(nextStep);
  }
  const insuranceComplete = searchMode !== 'RENTAL' || !!selectedInsurancePlan || (insuranceSelection.declinedCoverage && insuranceSelection.usingOwnInsurance && insuranceSelection.liabilityAccepted);
  const totalSteps = 3;

  const backHref = searchMode === 'CAR_SHARING' ? withSiteBase(basePath, `/car-sharing/${listingId}`) : withSiteBase(basePath, `/rent/${vehicleTypeId}`);

  const vehicleName = selectedResult
    ? (searchMode === 'CAR_SHARING' ? (selectedResult?.title || listingVehicleLabel(selectedResult)) : vehicleTypeLabel(selectedResult?.vehicleType))
    : '';

  async function handleSubmit() {
    const { success, errors } = validateGuestInfo(customer);
    if (!success) { setFieldErrors(errors); setError('Please fix the highlighted fields.'); return; }
    setFieldErrors({});
    if (!insuranceComplete) return setError('Please choose a protection option or confirm the guest is using their own insurance.');
    setSubmitting(true);
    setError('');
    try {
      const matchingReturnLocation = returnOption?.locations?.find((location) => location.tenantId === selectedResult?.location?.tenantId);
      const payload = await api('/api/public/booking/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tenantSlug: bootstrap?.selectedTenant?.slug || scopedTenantSlug || '',
          searchType: searchMode,
          pickupAt,
          returnAt,
          pickupLocationId: selectedResult?.location?.id || '',
          returnLocationId: searchMode === 'RENTAL' ? (matchingReturnLocation?.id || selectedResult?.location?.id || '') : (selectedResult?.location?.id || ''),
          vehicleTypeId: searchMode === 'RENTAL' ? selectedResult?.vehicleType?.id : null,
          listingId: searchMode === 'CAR_SHARING' ? selectedResult?.id : null,
          additionalServices: chosenServices.map((service) => ({ serviceId: service.serviceId, quantity: service.quantity })),
          insuranceSelection: searchMode === 'RENTAL' ? {
            selectedPlanCode: selectedInsurancePlan?.code || '',
            declinedCoverage: !!insuranceSelection.declinedCoverage,
            usingOwnInsurance: !!insuranceSelection.usingOwnInsurance,
            liabilityAccepted: !!insuranceSelection.liabilityAccepted,
            ownPolicyNumber: insuranceSelection.ownPolicyNumber || ''
          } : null,
          customer
        })
      });
      try { if (typeof window !== 'undefined') sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(payload)); } catch { /* storage quota or private browsing */ }
      router.push(withSiteBase(basePath, '/confirmation'));
    } catch (err) {
      setError(String(err?.message || 'Unable to create reservation'));
    } finally {
      setSubmitting(false);
    }
  }

  function BookingSummaryAside() {
    return (
      <div className={`glass card ${styles.asidePanel}`} style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
        {gallery[0] && (
          <div className={styles.galleryFrame} style={{ margin: 0, borderRadius: '20px 20px 0 0' }}>
            <Image src={gallery[0]} alt={vehicleName} className={styles.galleryImage} width={1200} height={675} sizes="360px" priority unoptimized />
          </div>
        )}
        <div style={{ padding: '18px 20px', display: 'grid', gap: 14 }}>
          <div>
            <div style={{ fontWeight: 800, color: '#1e2847', fontSize: '1.02rem' }}>{vehicleName}</div>
            {selectedResult?.instantBook && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '4px 10px', borderRadius: 999, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', fontSize: '0.76rem', fontWeight: 800 }}>
                ⚡ Instant Book
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gap: 8, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(110,73,255,.12)', background: 'rgba(246,244,255,.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#32405d' }}>
              <span style={{ color: '#6b7a9a', fontWeight: 600 }}>Pickup</span>
              <span>{formatPublicDateTime(pickupAt)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(110,73,255,.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, color: '#32405d' }}>
              <span style={{ color: '#6b7a9a', fontWeight: 600 }}>Return</span>
              <span>{formatPublicDateTime(returnAt)}</span>
            </div>
          </div>
          {publicLocationLabel(selectedLocation) !== 'Location' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.87rem', color: '#53607b', fontWeight: 600 }}>
              <span>📍</span><span>{publicLocationLabel(selectedLocation)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid rgba(110,73,255,.1)', paddingTop: 14, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#53607b' }}>
              <span>Base trip</span><strong style={{ color: '#1e2847' }}>{fmtMoney(baseTotal)}</strong>
            </div>
            {addOnsTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#53607b' }}>
                <span>Add-ons</span><strong style={{ color: '#1e2847' }}>{fmtMoney(addOnsTotal)}</strong>
              </div>
            )}
            {insuranceTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#53607b' }}>
                <span>Coverage</span><strong style={{ color: '#1e2847' }}>{fmtMoney(insuranceTotal)}</strong>
              </div>
            )}
            <div style={{ borderTop: '1.5px solid rgba(110,73,255,.14)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#1e2847' }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e2847' }}>{fmtMoney(estimatedTotal)}</span>
            </div>
            {estimatedDueNow > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem', color: '#53607b' }}>
                <span>Due now</span><strong style={{ color: '#1e2847' }}>{fmtMoney(estimatedDueNow)}</strong>
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center', lineHeight: 1.55 }}>
            🛡 Trip protection included · No hidden fees
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 18px 60px', display: 'grid', gap: 20 }}>
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: searchMode === 'CAR_SHARING' ? 'Car Sharing' : 'Rent', href: searchMode === 'CAR_SHARING' ? '/car-sharing' : '/rent' },
        { label: 'Checkout' }
      ]} />
      <div>
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.88rem', fontWeight: 700, color: '#4a38be', textDecoration: 'none' }}>
          {t('checkout.backToListing')}
        </Link>
      </div>

      <CheckoutStepBar step={step} searchMode={searchMode} />

      {error && !loading && (
        <div style={{ padding: '14px 18px', borderRadius: 14, background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.2)', color: '#991b1b', fontWeight: 600, fontSize: '0.93rem' }}>
          {error}
        </div>
      )}

      <div className={styles.detailGrid}>
        <div className={`glass card ${styles.contentPanel}`} style={{ gap: 24 }}>
          {loading && (
            <div style={{ color: '#6b7a9a', fontWeight: 600 }}>Preparing your booking...</div>
          )}
          {!loading && selectedResult && (
            <div style={{ display: 'grid', gap: 24 }}>
              {step === 1 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e2847', margin: '0 0 4px' }}>{t('checkout.yourInfo')}</h2>
                    <p style={{ color: '#6b7a9a', fontSize: '0.9rem', margin: 0 }}>{t('checkout.yourInfoSubtitle')}</p>
                  </div>
                  <div className="form-grid-2">
                    <div><div className="label">{t('checkout.firstName')}</div><input value={customer.firstName} onChange={(e) => { setCustomer((c) => ({ ...c, firstName: e.target.value })); setFieldErrors((f) => ({ ...f, firstName: undefined })); }} placeholder="Jane" style={fieldErrors.firstName ? { borderColor: '#ff6b6b' } : undefined} />{fieldErrors.firstName && <div style={{ color: '#ff6b6b', fontSize: '0.78rem', marginTop: 4 }} role="alert">{fieldErrors.firstName}</div>}</div>
                    <div><div className="label">{t('checkout.lastName')}</div><input value={customer.lastName} onChange={(e) => { setCustomer((c) => ({ ...c, lastName: e.target.value })); setFieldErrors((f) => ({ ...f, lastName: undefined })); }} placeholder="Smith" style={fieldErrors.lastName ? { borderColor: '#ff6b6b' } : undefined} />{fieldErrors.lastName && <div style={{ color: '#ff6b6b', fontSize: '0.78rem', marginTop: 4 }} role="alert">{fieldErrors.lastName}</div>}</div>
                  </div>
                  <div className="form-grid-2">
                    <div><div className="label">{t('checkout.email')}</div><input type="email" value={customer.email} onChange={(e) => { setCustomer((c) => ({ ...c, email: e.target.value })); setFieldErrors((f) => ({ ...f, email: undefined })); }} placeholder="jane@example.com" style={fieldErrors.email ? { borderColor: '#ff6b6b' } : undefined} />{fieldErrors.email && <div style={{ color: '#ff6b6b', fontSize: '0.78rem', marginTop: 4 }} role="alert">{fieldErrors.email}</div>}</div>
                    <div><div className="label">{t('checkout.phone')}</div><input value={customer.phone} onChange={(e) => { setCustomer((c) => ({ ...c, phone: e.target.value })); setFieldErrors((f) => ({ ...f, phone: undefined })); }} placeholder="+1 787 555 0100" style={fieldErrors.phone ? { borderColor: '#ff6b6b' } : undefined} />{fieldErrors.phone && <div style={{ color: '#ff6b6b', fontSize: '0.78rem', marginTop: 4 }} role="alert">{fieldErrors.phone}</div>}</div>
                  </div>
                  <div className="form-grid-3">
                    <div><div className="label">Date of birth</div><input type="date" value={customer.dateOfBirth} onChange={(e) => setCustomer((c) => ({ ...c, dateOfBirth: e.target.value }))} /></div>
                    <div><div className="label">License number</div><input value={customer.licenseNumber} onChange={(e) => setCustomer((c) => ({ ...c, licenseNumber: e.target.value }))} /></div>
                    <div><div className="label">License state</div><input value={customer.licenseState} onChange={(e) => setCustomer((c) => ({ ...c, licenseState: e.target.value }))} placeholder="PR" /></div>
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: 14, background: 'rgba(110,73,255,.05)', border: '1px solid rgba(110,73,255,.1)', fontSize: '0.84rem', color: '#53607b', lineHeight: 1.6 }}>
                    🔒 Your information is encrypted and used only to manage your reservation.
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {searchMode === 'RENTAL' && (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e2847', margin: '0 0 4px' }}>Trip coverage</h2>
                        <p style={{ color: '#6b7a9a', fontSize: '0.9rem', margin: 0 }}>Choose a protection plan or confirm you have your own coverage.</p>
                      </div>
                      {(selectedResult?.insurancePlans || []).map((plan) => {
                        const isSelected = String(insuranceSelection.selectedPlanCode || '').toUpperCase() === String(plan.code || '').toUpperCase();
                        return (
                          <label key={plan.code} style={{ display: 'grid', gap: 10, padding: '16px 18px', borderRadius: 16, border: `2px solid ${isSelected ? '#6e49ff' : 'rgba(110,73,255,.15)'}`, background: isSelected ? 'rgba(110,73,255,.05)' : 'rgba(255,255,255,.8)', cursor: 'pointer', transition: 'all 0.18s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="radio" name="insurance" checked={isSelected} onChange={() => setInsuranceSelection((c) => ({ ...c, selectedPlanCode: plan.code, declinedCoverage: false, usingOwnInsurance: false, liabilityAccepted: false }))} style={{ accentColor: '#6e49ff', width: 18, height: 18 }} />
                                <strong style={{ color: '#1e2847', fontSize: '0.97rem' }}>{plan.name}</strong>
                              </div>
                              <span style={{ fontWeight: 800, color: '#1e2847' }}>{fmtMoney(plan.total)}</span>
                            </div>
                            {plan.description && (
                              <div style={{ fontSize: '0.85rem', color: '#6b7a9a', paddingLeft: 28 }}>{plan.description}</div>
                            )}
                          </label>
                        );
                      })}
                      <div style={{ padding: '16px 18px', borderRadius: 16, border: '1.5px solid rgba(110,73,255,.15)', background: 'rgba(255,255,255,.8)', display: 'grid', gap: 12 }}>
                        <strong style={{ color: '#1e2847', fontSize: '0.97rem' }}>Use my own insurance</strong>
                        <div style={{ display: 'grid', gap: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#53607b' }}>
                            <input type="checkbox" checked={insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((c) => ({ ...c, selectedPlanCode: '', declinedCoverage: e.target.checked }))} style={{ accentColor: '#6e49ff', width: 17, height: 17 }} />
                            <span>Decline company coverage</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#53607b' }}>
                            <input type="checkbox" checked={insuranceSelection.usingOwnInsurance} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((c) => ({ ...c, usingOwnInsurance: e.target.checked }))} style={{ accentColor: '#6e49ff', width: 17, height: 17 }} />
                            <span>I will use my own insurance</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#53607b' }}>
                            <input type="checkbox" checked={insuranceSelection.liabilityAccepted} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((c) => ({ ...c, liabilityAccepted: e.target.checked }))} style={{ accentColor: '#6e49ff', width: 17, height: 17 }} />
                            <span>I accept responsibility and liability</span>
                          </label>
                        </div>
                        <div>
                          <div className="label">Policy number</div>
                          <input value={insuranceSelection.ownPolicyNumber} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((c) => ({ ...c, ownPolicyNumber: e.target.value }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e2847', margin: '0 0 4px' }}>{searchMode === 'RENTAL' ? 'Add-ons' : 'Trip add-ons'}</h2>
                      <p style={{ color: '#6b7a9a', fontSize: '0.9rem', margin: 0 }}>Customize your trip with optional extras.</p>
                    </div>
                    {selectedResult?.additionalServices?.length
                      ? selectedResult.additionalServices.map((service) => {
                          const state = selectedServices[service.serviceId] || { selected: !!service.mandatory, quantity: Math.max(1, Number(service.quantity || 1) || 1) };
                          return (
                            <div key={service.serviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 18px', borderRadius: 16, border: `1.5px solid ${state.selected || service.mandatory ? 'rgba(110,73,255,.25)' : 'rgba(110,73,255,.12)'}`, background: state.selected || service.mandatory ? 'rgba(110,73,255,.04)' : 'rgba(255,255,255,.8)', gap: 12 }}>
                              <div style={{ flex: 1 }}>
                                <strong style={{ color: '#1e2847', fontSize: '0.95rem' }}>{service.name}</strong>
                                {service.description && (
                                  <div style={{ fontSize: '0.84rem', color: '#6b7a9a', marginTop: 3 }}>{service.description}</div>
                                )}
                                <div style={{ fontSize: '0.83rem', color: '#6b7a9a', marginTop: 4 }}>{fmtMoney(service.rate)} {service.pricingMode === 'PER_DAY' ? '/ day' : 'flat'}</div>
                                {(state.selected || service.mandatory) && (
                                  <div style={{ marginTop: 10 }}>
                                    <div className="label">Quantity</div>
                                    <input type="number" min="1" value={state.quantity} disabled={!state.selected && !service.mandatory} onChange={(e) => setSelectedServices((c) => ({ ...c, [service.serviceId]: { selected: c[service.serviceId]?.selected ?? !!service.mandatory, quantity: Math.max(1, Number(e.target.value || 1) || 1) } }))} style={{ width: 80, padding: '8px 12px', borderRadius: 10, border: '1.5px solid rgba(110,73,255,.18)', background: '#fff', color: '#1e2847', fontSize: '0.95rem' }} />
                                  </div>
                                )}
                              </div>
                              <div>
                                {service.mandatory
                                  ? <span style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(22,163,74,.1)', color: '#15803d', fontSize: '0.78rem', fontWeight: 800 }}>Included</span>
                                  : (
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: state.selected ? '#6e49ff' : '#6b7a9a' }}>
                                      <input type="checkbox" checked={!!state.selected} onChange={(e) => setSelectedServices((c) => ({ ...c, [service.serviceId]: { selected: e.target.checked, quantity: Math.max(1, Number(c[service.serviceId]?.quantity ?? service.quantity ?? 1) || 1) } }))} style={{ accentColor: '#6e49ff', width: 18, height: 18 }} />
                                      Add
                                    </label>
                                  )
                                }
                              </div>
                            </div>
                          );
                        })
                      : (
                        <div style={{ padding: '20px', borderRadius: 16, background: 'rgba(110,73,255,.04)', border: '1px solid rgba(110,73,255,.1)', color: '#6b7a9a', fontSize: '0.9rem', textAlign: 'center' }}>
                          No add-ons available for this trip.
                        </div>
                      )
                    }
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e2847', margin: '0 0 4px' }}>{t('checkout.reviewBooking')}</h2>
                    <p style={{ color: '#6b7a9a', fontSize: '0.9rem', margin: 0 }}>{t('checkout.checkEverything')}</p>
                  </div>

                  <div style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(110,73,255,.12)', background: 'rgba(246,244,255,.8)', display: 'grid', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#1e2847' }}>Driver</span>
                      <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e49ff', fontWeight: 700, fontSize: '0.88rem' }} onClick={() => setStep(1)}>Edit</button>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#53607b' }}>{`${customer.firstName} ${customer.lastName}`.trim()}</div>
                    <div style={{ fontSize: '0.88rem', color: '#53607b' }}>{customer.email}</div>
                    <div style={{ fontSize: '0.88rem', color: '#53607b' }}>{customer.phone}</div>
                  </div>

                  <div style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(110,73,255,.12)', background: 'rgba(246,244,255,.8)', display: 'grid', gap: 6 }}>
                    <div style={{ fontWeight: 800, color: '#1e2847' }}>Trip</div>
                    <div style={{ fontSize: '0.88rem', color: '#53607b' }}>{formatPublicDateTime(pickupAt)} → {formatPublicDateTime(returnAt)}</div>
                    <div style={{ fontSize: '0.88rem', color: '#53607b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>📍</span><span>{publicLocationLabel(selectedLocation)}</span>
                    </div>
                  </div>

                  <div style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(110,73,255,.12)', background: 'rgba(246,244,255,.8)', display: 'grid', gap: 6 }}>
                    <div style={{ fontWeight: 800, color: '#1e2847' }}>{t('checkout.priceBreakdown')}</div>
                    {/* Daily rate × days */}
                    {selectedResult?.quote?.dailyRate && selectedResult?.quote?.days && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>{fmtMoney(selectedResult.quote.dailyRate)} × {selectedResult.quote.days} {selectedResult.quote.days === 1 ? 'day' : 'days'}</span>
                        <strong style={{ color: '#1e2847' }}>{fmtMoney(selectedResult.quote.subtotal || baseTotal)}</strong>
                      </div>
                    )}
                    {/* Car sharing: tripDays */}
                    {!selectedResult?.quote?.dailyRate && selectedResult?.quote?.tripDays && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>Base trip ({selectedResult.quote.tripDays} {selectedResult.quote.tripDays === 1 ? 'day' : 'days'})</span>
                        <strong style={{ color: '#1e2847' }}>{fmtMoney(selectedResult.quote.subtotal || baseTotal)}</strong>
                      </div>
                    )}
                    {/* Fees */}
                    {Number(selectedResult?.quote?.fees || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>Fees</span><strong style={{ color: '#1e2847' }}>{fmtMoney(selectedResult.quote.fees)}</strong>
                      </div>
                    )}
                    {/* Taxes */}
                    {Number(selectedResult?.quote?.taxes || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>Taxes</span><strong style={{ color: '#1e2847' }}>{fmtMoney(selectedResult.quote.taxes)}</strong>
                      </div>
                    )}
                    {addOnsTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>{t('checkout.addOns')}</span><strong style={{ color: '#1e2847' }}>{fmtMoney(addOnsTotal)}</strong>
                      </div>
                    )}
                    {insuranceTotal > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>{t('checkout.coverage')}</span><strong style={{ color: '#1e2847' }}>{fmtMoney(insuranceTotal)}</strong>
                      </div>
                    )}
                    {/* Multi-day discount hint */}
                    {(() => {
                      const days = Number(selectedResult?.quote?.days || selectedResult?.quote?.tripDays || 0);
                      if (days >= 30) return <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>🎉 Monthly rate applied — best value</div>;
                      if (days >= 7) return <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 600 }}>✓ Weekly rate applied</div>;
                      if (days >= 5) return <div style={{ fontSize: '0.82rem', color: '#6b7a9a' }}>💡 Book 7+ days for a weekly discount</div>;
                      return null;
                    })()}
                    <div style={{ borderTop: '1.5px solid rgba(110,73,255,.14)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#1e2847', fontSize: '1rem' }}>{t('checkout.total')}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#1e2847' }}>{fmtMoney(estimatedTotal)}</span>
                    </div>
                    {estimatedDueNow > 0 && estimatedDueNow < estimatedTotal && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#53607b' }}>
                        <span>{t('checkout.dueNow')}</span><strong style={{ color: '#1e2847' }}>{fmtMoney(estimatedDueNow)}</strong>
                      </div>
                    )}
                    {estimatedDueNow > 0 && estimatedDueNow < estimatedTotal && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#6b7a9a' }}>
                        <span>{t('checkout.dueAtPickup')}</span><span>{fmtMoney(estimatedTotal - estimatedDueNow)}</span>
                      </div>
                    )}
                  </div>

                  {/* Cancellation policy */}
                  <div style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid rgba(110,73,255,.08)', background: 'rgba(110,73,255,.02)', fontSize: '0.86rem', color: '#53607b', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: '#1e2847', marginBottom: 6 }}>{t('checkout.cancellationPolicy')}</div>
                    {searchMode === 'CAR_SHARING' ? (
                      <>
                        <div>• <strong>{t('checkout.carSharingCancel')}</strong></div>
                        <div>• {t('checkout.carSharingCancelLate')}</div>
                        <div>• {t('checkout.carSharingNoShow')}</div>
                      </>
                    ) : (
                      <>
                        <div>• <strong>{t('checkout.rentalCancel')}</strong></div>
                        <div>• {t('checkout.rentalCancelLate')}</div>
                        <div>• {t('checkout.rentalModify')}</div>
                      </>
                    )}
                  </div>

                  <div style={{ padding: '16px 18px', borderRadius: 16, border: '1px solid rgba(110,73,255,.1)', background: 'rgba(110,73,255,.03)', display: 'grid', gap: 10 }}>
                    <div style={{ fontWeight: 800, color: '#1e2847', fontSize: '0.95rem' }}>What happens next</div>
                    {[
                      'Your reservation is confirmed immediately',
                      estimatedDueNow > 0 ? `You'll be directed to payment for ${fmtMoney(estimatedDueNow)}` : 'No payment is due right now',
                      "You'll receive a confirmation email with trip details and next steps"
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.88rem', color: '#53607b' }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#ffc258,#6e49ff 55%,#0fb0d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className={styles.checkoutActionRow}>
                {step > 1 && (
                  <button type="button" className={styles.checkoutGhostButton} onClick={() => setStep((s) => s - 1)}>← Back</button>
                )}
                {step < totalSteps
                  ? (
                    <button
                      type="button"
                      className={styles.checkoutPrimaryButton}
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#6e49ff 55%,#0fb0d8)', color: '#fff', border: 'none', boxShadow: '0 10px 24px rgba(110,73,255,.3)' }}
                      onClick={() => {
                        if (step === 1) { validateAndAdvance(2); return; }
                        if (step === 2 && !insuranceComplete) return setError('Please choose a coverage option.');
                        setError('');
                        setStep((s) => s + 1);
                      }}
                    >
                      {t('checkout.continue')}
                    </button>
                  )
                  : (
                    <button
                      type="button"
                      className={styles.checkoutPrimaryButton}
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#6e49ff 55%,#0fb0d8)', color: '#fff', border: 'none', boxShadow: '0 10px 24px rgba(110,73,255,.3)', minWidth: 220 }}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Confirming...' : 'Complete booking'}
                    </button>
                  )
                }
                <TrustBadges compact />
              </div>
            </div>
          )}
        </div>

        <BookingSummaryAside />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="glass card" style={{ padding: 24 }}>Loading checkout...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
