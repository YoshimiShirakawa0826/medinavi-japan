'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Hospital } from '@/types';
import { scheduledOpenStatus } from './clinic-utils';

export function useClinic(id: string) {
  const [result, setResult] = useState<{ id: string; hospital?: Hospital; error?: boolean }>();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/clinics/${encodeURIComponent(id)}`, { signal: controller.signal }).then(async response => {
      if (response.status === 404) return undefined;
      if (!response.ok) throw new Error('Facility unavailable');
      const record = await response.json();
      if (record.id !== id || !record.name?.ja || !record.address?.ja) throw new Error('Invalid facility');
      return record as Hospital;
    }).then(hospital => {
      if (controller.signal.aborted) return;
      setResult({ id, hospital }); setNow(new Date());
    }).catch(() => { if (!controller.signal.aborted) setResult({ id, error: true }); });
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [id]);
  const hospitals = useMemo(() => result?.id === id && result.hospital
    ? [{ ...result.hospital, isOpenNow: now ? scheduledOpenStatus(result.hospital, now) : null }] : [], [result, id, now]);
  return { hospitals, loading: result?.id !== id, error: !!result?.error };
}
