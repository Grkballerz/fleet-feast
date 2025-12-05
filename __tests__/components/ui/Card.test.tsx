import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('renders header when provided', () => {
      render(<Card header={<div>Header content</div>}>Body</Card>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
      render(<Card footer={<div>Footer content</div>}>Body</Card>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders header and footer together', () => {
      render(
        <Card
          header={<div>Header</div>}
          footer={<div>Footer</div>}
        >
          Body content
        </Card>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Body content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant by default', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-md');
      expect(card).not.toHaveClass('cursor-pointer');
    });

    it('renders interactive variant with proper styles', () => {
      const { container } = render(<Card variant="interactive">Interactive</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('interactive variant has tabIndex of 0', () => {
      const { container } = render(<Card variant="interactive">Clickable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('default variant does not have tabIndex', () => {
      const { container } = render(<Card>Not clickable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute('tabIndex');
    });

    it('interactive variant has button role', () => {
      render(<Card variant="interactive">Click me</Card>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('default variant does not have button role', () => {
      render(<Card>Content</Card>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClick when interactive card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Card variant="interactive" onClick={handleClick}>
          Clickable card
        </Card>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('default card can still have onClick', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const { container } = render(
        <Card onClick={handleClick}>
          Card with click
        </Card>
      );

      await user.click(container.firstChild as HTMLElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('interactive card can be focused with keyboard', async () => {
      const user = userEvent.setup();
      render(<Card variant="interactive">Focusable</Card>);
      const card = screen.getByRole('button');

      await user.tab();
      expect(card).toHaveFocus();
    });

    it('interactive card can be activated with Enter', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Card variant="interactive" onClick={handleClick}>
          Press Enter
        </Card>
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('interactive card can be activated with Space', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Card variant="interactive" onClick={handleClick}>
          Press Space
        </Card>
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations (default)', async () => {
      const { container } = render(<Card>Accessible card</Card>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations (interactive)', async () => {
      const { container } = render(
        <Card variant="interactive">Clickable card</Card>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has focus-visible styles when interactive', () => {
      const { container } = render(<Card variant="interactive">Focus</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('focus-visible:outline-none');
      expect(card).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('ForwardRef', () => {
    it('forwards ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>With ref</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header).toHaveClass('custom-header');
  });

  it('has proper styling classes', () => {
    render(<CardHeader>Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header).toHaveClass('mb-4', 'border-b', 'border-border', 'pb-4');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body content</CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardBody className="custom-body">Body</CardBody>);
    const body = screen.getByText('Body');
    expect(body).toHaveClass('custom-body');
  });
});

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-footer');
  });

  it('has proper styling classes', () => {
    render(<CardFooter>Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('mt-4', 'border-t', 'border-border', 'pt-4');
  });
});

describe('Card Composition', () => {
  it('can compose Card with CardHeader, CardBody, and CardFooter', () => {
    render(
      <Card>
        <CardHeader>
          <h3>Title</h3>
        </CardHeader>
        <CardBody>
          <p>Main content</p>
        </CardBody>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
