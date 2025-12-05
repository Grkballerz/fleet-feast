"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import {
  Save,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Users,
  Info,
  ExternalLink,
} from "lucide-react";

interface VendorProfile {
  id: string;
  businessName: string;
  description: string;
  cuisineType: string[];
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
  logoUrl?: string;
  truckPhotoUrls: string[];
  status: string;
}

const CUISINE_OPTIONS = [
  "AMERICAN",
  "MEXICAN",
  "ITALIAN",
  "ASIAN",
  "BBQ",
  "DESSERT",
  "VEGETARIAN",
  "OTHER",
];

export default function VendorProfilePage() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    cuisineType: [] as string[],
    pricePerPerson: 0,
    minimumGuests: 0,
    maximumGuests: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/vendor/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      const profileData = data.data;

      setProfile(profileData);
      setFormData({
        businessName: profileData.businessName || "",
        description: profileData.description || "",
        cuisineType: profileData.cuisineType || [],
        pricePerPerson: profileData.pricePerPerson || 0,
        minimumGuests: profileData.minimumGuests || 0,
        maximumGuests: profileData.maximumGuests || 0,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Validation
      if (!formData.businessName.trim()) {
        throw new Error("Business name is required");
      }
      if (formData.cuisineType.length === 0) {
        throw new Error("Please select at least one cuisine type");
      }
      if (formData.pricePerPerson <= 0) {
        throw new Error("Price per person must be greater than 0");
      }
      if (formData.minimumGuests <= 0) {
        throw new Error("Minimum guests must be greater than 0");
      }
      if (formData.maximumGuests < formData.minimumGuests) {
        throw new Error("Maximum guests must be greater than or equal to minimum");
      }

      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      await fetchProfile();
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter((c) => c !== cuisine)
        : [...prev.cuisineType, cuisine],
    }));
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "success" | "warning" | "error", label: string }> = {
      APPROVED: { variant: "success", label: "Approved" },
      PENDING: { variant: "warning", label: "Pending Review" },
      REJECTED: { variant: "error", label: "Rejected" },
    };
    const { variant, label } = config[status] || { variant: "warning", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Alert variant="error" title="Error">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Profile Settings</h2>
          <p className="text-text-secondary mt-1">
            Manage your food truck profile and settings
          </p>
        </div>
        {profile && getStatusBadge(profile.status)}
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Basic Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={formData.businessName}
            onChange={(e) =>
              setFormData({ ...formData, businessName: e.target.value })
            }
            placeholder="e.g., Taco Fiesta Truck"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell customers about your food truck, specialties, and what makes you unique..."
            rows={4}
            maxLength={500}
            showCharCount
          />
        </div>
      </Card>

      {/* Cuisine Types */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Cuisine Types
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          Select all cuisine types that apply to your menu
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CUISINE_OPTIONS.map((cuisine) => (
            <button
              key={cuisine}
              type="button"
              onClick={() => toggleCuisine(cuisine)}
              className={`
                px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                ${
                  formData.cuisineType.includes(cuisine)
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-text-primary hover:border-primary/50"
                }
              `}
            >
              {cuisine.charAt(0) + cuisine.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* Pricing & Capacity */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Pricing & Capacity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Price Per Person"
              type="number"
              value={formData.pricePerPerson}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pricePerPerson: parseInt(e.target.value) || 0,
                })
              }
              icon={<DollarSign className="w-4 h-4" />}
              min={0}
              required
            />
            <p className="text-xs text-text-secondary mt-1">In cents (e.g., 1500 = $15.00)</p>
          </div>

          <Input
            label="Minimum Guests"
            type="number"
            value={formData.minimumGuests}
            onChange={(e) =>
              setFormData({
                ...formData,
                minimumGuests: parseInt(e.target.value) || 0,
              })
            }
            icon={<Users className="w-4 h-4" />}
            min={1}
            required
          />

          <Input
            label="Maximum Guests"
            type="number"
            value={formData.maximumGuests}
            onChange={(e) =>
              setFormData({
                ...formData,
                maximumGuests: parseInt(e.target.value) || 0,
              })
            }
            icon={<Users className="w-4 h-4" />}
            min={formData.minimumGuests}
            required
          />
        </div>
      </Card>

      {/* Photos */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Photos
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Logo
            </label>
            <div className="flex items-center gap-4">
              {profile?.logoUrl ? (
                <div className="w-24 h-24 bg-background rounded-lg flex items-center justify-center border border-border">
                  <img
                    src={profile.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-background rounded-lg flex items-center justify-center border border-border">
                  <ImageIcon className="w-8 h-8 text-text-tertiary" />
                </div>
              )}
              <Button variant="secondary" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Truck Photos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {profile?.truckPhotoUrls.map((url, index) => (
                <div
                  key={index}
                  className="aspect-square bg-background rounded-lg border border-border overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Truck ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              <button
                type="button"
                className="aspect-square bg-background rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-text-tertiary" />
                  <span className="text-xs text-text-secondary">Upload</span>
                </div>
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Upload high-quality photos of your food truck and menu items
            </p>
          </div>
        </div>
      </Card>

      {/* Menu Management */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Menu</h3>
            <p className="text-sm text-text-secondary">
              Manage your menu items and pricing
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Edit Menu
          </Button>
        </div>
        <Alert variant="info">
          Click "Edit Menu" to manage your menu items, dietary tags, and pricing
        </Alert>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          <Info className="w-4 h-4 inline mr-1" />
          Changes will be visible to customers immediately
        </p>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
