'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/client';
import styles from '../sitePreviewPremium.module.css';
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

function StepCard({ label, active, done }) {
  return (
    <div className={styles.checkoutStepCard}>
      <span className={`status-chip ${done ? 'good' : active ? '' : 'neutral'}`} style={{ width: 'fit-content' }}>
        {done ? 'Done' : active ? 'Current' : 'Next'}
      </span>
      <strong>{label}</strong>
    </div>
  );
}

function ReserveFlowStep({ step, title, body }) {
  return (
    <div className="surface-note" style={{ display: 'grid', gap: 6 }}>
      <span className="label">Step {step}</span>
      <strong>{title}</strong>
      <div className="ui-muted">{body}</div>
    </div>
  );
}

function CheckoutInner() {
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
  const insuranceComplete = searchMode !== 'RENTAL' || !!selectedInsurancePlan || (insuranceSelection.declinedCoverage && insuranceSelection.usingOwnInsurance && insuranceSelection.liabilityAccepted);
  const totalSteps = 3;
  const checkoutSignals = searchMode === 'RENTAL'
    ? ['Guest info collected up front', 'Insurance or own coverage confirmed', 'Hosted payment handoff after reservation']
    : ['Guest info collected up front', 'Trip add-ons reviewed before reserve', 'Hosted payment handoff after reservation'];
  const currentStepTitle = step === 1
    ? 'Basic guest information'
    : step === 2
      ? (searchMode === 'RENTAL' ? 'Protection and add-ons' : 'Trip add-ons')
      : 'Review and confirmation';

  const backHref = searchMode === 'CAR_SHARING' ? withSiteBase(basePath, `/car-sharing/${listingId}`) : withSiteBase(basePath, `/rent/${vehicleTypeId}`);

  async function handleSubmit() {
    if (!guestInfoComplete) return setError('Please complete the guest details first.');
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
      if (typeof window !== 'undefined') sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(payload));
      router.push(withSiteBase(basePath, '/confirmation'));
    } catch (err) {
      setError(String(err?.message || 'Unable to create reservation'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 24 }}>
      <section className={`glass card-lg ${styles.checkoutHero}`}>
        <span className="eyebrow">Guided Checkout</span>
        <h1 style={{ marginTop: 8, marginBottom: 8 }}>{searchMode === 'RENTAL' ? 'Reserve this class' : 'Reserve this listing'}</h1>
        <p className={styles.checkoutHeroLead}>Collect basic guest information, confirm protection and services, then review the trip total before continuing into payment.</p>
        <div className={styles.detailRibbon}>
          <span className={styles.detailRibbonChip}>{searchMode === 'RENTAL' ? 'Rental reservation' : 'Car sharing reservation'}</span>
          <span className={styles.detailRibbonChip}>Hosted payment follows confirmation</span>
          <span className={styles.detailRibbonChip}>Email and next steps sent after reserve</span>
        </div>
      </section>

      <section className={styles.checkoutStepRail}>
        <StepCard label="Guest details" active={step === 1} done={step > 1} />
        <StepCard label={searchMode === 'RENTAL' ? 'Insurance and services' : 'Trip add-ons'} active={step === 2} done={step > 2} />
        <StepCard label="Review and reserve" active={step === 3} done={false} />
      </section>

      <section className={styles.detailGrid}>
        <div className={`glass card ${styles.contentPanel}`}>
          {loading ? <div className="ui-muted">Preparing checkout...</div> : null}
          {!loading && error ? <div className="label" style={{ color: '#b91c1c' }}>{error}</div> : null}
          {!loading && selectedResult ? (
            <div className="stack" style={{ gap: 18 }}>
              <section className={styles.checkoutStageIntro}>
                <div className={styles.checkoutStageCopy}>
                  <span className="label">Step {step} of {totalSteps}</span>
                  <h2 className={styles.checkoutStageTitle}>{currentStepTitle}</h2>
                  <p className="ui-muted" style={{ margin: 0 }}>
                    {step === 1
                      ? 'Start with the guest details that keep the reservation, payment, and follow-up links connected.'
                      : step === 2
                        ? 'Confirm the protection story and any extra services before the guest reaches payment.'
                        : 'Review the trip summary so the final handoff feels clear, calm, and trustworthy.'}
                  </p>
                </div>
                <div className={styles.checkoutSignalStack}>
                  {checkoutSignals.map((signal) => (
                    <span key={signal} className={styles.checkoutSignalBadge}>{signal}</span>
                  ))}
                </div>
              </section>
              {step === 1 ? (
                <>
                  <div className="section-title" style={{ fontSize: 18 }}>Basic information</div>
                  <div className="form-grid-2">
                    <div><div className="label">First Name</div><input value={customer.firstName} onChange={(e) => setCustomer((current) => ({ ...current, firstName: e.target.value }))} /></div>
                    <div><div className="label">Last Name</div><input value={customer.lastName} onChange={(e) => setCustomer((current) => ({ ...current, lastName: e.target.value }))} /></div>
                  </div>
                  <div className="form-grid-2">
                    <div><div className="label">Email</div><input type="email" value={customer.email} onChange={(e) => setCustomer((current) => ({ ...current, email: e.target.value }))} /></div>
                    <div><div className="label">Phone</div><input value={customer.phone} onChange={(e) => setCustomer((current) => ({ ...current, phone: e.target.value }))} /></div>
                  </div>
                  <div className="form-grid-3">
                    <div><div className="label">Date of Birth</div><input type="date" value={customer.dateOfBirth} onChange={(e) => setCustomer((current) => ({ ...current, dateOfBirth: e.target.value }))} /></div>
                    <div><div className="label">License Number</div><input value={customer.licenseNumber} onChange={(e) => setCustomer((current) => ({ ...current, licenseNumber: e.target.value }))} /></div>
                    <div><div className="label">License State</div><input value={customer.licenseState} onChange={(e) => setCustomer((current) => ({ ...current, licenseState: e.target.value }))} /></div>
                  </div>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  {searchMode === 'RENTAL' ? (
                    <div className="stack" style={{ gap: 12 }}>
                      <div className="section-title" style={{ fontSize: 18 }}>Insurance</div>
                      {(selectedResult?.insurancePlans || []).map((plan) => (
                        <label key={plan.code} className={`${styles.checkoutChoiceCard} surface-note`}>
                          <div className={styles.checkoutChoiceHeader}>
                            <strong>{plan.name}</strong>
                            <input
                              type="radio"
                              name="insurance"
                              className={styles.checkoutRadio}
                              checked={String(insuranceSelection.selectedPlanCode || '').toUpperCase() === String(plan.code || '').toUpperCase()}
                              onChange={() => setInsuranceSelection((current) => ({ ...current, selectedPlanCode: plan.code, declinedCoverage: false, usingOwnInsurance: false, liabilityAccepted: false }))}
                            />
                          </div>
                          <div className="ui-muted">{plan.description || 'Protection plan'}</div>
                          <strong>{fmtMoney(plan.total)}</strong>
                        </label>
                      ))}
                      <div className={`${styles.checkoutChoiceCard} surface-note`}>
                        <strong>Use your own insurance</strong>
                        <div className={styles.checkoutCheckStack}>
                          <label className={styles.checkoutCheckRow}><input type="checkbox" className={styles.checkoutCheckbox} checked={insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((current) => ({ ...current, selectedPlanCode: '', declinedCoverage: e.target.checked }))} /><span>Decline company coverage</span></label>
                          <label className={styles.checkoutCheckRow}><input type="checkbox" className={styles.checkoutCheckbox} checked={insuranceSelection.usingOwnInsurance} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((current) => ({ ...current, usingOwnInsurance: e.target.checked }))} /><span>Guest will use their own insurance</span></label>
                          <label className={styles.checkoutCheckRow}><input type="checkbox" className={styles.checkoutCheckbox} checked={insuranceSelection.liabilityAccepted} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((current) => ({ ...current, liabilityAccepted: e.target.checked }))} /><span>Guest accepts responsibility and liability</span></label>
                        </div>
                        <div><div className="label">Policy Number</div><input value={insuranceSelection.ownPolicyNumber} disabled={!insuranceSelection.declinedCoverage} onChange={(e) => setInsuranceSelection((current) => ({ ...current, ownPolicyNumber: e.target.value }))} /></div>
                      </div>
                    </div>
                  ) : null}

                  <div className="stack" style={{ gap: 12 }}>
                    <div className="section-title" style={{ fontSize: 18 }}>{searchMode === 'RENTAL' ? 'Additional services' : 'Trip add-ons'}</div>
                    {selectedResult?.additionalServices?.length ? selectedResult.additionalServices.map((service) => {
                      const state = selectedServices[service.serviceId] || { selected: !!service.mandatory, quantity: Math.max(1, Number(service.quantity || 1) || 1) };
                      return (
                        <div key={service.serviceId} className={`${styles.checkoutChoiceCard} surface-note`}>
                          <div className={styles.checkoutChoiceHeader}>
                            <div><strong>{service.name}</strong><div className="ui-muted">{service.description || 'Optional service'}</div></div>
                            <label className={styles.checkoutCheckRow}><input type="checkbox" className={styles.checkoutCheckbox} checked={!!state.selected || !!service.mandatory} disabled={!!service.mandatory} onChange={(e) => setSelectedServices((current) => ({ ...current, [service.serviceId]: { selected: e.target.checked, quantity: Math.max(1, Number(current[service.serviceId]?.quantity ?? service.quantity ?? 1) || 1) } }))} /><span>{service.mandatory ? 'Included' : 'Add'}</span></label>
                          </div>
                          <div className="form-grid-3">
                            <div><div className="label">Quantity</div><input type="number" min="1" value={state.quantity} disabled={!state.selected && !service.mandatory} onChange={(e) => setSelectedServices((current) => ({ ...current, [service.serviceId]: { selected: current[service.serviceId]?.selected ?? !!service.mandatory, quantity: Math.max(1, Number(e.target.value || 1) || 1) } }))} /></div>
                            <div><div className="label">Rate</div><input value={fmtMoney(service.rate)} disabled /></div>
                            <div><div className="label">Billing</div><input value={service.pricingMode === 'PER_DAY' ? 'Per day' : 'Flat'} disabled /></div>
                          </div>
                        </div>
                      );
                    }) : <div className="surface-note">No online add-ons are configured for this option yet.</div>}
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <div className="stack" style={{ gap: 14 }}>
                  <div className="section-title" style={{ fontSize: 18 }}>Review your reservation</div>
                  <div className="surface-note"><strong>Guest</strong><div className="ui-muted">{[`${customer.firstName} ${customer.lastName}`.trim(), customer.email, customer.phone].filter(Boolean).join(' | ')}</div></div>
                  <div className="surface-note"><strong>Trip</strong><div className="ui-muted">{formatPublicDateTime(pickupAt)} {'->'} {formatPublicDateTime(returnAt)} | {publicLocationLabel(selectedLocation)}</div></div>
                  <div className="surface-note" style={{ display: 'grid', gap: 8 }}>
                    <strong>Summary</strong>
                    <div className="row-between" style={{ marginBottom: 0 }}><span>Base trip</span><strong>{fmtMoney(baseTotal)}</strong></div>
                    {addOnsTotal ? <div className="row-between" style={{ marginBottom: 0 }}><span>Add-ons</span><strong>{fmtMoney(addOnsTotal)}</strong></div> : null}
                    {insuranceTotal ? <div className="row-between" style={{ marginBottom: 0 }}><span>Insurance</span><strong>{fmtMoney(insuranceTotal)}</strong></div> : null}
                    <div className="row-between" style={{ marginBottom: 0 }}><span>Estimated total</span><strong>{fmtMoney(estimatedTotal)}</strong></div>
                  </div>
                  <div className={styles.storyCard}>
                    <div className="label">What happens after you reserve</div>
                    <h3 style={{ margin: '8px 0 10px' }}>The guest moves into the next step without needing operations access.</h3>
                    <div className="stack" style={{ gap: 10 }}>
                      <ReserveFlowStep
                        step="1"
                        title="Reservation is created"
                        body="The booking is written into Ride Fleet immediately with the trip details, selected services, and guest information."
                      />
                      <ReserveFlowStep
                        step="2"
                        title={estimatedDueNow > 0 ? 'Guest continues to payment' : 'Guest sees the confirmation screen'}
                        body={estimatedDueNow > 0
                          ? `If payment is due now, the guest is guided into the hosted payment handoff for ${fmtMoney(estimatedDueNow)}.`
                          : 'If no payment is due right now, the guest lands on a clear confirmation screen with the next digital actions.'}
                      />
                      <ReserveFlowStep
                        step="3"
                        title="Email and next links are sent"
                        body="The confirmation email includes links for payment, customer info, and signature so the trip can keep moving digitally."
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={styles.checkoutActionRow}>
                <Link href={backHref} className={styles.checkoutGhostButton} style={{ textDecoration: 'none' }}>Back to details</Link>
                {step > 1 ? <button type="button" className={styles.checkoutGhostButton} onClick={() => setStep((current) => Math.max(1, current - 1))}>Back</button> : null}
                {step < 3 ? <button type="button" className={styles.checkoutPrimaryButton} onClick={() => {
                  if (step === 1 && !guestInfoComplete) return setError('Please complete the guest details first.');
                  if (step === 2 && !insuranceComplete) return setError('Please finish the protection step before continuing.');
                  setError('');
                  setStep((current) => Math.min(3, current + 1));
                }}>Continue</button> : <button type="button" className={styles.checkoutPrimaryButton} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Creating reservation...' : 'Reserve and continue to payment'}</button>}
              </div>
            </div>
          ) : null}
        </div>

        <div className={`glass card ${styles.asidePanel}`}>
          <div className={styles.detailAsideHero}>
            <span className="label">Selected option</span>
            <strong>{searchMode === 'CAR_SHARING' ? (selectedResult?.title || listingVehicleLabel(selectedResult)) : vehicleTypeLabel(selectedResult?.vehicleType)}</strong>
          </div>
          {gallery[0] ? (
            <div className={styles.galleryFrame}>
              <Image src={gallery[0]} alt={searchMode === 'CAR_SHARING' ? (selectedResult?.title || listingVehicleLabel(selectedResult)) : vehicleTypeLabel(selectedResult?.vehicleType)} className={styles.galleryImage} width={1200} height={675} sizes="(max-width: 960px) 100vw, 360px" priority unoptimized />
            </div>
          ) : null}
          <div className="surface-note"><strong>Pickup</strong><div className="ui-muted">{formatPublicDateTime(pickupAt)}</div></div>
          <div className="surface-note"><strong>Return</strong><div className="ui-muted">{formatPublicDateTime(returnAt)}</div></div>
          <div className="surface-note"><strong>Location</strong><div className="ui-muted">{publicLocationLabel(selectedLocation)}</div></div>
          <div className={styles.checkoutSummaryPanel}>
            <div className="label">Estimated trip summary</div>
            <div className={styles.checkoutSummaryRow}><span>Base trip</span><strong>{fmtMoney(baseTotal)}</strong></div>
            {addOnsTotal ? <div className={styles.checkoutSummaryRow}><span>Add-ons</span><strong>{fmtMoney(addOnsTotal)}</strong></div> : null}
            {insuranceTotal ? <div className={styles.checkoutSummaryRow}><span>Protection</span><strong>{fmtMoney(insuranceTotal)}</strong></div> : null}
            <div className={styles.checkoutSummaryRow}><span>Estimated total</span><strong>{fmtMoney(estimatedTotal)}</strong></div>
            <div className={styles.checkoutSummaryRow}><span>Estimated due now</span><strong>{fmtMoney(estimatedDueNow)}</strong></div>
          </div>
          <div className={styles.reassurancePanel}>
            <div className="label">After reserve</div>
            <div className={styles.reassuranceChecklist}>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>The reservation is created in Ride Fleet</span></div>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>{estimatedDueNow > 0 ? `The guest is sent into hosted payment for ${fmtMoney(estimatedDueNow)}` : 'If nothing is due now, the guest stays in a clear confirmation flow'}</span></div>
              <div className={styles.reassuranceItem}><span className={styles.reassuranceDot} /><span>Confirmation email and next links continue the trip flow</span></div>
            </div>
          </div>
        </div>
      </section>
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
