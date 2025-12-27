import PipBoyFrame from "@/components/layout/pip-boy-frame";
import MapPageClient from "@/components/map/map-page-client";

export default function MapPage() {
  return (
    <PipBoyFrame activeTab="map">
      <MapPageClient />
    </PipBoyFrame>
  );
}
