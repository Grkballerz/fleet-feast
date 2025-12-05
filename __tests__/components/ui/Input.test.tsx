import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email Address" />);
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(<Input helperText="This is helpful" />);
      expect(screen.getByText('This is helpful')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('does not show helper text when error is present', () => {
      render(<Input error="Error!" helperText="Helper" />);
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.queryByText('Helper')).not.toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    it('defaults to text type', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    it('renders email type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password type', () => {
      render(<Input type="password" label="Password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number type', () => {
      render(<Input type="number" label="Age" />);
      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('shows toggle button for password input', () => {
      render(<Input type="password" label="Password" />);
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('does not show toggle button for non-password input', () => {
      render(<Input type="text" />);
      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument();
    });

    it('toggles password visibility when clicked', async () => {
      const user = userEvent.setup();
      render(<Input type="password" label="Password" />);

      const input = screen.getByLabelText('Password');
      const toggle = screen.getByRole('button', { name: /show password/i });

      expect(input).toHaveAttribute('type', 'password');

      await user.click(toggle);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

      await user.click(toggle);
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Required Field', () => {
    it('shows asterisk when required', () => {
      render(<Input label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('asterisk has aria-label', () => {
      render(<Input label="Email" required />);
      const asterisk = screen.getByText('*');
      expect(asterisk).toHaveAttribute('aria-label', 'required');
    });
  });

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies error styles when error is present', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-error');
    });

    it('has aria-invalid when error is present', () => {
      render(<Input error="Invalid" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('has aria-invalid false when no error', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('User Interactions', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('Hello');
    });

    it('can be focused', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('respects maxLength attribute', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={5} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'HelloWorld');

      expect(input).toHaveValue('Hello');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Input label="Accessible Input" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with error', async () => {
      const { container } = render(
        <Input label="Email" error="Invalid email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates label with input', () => {
      render(<Input label="Username" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Username');

      expect(label).toHaveAttribute('for', input.id);
    });

    it('associates error message with input via aria-describedby', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      const error = screen.getByText('Invalid email');

      expect(input).toHaveAttribute('aria-describedby', error.id);
    });

    it('associates helper text with input via aria-describedby', () => {
      render(<Input label="Password" helperText="Min 8 characters" />);
      const input = screen.getByRole('textbox');
      const helper = screen.getByText('Min 8 characters');

      expect(input).toHaveAttribute('aria-describedby', helper.id);
    });

    it('error has role="alert"', () => {
      render(<Input error="Error message" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Error message');
    });

    it('error has aria-live="polite"', () => {
      render(<Input error="Error message" />);
      const error = screen.getByRole('alert');
      expect(error).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('ID Generation', () => {
    it('uses provided id', () => {
      render(<Input id="custom-id" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id');
    });

    it('generates id from label when id not provided', () => {
      render(<Input label="Email Address" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'input-email-address');
    });
  });

  describe('ForwardRef', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('ref can be used to focus input', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className to input', () => {
      render(<Input className="custom-input" />);
      expect(screen.getByRole('textbox')).toHaveClass('custom-input');
    });

    it('applies containerClassName to wrapper', () => {
      render(<Input containerClassName="custom-container" label="Test" />);
      const container = screen.getByText('Test').parentElement;
      expect(container).toHaveClass('custom-container');
    });
  });
});
