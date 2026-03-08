"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function PrivacyPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="min-h-screen">
      <Modal
        isOpen={isVisible}
        onClose={handleClose}
        title="Privacy Policy"
      >
        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p><strong>Last Updated:</strong> March 2026</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, including: name, email address, and any messages you send through our contact form. We also collect usage data and analytics to improve our services.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">2. How We Use Your Information</h3>
          <p>We use the information we collect to: provide, maintain, and improve our services; respond to your comments and questions; send you technical notices, updates, and support messages.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">3. Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">4. Your Rights</h3>
          <p>You have the right to access, update, or delete your personal information at any time. You can also opt out of certain communications from us.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">5. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at ujjwalnepal32@gmail.com</p>
        </div>
      </Modal>
    </div>
  );
}
