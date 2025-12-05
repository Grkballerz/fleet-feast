"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  MenuItemData,
  DietaryTag,
  ValidationErrors,
} from "@/types/vendor-application";

interface Step3MenuProps {
  data: MenuItemData[];
  errors: ValidationErrors;
  onDataChange: (data: MenuItemData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const dietaryTagOptions = Object.values(DietaryTag);

const emptyMenuItem: MenuItemData = {
  name: "",
  description: "",
  price: 0,
  dietaryTags: [],
};

export const Step3Menu: React.FC<Step3MenuProps> = ({
  data,
  errors,
  onDataChange,
  onNext,
  onBack,
}) => {
  const [menuItems, setMenuItems] = useState<MenuItemData[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<MenuItemData>(emptyMenuItem);

  const handleAdd = () => {
    setEditingItem(null);
    setEditingIndex(null);
    setFormData(emptyMenuItem);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItemData, index: number) => {
    setEditingItem(item);
    setEditingIndex(index);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      const updated = menuItems.filter((_, i) => i !== index);
      setMenuItems(updated);
      onDataChange(updated);
    }
  };

  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      alert("Please enter a menu item name");
      return;
    }
    if (!formData.description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (formData.price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    let updated: MenuItemData[];
    if (editingIndex !== null) {
      // Update existing item
      updated = menuItems.map((item, i) => (i === editingIndex ? formData : item));
    } else {
      // Add new item
      updated = [...menuItems, { ...formData, id: `temp-${Date.now()}` }];
    }

    setMenuItems(updated);
    onDataChange(updated);
    setIsModalOpen(false);
    setFormData(emptyMenuItem);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData(emptyMenuItem);
  };

  const toggleDietaryTag = (tag: DietaryTag) => {
    const updated = formData.dietaryTags.includes(tag)
      ? formData.dietaryTags.filter((t) => t !== tag)
      : [...formData.dietaryTags, tag];
    setFormData({ ...formData, dietaryTags: updated });
  };

  const validateAndNext = () => {
    if (menuItems.length === 0) {
      alert("Please add at least one menu item before continuing");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Menu Setup
              </h2>
              <p className="text-text-secondary">
                Add your menu items and pricing
              </p>
            </div>
            <Button onClick={handleAdd} variant="primary">
              Add Menu Item
            </Button>
          </div>

          {/* Menu Items List */}
          {menuItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-text-secondary mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-text-secondary mb-4">No menu items yet</p>
              <Button onClick={handleAdd} variant="secondary">
                Add Your First Menu Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border-2 border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="font-semibold text-text-primary text-lg">
                          {item.name}
                        </h3>
                        <span className="font-bold text-primary text-lg">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-text-secondary mb-3">
                        {item.description}
                      </p>
                      {item.dietaryTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.dietaryTags.map((tag) => (
                            <Badge key={tag} variant="success">
                              {tag.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item, index)}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-error hover:text-error/80 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.menu && <p className="error-message mt-4">{errors.menu}</p>}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editingIndex !== null ? "Edit Menu Item" : "Add Menu Item"}
      >
        <div className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="label" htmlFor="itemName">
              Item Name <span className="text-error">*</span>
            </label>
            <Input
              id="itemName"
              type="text"
              placeholder="e.g., Classic Beef Taco"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="itemDescription">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              id="itemDescription"
              rows={3}
              placeholder="Describe the dish, ingredients, and flavors..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="textarea w-full"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="label" htmlFor="itemPrice">
              Price <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                $
              </span>
              <Input
                id="itemPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="12.99"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) })
                }
                className="pl-8"
                required
              />
            </div>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="label">Dietary Information</label>
            <p className="text-sm text-text-secondary mb-2">
              Select all that apply
            </p>
            <div className="grid grid-cols-2 gap-2">
              {dietaryTagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDietaryTag(tag)}
                  className={`px-3 py-2 rounded-md border-2 text-sm transition-colors ${
                    formData.dietaryTags.includes(tag)
                      ? "border-success bg-success/10 text-success font-medium"
                      : "border-border bg-white text-text-secondary hover:border-success/50"
                  }`}
                >
                  {tag.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleCancel} variant="ghost" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" className="flex-1">
              {editingIndex !== null ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="ghost" size="lg">
          Back
        </Button>
        <Button onClick={validateAndNext} variant="primary" size="lg">
          Continue to Availability
        </Button>
      </div>
    </div>
  );
};
