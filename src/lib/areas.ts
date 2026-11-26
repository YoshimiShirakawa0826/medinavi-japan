// 位置情報が使えない/拒否された場合のフォールバック基準点（東京主要エリア・駅）。
// 座標は各駅周辺の既知の代表点。実際の現在地ではなく「目安」として使う。
export const AREA_PRESETS: Array<{ name: string; lat: number; lng: number }> = [
  { name: "Shinjuku",   lat: 35.6896, lng: 139.7006 },
  { name: "Tokyo Sta.", lat: 35.6812, lng: 139.7671 },
  { name: "Shibuya",    lat: 35.6580, lng: 139.7016 },
  { name: "Ikebukuro",  lat: 35.7295, lng: 139.7109 },
  { name: "Ueno",       lat: 35.7141, lng: 139.7774 },
  { name: "Shinagawa",  lat: 35.6285, lng: 139.7387 },
  { name: "Asakusa",    lat: 35.7148, lng: 139.7967 },
  { name: "Ginza",      lat: 35.6717, lng: 139.7650 },
  { name: "Akihabara",  lat: 35.6984, lng: 139.7731 },
  { name: "Roppongi",   lat: 35.6628, lng: 139.7315 },
];

/** Great-circle distance in km (Haversine). Shared with server code, so no client imports here. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (deg: number) => deg * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
