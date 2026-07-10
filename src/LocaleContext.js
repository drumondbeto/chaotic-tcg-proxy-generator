import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext(null);

export const LocaleProvider = ({ children, defaultLocale = 'pt' }) => {
  const [locale, setLocale] = useState(defaultLocale);
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return ctx;
};

export default LocaleContext;
