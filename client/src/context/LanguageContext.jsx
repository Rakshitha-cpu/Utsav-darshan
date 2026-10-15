import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brandSubtitle: "Discover The Culture Around You",
    exploreEvents: "Explore Events",
    culturalCalendar: "Cultural Calendar",
    cities: "Cities",
    shareFestival: "Share Festival",
    adminModeration: "Admin Moderation",
    signIn: "Sign In",
    joinCommunity: "Join Community",
    signOut: "Sign Out",
    searchPlaceholder: "Search festivals by name, rituals, or location...",
    printCalendar: "Print City Calendar",
    addToCalendar: "Add to Google Calendar",
    downloadIcs: "Download .ics Reminder",
    aiRecommendations: "AI Cultural Recommendations",
    tourismIntegration: "State Tourism Partner",
    userReviews: "Community Reviews & Visitor Photos"
  },
  kn: {
    brandSubtitle: "ನಿಮ್ಮ ಸುತ್ತಲಿನ ಸಂಸ್ಕೃತಿಯನ್ನು ಅನ್ವೇಷಿಸಿ",
    exploreEvents: "ಹಬ್ಬಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    culturalCalendar: "ಸಾಂಸ್ಕೃತಿಕ ಕ್ಯಾಲೆಂಡರ್",
    cities: "ನಗರಗಳು",
    shareFestival: "ಹಬ್ಬವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    adminModeration: "ನಿರ್ವಾಹಕರ ಪರಿಶೀಲನೆ",
    signIn: "ಲಾಗಿನ್ ಆಗಿ",
    joinCommunity: "ಸಮುದಾಯ ಸೇರಿ",
    signOut: "ಲಾಗ್ ಔಟ್",
    searchPlaceholder: "ಹಬ್ಬ, ವಿಧಿವಿಧಾನ ಅಥವಾ ಸ್ಥಳದ ಹೆಸರು ಹುಡುಕಿ...",
    printCalendar: "ಕ್ಯಾಲೆಂಡರ್ ಮುದ್ರಿಸಿ (PDF)",
    addToCalendar: "ಗೂಗಲ್ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
    downloadIcs: ".ics ರಿಮೈಂಡರ್ ಡೌನ್‌ಲೋಡ್",
    aiRecommendations: "AI ಸಾಂಸ್ಕೃತಿಕ ಶಿಫಾರಸುಗಳು",
    tourismIntegration: "ರಾಜ್ಯ ಪ್ರವಾಸೋದ್ಯಮ ಪಾಲುದಾರಿಕೆ",
    userReviews: "ಸಮುದಾಯದ ವಿಮರ್ಶೆಗಳು ಮತ್ತು ಫೋಟೋಗಳು"
  },
  hi: {
    brandSubtitle: "अपने आस-पास की संस्कृति को जानें",
    exploreEvents: "उत्सव देखें",
    culturalCalendar: "सांस्कृतिक कैलेंडर",
    cities: "शहर",
    shareFestival: "उत्सव जोड़ें",
    adminModeration: "प्रशासन समीक्षा",
    signIn: "लॉग इन",
    joinCommunity: "समुदाय से जुड़ें",
    signOut: "साइन आउट",
    searchPlaceholder: "उत्सव, अनुष्ठान या शहर खोजें...",
    printCalendar: "कैलेंडर प्रिंट करें",
    addToCalendar: "गूगल कैलेंडर में जोड़ें",
    downloadIcs: ".ics रिमाइंडर डाउनलोड",
    aiRecommendations: "AI सांस्कृतिक सुझाव",
    tourismIntegration: "पर्यटन विभाग सहयोग",
    userReviews: "समीक्षाएं और तस्वीरें"
  },
  ta: {
    brandSubtitle: "உங்களைச் சுற்றியுள்ள கலாச்சாரத்தை அறியுங்கள்",
    exploreEvents: "திருவிழாக்களை ஆராய்க",
    culturalCalendar: "கலாச்சார நாட்காட்டி",
    cities: "நகரங்கள்",
    shareFestival: "திருவிழாவை சேர்க்க",
    adminModeration: "நிர்வாகி மதிப்பாய்வு",
    signIn: "உள்நுழைக",
    joinCommunity: "இணையுங்கள்",
    signOut: "வெளியேறுக",
    searchPlaceholder: "திருவிழாக்கள், சடங்குகளைத் தேடுக...",
    printCalendar: "நாட்காட்டியை அச்சிடுக",
    addToCalendar: "Google காலெண்டரில் சேர்க்கவும்",
    downloadIcs: ".ics நினைவூட்டல்",
    aiRecommendations: "AI கலாச்சார பரிந்துரைகள்",
    tourismIntegration: "சுற்றுலாத்துறை கூட்டாண்மை",
    userReviews: "கருத்துகள் & புகைப்படங்கள்"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('utsav_lang') || 'en');

  const setLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('utsav_lang', newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, availableLanguages: [
      { code: 'en', label: 'English' },
      { code: 'kn', label: 'ಕನ್ನಡ' },
      { code: 'hi', label: 'हिंदी' },
      { code: 'ta', label: 'தமிழ்' }
    ] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
