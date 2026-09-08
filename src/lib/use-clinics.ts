'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Hospital } from '@/types';
import { loadClinics, scheduledOpenStatus } from './clinic-utils';

export function useClinics() {
  const [records, setRecords] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadClinics(controller.signal).then(data => {
      if (controller.signal.aborted) return;
      setRecords(data);
      setNow(new Date());
      setLoading(false);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setError(true);
      setLoading(false);
    });
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  const hospitals = useMemo(() => records.map(h => ({
    ...h, isOpenNow: now ? scheduledOpenStatus(h, now) : null,
  })), [records, now]);
  return { hospitals, loading, error };
}
