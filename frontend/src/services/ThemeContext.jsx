import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)

export function ThemeProvider({ children, initialTheme = 'dark' }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
