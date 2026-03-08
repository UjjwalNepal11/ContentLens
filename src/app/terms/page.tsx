"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function TermsPage() {
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
        title="Terms of Service"
      >
        <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p><strong>Last Updated:</strong> March 2026</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">1. Acceptance of Terms</h3>
          <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">2. Use License</h3>
          <p>Permission is granted to temporarily use this application for personal, non-commercial use only. This is the grant of a license, not a transfer of title.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">3. Disclaimer</h3>
          <p>This application is provided "as is". The application makes no warranties, expressed or implied, and hereby disclaims all other warranties.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">4. Limitations</h3>
          <p>In no event shall the application or its suppliers be liable for any damages arising out of the use or inability to use the materials on this application.</p>

          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">5. Contact Information</h3>
          <p>For questions about these Terms of Service, please contact us at ujjwalnepal32@gmail.com</p>
        </div>
      </Modal>
    </div>
  );
}
