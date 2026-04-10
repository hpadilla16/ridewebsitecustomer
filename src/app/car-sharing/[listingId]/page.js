export function generateMetadata({ params }) {
  return {
    title: 'Car Sharing Listing',
    description: 'View this locally hosted vehicle on Ride Car Sharing. Check availability, pricing, host reviews, and book your trip.',
  };
}
export { default } from '../../../site/car-sharing/[listingId]/page';
