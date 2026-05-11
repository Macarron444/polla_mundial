import { useEffect, useRef, useState } from 'react'

export function useOnlineStatus() {
    const [online, setOnline] = useState(navigator.onLine)
    const [toast, setToast] = useState(null)
    const isFirst = useRef(true)

    useEffect(() => {
        const goOnline = () => {
            setOnline(true)
            if (!isFirst.current) setToast({ msg: 'Conexion restaurada', type: 'online' })
        }
        const goOffline = () => {
            setOnline(false)
            setToast({ msg: 'Sin conexion — usando cache', type: 'offline' })
        }
        window.addEventListener('online', goOnline)
        window.addEventListener('offline', goOffline)
        isFirst.current = false
        return () => {
            window.removeEventListener('online', goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, [])

    useEffect(() => {
        if (!toast) return undefined
        const t = setTimeout(() => setToast(null), 3500)
        return () => clearTimeout(t)
    }, [toast])

    return { online, toast, dismissToast: () => setToast(null) }
}
