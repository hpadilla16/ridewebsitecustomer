'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveSiteBasePath, withSiteBase } from '../sitePreviewShared';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using the Ride Car Sharing website, mobile applications, or any of our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
  },
  {
    title: 'Eligibility',
    body: 'You must be at least 21 years of age with a valid driver\'s license to rent or book a vehicle through our platform. Additional age restrictions may apply depending on the vehicle class and location. You must provide accurate, current, and complete information during registration and booking.'
  },
  {
    title: 'Booking and Reservations',
    body: 'All reservations are subject to vehicle availability and host confirmation. Pricing displayed at the time of booking is the rate you will be charged, inclusive of any disclosed fees and taxes. Ride Car Sharing reserves the right to cancel reservations that violate these terms.'
  },
  {
    title: 'Cancellation Policy',
    body: 'For traditional rentals, free cancellation is available up to 48 hours before the scheduled pickup time. For car sharing trips, free cancellation is available up to 24 hours before pickup. Cancellations made after these windows may incur fees up to the full trip amount. No-shows are charged the full booking amount.'
  },
  {
    title: 'Payment and Fees',
    body: 'Payment is processed through our secure hosted payment system. A security deposit hold may be placed on your payment method at the time of booking. Additional charges may apply for late returns, fuel replacement, tolls, cleaning, or damage. All prices are in USD unless otherwise stated.'
  },
  {
    title: 'Vehicle Use and Responsibilities',
    body: 'Guests are responsible for operating the vehicle in accordance with all applicable laws. Smoking, pets (unless disclosed), off-road driving, and illegal activities are prohibited. Guests must return the vehicle in the same condition as received, with the same fuel level. Any damage, loss, or theft during the rental period is the guest\'s responsibility, subject to applicable protection plans.'
  },
  {
    title: 'Insurance and Protection',
    body: 'Trip protection is included on car sharing bookings. Additional coverage options are available during checkout. Protection plans do not cover intentional damage, violations of these terms, or use by unauthorized drivers. Review your protection plan details carefully before booking.'
  },
  {
    title: 'Host Responsibilities',
    body: 'Hosts must ensure their vehicles are properly maintained, insured, registered, and meet all local safety requirements. Hosts must accurately describe their vehicles and provide them in the condition listed. Hosts are responsible for providing clear pickup instructions and being available during scheduled pickup and return times.'
  },
  {
    title: 'Dispute Resolution',
    body: 'In the event of a dispute between a guest and host, both parties agree to first attempt resolution through our in-platform issue center. Ride Car Sharing will review evidence from both parties, including trip chat transcripts, inspection photos, and booking records. Decisions made by our support team are final for claims under $500.'
  },
  {
    title: 'Limitation of Liability',
    body: 'Ride Car Sharing acts as a marketplace connecting guests with vehicle hosts. We are not a rental car company and do not own the vehicles listed on our platform. Our liability is limited to the fees paid to us for our services. We are not responsible for the actions, omissions, or condition of vehicles provided by hosts.'
  },
  {
    title: 'Privacy',
    body: 'Your use of our services is also governed by our Privacy Policy. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.'
  },
  {
    title: 'Changes to Terms',
    body: 'We may update these Terms of Service from time to time. We will notify you of material changes by posting the updated terms on our website. Your continued use of our services after such changes constitutes acceptance of the new terms.'
  },
  {
    title: 'Contact',
    body: 'For questions about these Terms of Service, please contact us at support@ride-carsharing.com or through our Contact page.'
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
      </section>

      {sections.map((section, idx) => (
        <section key={idx} className="glass card" style={{ padding: '22px 24px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.05rem', fontWeight: 700, color: '#1e2847' }}>{section.title}</h2>
          <p style={{ margin: 0, color: '#53607b', lineHeight: 1.7, fontSize: '0.92rem' }}>{section.body}</p>
        </section>
      ))}

      <div style={{ display: 'flex', gap: 12 }}>
        <Link href={withSiteBase(basePath, '/privacy')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>Privacy Policy</Link>
        <Link href={withSiteBase(basePath, '/contact')} style={{ color: '#6e49ff', fontWeight: 600, fontSize: '0.88rem' }}>Contact Us</Link>
      </div>
    </div>
  );
}
