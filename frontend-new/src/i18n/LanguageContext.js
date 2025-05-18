import React, { createContext, useState, useContext } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext({
    lang: 'zh',
    setLang: () => {},
    t: translations['zh'], // 当前语言的文本资源
});

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('zh');
    const t = translations[lang] || translations['zh'];
    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
