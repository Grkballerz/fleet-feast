"use client";

import React, { useState } from "react";

export interface FAQItem {
  /**
   * FAQ question
   */
  question: string;
  /**
   * FAQ answer (can include HTML/markdown)
   */
  answer: string;
  /**
   * FAQ category
   */
  category: "customers" | "vendors" | "payments" | "general";
}

export interface FAQAccordionProps {
  /**
   * Array of FAQ items
   */
  items: FAQItem[];
  /**
   * Filter by category (optional)
   */
  filterCategory?: "customers" | "vendors" | "payments" | "general" | "all";
}

/**
 * FAQAccordion Component
 *
 * Expandable/collapsible FAQ accordion with category filtering.
 * Only one item can be open at a time.
 *
 * @example
 * ```tsx
 * <FAQAccordion
 *   items={faqItems}
 *   filterCategory="customers"
 * />
 * ```
 */
export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  items,
  filterCategory = "all",
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter items by category
  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((item) => item.category === filterCategory);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {filteredItems.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
        >
          {/* Question Button */}
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-gray-900 pr-4">
              {item.question}
            </span>
            <svg
              className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Answer Panel */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
              {item.answer}
            </div>
          </div>
        </div>
      ))}

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No FAQs found for this category.
        </div>
      )}
    </div>
  );
};
