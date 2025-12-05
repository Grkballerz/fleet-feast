"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Modal title
   */
  title?: string;
  /**
   * Modal description
   */
  description?: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Footer actions (typically buttons)
   */
  actions?: React.ReactNode;
  /**
   * Optional className for the modal panel
   */
  className?: string;
  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
}

/**
 * Modal Component
 *
 * Accessible modal dialog built on Headless UI.
 * Includes backdrop, focus trap, ESC to close, and proper ARIA attributes.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   description="Are you sure you want to proceed?"
 *   actions={
 *     <>
 *       <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Additional content goes here...</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  className,
  size = "md",
  showCloseButton = true,
}) => {
  // Size-specific max widths
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[1400]" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={cn(
                  "w-full transform overflow-hidden rounded-xl bg-card p-6 text-left align-middle shadow-xl transition-all",
                  sizeStyles[size],
                  className
                )}
              >
                {/* Close button */}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}

                {/* Title */}
                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-text-primary mb-2"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {/* Description */}
                {description && (
                  <Dialog.Description className="text-sm text-text-secondary mb-4">
                    {description}
                  </Dialog.Description>
                )}

                {/* Content */}
                <div className="mt-2">{children}</div>

                {/* Actions */}
                {actions && (
                  <div className="mt-6 flex items-center justify-end gap-3">
                    {actions}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

Modal.displayName = "Modal";
