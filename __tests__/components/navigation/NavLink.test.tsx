import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { axe } from 'jest-axe';
import { NavLink } from '@/components/navigation/NavLink';

// Mock next/navigation
jest.mock('next/navigation');

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('NavLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('renders link with label', () => {
      render(<NavLink href="/dashboard" label="Dashboard" />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders with correct href', () => {
      render(<NavLink href="/profile" label="Profile" />);
      const link = screen.getByRole('link', { name: /profile/i });
      expect(link).toHaveAttribute('href', '/profile');
    });

    it('renders with icon', () => {
      const Icon = () => <span data-testid="icon">🏠</span>;
      render(<NavLink href="/home" label="Home" icon={<Icon />} />);
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders without icon', () => {
      render(<NavLink href="/home" label="Home" />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('is active when pathname matches href exactly', () => {
      mockUsePathname.mockReturnValue('/dashboard');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-primary', 'text-white');
    });

    it('is active when pathname starts with href', () => {
      mockUsePathname.mockReturnValue('/dashboard/settings');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-primary', 'text-white');
    });

    it('is not active when pathname does not match', () => {
      mockUsePathname.mockReturnValue('/profile');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('bg-primary');
      expect(link).toHaveClass('text-text-primary');
    });

    it('applies inactive hover styles when not active', () => {
      mockUsePathname.mockReturnValue('/other');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('hover:bg-secondary', 'hover:text-primary');
    });
  });

  describe('Mobile Variant', () => {
    it('applies mobile styles when mobile prop is true', () => {
      render(<NavLink href="/home" label="Home" mobile />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-4', 'py-3', 'text-base');
    });

    it('applies desktop styles by default', () => {
      render(<NavLink href="/home" label="Home" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('px-3', 'py-2', 'text-sm');
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<NavLink href="/home" label="Home" onClick={handleClick} />);

      await user.click(screen.getByRole('link'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be navigated to with keyboard', async () => {
      const user = userEvent.setup();
      render(<NavLink href="/home" label="Home" />);

      await user.tab();
      expect(screen.getByRole('link')).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <NavLink href="/dashboard" label="Dashboard" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with icon', async () => {
      const Icon = () => <span>🏠</span>;
      const { container } = render(
        <NavLink href="/home" label="Home" icon={<Icon />} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('is a link element with proper role', () => {
      render(<NavLink href="/profile" label="Profile" />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      render(
        <NavLink href="/home" label="Home" className="custom-class" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('merges custom className with default styles', () => {
      render(
        <NavLink href="/home" label="Home" className="extra-class" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass('extra-class');
      expect(link).toHaveClass('flex', 'items-center');
    });
  });

  describe('Icon Styling', () => {
    it('icon container has proper sizing classes', () => {
      const Icon = () => <svg data-testid="svg-icon"></svg>;
      render(<NavLink href="/home" label="Home" icon={<Icon />} />);

      const iconContainer = screen.getByTestId('svg-icon').parentElement;
      expect(iconContainer).toHaveClass('inline-flex', 'shrink-0', 'h-5', 'w-5');
    });
  });

  describe('Edge Cases', () => {
    it('handles root path correctly', () => {
      mockUsePathname.mockReturnValue('/');
      render(<NavLink href="/" label="Home" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-primary', 'text-white');
    });

    it('handles nested paths', () => {
      mockUsePathname.mockReturnValue('/dashboard/settings/profile');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-primary', 'text-white');
    });

    it('does not match similar paths', () => {
      mockUsePathname.mockReturnValue('/dashboard-admin');
      render(<NavLink href="/dashboard" label="Dashboard" />);

      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('bg-primary');
    });
  });
});
