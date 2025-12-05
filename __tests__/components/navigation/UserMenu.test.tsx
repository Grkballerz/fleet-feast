import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession, signOut } from 'next-auth/react';
import { axe } from 'jest-axe';
import { UserMenu } from '@/components/navigation/UserMenu';
import { UserRole } from '@/types';

// Mock next-auth
jest.mock('next-auth/react');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });
    });

    it('shows login and sign up buttons when not authenticated', () => {
      render(<UserMenu />);
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('login button links to /login', () => {
      render(<UserMenu />);
      const loginLink = screen.getByText('Login').closest('a');
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('sign up button links to /register', () => {
      render(<UserMenu />);
      const signUpLink = screen.getByText('Sign Up').closest('a');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });
    });

    it('shows loading skeleton', () => {
      render(<UserMenu />);
      const skeleton = screen.getByRole('generic', { hidden: true });
      expect(skeleton.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('does not show login/signup buttons while loading', () => {
      render(<UserMenu />);
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated - Customer', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            role: UserRole.CUSTOMER,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('shows user avatar and name', () => {
      render(<UserMenu />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows customer role', () => {
      render(<UserMenu />);
      expect(screen.getByText('customer')).toBeInTheDocument();
    });

    it('shows customer-specific menu items', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      // Click to open dropdown
      const trigger = screen.getByText('John Doe').closest('div');
      if (trigger) {
        await user.click(trigger);
      }

      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Bookings')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('shows common menu items', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const trigger = screen.getByText('John Doe').closest('div');
      if (trigger) {
        await user.click(trigger);
      }

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('calls signOut when logout is clicked', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const trigger = screen.getByText('John Doe').closest('div');
      if (trigger) {
        await user.click(trigger);
      }

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });

  describe('Authenticated - Vendor', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'vendor1',
            name: 'Vendor User',
            email: 'vendor@example.com',
            role: UserRole.VENDOR,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('shows vendor role', () => {
      render(<UserMenu />);
      expect(screen.getByText('vendor')).toBeInTheDocument();
    });

    it('shows vendor-specific menu items', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const trigger = screen.getByText('Vendor User').closest('div');
      if (trigger) {
        await user.click(trigger);
      }

      expect(screen.getByText('Vendor Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Bookings')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  describe('Authenticated - Admin', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@example.com',
            role: UserRole.ADMIN,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('shows admin role', () => {
      render(<UserMenu />);
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('shows admin-specific menu items', async () => {
      const user = userEvent.setup();
      render(<UserMenu />);

      const trigger = screen.getByText('Admin User').closest('div');
      if (trigger) {
        await user.click(trigger);
      }

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Pending Vendors')).toBeInTheDocument();
      expect(screen.getByText('Disputes')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('shows email when name is not provided', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user1',
            name: '',
            email: 'test@example.com',
            role: UserRole.CUSTOMER,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      render(<UserMenu />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('name is visible on desktop', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            role: UserRole.CUSTOMER,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });

      const { container } = render(<UserMenu />);
      const nameElement = screen.getByText('John Doe');

      // Check for hidden class on mobile (md:block)
      expect(nameElement.closest('div')).toHaveClass('hidden', 'md:block');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            role: UserRole.CUSTOMER,
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
        update: jest.fn(),
      });
    });

    it('has no accessibility violations (authenticated)', async () => {
      const { container } = render(<UserMenu />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (unauthenticated)', async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<UserMenu />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      const { container } = render(<UserMenu className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
