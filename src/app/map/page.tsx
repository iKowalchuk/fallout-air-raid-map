import PipBoyFrame from "@/components/layout/PipBoyFrame";
import MapPageClient from "@/components/map/MapPageClient";

export default function MapPage() {
  return (
    <PipBoyFrame activeTab="map">
      <MapPageClient />
    </PipBoyFrame>
  );
}
