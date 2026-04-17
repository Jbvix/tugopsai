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

export const FLEET_MAP_CENTER: [number, number] = [-22.88, -43.18];
export const FLEET_MAP_ZOOM = 12;

export const BRASCO_GEOFENCE: [number, number][] = [
  [-22.878, -43.219],
  [-22.873, -43.211],
  [-22.882, -43.206],
  [-22.887, -43.214],
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
