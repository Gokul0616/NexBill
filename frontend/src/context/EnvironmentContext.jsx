import { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const EnvironmentContext = createContext();

export function EnvironmentProvider({ children }) {
  const { testMode, toggleTestMode } = useContext(AuthContext);
  const [environment, setEnvironment] = useState(testMode ? 'test' : 'live');

  useEffect(() => {
    setEnvironment(testMode ? 'test' : 'live');
  }, [testMode]);

  const value = {
    mode: environment,
    isTest: environment === 'test',
    isLive: environment === 'live',
    toggleMode: toggleTestMode,
    // Helper to format identifiers like ch_test_123 or ch_live_123
    formatId: (prefix, id) => `${prefix}_${environment}_${id}`,
  };

  return (
    <EnvironmentContext.Provider value={value}>
      <div className={environment === 'test' ? 'env-test-mode' : 'env-live-mode'}>
        {children}
      </div>
    </EnvironmentContext.Provider>
  );
}

export const useEnvironment = () => useContext(EnvironmentContext);
