import React, { createContext, useContext, useMemo, useState } from 'react';
import { UserRole } from '../types';

const ThemeContext = createContext<{
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}>({
  userRole: UserRole.TRADER,
  setUserRole: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.TRADER);

  const value = useMemo(() => ({ userRole, setUserRole }), [userRole]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
