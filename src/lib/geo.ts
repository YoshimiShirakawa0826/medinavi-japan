"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { calculateDistance } from "./utils";
import { hasClinicCoordinates } from './clinic-utils';

// ────────────────────────────────────────────────────────────
// 位置情報ユーティリティ
//  - 位置情報の取得は「任意」。未許可・非対応・失敗のいずれでも
//    アプリは通常どおりリスト閲覧できる（要件5: 位置情報の許可は任意）。
//  - 距離計算は Google Maps API を使わず Haversine（アプリ側計算）で行う
//    （要件2・3: API 呼び出しを増やさない）。
// ────────────────────────────────────────────────────────────

export type Coords = { lat: number; lng: number };

// 新宿区周辺のフォールバック中心（位置情報を許可しない/取得できない場合の任意基準点）。
// これはあくまで参考表示用で、ユーザーの実際の現在地ではない旨を UI 側で明示する。
export const SHINJUKU_CENTER: Coords = { lat: 35.6938, lng: 139.7036 };

export type GeoFailureStatus = "denied" | "unavailable" | "timeout" | "unsupported" | "error";
export type GeoStatus = "idle" | "prompting" | "granted" | GeoFailureStatus;

export function getGeoFailureStatus(error: GeolocationPositionError): GeoFailureStatus {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "denied";
    case error.POSITION_UNAVAILABLE:
      return "unavailable";
    case error.TIMEOUT:
      return "timeout";
    default:
      return "error";
  }
}

export function isGeoFailureStatus(status: GeoStatus): status is GeoFailureStatus {
  return ["denied", "unavailable", "timeout", "unsupported", "error"].includes(status);
}

export interface GeoState {
  coords: Coords | null;
  status: GeoStatus;
  /** 位置情報の取得を要求する（ユーザー操作起点で呼ぶこと） */
  request: (onLocated?: (coords: Coords) => void) => void;
  /** 取得済み位置をクリア（フォールバックに戻す） */
  clear: () => void;
}

/**
 * 位置情報フック。呼び出しても自動では位置を取りにいかない。
 * ユーザーがボタン等を押して request() したときだけ getCurrentPosition を実行する。
 */
export function useGeolocation(): GeoState {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current++; }, []);

  const request = useCallback((onLocated?: (coords: Coords) => void) => {
    const id = ++requestId.current;
    setCoords(null);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== requestId.current) return;
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!hasClinicCoordinates(next.lat, next.lng)) { setStatus('unavailable'); return; }
        setCoords(next);
        setStatus("granted");
        onLocated?.(next);
      },
      (err) => { if (id === requestId.current) setStatus(getGeoFailureStatus(err)); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const clear = useCallback(() => {
    requestId.current++;
    setCoords(null);
    setStatus("idle");
  }, []);

  return { coords, status, request, clear };
}

/** 2 地点間の距離(km) を Haversine で計算 */
export function distanceKm(from: Coords, lat: number, lng: number): number {
  if (!hasClinicCoordinates(lat, lng) || !hasClinicCoordinates(from.lat, from.lng)) return Infinity;
  return calculateDistance(from.lat, from.lng, lat, lng);
}

/** 距離(km) を人が読みやすい表記へ整形。1km 未満は m 表示（例: 850m / 1.2km） */
export function formatDistance(km: number): string {
  if (!isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

/** 距離フィルタの選択肢(km)。null = 「近い順（距離制限なし）」 */
export const DISTANCE_OPTIONS: Array<{ value: number | null; labelKey: string }> = [
  { value: 1, labelKey: "distance.1km" },
  { value: 3, labelKey: "distance.3km" },
  { value: 5, labelKey: "distance.5km" },
  { value: 10, labelKey: "distance.10km" },
  { value: null, labelKey: "distance.nearest" },
];

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
