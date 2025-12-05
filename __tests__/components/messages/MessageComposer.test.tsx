import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MessageComposer } from '@/components/messages/MessageComposer';

// Mock fetch
global.fetch = jest.fn();

describe('MessageComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('Rendering', () => {
    it('renders textarea for message input', () => {
      render(<MessageComposer bookingId="booking_123" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<MessageComposer bookingId="booking_123" />);
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('shows placeholder text', () => {
      render(<MessageComposer bookingId="booking_123" />);
      expect(
        screen.getByPlaceholderText(/type a message/i)
      ).toBeInTheDocument();
    });

    it('shows disabled message when disabled', () => {
      render(<MessageComposer bookingId="booking_123" disabled />);
      expect(
        screen.getByText(/messaging is disabled for this booking/i)
      ).toBeInTheDocument();
    });

    it('does not show textarea when disabled', () => {
      render(<MessageComposer bookingId="booking_123" disabled />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('allows typing in textarea', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello world');

      expect(textarea).toHaveValue('Hello world');
    });

    it('respects maxLength of 1000 characters', () => {
      render(<MessageComposer bookingId="booking_123" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '1000');
    });

    it('disables textarea when sending', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      );

      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(textarea).toBeDisabled();
    });
  });

  describe('Send Button', () => {
    it('is disabled when textarea is empty', () => {
      render(<MessageComposer bookingId="booking_123" />);
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('is enabled when textarea has content', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).not.toBeDisabled();
    });

    it('is disabled when content is only whitespace', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');

      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    it('shows loading state when sending', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      );

      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));

      expect(screen.getByRole('button', { name: /send/i })).toHaveAttribute(
        'aria-busy',
        'true'
      );
    });
  });

  describe('Flagged Content Detection', () => {
    it('shows warning for phone number', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Call me at 555-123-4567');

      expect(
        screen.getByText(/appears to contain a phone number/i)
      ).toBeInTheDocument();
    });

    it('shows warning for email address', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Email me at test@example.com');

      expect(
        screen.getByText(/appears to contain a email address/i)
      ).toBeInTheDocument();
    });

    it('shows warning for social media handle', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Find me @username on social media');

      expect(
        screen.getByText(/appears to contain a social media handle/i)
      ).toBeInTheDocument();
    });

    it('clears warning when flagged content is removed', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Call 555-1234');
      expect(screen.getByText(/phone number/i)).toBeInTheDocument();

      await user.clear(textarea);
      await user.type(textarea, 'Safe message');
      expect(screen.queryByText(/phone number/i)).not.toBeInTheDocument();
    });
  });

  describe('Send Message', () => {
    it('sends message to correct endpoint', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/messages',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: 'booking_123',
              content: 'Test message',
            }),
          })
        );
      });
    });

    it('trims message before sending', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  Test message  ');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/messages',
          expect.objectContaining({
            body: JSON.stringify({
              bookingId: 'booking_123',
              content: 'Test message',
            }),
          })
        );
      });
    });

    it('clears textarea after successful send', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });

    it('calls onSend callback after successful send', async () => {
      const user = userEvent.setup();
      const onSend = jest.fn();

      render(<MessageComposer bookingId="booking_123" onSend={onSend} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(onSend).toHaveBeenCalled();
      });
    });

    it('shows error message when send fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Failed to send' } }),
      });

      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to send/i)).toBeInTheDocument();
      });
    });

    it('does not clear textarea when send fails', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Error' } }),
      });

      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test message');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(textarea).toHaveValue('Test message');
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('sends message on Enter key', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('adds new line on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

      expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('does not send on Enter when textarea is empty', async () => {
      const user = userEvent.setup();
      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      textarea.focus();
      await user.keyboard('{Enter}');

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<MessageComposer bookingId="booking_123" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('send button has proper aria-label', () => {
      render(<MessageComposer bookingId="booking_123" />);
      const button = screen.getByRole('button', { name: /send/i });
      expect(button).toHaveAttribute('aria-label', 'Send message');
    });

    it('error has proper alert role', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Error' } }),
      });

      render(<MessageComposer bookingId="booking_123" />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Test');
      await user.click(screen.getByRole('button', { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});
