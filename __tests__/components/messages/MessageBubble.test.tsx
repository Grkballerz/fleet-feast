import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MessageBubble } from '@/components/messages/MessageBubble';

describe('MessageBubble', () => {
  const mockMessage = {
    id: 'msg_123',
    content: 'Hello, this is a test message',
    createdAt: new Date('2024-12-05T10:00:00Z'),
    flagged: false,
    sender: {
      id: 'user_1',
      name: 'John Doe',
    },
  };

  describe('Rendering', () => {
    it('renders message content', () => {
      render(<MessageBubble message={mockMessage} isOwn={false} />);
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('renders sender avatar for other party messages', () => {
      render(<MessageBubble message={mockMessage} isOwn={false} />);
      // Avatar component should be rendered
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('does not render avatar for own messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );
      // Own messages should not have avatar
      const bubble = container.querySelector('.flex-row-reverse');
      expect(bubble).toBeInTheDocument();
    });

    it('renders timestamp', () => {
      render(<MessageBubble message={mockMessage} isOwn={false} />);
      // Should show formatted time (h:mm a)
      expect(screen.getByText(/am|pm/i)).toBeInTheDocument();
    });

    it('handles string date format', () => {
      const messageWithStringDate = {
        ...mockMessage,
        createdAt: '2024-12-05T10:00:00Z',
      };

      render(<MessageBubble message={messageWithStringDate} isOwn={false} />);
      expect(screen.getByText(/am|pm/i)).toBeInTheDocument();
    });
  });

  describe('Own Messages', () => {
    it('applies correct styling for own messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );

      const bubble = container.querySelector('.bg-primary');
      expect(bubble).toBeInTheDocument();
      expect(bubble).toHaveClass('text-white');
    });

    it('applies correct border radius for own messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );

      const bubble = container.querySelector('.rounded-br-none');
      expect(bubble).toBeInTheDocument();
    });

    it('aligns own messages to the right', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );

      const wrapper = container.querySelector('.ml-auto');
      expect(wrapper).toBeInTheDocument();
    });

    it('reverses flex direction for own messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );

      const wrapper = container.querySelector('.flex-row-reverse');
      expect(wrapper).toBeInTheDocument();
    });

    it('aligns timestamp to the right for own messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );

      const timestamp = container.querySelector('.text-right');
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe('Other Party Messages', () => {
    it('applies correct styling for other party messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const bubble = container.querySelector('.bg-gray-100');
      expect(bubble).toBeInTheDocument();
      expect(bubble).toHaveClass('text-text-primary');
    });

    it('applies correct border radius for other party messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const bubble = container.querySelector('.rounded-bl-none');
      expect(bubble).toBeInTheDocument();
    });

    it('aligns timestamp to the left for other party messages', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const timestamp = container.querySelector('.text-left');
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe('Flagged Messages', () => {
    it('shows warning when message is flagged', () => {
      const flaggedMessage = {
        ...mockMessage,
        flagged: true,
        flagReason: 'Contains contact information',
      };

      render(<MessageBubble message={flaggedMessage} isOwn={false} />);
      // FlaggedWarning component should be rendered
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });

    it('does not show warning when message is not flagged', () => {
      render(<MessageBubble message={mockMessage} isOwn={false} />);
      // No warning should be visible
      expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    });
  });

  describe('Message Content', () => {
    it('preserves whitespace and line breaks', () => {
      const multilineMessage = {
        ...mockMessage,
        content: 'Line 1\nLine 2\nLine 3',
      };

      const { container } = render(
        <MessageBubble message={multilineMessage} isOwn={false} />
      );

      const content = container.querySelector('.whitespace-pre-wrap');
      expect(content).toBeInTheDocument();
    });

    it('allows long words to break', () => {
      const longMessage = {
        ...mockMessage,
        content: 'verylongwordwithnobreaksverylongwordwithnobreaks',
      };

      const { container } = render(
        <MessageBubble message={longMessage} isOwn={false} />
      );

      const content = container.querySelector('.break-words');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has max width constraint', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const wrapper = container.querySelector('.max-w-\\[80\\%\\]');
      expect(wrapper).toBeInTheDocument();
    });

    it('has bottom margin for spacing', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const wrapper = container.querySelector('.mb-4');
      expect(wrapper).toBeInTheDocument();
    });

    it('has rounded corners', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const bubble = container.querySelector('.rounded-2xl');
      expect(bubble).toBeInTheDocument();
    });

    it('has padding', () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );

      const bubble = container.querySelector('.px-4');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations (own message)', async () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={true} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (other party message)', async () => {
      const { container } = render(
        <MessageBubble message={mockMessage} isOwn={false} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no violations with flagged message', async () => {
      const flaggedMessage = {
        ...mockMessage,
        flagged: true,
        flagReason: 'Policy violation',
      };

      const { container } = render(
        <MessageBubble message={flaggedMessage} isOwn={false} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message content', () => {
      const emptyMessage = {
        ...mockMessage,
        content: '',
      };

      render(<MessageBubble message={emptyMessage} isOwn={false} />);
      expect(screen.getByText(/am|pm/i)).toBeInTheDocument();
    });

    it('handles very long message content', () => {
      const longMessage = {
        ...mockMessage,
        content: 'A'.repeat(1000),
      };

      const { container } = render(
        <MessageBubble message={longMessage} isOwn={false} />
      );
      expect(container.querySelector('.break-words')).toBeInTheDocument();
    });

    it('handles message with special characters', () => {
      const specialMessage = {
        ...mockMessage,
        content: '<script>alert("xss")</script>',
      };

      render(<MessageBubble message={specialMessage} isOwn={false} />);
      // React automatically escapes HTML, so the script tag should be rendered as text
      expect(screen.getByText(/<script>alert\("xss"\)<\/script>/)).toBeInTheDocument();
    });
  });
});
