'use client';

const EMBED_URL =
  'https://www.marinetraffic.com/en/ais/embed/' +
  'zoom:13/' +
  'centery:-22.8877/' +
  'centerx:-43.1968/' +
  'maptype:0/' +
  'shownames:true/' +
  'showmenu:false/' +
  'remember:false';

export function FleetMap() {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <iframe
        src={EMBED_URL}
        title="Frota SAAM — Baía de Guanabara"
        className="w-full h-full border-0"
        loading="lazy"
        allowFullScreen
      />
      <div className="absolute bottom-2 left-2 bg-naval-900/80 backdrop-blur-sm text-[10px] text-slate-400 px-2 py-1 rounded-lg pointer-events-none">
        ⚓ Base Brasco Caju · dados MarineTraffic
      </div>
    </div>
  );
}
