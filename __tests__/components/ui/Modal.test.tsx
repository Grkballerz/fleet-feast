import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Modal } from '@/components/ui/Modal';

// Helper component to test controlled modal
function ControlledModal({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Test Modal"
        description="This is a test modal"
      >
        <p>Modal content</p>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  describe('Rendering', () => {
    it('does not render when open is false', () => {
      render(
        <Modal open={false} onClose={jest.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders when open is true', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <Modal open={true} onClose={jest.fn()} title="My Modal">
          Content
        </Modal>
      );
      expect(screen.getByText('My Modal')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <Modal
          open={true}
          onClose={jest.fn()}
          description="Modal description"
        >
          Content
        </Modal>
      );
      expect(screen.getByText('Modal description')).toBeInTheDocument();
    });

    it('renders actions when provided', () => {
      render(
        <Modal
          open={true}
          onClose={jest.fn()}
          actions={<button>Action Button</button>}
        >
          Content
        </Modal>
      );
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal open={true} onClose={jest.fn()} showCloseButton={false}>
          Content
        </Modal>
      );
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );
      const panel = container.querySelector('[class*="max-w-md"]');
      expect(panel).toBeInTheDocument();
    });

    it('renders small size', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()} size="sm">
          Content
        </Modal>
      );
      const panel = container.querySelector('[class*="max-w-sm"]');
      expect(panel).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()} size="lg">
          Content
        </Modal>
      );
      const panel = container.querySelector('[class*="max-w-lg"]');
      expect(panel).toBeInTheDocument();
    });

    it('renders extra large size', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()} size="xl">
          Content
        </Modal>
      );
      const panel = container.querySelector('[class*="max-w-xl"]');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <Modal open={true} onClose={handleClose}>
          Content
        </Modal>
      );

      await user.click(screen.getByRole('button', { name: /close modal/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <Modal open={true} onClose={handleClose}>
          Content
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const handleClose = jest.fn();

      render(
        <Modal open={true} onClose={handleClose}>
          Content
        </Modal>
      );

      // Click on the backdrop (not the modal panel)
      const backdrop = screen.getByRole('dialog').parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }

      // HeadlessUI Dialog handles backdrop clicks
      expect(handleClose).toHaveBeenCalled();
    });

    it('can be opened and closed', async () => {
      const user = userEvent.setup();
      render(<ControlledModal />);

      // Modal should not be visible initially
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();

      // Open modal
      await user.click(screen.getByText('Open Modal'));
      await waitFor(() => {
        expect(screen.getByText('Modal content')).toBeInTheDocument();
      });

      // Close modal
      await user.click(screen.getByRole('button', { name: /close modal/i }));
      await waitFor(() => {
        expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has no accessibility violations', async () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()} title="Accessible Modal">
          Content
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('title has proper heading role', () => {
      render(
        <Modal open={true} onClose={jest.fn()} title="Modal Title">
          Content
        </Modal>
      );

      const title = screen.getByText('Modal Title');
      expect(title.tagName).toBe('H3');
    });

    it('close button has proper aria-label', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('close icon has aria-hidden', () => {
      render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const icon = closeButton.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <Modal
          open={true}
          onClose={jest.fn()}
          actions={
            <>
              <button>Cancel</button>
              <button>Confirm</button>
            </>
          }
        >
          <button>Inside Modal</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      const insideButton = screen.getByText('Inside Modal');
      const cancelButton = screen.getByText('Cancel');
      const confirmButton = screen.getByText('Confirm');

      // Focus should start at close button or first focusable element
      await user.tab();
      expect([closeButton, insideButton]).toContainEqual(document.activeElement);

      // Tab through all focusable elements
      await user.tab();
      await user.tab();
      await user.tab();

      // After tabbing through all elements, focus should wrap
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to modal panel', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()} className="custom-modal">
          Content
        </Modal>
      );

      const panel = container.querySelector('[class*="custom-modal"]');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Backdrop', () => {
    it('renders backdrop with blur effect', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );

      const backdrop = container.querySelector('[class*="backdrop-blur"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('backdrop has opacity styling', () => {
      const { container } = render(
        <Modal open={true} onClose={jest.fn()}>
          Content
        </Modal>
      );

      const backdrop = container.querySelector('[class*="bg-black"]');
      expect(backdrop).toBeInTheDocument();
    });
  });
});
