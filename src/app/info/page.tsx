import InfoPageClient from "@/components/info/info-page-client";
import PipBoyFrame from "@/components/layout/pip-boy-frame";

export default function InfoPage() {
  return (
    <PipBoyFrame activeTab="info">
      <InfoPageClient />
    </PipBoyFrame>
  );
}
