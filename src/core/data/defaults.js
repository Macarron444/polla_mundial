export const EQUIPOS_DEFAULT = [
    { id: 1, nombre: 'Argentina', grupo: 'A', flag: '🇦🇷' },
    { id: 2, nombre: 'Francia', grupo: 'A', flag: '🇫🇷' },
    { id: 3, nombre: 'Brasil', grupo: 'B', flag: '🇧🇷' },
    { id: 4, nombre: 'Espana', grupo: 'B', flag: '🇪🇸' },
    { id: 5, nombre: 'Alemania', grupo: 'C', flag: '🇩🇪' },
    { id: 6, nombre: 'Portugal', grupo: 'C', flag: '🇵🇹' },
    { id: 7, nombre: 'Inglaterra', grupo: 'D', flag: '🏴' },
    { id: 8, nombre: 'Mexico', grupo: 'D', flag: '🇲🇽' },
]

export const PARTIDOS_DEFAULT = [
    {
        id: 1,
        local: 1,
        visitante: 2,
        golesL: null,
        golesV: null,
        fecha: '11 Jun · 18:00',
        fechaISO: new Date(Date.now() + 20 * 60000).toISOString(),
        estado: 'PROGRAMADO',
        fase: 'GRUPOS',
    },
    {
        id: 2,
        local: 3,
        visitante: 4,
        golesL: 2,
        golesV: 1,
        fecha: '11 Jun · 21:00',
        fechaISO: new Date(Date.now() - 120 * 60000).toISOString(),
        estado: 'FINALIZADO',
        fase: 'GRUPOS',
    },
    {
        id: 3,
        local: 5,
        visitante: 6,
        golesL: null,
        golesV: null,
        fecha: '12 Jun · 18:00',
        fechaISO: new Date(Date.now() + 10 * 60000).toISOString(),
        estado: 'EN_CURSO',
        fase: 'GRUPOS',
    },
    {
        id: 4,
        local: 7,
        visitante: 8,
        golesL: null,
        golesV: null,
        fecha: '12 Jun · 21:00',
        fechaISO: new Date(Date.now() + 60 * 60000).toISOString(),
        estado: 'PROGRAMADO',
        fase: 'OCTAVOS',
    },
]

export const PARTICIPANTES_DEFAULT = [
    { id: 1, nombre: 'Sebastian M.', pts: 21, exactas: 3, correctas: 4, fallidas: 1, rol: 'CREADOR' },
    { id: 2, nombre: 'Valentina R.', pts: 18, exactas: 2, correctas: 5, fallidas: 2, rol: 'ADMINISTRADOR' },
    { id: 3, nombre: 'Camilo T.', pts: 18, exactas: 2, correctas: 4, fallidas: 3, rol: 'PARTICIPANTE' },
    { id: 4, nombre: 'Lucia P.', pts: 15, exactas: 1, correctas: 6, fallidas: 2, rol: 'PARTICIPANTE' },
    { id: 5, nombre: 'Andres B.', pts: 12, exactas: 1, correctas: 4, fallidas: 4, rol: 'PARTICIPANTE' },
]

export const PREDICCIONES_DEFAULT = [
    { partidoId: 2, golesL: 2, golesV: 0, estado: 'CORRECTA', pts: 1 },
    { partidoId: 3, golesL: 1, golesV: 2, estado: 'PENDIENTE', pts: 0 },
    { partidoId: 1, golesL: 1, golesV: 1, estado: 'PENDIENTE', pts: 0 },
]
