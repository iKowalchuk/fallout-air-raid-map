import { AppInitializer } from "@/app/_components/app-initializer";
import InfoPageClient from "@/components/info/info-page-client";
import PipBoyFrame from "@/components/layout/pip-boy-frame";

export default function InfoPage() {
  return (
    <PipBoyFrame activeTab="info">
      <AppInitializer requiredData="messages">
        <InfoPageClient />
      </AppInitializer>
    </PipBoyFrame>
  );
}
