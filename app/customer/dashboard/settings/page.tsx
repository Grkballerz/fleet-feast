"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface EmailPreferences {
  bookingUpdates: boolean;
  marketingEmails: boolean;
  newMessages: boolean;
  reviewReminders: boolean;
  weeklyDigest: boolean;
}

/**
 * Account Settings Page
 *
 * Manage profile information, email preferences, password, and account deletion
 */
export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = React.useState<UserProfile>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(512) 555-0123",
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
  });

  // Email preferences state
  const [emailPreferences, setEmailPreferences] = React.useState<EmailPreferences>({
    bookingUpdates: true,
    marketingEmails: false,
    newMessages: true,
    reviewReminders: true,
    weeklyDigest: false,
  });

  // Password change state
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailPrefChange = (field: keyof EmailPreferences, value: boolean) => {
    setEmailPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // TODO: API call to update profile
      // await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(profile),
      // })

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmailPreferences = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // TODO: API call to update email preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Email preferences updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // TODO: API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type DELETE to confirm.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // TODO: API call to delete account
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect to logout or homepage
      window.location.href = "/";
    } catch (err) {
      setError("Failed to delete account. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Account Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your profile, preferences, and security settings
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" title="Success">
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Profile Information */}
      <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Profile Information
          </h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              placeholder="john@example.com"
              disabled
              helperText="Contact support to change your email"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileChange("phone", e.target.value)}
              placeholder="(512) 555-0123"
            />
            <Input
              label="Street Address"
              value={profile.address}
              onChange={(e) => handleProfileChange("address", e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={profile.city}
              onChange={(e) => handleProfileChange("city", e.target.value)}
              placeholder="Austin"
            />
            <Input
              label="State"
              value={profile.state}
              onChange={(e) => handleProfileChange("state", e.target.value)}
              placeholder="TX"
              maxLength={2}
            />
            <Input
              label="ZIP Code"
              value={profile.zipCode}
              onChange={(e) => handleProfileChange("zipCode", e.target.value)}
              placeholder="78701"
              maxLength={5}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Email Preferences */}
      <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Email Preferences
          </h2>
        </div>

        <div className="space-y-4">
          {/* Booking Updates */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
            <div className="flex-1">
              <p className="font-medium text-text-primary">Booking Updates</p>
              <p className="text-sm text-text-secondary">
                Receive notifications about booking confirmations and changes
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPreferences.bookingUpdates}
              onChange={(e) =>
                handleEmailPrefChange("bookingUpdates", e.target.checked)
              }
              className="w-5 h-5 text-primary focus:ring-primary"
            />
          </label>

          {/* New Messages */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
            <div className="flex-1">
              <p className="font-medium text-text-primary">New Messages</p>
              <p className="text-sm text-text-secondary">
                Get notified when you receive messages from vendors
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPreferences.newMessages}
              onChange={(e) =>
                handleEmailPrefChange("newMessages", e.target.checked)
              }
              className="w-5 h-5 text-primary focus:ring-primary"
            />
          </label>

          {/* Review Reminders */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
            <div className="flex-1">
              <p className="font-medium text-text-primary">Review Reminders</p>
              <p className="text-sm text-text-secondary">
                Remind me to review vendors after completed events
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPreferences.reviewReminders}
              onChange={(e) =>
                handleEmailPrefChange("reviewReminders", e.target.checked)
              }
              className="w-5 h-5 text-primary focus:ring-primary"
            />
          </label>

          {/* Weekly Digest */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
            <div className="flex-1">
              <p className="font-medium text-text-primary">Weekly Digest</p>
              <p className="text-sm text-text-secondary">
                Get a weekly summary of your bookings and account activity
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPreferences.weeklyDigest}
              onChange={(e) =>
                handleEmailPrefChange("weeklyDigest", e.target.checked)
              }
              className="w-5 h-5 text-primary focus:ring-primary"
            />
          </label>

          {/* Marketing Emails */}
          <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-hover">
            <div className="flex-1">
              <p className="font-medium text-text-primary">Marketing Emails</p>
              <p className="text-sm text-text-secondary">
                Receive promotional offers and new vendor announcements
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailPreferences.marketingEmails}
              onChange={(e) =>
                handleEmailPrefChange("marketingEmails", e.target.checked)
              }
              className="w-5 h-5 text-primary focus:ring-primary"
            />
          </label>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSaveEmailPreferences} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="neo-card-glass p-6 neo-shadow rounded-neo">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Change Password
          </h2>
        </div>

        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="Enter new password (min 8 characters)"
            helperText="Must be at least 8 characters long"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Re-enter new password"
          />

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={handleChangePassword}
              disabled={
                isSaving ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword
              }
            >
              {isSaving ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Account */}
      <Card className="neo-card-glass p-6 neo-border-primary neo-shadow rounded-neo">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-error" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">
            Delete Account
          </h2>
        </div>

        <Alert variant="warning" title="Warning">
          This action cannot be undone. All your data, bookings, and messages will
          be permanently deleted.
        </Alert>

        <div className="flex justify-end mt-4">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText("");
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <Alert variant="error" title="This action is permanent">
            Your account and all associated data will be permanently deleted. This
            includes:
          </Alert>

          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>All bookings and payment history</li>
            <li>Messages and conversations</li>
            <li>Reviews and ratings</li>
            <li>Favorites and preferences</li>
          </ul>

          <div className="pt-4">
            <Input
              label='Type "DELETE" to confirm'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isSaving || deleteConfirmText !== "DELETE"}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
