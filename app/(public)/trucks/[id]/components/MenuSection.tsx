"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Leaf, Wheat, Flame } from "lucide-react";

export interface MenuItem {
  name: string;
  description?: string;
  price: number;
  dietaryTags?: string[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuSectionProps {
  menu: {
    items: MenuItem[];
    pricingModel: "per_person" | "flat_rate" | "custom";
  } | null;
  className?: string;
}

/**
 * Dietary tag icon mapping
 */
const dietaryIcons: Record<string, React.ReactNode> = {
  vegan: <Leaf className="h-3 w-3" />,
  vegetarian: <Leaf className="h-3 w-3" />,
  "gluten-free": <Wheat className="h-3 w-3" />,
  "gluten free": <Wheat className="h-3 w-3" />,
  spicy: <Flame className="h-3 w-3" />,
  halal: null,
  kosher: null,
};

/**
 * Dietary tag display names
 */
const dietaryTagDisplay: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "gluten-free": "GF",
  "gluten free": "GF",
  spicy: "Spicy",
  halal: "Halal",
  kosher: "Kosher",
};

/**
 * Group menu items by category (if not already categorized)
 * For now, we'll display all items in a single list
 * Future enhancement: Support category-based menu structure
 */
const categorizeItems = (items: MenuItem[]): MenuCategory[] => {
  // Simple categorization: just return all items under "Menu"
  return [
    {
      name: "Menu",
      items,
    },
  ];
};

/**
 * MenuItem Component
 * Displays a single menu item with name, description, price, and dietary tags
 */
interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b last:border-0">
      <div className="flex-1 space-y-1">
        {/* Item Name */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-base">{item.name}</h4>

          {/* Dietary Tags */}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex items-center gap-1">
              {item.dietaryTags.map((tag, idx) => {
                const normalizedTag = tag.toLowerCase();
                const icon = dietaryIcons[normalizedTag];
                const displayName = dietaryTagDisplay[normalizedTag] || tag;

                return (
                  <Badge
                    key={idx}
                    variant="success"
                    size="sm"
                    className="flex items-center gap-1 neo-border-thin rounded-neo"
                  >
                    {icon}
                    <span>{displayName}</span>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Item Description */}
        {item.description && (
          <p className="text-sm text-text-secondary font-medium">{item.description}</p>
        )}
      </div>

      {/* Price */}
      <div className="font-black text-base whitespace-nowrap text-primary">
        ${item.price.toFixed(2)}
      </div>
    </div>
  );
};

/**
 * MenuSection Component
 *
 * Displays the food truck's menu with items, prices, and dietary indicators.
 * Supports categorization (future enhancement) and pricing model display.
 *
 * @example
 * ```tsx
 * <MenuSection menu={truckMenu} />
 * ```
 */
export const MenuSection: React.FC<MenuSectionProps> = ({ menu, className }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // No menu available
  if (!menu || !menu.items || menu.items.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-2xl font-bold">Menu</h2>
        <p className="text-text-secondary">
          Menu information is not available at this time.
        </p>
      </div>
    );
  }

  const categories = categorizeItems(menu.items);
  const displayCategory = selectedCategory
    ? categories.find((cat) => cat.name === selectedCategory)
    : categories[0];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="neo-heading text-2xl">Menu</h2>

        {/* Pricing Model Badge */}
        {menu.pricingModel && (
          <Badge variant="neutral" size="md" className="neo-border rounded-neo">
            {menu.pricingModel === "per_person" && "Per Person Pricing"}
            {menu.pricingModel === "flat_rate" && "Flat Rate"}
            {menu.pricingModel === "custom" && "Custom Pricing"}
          </Badge>
        )}
      </div>

      {/* Category Tabs (if multiple categories in future) */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={cn(
                "px-4 py-2 rounded-neo neo-border font-bold transition-all",
                selectedCategory === category.name || (!selectedCategory && category === categories[0])
                  ? "neo-btn-primary"
                  : "bg-white text-text-primary hover:neo-shadow"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      {displayCategory && (
        <div className="neo-card-glass rounded-neo neo-shadow p-4 md:p-6">
          <div className="divide-y divide-gray-200">
            {displayCategory.items.map((item, idx) => (
              <MenuItemCard key={idx} item={item} />
            ))}
          </div>

          {/* Item Count */}
          <p className="text-sm text-text-secondary font-medium mt-4 pt-4 border-t border-gray-200">
            {displayCategory.items.length} {displayCategory.items.length === 1 ? "item" : "items"}
          </p>
        </div>
      )}

      {/* Dietary Legend */}
      <div className="flex flex-wrap gap-3 text-sm text-text-secondary font-medium">
        <span className="flex items-center gap-1">
          <Leaf className="h-4 w-4 text-success" />
          Vegetarian/Vegan
        </span>
        <span className="flex items-center gap-1">
          <Wheat className="h-4 w-4 text-warning" />
          Gluten-Free
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-error" />
          Spicy
        </span>
      </div>
    </div>
  );
};
