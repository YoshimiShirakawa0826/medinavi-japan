import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCosmeticFocused } from '../src/lib/clinic-utils.ts';

const clinic = (ja, en = '') => ({ name: { ja, en, zh: en, ko: en, es: en } });

test('cosmetic-only clinics are detected from Japanese or English names', () => {
  for (const name of ['湘南美容クリニック新宿本院', '湘南美容皮フ科新宿東口院', '品川美容外科渋谷院',
    'ＡＰＯＬＬＯ　ＢＥＡＵＴＹ　ＣＬＩＮＩＣ', 'ナチュラルＡＧＡクリニック', '東京植毛美容外科', '大塚美容・形成外科銀座院']) {
    assert.equal(isCosmeticFocused(clinic(name)), true, name);
  }
});

test('general clinics that also offer cosmetic care stay visible', () => {
  for (const name of ['アーサー皮膚科　美容皮膚科　高田馬場', 'コアラ皮膚科・美容皮膚科クリニック三軒茶屋',
    '豊洲内科・糖尿病／形成・美容外科クリニック', '新宿なないろクリニック', '品川メディカルクリニック', '世田谷総合クリニック']) {
    assert.equal(isCosmeticFocused(clinic(name)), false, name);
  }
});

test('romanised place names containing "aga" are not mistaken for AGA clinics', () => {
  assert.equal(isCosmeticFocused(clinic('杉田眼科', 'Setagaya Eye Clinic')), false);
  assert.equal(isCosmeticFocused(clinic('品川内科', 'Shinagawa Clinic')), false);
});
