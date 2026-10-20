'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { parseSearchLocation, searchLocationSnapshot } from './search-state';

function subscribe(listener: () => void) {
  window.addEventListener('medinavi-location', listener);
  return () => window.removeEventListener('medinavi-location', listener);
}
export function useSearchLocation() {
  const raw = useSyncExternalStore(subscribe, searchLocationSnapshot, () => null);
  return useMemo(() => parseSearchLocation(raw), [raw]);
}
