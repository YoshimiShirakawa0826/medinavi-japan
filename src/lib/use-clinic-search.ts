'use client';

import { useEffect, useState } from 'react';
import { fetchNearestPage, fetchSearchPage, searchQuery, type SearchPage } from './clinic-search-client';
import type { SearchRadius } from './search-state';

export function useClinicSearch(query: string, origin: { lat: number; lng: number } | null, radius: SearchRadius) {
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: SearchPage; error?: boolean }>();
  const canonical = searchQuery(query);
  const lat = origin?.lat, lng = origin?.lng;
  const key = `${canonical}|${lat}|${lng}|${radius}`; // device memory only
  useEffect(() => {
    const timer = setInterval(() => setRefresh(value => value + 1), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const search = radius !== 'off' && lat !== undefined && lng !== undefined
      ? fetchNearestPage(canonical, { lat, lng }, radius, controller.signal)
      : fetchSearchPage(canonical, controller.signal);
    search.then(data => { if (!controller.signal.aborted) setResult({ key, data }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ key, error: true }); });
    return () => controller.abort();
  }, [key, canonical, lat, lng, radius, refresh]);
  return { data: result?.key === key ? result.data : undefined,
    loading: result?.key !== key, error: result?.key === key && !!result.error };
}
