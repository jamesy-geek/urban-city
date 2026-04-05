"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'kn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "Dashboard": "Dashboard",
    "City Map": "City Map",
    "CityMind AI": "CityMind AI",
    "Civic Forms": "Civic Forms",
    "Support": "Support",
    "English / ಕನ್ನಡ": "English / ಕನ್ನಡ",
    
    // Support Dashboard
    "Help": "Help",
    "Raised": "Raised",
    "Resolved": "Resolved",
    "Unresolved": "Unresolved",
    "All": "All",
    "Open": "Open",
    "ID": "ID",
    "Subject": "Subject",
    "Raised by": "Raised by",
    "Date": "Date",
    "Status": "Status",
    "No tickets found": "No tickets found",
    "There are currently no tickets in the": "There are currently no tickets in the",
    "category": "category",
    "Real data will be populated here soon.": "Real data will be populated here soon.",
    
    // Consolidated Dashboard
    "Help Requests": "Help Requests",
    "Raised Tickets": "Raised Tickets",
    "City Operations Map": "City Operations Map",
    
    // Map Scenarios
    "Road Closure": "Road Closure",
    "Construction": "Construction",
    "Flood": "Flood",
    "Bus Route": "Bus Route",
    "Restriction": "Restriction",
    "Festival": "Festival",

    // Map UI
    "Mysuru City Status": "Mysuru City Status",
    "Live": "Live",
    "Last updated": "Last updated",
    "Road Blocks": "Road Blocks",
    "Active Alerts": "Active Alerts",
    "Construction Zones": "Construction Zones",
    "Events": "Events",
    "No active alerts for this category.": "No active alerts for this category."
  },
  kn: {
    "Dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "City Map": "ನಗರ ನಕ್ಷೆ",
    "CityMind AI": "ಸಿಟಿಮೈಂಡ್ ಎಐ",
    "Civic Forms": "ನಾಗರಿಕ ನಮೂನೆಗಳು",
    "Support": "ಬೆಂಬಲ",
    "English / ಕನ್ನಡ": "English / ಕನ್ನಡ",
    
    // Support Dashboard
    "Help": "ಸಹಾಯ",
    "Raised": "ಎತ್ತಲಾಗಿದೆ",
    "Resolved": "ಬಗೆಹರಿಸಲಾಗಿದೆ",
    "Unresolved": "ಬಗೆಹರಿಸದ",
    "All": "ಎಲ್ಲಾ",
    "Open": "ತೆರೆದ",
    "ID": "ಗುರುತು",
    "Subject": "ವಿಷಯ",
    "Raised by": "ಎತ್ತಿದವರು",
    "Date": "ದಿನಾಂಕ",
    "Status": "ಸ್ಥಿತಿ",
    "No tickets found": "ಯಾವುದೇ ಟಿಕೆಟ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    "There are currently no tickets in the": "ಪ್ರಸ್ತುತ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಟಿಕೆಟ್‌ಗಳಿಲ್ಲ:",
    "category": "ವರ್ಗ",
    "Real data will be populated here soon.": "ನೈಜ ಡೇಟಾವನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಜನಪ್ರಿಯಗೊಳಿಸಲಾಗುವುದು.",
    
    // Consolidated Dashboard
    "Help Requests": "ಸಹಾಯ ವಿನಂತಿಗಳು",
    "Raised Tickets": "ರೈಸ್ಡ್ ಟಿಕೆಟ್‌ಗಳು",
    "City Operations Map": "ನಗರ ಕಾರ್ಯಾಚರಣೆಗಳ ನಕ್ಷೆ",
    
    // Map Scenarios
    "Road Closure": "ರಸ್ತೆ ಮುಚ್ಚುವಿಕೆ",
    "Construction": "ನಿರ್ಮಾಣ",
    "Flood": "ಪ್ರವಾಹ",
    "Bus Route": "ಬಸ್ ಮಾರ್ಗ",
    "Restriction": "ನಿರ್ಬಂಧ",
    "Festival": "ಹಬ್ಬ",

    // Map UI
    "Mysuru City Status": "ಮೈಸೂರು ನಗರದ ಸ್ಥಿತಿ",
    "Live": "ಲೈವ್",
    "Last updated": "ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ",
    "Road Blocks": "ರಸ್ತೆ ತಡೆಗಳು",
    "Active Alerts": "ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳು",
    "Construction Zones": "ನಿರ್ಮಾಣ ವಲಯಗಳು",
    "Events": "ಕಾರ್ಯಕ್ರಮಗಳು",
    "No active alerts for this category.": "ಈ ವರ್ಗಕ್ಕೆ ಯಾವುದೇ ಸಕ್ರಿಯ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ."
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedMsg = localStorage.getItem('muip_dashboard_lang');
    if (savedMsg === 'kn') setLanguage('kn');
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'kn' : 'en';
    setLanguage(newLang);
    localStorage.setItem('muip_dashboard_lang', newLang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
