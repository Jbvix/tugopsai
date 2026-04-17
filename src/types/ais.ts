export interface AISPosition {
  mmsi: string;
  nome: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
  heading: number;
  navStatus: string;
  updatedAt: string;
}

export const NAV_STATUS: Record<number, string> = {
  0: 'Em movimento',
  1: 'Fundeado',
  2: 'Sem governo',
  3: 'Manobra restrita',
  4: 'Restrito por calado',
  5: 'Atracado',
  6: 'Encalhado',
  7: 'Pesca',
  8: 'A vela',
  9: 'Reservado HSC',
  10: 'Reservado WIG',
  11: 'Reservado',
  12: 'Reservado',
  13: 'Reservado',
  14: 'AIS-SART',
  15: 'Indefinido',
};
