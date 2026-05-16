import { createContext, useContext, useState, useCallback } from 'react';

const BannerContext = createContext();

export function BannerProvider({ children }) {
  const [banner, setBanner] = useState(null);

  const showBanner = useCallback((id, message, type = 'info', action = null) => {
    setBanner({ id, message, type, action });
  }, []);

  const hideBanner = useCallback(() => {
    setBanner(null);
  }, []);

  return (
    <BannerContext.Provider value={{ banner, showBanner, hideBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}
