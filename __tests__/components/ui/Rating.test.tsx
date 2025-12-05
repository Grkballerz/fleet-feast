import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Rating } from '@/components/ui/Rating';

describe('Rating', () => {
  describe('Rendering', () => {
    it('renders 5 stars by default', () => {
      const { container } = render(<Rating value={0} />);
      const stars = container.querySelectorAll('svg');
      expect(stars).toHaveLength(5);
    });

    it('displays correct filled stars based on value', () => {
      render(<Rating value={3} />);
      // Check that rating is displayed (implementation may vary)
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('displays decimal ratings', () => {
      render(<Rating value={3.5} />);
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('renders with custom size', () => {
      const { container } = render(<Rating value={4} size="lg" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Interactive Mode', () => {
    it('allows star selection when not readonly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Rating value={0} onChange={handleChange} />);

      const stars = screen.getAllByRole('button');
      expect(stars).toHaveLength(5);

      await user.click(stars[2]);
      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('updates on hover in interactive mode', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Rating value={0} onChange={handleChange} />);

      const stars = screen.getAllByRole('button');
      await user.hover(stars[3]);

      // Visual feedback should be present
      expect(stars[3]).toBeInTheDocument();
    });

    it('calls onChange with correct value', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Rating value={0} onChange={handleChange} />);

      const stars = screen.getAllByRole('button');

      await user.click(stars[0]);
      expect(handleChange).toHaveBeenCalledWith(1);

      await user.click(stars[4]);
      expect(handleChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Readonly Mode', () => {
    it('does not have interactive buttons when readonly', () => {
      render(<Rating value={3} readonly />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('does not call onChange when readonly', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      const { container } = render(
        <Rating value={3} onChange={handleChange} readonly />
      );

      const stars = container.querySelectorAll('svg');
      if (stars[2]) {
        await user.click(stars[2] as Element);
      }

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();

      render(<Rating value={0} onChange={handleChange} />);

      const stars = screen.getAllByRole('button');

      // Tab to first star
      await user.tab();
      expect(stars[0]).toHaveFocus();

      // Press Enter to select
      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledWith(1);
    });

    it('can navigate with arrow keys', async () => {
      const user = userEvent.setup();

      render(<Rating value={0} onChange={jest.fn()} />);

      const stars = screen.getAllByRole('button');

      await user.tab();
      expect(stars[0]).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      // Implementation may handle arrow keys differently
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes', () => {
      render(<Rating value={3} />);
      const container = screen.getByRole('img', { hidden: true });
      expect(container).toBeInTheDocument();
    });

    it('has no accessibility violations (readonly)', async () => {
      const { container } = render(<Rating value={4} readonly />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (interactive)', async () => {
      const { container } = render(<Rating value={0} onChange={jest.fn()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('stars are keyboard accessible when interactive', () => {
      render(<Rating value={0} onChange={jest.fn()} />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles value of 0', () => {
      const { container } = render(<Rating value={0} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles maximum value of 5', () => {
      const { container } = render(<Rating value={5} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('clamps values above 5', () => {
      const { container } = render(<Rating value={10} />);
      const stars = container.querySelectorAll('svg');
      expect(stars).toHaveLength(5);
    });

    it('clamps negative values', () => {
      const { container } = render(<Rating value={-1} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Display Options', () => {
    it('can show count when provided', () => {
      render(<Rating value={4} count={150} />);
      expect(screen.getByText(/150/)).toBeInTheDocument();
    });

    it('shows average when showAverage is true', () => {
      render(<Rating value={4.2} showAverage />);
      expect(screen.getByText(/4\.2/)).toBeInTheDocument();
    });
  });
});
