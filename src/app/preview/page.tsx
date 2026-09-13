'use client';

import { useRef, useState } from 'react';
import { Monitor, Smartphone, ExternalLink, RotateCcw } from 'lucide-react';

export default function PreviewWorkbench() {
  const [mobile, setMobile] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  return <div className="preview-workbench">
    <div className="preview-toolbar"><div><strong>MediNavi JAPAN</strong><span>デザイン確認用 · 本番未反映</span></div><div className="preview-controls">
      <button aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor size={17} />パソコン</button>
      <button aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone size={17} />スマホ</button>
      <button onClick={() => { if (frame.current) frame.current.src = '/'; }} aria-label="トップに戻す"><RotateCcw size={17} /></button>
      <a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17} />別画面で開く</a>
    </div></div>
    <p className="preview-instructions">トップ → 検索結果 → 施設詳細を操作できます。電話・地図・公式サイトのリンク先は実際の施設です。</p>
    <div className={`preview-canvas ${mobile ? 'preview-mobile' : ''}`}><iframe ref={frame} title="MediNavi JAPAN 操作プレビュー" src="/" allow="geolocation 'self'; clipboard-write 'self'" /></div>
  </div>;
}
