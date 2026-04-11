'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const sections = [
  {
    title: '1. Platform Nature and Role',
    body: `Ride Car Sharing ("Ride," "we," "us," or "our") operates an online peer-to-peer car sharing marketplace platform that connects vehicle owners ("Hosts") with individuals seeking to rent vehicles ("Guests"). Ride is NOT a car rental company, vehicle dealership, insurance provider, or transportation carrier. We do not own, operate, maintain, inspect, or insure any vehicles listed on our platform. We are a technology marketplace that facilitates connections between independent Hosts and Guests.

By using our platform, you acknowledge and agree that:
• Ride acts solely as an intermediary and facilitator of transactions between Hosts and Guests.
• Ride does not employ, contract, supervise, or control Hosts or Guests.
• Ride does not guarantee the condition, safety, legality, or suitability of any listed vehicle.
• Ride is not a party to the rental agreement between Host and Guest.
• Any dispute regarding the vehicle, trip, or transaction is between the Host and Guest, subject to our limited dispute resolution program described below.`
  },
  {
    title: '2. Eligibility',
    body: `To use our platform as a Guest, you must:
• Be at least 21 years of age (25 for certain vehicle categories).
• Possess a valid, unrestricted driver's license issued in the United States or Puerto Rico.
• Provide accurate personal information including full legal name, email, phone, and date of birth.
• Not have any DUI, DWI, reckless driving, or suspended license within the past 7 years.

To use our platform as a Host, you must:
• Be at least 21 years of age.
• Be the legal owner or authorized operator of the listed vehicle.
• Maintain active personal auto insurance that meets or exceeds state minimum requirements.
• Notify your personal insurance provider that you intend to share your vehicle on a peer-to-peer platform.
• Ensure your vehicle passes applicable state safety and emissions inspections.
• List only vehicles that are 15 model years old or newer and have fewer than 150,000 miles.`
  },
  {
    title: '3. Host Responsibilities and Insurance',
    body: `AS A HOST, YOU ARE SOLELY RESPONSIBLE FOR:
• Maintaining adequate auto insurance coverage that meets or exceeds the minimum requirements of your state or territory. Minimum requirements: Puerto Rico — Seguro Obligatorio (SRO); Florida — 10/20/10; California — 15/30/5; New York — 25/50/10; Texas — 30/60/25.
• Notifying your insurance carrier that your vehicle is used for peer-to-peer car sharing. Failure to do so may void your personal insurance policy.
• Ensuring your vehicle is in safe, roadworthy condition with current registration and inspection.
• Providing accurate descriptions, photos, and condition disclosures for your vehicle.
• Being available and responsive during scheduled pickup and return times.
• Reporting any known mechanical issues, recalls, or safety concerns.

HOST INDEMNIFICATION: You agree to indemnify, defend, and hold harmless Ride Car Sharing, its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from or related to: (a) the condition, operation, maintenance, or use of your vehicle; (b) any breach of your representations or obligations under these Terms; (c) any injury, death, or property damage caused by or related to your vehicle; (d) any insurance coverage dispute or gap related to your vehicle.

RIDE DOES NOT VERIFY, VALIDATE, OR GUARANTEE THE EXISTENCE, ADEQUACY, OR APPLICABILITY OF ANY HOST'S INSURANCE COVERAGE. Hosts are solely responsible for ensuring appropriate insurance at all times.`
  },
  {
    title: '4. Trip Protection Program',
    body: `Ride offers an optional Trip Protection Program ("TPP") to Guests at checkout. THE TRIP PROTECTION PROGRAM IS NOT INSURANCE. It is a limited contractual reimbursement program between you and Ride, subject to the terms and exclusions below.

PROTECTION TIERS:
• Basic (included): No damage reimbursement. Guest is financially responsible for all damages up to the full value of the vehicle. Host receives no platform-backed damage coverage.
• Standard (fee applies): Limited damage reimbursement up to $35,000 with a $1,000 Guest deductible per incident. Ride will reimburse the Host for eligible repair costs or the Host's insurance deductible, whichever is less, up to the coverage limit.
• Premium (fee applies): Limited damage reimbursement up to $50,000 with a $250 Guest deductible per incident. Ride will reimburse the Host for eligible repair costs or the Host's insurance deductible, whichever is less, up to the coverage limit. Includes roadside assistance.

HOST REIMBURSEMENT: When a Guest selects Standard or Premium Trip Protection, the Host is covered. If damage occurs during the trip and the Guest is responsible, Ride will reimburse the Host for the lesser of: (a) the actual documented repair cost, or (b) the Host's personal insurance deductible. This reimbursement is paid from the Trip Protection Fund and is subject to the coverage limit of the selected tier. The Host must submit a claim with photos and repair estimates within 24 hours of trip completion.

WHAT THE TRIP PROTECTION PROGRAM COVERS:
• Collision damage to the Host's vehicle occurring during the active trip period.
• Theft of the Host's vehicle during the active trip period (police report required).

WHAT THE TRIP PROTECTION PROGRAM DOES NOT COVER:
• Liability for bodily injury or death to any person.
• Damage to third-party vehicles or property.
• Damage caused by intentional acts, gross negligence, or violation of these Terms.
• Damage caused by unauthorized drivers, off-road use, racing, or illegal activity.
• Pre-existing damage not documented in the pre-trip inspection.
• Mechanical breakdowns, wear and tear, tire damage, or interior damage caused by normal use.
• Personal property left in the vehicle.
• Loss of use, diminished value, or consequential damages.
• Any incident occurring outside the active trip period.

THE TRIP PROTECTION PROGRAM IS NOT A SUBSTITUTE FOR PERSONAL AUTO INSURANCE. Guests are strongly encouraged to carry personal auto insurance that covers rental and borrowed vehicles. Guests may also purchase separate rental car insurance from a third-party provider.`
  },
  {
    title: '5. Security Deposit',
    body: `A refundable security deposit hold may be placed on the Guest's payment method at the time of booking. The deposit amount is displayed at checkout and varies by vehicle and Host preferences. The deposit hold will be released within 5-7 business days after the trip ends without incident. If damage or a policy violation occurs, Ride may charge the deposit (in full or in part) to cover documented costs, subject to the Trip Protection Program terms.`
  },
  {
    title: '6. Booking, Payment, and Cancellation',
    body: `BOOKING: All reservations are subject to vehicle availability and, where applicable, Host approval. Instant Book listings are confirmed immediately. Non-Instant Book listings require Host confirmation within 24 hours.

PAYMENT: Payment is processed through our secure hosted payment system at the time of booking or at pickup, depending on the listing configuration. The total trip cost includes: base daily rate, cleaning fee (if applicable), delivery fee (if applicable), Trip Protection fee (if selected), platform service fee, and applicable taxes.

CANCELLATION BY GUEST:
• Car sharing trips: Free cancellation up to 24 hours before scheduled pickup. Cancellations within 24 hours may incur a fee equal to one day's rental rate. No-shows are charged the full trip amount.
• Traditional rentals: Free cancellation up to 48 hours before scheduled pickup. Late cancellations may forfeit the deposit.

CANCELLATION BY HOST: Hosts who cancel confirmed bookings may be subject to penalties including reduced search visibility, account warnings, and in repeated cases, account suspension.`
  },
  {
    title: '7. Vehicle Use Restrictions',
    body: `During the trip, the Guest agrees:
• To operate the vehicle in compliance with all applicable traffic laws and regulations.
• NOT to allow any person other than the registered Guest to drive the vehicle.
• NOT to use the vehicle for any illegal purpose, racing, towing, off-road driving, or commercial delivery services.
• NOT to smoke or vape in the vehicle (unless the listing explicitly permits it).
• NOT to transport pets in the vehicle (unless the listing explicitly permits it).
• To return the vehicle at the agreed-upon time and location with the same fuel level as at pickup.
• To immediately report any accident, damage, breakdown, or traffic violation to both the Host (via Trip Chat) and to Ride support.

Violation of these restrictions voids any Trip Protection coverage and may result in full financial liability for the Guest.`
  },
  {
    title: '8. Inspections and Damage Claims',
    body: `PRE-TRIP INSPECTION: Guests and Hosts are strongly encouraged to document the vehicle condition with photos before and after each trip using the in-app inspection tool. Pre-trip photos serve as the baseline for damage assessment.

DAMAGE CLAIMS: If damage is discovered at the end of a trip:
1. The Host reports the damage via the Issue Center or Trip Chat (with photos).
2. The full chat transcript is preserved as evidence.
3. Pre-trip and post-trip inspection photos are compared.
4. The claims team reviews the evidence and makes a determination.
5. If the Guest is responsible, the security deposit is charged first.
6. If the damage exceeds the deposit, the Trip Protection Program applies (if purchased).
7. If the damage exceeds the TPP limit, the Host's personal insurance and/or legal remedies apply.

Claims must be submitted within 24 hours of trip completion. Late claims may not be eligible for the Trip Protection Program.`
  },
  {
    title: '9. Limitation of Liability',
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

RIDE CAR SHARING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM:
• YOUR USE OF OR INABILITY TO USE THE PLATFORM.
• ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM.
• ANY VEHICLE CONDITION, ACCIDENT, INJURY, OR PROPERTY DAMAGE.
• UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.

RIDE'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO RIDE IN PLATFORM FEES DURING THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00).

YOU ACKNOWLEDGE THAT RIDE DOES NOT PROVIDE INSURANCE AND THAT THE TRIP PROTECTION PROGRAM IS A LIMITED CONTRACTUAL BENEFIT, NOT AN INSURANCE PRODUCT. YOU ASSUME ALL RISK ASSOCIATED WITH RENTING OR LISTING A VEHICLE THROUGH THE PLATFORM.`
  },
  {
    title: '10. Dispute Resolution and Arbitration',
    body: `INFORMAL RESOLUTION: Before filing any formal claim, you agree to contact Ride at support@ride-carsharing.com and attempt to resolve the dispute informally for at least 30 days.

BINDING ARBITRATION: If the dispute is not resolved informally, you agree that any claim or dispute arising from or relating to these Terms or the platform shall be resolved through binding individual arbitration under the rules of the American Arbitration Association ("AAA"), and NOT through court proceedings.

CLASS ACTION WAIVER: YOU AND RIDE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.

GOVERNING LAW: These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Puerto Rico, without regard to its conflict of law provisions.`
  },
  {
    title: '11. Privacy and Data',
    body: `Your use of the platform is also governed by our Privacy Policy. By using our services, you consent to the collection and use of your information as described in our Privacy Policy. This includes trip chat messages, inspection photos, location data, and transaction records, which may be used as evidence in the dispute resolution process.`
  },
  {
    title: '12. Account Suspension and Termination',
    body: `Ride reserves the right to suspend or terminate your account at any time, with or without notice, for any reason including but not limited to: violation of these Terms, fraudulent activity, safety concerns, excessive cancellations, consistently low ratings, or failure to maintain required insurance (Hosts). Upon termination, any pending trips will be cancelled and refunds issued per the cancellation policy.`
  },
  {
    title: '13. Changes to Terms',
    body: `We may modify these Terms at any time by posting the updated version on our website and app. Material changes will be communicated via email to registered users. Your continued use of the platform after changes are posted constitutes acceptance of the modified Terms. If you do not agree with the changes, you must stop using the platform.`
  },
  {
    title: '14. Contact Information',
    body: `Ride Car Sharing
San Juan, Puerto Rico
Email: support@ride-carsharing.com
Phone: +1 (787) 555-0100

For insurance-related questions: insurance@ride-carsharing.com
For legal inquiries: legal@ride-carsharing.com`
  }
];

export default function TermsPage() {
  const pathname = usePathname();
  const basePath = resolveSiteBasePath(pathname);

  return (
    <div className="stack" style={{ gap: 24, maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <section className="glass card-lg" style={{ padding: 28 }}>
        <span className="eyebrow">Legal</span>
        <h1 style={{ marginTop: 8 }}>Terms of Service</h1>
        <p className="ui-muted">Last updated: April 2026</p>
        <p className="ui-muted" style={{ marginTop: 8, fontWeight: 600 }}>
          IMPORTANT: By using Ride Car Sharing, you agree to these Terms, including the binding arbitration clause and class action waiver in Section 10. Please read carefully.
        </p>
      </section>

      {sections.map((section, idx) => (
        <section key={idx} className="glass card" style={{ padding: '22px 24px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#1e2847' }}>{section.title}</h2>
          <pre style={{ margin: 0, color: '#53607b', lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{section.body}</pre>
        </section>
      ))}

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href={withSiteBase(basePath, '/privacy')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>Privacy Policy</Link>
        <Link href={withSiteBase(basePath, '/contact')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>Contact Us</Link>
      </div>
    </div>
  );
}
