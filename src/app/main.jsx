import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '../shared/styles/styles.css'

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registrado con exito:', registration.scope)
            })
            .catch((error) => {
                console.error('Error al registrar Service Worker:', error)
            })
    })
}
