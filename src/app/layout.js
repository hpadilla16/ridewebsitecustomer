import '../app/globals.css';
import { PublicSiteShell } from '../components/PublicSiteShell';

export const metadata = {
  title: 'Ride Car Sharing',
  description: 'Airport-ready rentals and car sharing powered by Ride Fleet.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PublicSiteShell>{children}</PublicSiteShell>
      </body>
    </html>
  );
}
