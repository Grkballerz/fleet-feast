import { Metadata } from "next";
import { ApplicationForm } from "./components/ApplicationForm";

export const metadata: Metadata = {
  title: "Vendor Application | Fleet Feast",
  description: "Apply to become a food truck vendor on Fleet Feast",
};

export default function VendorApplicationPage() {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="neo-heading text-3xl mb-2">
          Become a Fleet Feast Vendor
        </h1>
        <p className="text-lg text-text-secondary">
          Complete the application below to start catering events through our platform.
          Your progress is saved automatically.
        </p>
      </div>

      <ApplicationForm />
    </div>
  );
}
