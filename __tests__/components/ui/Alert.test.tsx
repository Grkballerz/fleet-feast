import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Alert } from '@/components/ui/Alert';

describe('Alert', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByText('Alert message')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <Alert className="custom-alert">Message</Alert>
      );
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass('custom-alert');
    });
  });

  describe('Variants', () => {
    it('renders info variant by default', () => {
      const { container } = render(<Alert>Info</Alert>);
      const alert = container.firstChild as HTMLElement;
      // Check for default info styling
      expect(alert).toBeInTheDocument();
    });

    it('renders success variant', () => {
      render(<Alert variant="success">Success message</Alert>);
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('renders warning variant', () => {
      render(<Alert variant="warning">Warning message</Alert>);
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('renders error variant', () => {
      render(<Alert variant="error">Error message</Alert>);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Dismissible', () => {
    it('shows close button when dismissible is true', () => {
      render(
        <Alert dismissible onDismiss={jest.fn()}>
          Dismissible alert
        </Alert>
      );
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('does not show close button when dismissible is false', () => {
      render(<Alert>Non-dismissible</Alert>);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('calls onDismiss when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleDismiss = jest.fn();

      render(
        <Alert dismissible onDismiss={handleDismiss}>
          Dismissible alert
        </Alert>
      );

      await user.click(screen.getByRole('button', { name: /dismiss/i }));
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has role="alert"', () => {
      render(<Alert>Alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has aria-live="polite"', () => {
      render(<Alert>Alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Alert>Accessible alert</Alert>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations when dismissible', async () => {
      const { container } = render(
        <Alert dismissible onDismiss={jest.fn()}>
          Dismissible
        </Alert>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('close button has proper aria-label', () => {
      render(
        <Alert dismissible onDismiss={jest.fn()}>
          Alert
        </Alert>
      );
      const button = screen.getByRole('button', { name: /dismiss/i });
      expect(button).toHaveAccessibleName();
    });
  });
});
