import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '../src/components/Breadcrumbs';

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}));

describe('Breadcrumbs', () => {
  it('renders nothing with no items', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.querySelector('nav')).toBeNull();
  });

  it('renders breadcrumb items', () => {
    render(<Breadcrumbs items={[
      { label: 'Home', href: '/' },
      { label: 'Car Sharing', href: '/car-sharing' },
      { label: 'Listing' },
    ]} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Car Sharing')).toBeInTheDocument();
    expect(screen.getByText('Listing')).toBeInTheDocument();
  });

  it('renders links for non-last items', () => {
    render(<Breadcrumbs items={[
      { label: 'Home', href: '/' },
      { label: 'Rent', href: '/rent' },
      { label: 'Vehicle' },
    ]} />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    const rentLink = screen.getByText('Rent').closest('a');
    expect(rentLink).toHaveAttribute('href', '/rent');
    // Last item should not be a link
    const vehicle = screen.getByText('Vehicle');
    expect(vehicle.closest('a')).toBeNull();
  });

  it('renders aria-label on nav', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Page' }]} />);
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('injects JSON-LD script', () => {
    const { container } = render(<Breadcrumbs items={[
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script.innerHTML);
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(2);
    expect(data.itemListElement[0].name).toBe('Home');
  });
});
