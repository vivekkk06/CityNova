'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'kok';

export interface LanguageInfo {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'kok', label: 'Local (Konkani)', nativeLabel: 'कोंकणी (Goa)', flag: '🌴' },
];

export const translations = {
  // Navigation & General
  nav_brand_title: {
    en: 'CityNova',
    hi: 'सिटीनोवा',
    kok: 'सिटीनोव्हा',
  },
  nav_tagline: {
    en: 'Ponda Municipal Council • Goa',
    hi: 'पोंडा नगरपालिका परिषद • गोवा',
    kok: 'पोंडा नगरपालिका मंडळ • गोंय',
  },
  nav_helpline_bar: {
    en: 'CityNova • Municipal Civic Operating System | Goa Right to Public Services Act 2013',
    hi: 'सिटीनोवा • नगर पालिका जन सेवा प्रणाली | गोवा लोक सेवा अधिकार अधिनियम २०१३',
    kok: 'सिटीनोव्हा • नगरपालिका नागरीक सेवा प्रणाली | गोंय लोकसेवा हक्क कायदो २०१३',
  },
  nav_helpline: {
    en: '24x7 Citizen Helpline: 1913 (Toll Free)',
    hi: '२४x७ नागरिक हेल्पलाइन: १९१३ (निःशुल्क)',
    kok: '२४x७ नागरीक हेल्पलायन: १९१३ (फुकट)',
  },
  nav_report: {
    en: '+ Report Problem',
    hi: '+ समस्या दर्ज करें',
    kok: '+ समस्या नोंदवा',
  },
  nav_rights: {
    en: "Citizens' Rights",
    hi: 'नागरिक अधिकार',
    kok: 'नागरीक हक्क',
  },
  nav_city_wards: {
    en: 'City & Wards',
    hi: 'शहर एवं वार्ड',
    kok: 'शार आनी वॉर्ड',
  },
  nav_authority: {
    en: 'Authority',
    hi: 'प्रशासन कक्ष',
    kok: 'प्रशासन',
  },
  nav_field_worker: {
    en: 'Field Operations',
    hi: 'फील्ड कर्मचारी',
    kok: 'क्षेत्र कर्मचारी',
  },
  nav_admin_matrix: {
    en: 'Chief Officer Command',
    hi: 'मुख्य अधिकारी नियंत्रण',
    kok: 'मुखेल अधिकारी नियंत्रण',
  },
  nav_ai_assistant: {
    en: 'CityNova Copilot',
    hi: 'सिटीनोवा सहायक',
    kok: 'सिटीनोव्हा सहाय्यक',
  },

  // Hero Section
  hero_tag: {
    en: 'GOVERNMENT OF GOA • PONDA MUNICIPAL COUNCIL • CITYNOVA',
    hi: 'गोवा सरकार • पोंडा नगरपालिका परिषद • सिटीनोवा',
    kok: 'गोंय सरकार • पोंडा नगरपालिका मंडळ • सिटीनोव्हा',
  },
  hero_title_part1: {
    en: 'Public Grievance Map & ',
    hi: 'जन शिकायत मानचित्र एवं ',
    kok: 'लोक तक्रार नकाशो आनी ',
  },
  hero_title_accent: {
    en: 'Promise-to-Proof',
    hi: 'वचन-से-प्रमाण (Promise-to-Proof)',
    kok: 'उतर-ते-पुरावो (Promise-to-Proof)',
  },
  hero_title_part2: {
    en: ' Ledger',
    hi: ' खाता बही',
    kok: ' दफ्तर वही',
  },
  hero_subtitle: {
    en: 'Citizen Grievance & Service Delivery Platform. Every complaint is publicly logged with legal turnaround deadlines under the Goa Right to Public Services Act 2013. No issue is marked resolved without physical geo-tagged photo proof and resident sign-off.',
    hi: 'नागरिक शिकायत एवं लोक सेवा मंच। गोवा लोक सेवा अधिकार अधिनियम २०१३ के तहत प्रत्येक शिकायत सार्वजनिक रूप से समय-सीमा के साथ दर्ज होती है। बिना जीपीएस फोटो प्रमाण और नागरिक पुष्टि के कोई कार्य पूर्ण नहीं माना जाता।',
    kok: 'नागरीक तक्रार आनी लोकसेवा मंच। गोंय लोकसेवा हक्क कायदो २०१३ प्रमाण दर एक तक्रार कायदेशीर वेळ-मर्यादेन नोंद जाता। प्रत्यक्ष जीपीएस फोटो पुराव्या आनी नागरीकांच्या मान्याताये बगर कसलोच प्रस्न पुराय माननात।',
  },
  hero_telemetry_label: {
    en: 'CityNova Telemetry',
    hi: 'सिटीनोवा लाइव सूचना',
    kok: 'सिटीनोव्हा थेट म्हायती',
  },
  hero_telemetry_text: {
    en: 'Ward 2: 4 High-mast LED luminaires restored 10h ahead of SLA • Ward 3: Khandepar water feeder line isolated • 100% Geo-verified Proof of Work active',
    hi: 'वार्ड २: ४ स्ट्रीटलाइट एसएलए से १० घंटे पहले ठीक हुईं • वार्ड ३: खांडेपार पेयजल पाइप लाइन सुरक्षित • १००% जीपीएस फोटो प्रमाण सक्रिय',
    kok: 'वार्ड २: ४ हाय-मास्ट दिवे वेळे पयलीं १० वरां नीट केले • वार्ड ३: खांडेपार उदकाची नळी बंद करून दुरुस्ती सुरू • १००% जीपीएस फोटो पुरावो लागू',
  },
  quick_topics: {
    en: 'Quick Topics:',
    hi: 'त्वरित विषय:',
    kok: 'रोखडे विशय:',
  },
  reset_filter: {
    en: 'Reset Filter',
    hi: 'फ़िल्टर हटाएं',
    kok: 'फिल्टर काढा',
  },
  btn_report_problem: {
    en: '+ Report Civic Problem',
    hi: '+ जन समस्या दर्ज करें',
    kok: '+ नागरीक समस्या नोंदवा',
  },
  btn_ask_copilot: {
    en: 'Ask CityNova Copilot',
    hi: 'एआई सहायक से पूछें',
    kok: 'एआय सहाय्यकाक विचारात',
  },

  // Stats Cards
  stats_total: {
    en: 'Total Registered',
    hi: 'कुल दर्ज शिकायतें',
    kok: 'एकूण नोंदविल्ल्यो',
  },
  stats_total_sub: {
    en: 'Cumulative Cases',
    hi: 'संचयी मामले',
    kok: 'एकूण प्रकरणां',
  },
  stats_active: {
    en: 'Active Under Work',
    hi: 'कार्य प्रगति पर',
    kok: 'काम चालू आसा',
  },
  stats_active_sub: {
    en: 'SLA Countdown Active',
    hi: 'समय-सीमा उलटी गिनती',
    kok: 'वेळ-मर्यादा सुरू आसा',
  },
  stats_resolved: {
    en: 'Verified Resolved',
    hi: 'सत्यापित समाधान',
    kok: 'तपासणी जावन पुराय',
  },
  stats_resolved_sub: {
    en: 'With Photo Proof',
    hi: 'फोटो प्रमाण सहित',
    kok: 'फोटो पुराव्या सयत',
  },
  stats_wards: {
    en: 'Municipal Wards',
    hi: 'नगरपालिका वार्ड',
    kok: 'नगरपालिका वॉर्ड',
  },
  stats_wards_sub: {
    en: '100% Geo-Fenced',
    hi: '१००% जीपीएस सीमाबद्ध',
    kok: '१००% जीपीएस मर्यादित',
  },
  stats_sla: {
    en: 'Statutory SLA Rate',
    hi: 'कानूनी समयबद्धता दर',
    kok: 'कायदेशीर वेळ पाळप दर',
  },
  stats_sla_sub: {
    en: 'Guaranteed Turnaround',
    hi: 'निश्चित समाधान अवधि',
    kok: 'हमी दिल्लो वेळ',
  },

  // Tabs
  tab_map: {
    en: 'Map View (GIS & Google Maps)',
    hi: 'मानचित्र दृश्य (Google Maps)',
    kok: 'नकाशो (Google Maps)',
  },
  tab_ledger: {
    en: 'Promise-to-Proof Ledger',
    hi: 'वचन-प्रमाण बही (Ledger)',
    kok: 'दफ्तर वही (Ledger)',
  },
  tab_officials: {
    en: 'Ward Officials Directory',
    hi: 'वार्ड अधिकारी सूची',
    kok: 'वॉर्ड अधिकारी वळेरी',
  },
  tab_rights: {
    en: "Citizens' Legal Rights",
    hi: 'नागरिक कानूनी अधिकार',
    kok: 'नागरीक कायदेशीर हक्क',
  },

  // Filters
  filter_search_placeholder: {
    en: 'Search case, landmark, title...',
    hi: 'केस नंबर, स्थान, शीर्षक खोजें...',
    kok: 'केस नंबर, जागो, विशय सोदात...',
  },
  filter_all_wards: {
    en: 'All Wards (सभी वार्ड)',
    hi: 'सभी वार्ड',
    kok: 'सगळे वॉर्ड',
  },
  filter_all_categories: {
    en: 'All Categories (सभी श्रेणियां)',
    hi: 'सभी श्रेणियां',
    kok: 'सगळ्यो वर्गवार्यो',
  },
  filter_all_status: {
    en: 'All Statuses (सभी स्थितियां)',
    hi: 'सभी स्थितियां',
    kok: 'सगळी स्थिती',
  },

  // Categories
  cat_pothole: {
    en: 'Pothole & Road Damage',
    hi: 'सड़क गड्ढे एवं क्षति',
    kok: 'रस्त्याचे चर आनी खड्डे',
  },
  cat_water: {
    en: 'Water Leakage / Pipe Burst',
    hi: 'पानी पाइप लीकेज / फूटना',
    kok: 'उदकाच्यो नळ्यो गळप / फुटप',
  },
  cat_streetlight: {
    en: 'Streetlight Outage',
    hi: 'स्ट्रीटलाइट खराबी / अंधेरा',
    kok: 'रस्त्यावयले दिवे बंद',
  },
  cat_garbage: {
    en: 'Garbage & Waste Accumulation',
    hi: 'कचरा एवं गंदगी का ढेर',
    kok: 'कचरो आनी घाण एकठांय',
  },
  cat_drainage: {
    en: 'Drainage & Sewer Overflow',
    hi: 'नाली एवं सीवर ओवरफ्लो',
    kok: 'गटर आनी उदक तुंबप',
  },

  // Map Controls & Google Maps
  map_google_roadmap: {
    en: 'Google Maps (Roadmap)',
    hi: 'गूगल मैप्स (सड़क दृश्य)',
    kok: 'गूगल नकाशो (रस्ते)',
  },
  map_google_satellite: {
    en: 'Google Satellite',
    hi: 'गूगल उपग्रह (Satellite)',
    kok: 'गूगल सॅटेलाइट',
  },
  map_google_hybrid: {
    en: 'Google Hybrid',
    hi: 'गूगल हाइब्रिड (Hybrid)',
    kok: 'गूगल हायब्रिड',
  },
  map_municipal_gis: {
    en: 'Municipal GIS Light',
    hi: 'नगरपालिका जीआईएस',
    kok: 'नगरपालिका जीआयएस',
  },
  open_in_google_maps: {
    en: 'Open in Google Maps ↗',
    hi: 'गूगल मैप्स में देखें ↗',
    kok: 'गूगल मॅपाचेर पळयात ↗',
  },
  get_directions_google: {
    en: 'Directions (Google Maps) ↗',
    hi: 'दिशा-निर्देश (गूगल मैप्स) ↗',
    kok: 'मार्ग पळयात (गूगल मॅप्स) ↗',
  },

  // Docket Cards
  reported_by: {
    en: 'Reported by:',
    hi: 'शिकायतकर्ता:',
    kok: 'तक्रारदार:',
  },
  sla_guarantee: {
    en: 'Statutory SLA:',
    hi: 'कानूनी समय-सीमा:',
    kok: 'कायदेशीर वेळ-मर्यादा:',
  },
  confirmed_genuine: {
    en: 'Confirmed Genuine',
    hi: 'सत्यापित असली',
    kok: 'खरेपण सिद्ध',
  },
  inspect_full_docket: {
    en: 'Inspect Full Docket',
    hi: 'पूरा विवरण देखें',
    kok: 'पुराय म्हायती पळयात',
  },
  share_docket: {
    en: 'Share Link',
    hi: 'शेयर करें',
    kok: 'शेअर करात',
  },
  copied_toast: {
    en: 'Copied!',
    hi: 'कॉपी हुआ!',
    kok: 'कॉपी जालें!',
  },

  // Reporting Wizard
  step_1_title: {
    en: '1. Tell Us Problem',
    hi: '१. समस्या बताएं',
    kok: '१. अडचण सांगात',
  },
  step_2_title: {
    en: '2. Review Details',
    hi: '२. विवरण जांचें',
    kok: '२. म्हायती तपासात',
  },
  step_3_title: {
    en: '3. Pick Location',
    hi: '३. स्थान चुनें',
    kok: '३. जागो थारावात',
  },
  step_4_title: {
    en: '4. Confirm & Seal',
    hi: '४. पुष्टि एवं जमा करें',
    kok: '४. खात्री आनी दाखल करात',
  },
  report_speech_prompt: {
    en: 'Speak in English, Hindi, or Konkani / Marathi using microphone:',
    hi: 'माइक का उपयोग कर अंग्रेजी, हिंदी या कोंकणी/मराठी में बोलें:',
    kok: 'मायकाचो वापर करून इंग्रजी, हिंदी वा कोंकणींत उलय्यात:',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
  currentLanguageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('citynova_lang') as Language | null;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'kok')) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('citynova_lang', lang);
      window.dispatchEvent(new CustomEvent('citynova_lang_changed', { detail: { lang } }));
    }
  };

  const t = (key: keyof typeof translations): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item['en'] || key;
  };

  const currentLanguageInfo =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageInfo,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: keyof typeof translations) => {
        const item = translations[key];
        return item ? item['en'] : key;
      },
      currentLanguageInfo: LANGUAGES[0],
    };
  }
  return context;
}
