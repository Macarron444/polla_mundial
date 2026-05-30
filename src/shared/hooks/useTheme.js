import { useEffect, useState } from 'react'

const THEME_KEY = 'theme'

const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

const getStoredTheme = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(THEME_KEY)
}

const applyTheme = (theme) => {
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
    const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme())

    useEffect(() => {
        const stored = getStoredTheme()
        const initial = stored || getSystemTheme()
        setTheme(initial)
        applyTheme(initial)

        if (stored) return undefined

        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const handler = (event) => {
            const next = event.matches ? 'dark' : 'light'
            setTheme(next)
            applyTheme(next)
        }

        if (media.addEventListener) {
            media.addEventListener('change', handler)
        } else {
            media.addListener(handler)
        }

        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', handler)
            } else {
                media.removeListener(handler)
            }
        }
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        applyTheme(next)
        localStorage.setItem(THEME_KEY, next)
    }

    return { theme, toggleTheme }
}
