'use client';

import { useEffect, useState } from 'react';

export function useCoverage() {
  const [counts, setCounts] = useState<Record<string, number>>();
  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/coverage.json', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Coverage unavailable');
        const data = await response.json();
        if (!data.prefectures || Object.keys(data.prefectures).length !== 47
          || !Object.values(data.prefectures).every(count => Number.isInteger(count) && Number(count) >= 0)) throw new Error('Invalid coverage');
        if (!controller.signal.aborted) setCounts(data.prefectures);
      }).catch(() => { /* Coverage is optional; the facility request reports failures separately. */ });
    return () => controller.abort();
  }, []);
  return counts;
}
