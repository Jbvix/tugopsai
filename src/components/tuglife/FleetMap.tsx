'use client';

const MT_BASE =
  'https://www.marinetraffic.com/en/ais/embed/' +
  'zoom:15/centery:-22.8703/centerx:-43.2132/' +
  'maptype:4/shownames:false/mmsi:0/show_menu:true/remember:false/get_info:true';

function mtVesselUrl(mmsi: string) {
  return (
    `https://www.marinetraffic.com/en/ais/embed/` +
    `zoom:17/mmsi:${mmsi}/` +
    `maptype:4/shownames:true/show_menu:true/remember:false/get_info:true`
  );
}

interface FleetMapProps {
  focusMmsi?: string | null;
}

export function FleetMap({ focusMmsi }: FleetMapProps) {
  const src   = focusMmsi ? mtVesselUrl(focusMmsi) : MT_BASE;
  const label = focusMmsi ? `MMSI ${focusMmsi}` : 'Base Brasco Caju';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <iframe
        key={src}
        src={src}
        title={`AIS — ${label}`}
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />
      <div className="absolute bottom-2 left-2 bg-naval-900/80 backdrop-blur-sm text-[10px] text-slate-400 px-2 py-1 rounded-lg pointer-events-none">
        ⚓ {label} · MarineTraffic
      </div>
    </div>
  );
}
