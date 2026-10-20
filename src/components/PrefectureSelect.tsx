'use client';

import { PREFECTURES } from '../../data/prefectures.mjs';
import { useLanguage } from './LanguageProvider';

export function PrefectureSelect({ value, onChange, counts }: {
  value: string;
  onChange: (code: string) => void;
  counts?: Record<string, number>;
}) {
  const { language, t } = useLanguage();
  return <label className="block space-y-2 text-sm font-bold text-slate-700">
    <span>{t('nation.prefecture')}</span>
    <select value={value} onChange={event => onChange(event.target.value)} className="block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base font-normal text-slate-900">
      <option value="">{t('nation.all')}</option>
      {Array.from({ length: 7 }, (_, region) => <optgroup key={region} label={t(`nation.region.${region}`)}>
        {PREFECTURES.filter(prefecture => prefecture.region === region).map(prefecture => <option key={prefecture.code} value={prefecture.code}>
          {prefecture.name[language]}{counts ? ` · ${counts[prefecture.code] ? counts[prefecture.code].toLocaleString() : t('nation.notImported')}` : ''}
        </option>)}
      </optgroup>)}
    </select>
  </label>;
}
