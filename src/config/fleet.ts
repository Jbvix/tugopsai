export const FLEET_MMSI: Record<string, string> = {
  '710000348': 'SAAM ITABIRA',
  '710020280': 'SAAM ARIES',
  '710016030': 'SAAM LANCELOT',
  '710021750': 'SAAM CHILE',
  '710001593': 'SAAM HOLANDA',
  '710015310': 'SAAM ARTHUR',
};

export const AIS_BOUNDING_BOX: [[number, number], [number, number]][] = [
  [[-23.1, -43.4], [-22.6, -43.0]],
];

export const FLEET_MAP_CENTER: [number, number] = [-22.8701, -43.2132];
export const FLEET_MAP_ZOOM = 15;

// Polígono real do cais BRASCO — fonte: shapefile oficial (WKT lon/lat convertido)
export const BRASCO_GEOFENCE: [number, number][] = [
  [-22.8702826, -43.2151462],
  [-22.871884,  -43.2132579],
  [-22.8698674, -43.2112838],
  [-22.8683253, -43.213215 ],
];

export function isInsideGeofence(lat: number, lon: number): boolean {
  let inside = false;

  for (let i = 0, j = BRASCO_GEOFENCE.length - 1; i < BRASCO_GEOFENCE.length; j = i++) {
    const [latI, lonI] = BRASCO_GEOFENCE[i];
    const [latJ, lonJ] = BRASCO_GEOFENCE[j];
    const crossesLatitude = (latI > lat) !== (latJ > lat);

    if (!crossesLatitude) {
      continue;
    }

    const lonAtIntersection = ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI;
    if (lon < lonAtIntersection) {
      inside = !inside;
    }
  }

  return inside;
}
