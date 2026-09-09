"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore, ReactNode } from 'react';
import { Language } from '@/types';
import { uiMessages } from './ui-messages';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ja: {
    'app.name': 'MediNavi JAPAN',
    'search.title': '医療機関を探す',
    'search.department': '診療科から探す',
    'search.language': '対応言語から探す',
    
    // Filters
    'filter.openNow': '現在開院中',
    'filter.holiday': '休日診療あり',
    'filter.walkIn': '予約不要（Walk-in）',
    'filter.englishToday': '本日の英語対応',
    'filter.creditCard': 'クレカ・キャッシュレス決済',
    'filter.insurance': '海外旅行保険・書類対応',
    'filter.nightWeekend': '夜間・休日診療',
    'filter.verified': '確認済みデータのみ',

    // Trust & Shinjuku Pilot
    'trust.pilotArea': '実証実験エリア: 東京都新宿区',
    'trust.banner': 'オープンデータだけではありません。MediNavi JAPANは直接の電話、AIインタビュー、地域医療連携により、真の受診可否を確認しています。',
    'trust.stats': '確認済みクリニック: 新宿区内 32 / 100 件',
    'trust.badge': '検証済みデータ',
    'trust.lastConfirmed': '最終確認日',
    'trust.method': '確認方法',

    // Emergency UI
    'emergency.title': '緊急ですか？ 119番へ発信',
    'emergency.desc': '命に関わる症状や、救急車が必要な重症の場合は、ただちに119番にダイヤルしてください。通訳対応可能です。',
    'emergency.consultation': '救急相談は #7119 へ',
    'emergency.consultationDesc': '救急車を呼ぶべきか判断に迷う場合は、#7119の救急相談窓口で専門医や看護師のアドバイスを受けられます。',
    'emergency.location': '現在地を表示する',
    'emergency.phrases': '救急時の日本語フレーズ',
    'emergency.sayThis': '落ち着いて、電話口で以下を伝えてください：',
    
    'btn.search': 'この条件で探す',
    'footer.disclaimer': '※当アプリは診断を行うものではありません。受診先の目安としてご利用ください。実際の受診前には直接お電話等でご確認ください。',
    'nav.home': 'ホーム',
    'nav.hospitals': '医療機関一覧',
    'nav.emergency': '緊急時ガイド',
    'nav.symptoms': '症状から探す',
    'nav.online': 'オンライン診療',
    'common.paid': '有料',
    'online.desc': '看護師がチャットで症状相談・病院案内・遠隔診療予約をサポート（外部サービス）',

    // 距離検索
    'distance.title': '距離で絞り込む',
    'distance.useLocation': '現在地を使う',
    'distance.1km': '1km以内',
    'distance.3km': '3km以内',
    'distance.5km': '5km以内',
    'distance.10km': '10km以内',
    'distance.nearest': '近い順',
    'distance.fromMe': '現在地から',
    'distance.approx': '新宿中心からの目安',
    'distance.denied': '位置情報が許可されていないため、新宿中心からの目安距離を表示しています。',
    'distance.unsupported': 'お使いの環境では位置情報を利用できません。新宿中心からの目安を表示します。',
    'distance.consent': '近くの病院を探すために位置情報を使います。位置情報は端末内でのみ使用し、サーバーには送信しません。',
    'distance.chooseArea': '位置情報が使えない場合は、エリア・駅を選んでください',
    'list.showing': '表示中',


    // 自費診療
    'filter.selfPay': '自費診療対応',
    'selfpay.title': '自費診療・保険 / Insurance & Self-pay',
    'selfpay.subtitle': '健康保険証をお持ちでない訪日の方向けの情報です。',
    'selfpay.selfPayOk': '自費診療対応',
    'selfpay.noInsuranceOk': '保険証なしで受診可',
    'selfpay.creditCard': 'クレジットカード',
    'selfpay.overseasInsurance': '海外旅行保険',
    'selfpay.certJa': '診断書（日本語）',
    'selfpay.certEn': '診断書（英文）',
    'selfpay.estCost': '概算費用',
    'selfpay.needConfirm': '要事前確認',
    'selfpay.caution': '費用は医療機関により異なるため、必ず事前にご確認ください。',

    // 安全表示
    'safety.infoMayChange': '医療機関の情報は変更される場合があります。受診前に必ずお電話等でご確認ください。',
    'safety.notDiagnosis': '本アプリは診断を行うものではなく、医療機関をご案内するものです。',

    // 症状ガイド
    'symptom.title': '症状から診療科を探す',
    'symptom.lead': '当てはまる症状を選ぶと、目安となる診療科をご案内します。',
    'symptom.disclaimer': '※これは診断ではなく、受診する科の「目安」です。判断に迷う場合は #7119、緊急時は 119 へ。',
    'symptom.emergency': '意識がない・大量出血・強い胸の痛みなどは、ためらわず 119 へ。',
    'symptom.findClinics': 'この科のクリニックを探す',

    // ボタン
    'btn.callNow': '電話する',
    'btn.openMap': '地図で開く',
    'btn.needCareNow': '今すぐ受診したい',
    'btn.findNearby': '近くの病院を探す',
    'btn.locating': '現在地を取得中…',
    'location.errorTitle': '現在地を取得できませんでした',
    'location.denied': 'ブラウザのサイト設定で位置情報を許可してから、もう一度お試しください。',
    'location.unavailable': '端末が現在地を特定できませんでした。電波状況のよい場所で、もう一度お試しください。',
    'location.timeout': '位置情報の取得に時間がかかっています。屋外や窓際に移動して、もう一度お試しください。',
    'location.unsupported': 'このブラウザでは位置情報を利用できません。エリア・駅から検索してください。',
    'location.error': '位置情報を保存できませんでした。ブラウザのプライベートモードやストレージ設定をご確認ください。',
    'location.retry': '現在地を再取得',
    'location.chooseArea': 'エリア・駅から選ぶ',
    'symptom.suggestedDept': '目安の診療科',
    'filter.clearAll': 'すべて解除',

    // 地図
    'map.show': '地図を表示',
    'map.hide': '地図を閉じる',
    'map.hint': '施設の 📍 ボタンを押すと、ここに地図で表示します。',
    'map.free': 'キー不要・無料',

    // トップページ
    'home.badgeData': '東京 · 4,430施設 · 厚生労働省オープンデータ',
    'home.badgeVerified': '確認済みクリニック収録',
    'home.subtitle': '外国人旅行者のための東京医療機関検索',
    'home.orRefine': 'または条件を絞り込む',
    'home.closeFilters': '条件を閉じる',
    'home.moreFilters': 'その他の条件 (4)',
    'home.emergencyQ': '緊急ですか？',
    'home.consultBadge': '救急相談',

    // データ出典
    'data.mhlwOpenData': '厚生労働省 オープンデータ',

    // 緊急ページ 追加分
    'emergency.jaAddressLabel': '日本語住所',
    'emergency.readAddress': '※オペレーターに現在地を聞かれたら、上の住所をそのまま読み上げてください。',
    'emergency.tryCall': '#7119 に発信を試す',
    'emergency.copyNumber': '番号をコピー',
    'emergency.copied': 'コピーしました',
    'emergency.dialManual': 'リンクで発信できない場合は、電話のキーパッドで #7119 を手動でダイヤルしてください。',
    'emergency.regionNote': '#7119 は東京都など日本の一部地域のみのサービスです。',
  },
  en: {
    'app.name': 'MediNavi JAPAN',
    'search.title': 'Find Medical Institutions',
    'search.department': 'Search by Department',
    'search.language': 'Search by Language',
    
    // Filters
    'filter.openNow': 'Open Now',
    'filter.holiday': 'Holiday Service',
    'filter.walkIn': 'Walk-in Allowed',
    'filter.englishToday': 'Real-time English Support',
    'filter.creditCard': 'Credit Card / Cashless',
    'filter.insurance': 'Overseas Insurance Accepted',
    'filter.nightWeekend': 'Night / Weekend Open',
    'filter.verified': 'Verified Data Only',

    // Trust & Shinjuku Pilot
    'trust.pilotArea': 'Pilot Area: Shinjuku-ku, Tokyo',
    'trust.banner': 'Not just open data. MediNavi JAPAN verifies real clinic access through direct calls, AI interviews, and local medical partnerships.',
    'trust.stats': 'Verified Clinics: 32 / 100 in Shinjuku',
    'trust.badge': 'Verified Data',
    'trust.lastConfirmed': 'Last Confirmed',
    'trust.method': 'Confirmed By',

    // Emergency UI
    'emergency.title': 'Emergency? Call 119',
    'emergency.desc': 'If you have life-threatening symptoms and need an ambulance immediately, dial 119. Multilingual support may be available through interpretation.',
    'emergency.consultation': 'Call #7119 for Emergency Consultation',
    'emergency.consultationDesc': 'If you are not sure whether to call an ambulance, dial #7119 for professional medical advice.',
    'emergency.location': 'Show My Current Location',
    'emergency.phrases': 'What to say in an emergency',
    'emergency.sayThis': 'Stay calm. Tell the operator:',
    
    'btn.search': 'Search',
    'footer.disclaimer': '* This app does not provide medical diagnosis. Use for reference only. Always confirm directly before visiting.',
    'nav.home': 'Home',
    'nav.hospitals': 'Hospitals',
    'nav.emergency': 'Emergency Guide',
    'nav.symptoms': 'By Symptom',
    'nav.online': 'Online Consultation',
    'common.paid': 'Paid',
    'online.desc': 'Licensed nurses assist by chat: symptom advice, hospital navigation, telemedicine booking (external service).',

    // Distance search
    'distance.title': 'Filter by Distance',
    'distance.useLocation': 'Use my location',
    'distance.1km': 'Within 1km',
    'distance.3km': 'Within 3km',
    'distance.5km': 'Within 5km',
    'distance.10km': 'Within 10km',
    'distance.nearest': 'Nearest first',
    'distance.fromMe': 'from you',
    'distance.approx': 'approx. from Shinjuku center',
    'distance.denied': 'Location not permitted. Showing approximate distance from Shinjuku center.',
    'distance.unsupported': 'Location is unavailable on this device. Showing approximate distance from Shinjuku center.',
    'distance.consent': 'We use your location to find clinics near you. Your location stays on your device and is never sent to our servers.',
    'distance.chooseArea': 'If location is unavailable, choose an area or station',
    'list.showing': 'Showing',


    // Self-pay
    'filter.selfPay': 'Self-pay Accepted',
    'selfpay.title': 'Insurance & Self-pay',
    'selfpay.subtitle': 'Information for visitors without Japanese health insurance.',
    'selfpay.selfPayOk': 'Self-pay accepted',
    'selfpay.noInsuranceOk': 'No insurance card OK',
    'selfpay.creditCard': 'Credit card',
    'selfpay.overseasInsurance': 'Travel insurance',
    'selfpay.certJa': 'Medical certificate (JA)',
    'selfpay.certEn': 'Medical certificate (EN)',
    'selfpay.estCost': 'Estimated cost',
    'selfpay.needConfirm': 'Please confirm',
    'selfpay.caution': 'Costs vary by clinic. Always confirm in advance.',

    // Safety
    'safety.infoMayChange': 'Clinic information may change. Always confirm by phone before visiting.',
    'safety.notDiagnosis': 'This app does not diagnose. It helps you find medical institutions.',

    // Symptom guide
    'symptom.title': 'Find a Department by Symptom',
    'symptom.lead': 'Select your symptom to see a suggested department to visit.',
    'symptom.disclaimer': '* This is not a diagnosis, only a guide to which department to visit. If unsure call #7119; for emergencies call 119.',
    'symptom.emergency': 'For loss of consciousness, heavy bleeding, or severe chest pain, call 119 without delay.',
    'symptom.findClinics': 'Find clinics in this department',

    // Buttons
    'btn.callNow': 'Call',
    'btn.openMap': 'Open in Maps',
    'btn.needCareNow': 'I need care now',
    'btn.findNearby': 'Find clinics near me',
    'btn.locating': 'Locating…',
    'location.errorTitle': 'We could not get your location',
    'location.denied': 'Allow location access in your browser site settings, then try again.',
    'location.unavailable': 'Your device could not determine its location. Move to an area with a better signal and try again.',
    'location.timeout': 'Location is taking too long. Move outdoors or near a window, then try again.',
    'location.unsupported': 'Location is unavailable in this browser. Search by area or station instead.',
    'location.error': 'Your location could not be saved. Check private browsing or browser storage settings.',
    'location.retry': 'Try location again',
    'location.chooseArea': 'Choose area or station',
    'symptom.suggestedDept': 'Suggested department',
    'filter.clearAll': 'Clear all',

    // Map
    'map.show': 'Show map',
    'map.hide': 'Close map',
    'map.hint': 'Tap the 📍 button on a clinic to show it here on the map.',
    'map.free': 'No key required · Free',

    // Home page
    'home.badgeData': 'Tokyo · 4,430 clinics · MHLW Open Data',
    'home.badgeVerified': 'Verified clinics included',
    'home.subtitle': 'Find medical care in Tokyo for international visitors',
    'home.orRefine': 'or refine your search',
    'home.closeFilters': 'Close filters',
    'home.moreFilters': 'More filters (4)',
    'home.emergencyQ': 'Emergency?',
    'home.consultBadge': 'Advice line',

    // Data source
    'data.mhlwOpenData': 'MHLW Open Data',

    // Emergency page (additional)
    'emergency.jaAddressLabel': 'Japanese Address (read aloud)',
    'emergency.readAddress': 'If the operator asks for your location, read the address above aloud.',
    'emergency.tryCall': 'Try calling #7119',
    'emergency.copyNumber': 'Copy number',
    'emergency.copied': 'Copied',
    'emergency.dialManual': "If the link does not start the call, dial #7119 manually on your phone's keypad.",
    'emergency.regionNote': '#7119 is available only in Tokyo and some other regions of Japan.',
  },
  zh: {
    'app.name': 'MediNavi JAPAN',
    'search.title': '查找医疗机构',
    'search.department': '按科室查找',
    'search.language': '按语言查找',
    
    // Filters
    'filter.openNow': '目前营业',
    'filter.holiday': '节假日门诊',
    'filter.walkIn': '无需预约',
    'filter.englishToday': '今日英语服务',
    'filter.creditCard': '信用卡/无现金支付',
    'filter.insurance': '接受海外保险',
    'filter.nightWeekend': '夜间/周末门诊',
    'filter.verified': '仅限已确认数据',

    // Trust & Shinjuku Pilot
    'trust.pilotArea': '实证实验区域: 东京都新宿区',
    'trust.banner': '不仅是开放数据。MediNavi JAPAN通过直接电话、AI面谈和地方医疗合作验证真实的就医可及性。',
    'trust.stats': '新宿区已确认诊所: 32 / 100',
    'trust.badge': '已验证数据',
    'trust.lastConfirmed': '最后确认日',
    'trust.method': '确认方法',

    // Emergency UI
    'emergency.title': '紧急情况？请拨打 119',
    'emergency.desc': '如果您有危及生命的症状且需要救护车，请立即拨打119。可通过口译获得多语言支持。',
    'emergency.consultation': '拨打 #7119 咨询紧急情况',
    'emergency.consultationDesc': '如果您不确定是否要叫救护车，请拨打#7119获取专业医疗建议。',
    'emergency.location': '显示我的当前位置',
    'emergency.phrases': '紧急情况下的日语常用语',
    'emergency.sayThis': '请保持冷静。告诉接线员：',
    
    'btn.search': '搜索',
    'footer.disclaimer': '* 本应用不提供医疗诊断。仅供参考。就诊前请务必直接确认。',
    'nav.home': '首页',
    'nav.hospitals': '医院列表',
    'nav.emergency': '紧急指南',
    'nav.symptoms': '按症状查找',
    'nav.online': '在线诊疗',
    'common.paid': '收费',
    'online.desc': '护士通过聊天协助症状咨询、就医引导、远程诊疗预约（外部服务）。',

    // 距离检索
    'distance.title': '按距离筛选',
    'distance.useLocation': '使用我的位置',
    'distance.1km': '1km以内',
    'distance.3km': '3km以内',
    'distance.5km': '5km以内',
    'distance.10km': '10km以内',
    'distance.nearest': '由近到远',
    'distance.fromMe': '距您',
    'distance.approx': '距新宿中心约',
    'distance.denied': '未允许定位，显示距新宿中心的大致距离。',
    'distance.unsupported': '当前环境无法使用定位，显示距新宿中心的大致距离。',
    'distance.consent': '我们使用您的位置来查找附近的诊所。位置信息仅在您的设备上使用，绝不会发送到服务器。',
    'distance.chooseArea': '如果无法使用定位，请选择区域或车站',
    'list.showing': '显示中',


    // 自费诊疗
    'filter.selfPay': '接受自费',
    'selfpay.title': '保险与自费',
    'selfpay.subtitle': '面向没有日本健康保险的访日人士的信息。',
    'selfpay.selfPayOk': '可自费就诊',
    'selfpay.noInsuranceOk': '无保险证可就诊',
    'selfpay.creditCard': '信用卡',
    'selfpay.overseasInsurance': '海外旅行保险',
    'selfpay.certJa': '诊断书（日文）',
    'selfpay.certEn': '诊断书（英文）',
    'selfpay.estCost': '大致费用',
    'selfpay.needConfirm': '请事先确认',
    'selfpay.caution': '费用因医疗机构而异，请务必事先确认。',

    // 安全提示
    'safety.infoMayChange': '医疗机构信息可能会变更。就诊前请务必致电确认。',
    'safety.notDiagnosis': '本应用不提供诊断，仅协助您查找医疗机构。',

    // 症状指南
    'symptom.title': '按症状查找科室',
    'symptom.lead': '选择您的症状，为您推荐就诊科室。',
    'symptom.disclaimer': '※这不是诊断，仅为就诊科室的参考。不确定请拨打 #7119，紧急情况请拨打 119。',
    'symptom.emergency': '如出现昏迷、大量出血、剧烈胸痛等，请立即拨打 119。',
    'symptom.findClinics': '查找该科室的诊所',

    // 按钮
    'btn.callNow': '拨打电话',
    'btn.openMap': '在地图中打开',
    'btn.needCareNow': '我现在需要就诊',
    'btn.findNearby': '查找附近的诊所',
    'btn.locating': '正在获取位置…',
    'location.errorTitle': '无法获取您的位置',
    'location.denied': '请在浏览器的网站设置中允许定位，然后重试。',
    'location.unavailable': '设备无法确定当前位置。请移至信号较好的地方后重试。',
    'location.timeout': '获取位置超时。请移至室外或窗边后重试。',
    'location.unsupported': '此浏览器无法使用定位。请改为选择区域或车站。',
    'location.error': '无法保存位置信息。请检查无痕浏览或浏览器存储设置。',
    'location.retry': '重新获取位置',
    'location.chooseArea': '选择区域或车站',
    'symptom.suggestedDept': '建议就诊科室',
    'filter.clearAll': '全部清除',

    // 地图
    'map.show': '显示地图',
    'map.hide': '关闭地图',
    'map.hint': '点击诊所的 📍 按钮，在此以地图显示。',
    'map.free': '无需密钥 · 免费',

    // 首页
    'home.badgeData': '东京 · 4,430家诊所 · 厚生劳动省开放数据',
    'home.badgeVerified': '收录已确认诊所',
    'home.subtitle': '为外国游客提供的东京医疗机构检索',
    'home.orRefine': '或筛选条件',
    'home.closeFilters': '收起条件',
    'home.moreFilters': '其他条件 (4)',
    'home.emergencyQ': '紧急情况？',
    'home.consultBadge': '急救咨询',

    // 数据来源
    'data.mhlwOpenData': '厚生劳动省开放数据',

    // 紧急页面 追加
    'emergency.jaAddressLabel': '日语地址（朗读用）',
    'emergency.readAddress': '※如接线员询问您的位置，请照读上面的地址。',
    'emergency.tryCall': '尝试拨打 #7119',
    'emergency.copyNumber': '复制号码',
    'emergency.copied': '已复制',
    'emergency.dialManual': '如果链接无法拨号，请在电话键盘上手动拨打 #7119。',
    'emergency.regionNote': '#7119 仅在东京都等日本部分地区提供。',
  },
  ko: {
    'app.name': 'MediNavi JAPAN',
    'search.title': '의료기관 찾기',
    'search.department': '진료과 검색',
    'search.language': '언어 검색',

    // Filters
    'filter.openNow': '현재 진료중',
    'filter.holiday': '휴일 진료',
    'filter.walkIn': '예약 불필요',
    'filter.englishToday': '오늘 영어 지원',
    'filter.creditCard': '신용카드/간편결제',
    'filter.insurance': '해외 여행자보험 대응',
    'filter.nightWeekend': '야간/주말 진료',
    'filter.verified': '인증된 데이터만',

    // Trust & Shinjuku Pilot
    'trust.pilotArea': '실증실험 구역: 도쿄도 신주쿠구',
    'trust.banner': '단순한 오픈 데이터가 아닙니다. MediNavi JAPAN은 직접 전화, AI 인터뷰, 지역 의료 연계를 통해 실제 진료 가능 여부를 검증합니다.',
    'trust.stats': '신주쿠 검증 완료 클리닉: 32 / 100건',
    'trust.badge': '검증된 데이터',
    'trust.lastConfirmed': '최종 확인일',
    'trust.method': '확인 방법',

    // Emergency UI
    'emergency.title': '응급상황인가요? 119로 전화',
    'emergency.desc': '생명이 위독한 증상이 있고 즉시 구급차가 필요한 경우 119로 전화하십시오. 통역 서비스 이용이 가능할 수 있습니다.',
    'emergency.consultation': '응급상담은 #7119로',
    'emergency.consultationDesc': '구급차를 불러야 할지 고민되는 경우, #7119로 전화하여 전문가의 의학적 조언을 받으실 수 있습니다.',
    'emergency.location': '현재 위치 표시',
    'emergency.phrases': '응급 시 유용한 일본어 표현',
    'emergency.sayThis': '차분하게 상담원에게 전달하십시오:',

    'btn.search': '검색',
    'footer.disclaimer': '* 이 앱은 의료 진단을 제공하지 않습니다. 참고용으로만 사용해 주십시오. 방문 전 반드시 직접 확인하시기 바랍니다.',
    'nav.home': '홈',
    'nav.hospitals': '병원 목록',
    'nav.emergency': '응급 가이드',
    'nav.symptoms': '증상으로 찾기',
    'nav.online': '온라인 진료',
    'common.paid': '유료',
    'online.desc': '간호사가 채팅으로 증상 상담·병원 안내·원격진료 예약을 지원합니다(외부 서비스).',

    // 거리 검색
    'distance.title': '거리로 필터링',
    'distance.useLocation': '내 위치 사용',
    'distance.1km': '1km 이내',
    'distance.3km': '3km 이내',
    'distance.5km': '5km 이내',
    'distance.10km': '10km 이내',
    'distance.nearest': '가까운 순',
    'distance.fromMe': '내 위치에서',
    'distance.approx': '신주쿠 중심 기준 약',
    'distance.denied': '위치 정보가 허용되지 않아 신주쿠 중심 기준 대략 거리를 표시합니다.',
    'distance.unsupported': '현재 환경에서는 위치를 사용할 수 없어 신주쿠 중심 기준 거리를 표시합니다.',
    'distance.consent': '근처 병원을 찾기 위해 위치 정보를 사용합니다. 위치 정보는 기기 내에서만 사용되며 서버로 전송되지 않습니다.',
    'distance.chooseArea': '위치 정보를 사용할 수 없으면 지역·역을 선택하세요',
    'list.showing': '표시 중',


    // 자비 진료
    'filter.selfPay': '자비 진료 가능',
    'selfpay.title': '보험 및 자비 진료',
    'selfpay.subtitle': '일본 건강보험이 없는 방문객을 위한 정보입니다.',
    'selfpay.selfPayOk': '자비 진료 가능',
    'selfpay.noInsuranceOk': '보험증 없이 진료 가능',
    'selfpay.creditCard': '신용카드',
    'selfpay.overseasInsurance': '해외 여행자보험',
    'selfpay.certJa': '진단서(일본어)',
    'selfpay.certEn': '진단서(영문)',
    'selfpay.estCost': '예상 비용',
    'selfpay.needConfirm': '사전 확인 필요',
    'selfpay.caution': '비용은 의료기관마다 다르므로 반드시 사전에 확인하십시오.',

    // 안전 표시
    'safety.infoMayChange': '의료기관 정보는 변경될 수 있습니다. 방문 전 반드시 전화로 확인하십시오.',
    'safety.notDiagnosis': '이 앱은 진단을 제공하지 않으며 의료기관 안내를 돕습니다.',

    // 증상 가이드
    'symptom.title': '증상으로 진료과 찾기',
    'symptom.lead': '증상을 선택하면 방문할 진료과를 안내합니다.',
    'symptom.disclaimer': '※ 진단이 아니라 방문할 진료과의 참고입니다. 판단이 어려우면 #7119, 응급 시 119로 전화하십시오.',
    'symptom.emergency': '의식이 없거나 대량 출혈, 심한 흉통이 있으면 즉시 119로 전화하십시오.',
    'symptom.findClinics': '이 진료과 클리닉 찾기',

    // 버튼
    'btn.callNow': '전화하기',
    'btn.openMap': '지도에서 열기',
    'btn.needCareNow': '지금 진료가 필요해요',
    'btn.findNearby': '가까운 병원 찾기',
    'btn.locating': '위치 확인 중…',
    'location.errorTitle': '현재 위치를 가져올 수 없습니다',
    'location.denied': '브라우저 사이트 설정에서 위치 권한을 허용한 뒤 다시 시도해 주세요.',
    'location.unavailable': '기기에서 현재 위치를 확인할 수 없습니다. 신호가 좋은 곳에서 다시 시도해 주세요.',
    'location.timeout': '위치 확인 시간이 초과되었습니다. 실외나 창가로 이동한 뒤 다시 시도해 주세요.',
    'location.unsupported': '이 브라우저에서는 위치를 사용할 수 없습니다. 지역 또는 역을 선택해 주세요.',
    'location.error': '위치 정보를 저장할 수 없습니다. 비공개 브라우징 또는 저장소 설정을 확인해 주세요.',
    'location.retry': '현재 위치 다시 확인',
    'location.chooseArea': '지역 또는 역 선택',
    'symptom.suggestedDept': '권장 진료과',
    'filter.clearAll': '모두 해제',

    // 지도
    'map.show': '지도 표시',
    'map.hide': '지도 닫기',
    'map.hint': '클리닉의 📍 버튼을 누르면 여기 지도에 표시됩니다.',
    'map.free': '키 불필요 · 무료',

    // 홈
    'home.badgeData': '도쿄 · 4,430개 클리닉 · 후생노동성 오픈데이터',
    'home.badgeVerified': '확인된 클리닉 수록',
    'home.subtitle': '외국인 여행자를 위한 도쿄 의료기관 검색',
    'home.orRefine': '또는 조건으로 좁히기',
    'home.closeFilters': '조건 닫기',
    'home.moreFilters': '기타 조건 (4)',
    'home.emergencyQ': '응급상황인가요?',
    'home.consultBadge': '응급상담',

    // 데이터 출처
    'data.mhlwOpenData': '후생노동성 오픈데이터',

    // 응급 페이지 추가
    'emergency.jaAddressLabel': '일본어 주소 (읽어주기용)',
    'emergency.readAddress': '※오퍼레이터가 현재 위치를 물으면 위 주소를 그대로 읽어주세요.',
    'emergency.tryCall': '#7119 발신 시도',
    'emergency.copyNumber': '번호 복사',
    'emergency.copied': '복사됨',
    'emergency.dialManual': '링크로 발신되지 않으면 전화 키패드에서 #7119를 직접 눌러 거세요.',
    'emergency.regionNote': '#7119는 도쿄도 등 일본 일부 지역에서만 이용할 수 있습니다.',
  },
  es: {
    'app.name': 'MediNavi JAPAN',
    'search.title': 'Buscar Centros Médicos',
    'search.department': 'Buscar por Especialidad',
    'search.language': 'Buscar por Idioma',

    // Filters
    'filter.openNow': 'Abierto Ahora',
    'filter.holiday': 'Servicio en Festivos',
    'filter.walkIn': 'Sin Cita Previa',
    'filter.englishToday': 'Inglés Disponible Hoy',
    'filter.creditCard': 'Tarjeta / Sin Efectivo',
    'filter.insurance': 'Seguro Internacional',
    'filter.nightWeekend': 'Nocturno / Fin de Semana',
    'filter.verified': 'Solo Datos Verificados',

    // Trust & Shinjuku Pilot
    'trust.pilotArea': 'Área Piloto: Shinjuku, Tokio',
    'trust.banner': 'No solo datos abiertos. MediNavi JAPAN verifica el acceso real a clínicas mediante llamadas directas, entrevistas con IA y alianzas médicas locales.',
    'trust.stats': 'Clínicas verificadas en Shinjuku: 32 / 100',
    'trust.badge': 'Datos Verificados',
    'trust.lastConfirmed': 'Última Verificación',
    'trust.method': 'Verificado Por',

    // Emergency UI
    'emergency.title': '¿Emergencia? Llame al 119',
    'emergency.desc': 'Si tiene síntomas que ponen en peligro su vida y necesita una ambulancia inmediatamente, llame al 119. Puede haber asistencia multilingüe.',
    'emergency.consultation': 'Llame al #7119 para Consulta de Emergencia',
    'emergency.consultationDesc': 'Si no está seguro de si llamar a una ambulancia, llame al #7119 para recibir asesoramiento médico profesional.',
    'emergency.location': 'Mostrar Mi Ubicación Actual',
    'emergency.phrases': 'Frases de emergencia en japonés',
    'emergency.sayThis': 'Mantenga la calma. Diga al operador:',

    'btn.search': 'Buscar',
    'footer.disclaimer': '* Esta aplicación no proporciona diagnósticos médicos. Úsela solo como referencia. Siempre confirme directamente antes de visitar.',
    'nav.home': 'Inicio',
    'nav.hospitals': 'Hospitales',
    'nav.emergency': 'Guía de Emergencia',
    'nav.symptoms': 'Por Síntoma',
    'nav.online': 'Consulta en línea',
    'common.paid': 'De pago',
    'online.desc': 'Enfermeras te asisten por chat: consulta de síntomas, guía hospitalaria y reserva de telemedicina (servicio externo).',

    // Búsqueda por distancia
    'distance.title': 'Filtrar por distancia',
    'distance.useLocation': 'Usar mi ubicación',
    'distance.1km': 'Hasta 1km',
    'distance.3km': 'Hasta 3km',
    'distance.5km': 'Hasta 5km',
    'distance.10km': 'Hasta 10km',
    'distance.nearest': 'Más cercano primero',
    'distance.fromMe': 'desde usted',
    'distance.approx': 'aprox. desde el centro de Shinjuku',
    'distance.denied': 'Ubicación no permitida. Mostrando distancia aproximada desde el centro de Shinjuku.',
    'distance.unsupported': 'La ubicación no está disponible en este dispositivo. Mostrando distancia desde el centro de Shinjuku.',
    'distance.consent': 'Usamos tu ubicación para encontrar clínicas cercanas. Tu ubicación permanece en tu dispositivo y nunca se envía a nuestros servidores.',
    'distance.chooseArea': 'Si la ubicación no está disponible, elige una zona o estación',
    'list.showing': 'Mostrando',


    // Pago privado
    'filter.selfPay': 'Acepta pago privado',
    'selfpay.title': 'Seguro y pago privado',
    'selfpay.subtitle': 'Información para visitantes sin seguro médico japonés.',
    'selfpay.selfPayOk': 'Acepta pago privado',
    'selfpay.noInsuranceOk': 'Sin tarjeta de seguro OK',
    'selfpay.creditCard': 'Tarjeta de crédito',
    'selfpay.overseasInsurance': 'Seguro de viaje',
    'selfpay.certJa': 'Certificado médico (JA)',
    'selfpay.certEn': 'Certificado médico (EN)',
    'selfpay.estCost': 'Costo estimado',
    'selfpay.needConfirm': 'Confirme por favor',
    'selfpay.caution': 'Los costos varían según la clínica. Confirme siempre con antelación.',

    // Seguridad
    'safety.infoMayChange': 'La información puede cambiar. Confirme siempre por teléfono antes de visitar.',
    'safety.notDiagnosis': 'Esta aplicación no diagnostica; le ayuda a encontrar centros médicos.',

    // Guía de síntomas
    'symptom.title': 'Buscar Especialidad por Síntoma',
    'symptom.lead': 'Seleccione su síntoma para ver la especialidad sugerida.',
    'symptom.disclaimer': '* Esto no es un diagnóstico, solo una guía de qué especialidad visitar. Si no está seguro llame al #7119; en emergencias al 119.',
    'symptom.emergency': 'Ante pérdida de conciencia, hemorragia grave o dolor torácico intenso, llame al 119 sin demora.',
    'symptom.findClinics': 'Buscar clínicas de esta especialidad',

    // Botones
    'btn.callNow': 'Llamar',
    'btn.openMap': 'Abrir en Maps',
    'btn.needCareNow': 'Necesito atención ahora',
    'btn.findNearby': 'Buscar clínicas cercanas',
    'btn.locating': 'Ubicando…',
    'location.errorTitle': 'No pudimos obtener tu ubicación',
    'location.denied': 'Permite el acceso a la ubicación en la configuración del sitio y vuelve a intentarlo.',
    'location.unavailable': 'El dispositivo no pudo determinar tu ubicación. Ve a un lugar con mejor señal e inténtalo de nuevo.',
    'location.timeout': 'La ubicación está tardando demasiado. Ve al exterior o cerca de una ventana e inténtalo de nuevo.',
    'location.unsupported': 'La ubicación no está disponible en este navegador. Busca por zona o estación.',
    'location.error': 'No se pudo guardar tu ubicación. Revisa el modo privado o la configuración de almacenamiento.',
    'location.retry': 'Intentar ubicación de nuevo',
    'location.chooseArea': 'Elegir zona o estación',
    'symptom.suggestedDept': 'Especialidad sugerida',
    'filter.clearAll': 'Borrar todo',

    // Mapa
    'map.show': 'Mostrar mapa',
    'map.hide': 'Cerrar mapa',
    'map.hint': 'Toque el botón 📍 de una clínica para verla aquí en el mapa.',
    'map.free': 'Sin clave · Gratis',

    // Página de inicio
    'home.badgeData': 'Tokio · 4.430 clínicas · Datos abiertos del MHLW',
    'home.badgeVerified': 'Incluye clínicas verificadas',
    'home.subtitle': 'Buscador de centros médicos en Tokio para viajeros extranjeros',
    'home.orRefine': 'o refine su búsqueda',
    'home.closeFilters': 'Cerrar filtros',
    'home.moreFilters': 'Más filtros (4)',
    'home.emergencyQ': '¿Emergencia?',
    'home.consultBadge': 'Línea de consulta',

    // Fuente de datos
    'data.mhlwOpenData': 'Datos abiertos del MHLW',

    // Página de emergencia (adicional)
    'emergency.jaAddressLabel': 'Dirección en japonés (para leer)',
    'emergency.readAddress': 'Si el operador pregunta por su ubicación, lea en voz alta la dirección de arriba.',
    'emergency.tryCall': 'Intentar llamar al #7119',
    'emergency.copyNumber': 'Copiar número',
    'emergency.copied': 'Copiado',
    'emergency.dialManual': 'Si el enlace no inicia la llamada, marque #7119 manualmente en el teclado.',
    'emergency.regionNote': '#7119 solo está disponible en Tokio y algunas otras regiones de Japón.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

let activeLanguage: Language = 'en';
const languageListeners = new Set<() => void>();
function languageSnapshot(): Language {
  try {
    const saved = localStorage.getItem('medinavi-language');
    if (saved && ['ja', 'en', 'zh', 'ko', 'es'].includes(saved)) activeLanguage = saved as Language;
  } catch { /* Fall back to in-memory preference if storage is blocked. */ }
  return activeLanguage;
}
function subscribeLanguage(listener: () => void) {
  languageListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => { languageListeners.delete(listener); window.removeEventListener('storage', listener); };
}
function setLanguage(language: Language) {
  activeLanguage = language;
  try { localStorage.setItem('medinavi-language', language); } catch { /* optional */ }
  languageListeners.forEach(listener => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, languageSnapshot, () => 'en' as Language);
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const t = (key: string) => {
    return uiMessages[key]?.[language] || translations[language][key as keyof typeof translations['ja']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
