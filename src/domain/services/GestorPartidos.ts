import { Partido } from '../models/Partido'
import { Equipo } from '../models/Equipo'
import { IPartido, IEquipo } from '../interfaces'
import { EstadoPartido, FasePartido } from '../enums'

export class GestorPartidos {
    private partidos: Map<number, IPartido> = new Map()
    private equipos: Map<number, IEquipo> = new Map()
    private nextPartidoId: number = 1

    constructor() {
        this.inicializarPartidos()
    }

    private inicializarPartidos(): void {
        const equiposData: IEquipo[] = [
            { id: 1, nombre: 'Argentina', grupo: 'A', codigoPais: 'ARG', flag: '🇦🇷' },
            { id: 2, nombre: 'Francia', grupo: 'A', codigoPais: 'FRA', flag: '🇫🇷' },
            { id: 3, nombre: 'Brasil', grupo: 'B', codigoPais: 'BRA', flag: '🇧🇷' },
            { id: 4, nombre: 'Espana', grupo: 'B', codigoPais: 'ESP', flag: '🇪🇸' },
            { id: 5, nombre: 'Alemania', grupo: 'C', codigoPais: 'ALE', flag: '🇩🇪' },
            { id: 6, nombre: 'Portugal', grupo: 'C', codigoPais: 'POR', flag: '🇵🇹' },
            { id: 7, nombre: 'Inglaterra', grupo: 'D', codigoPais: 'ING', flag: '🏴' },
            { id: 8, nombre: 'Mexico', grupo: 'D', codigoPais: 'MEX', flag: '🇲🇽' },
        ]

        equiposData.forEach((e) => this.equipos.set(e.id, e))

        const partidosData: IPartido[] = [
            {
                id: 1,
                equipoLocalId: 1,
                equipoVisitanteId: 2,
                golesLocal: null,
                golesVisitante: null,
                fechaHora: new Date('2026-06-11T18:00:00'),
                estado: EstadoPartido.PROGRAMADO,
                fase: FasePartido.GRUPOS,
            },
            {
                id: 2,
                equipoLocalId: 3,
                equipoVisitanteId: 4,
                golesLocal: 2,
                golesVisitante: 1,
                fechaHora: new Date('2026-06-11T21:00:00'),
                estado: EstadoPartido.FINALIZADO,
                fase: FasePartido.GRUPOS,
            },
            {
                id: 3,
                equipoLocalId: 5,
                equipoVisitanteId: 6,
                golesLocal: null,
                golesVisitante: null,
                fechaHora: new Date('2026-06-12T18:00:00'),
                estado: EstadoPartido.EN_CURSO,
                fase: FasePartido.GRUPOS,
            },
            {
                id: 4,
                equipoLocalId: 7,
                equipoVisitanteId: 8,
                golesLocal: null,
                golesVisitante: null,
                fechaHora: new Date('2026-06-12T21:00:00'),
                estado: EstadoPartido.PROGRAMADO,
                fase: FasePartido.OCTAVOS,
            },
        ]

        partidosData.forEach((p) => {
            this.partidos.set(p.id, p)
            this.nextPartidoId = Math.max(this.nextPartidoId, p.id + 1)
        })
    }

    agregarPartido(
        equipoLocalId: number,
        equipoVisitanteId: number,
        fechaHora: Date,
        fase: FasePartido = FasePartido.GRUPOS
    ): Partido {
        if (!this.equipos.has(equipoLocalId)) {
            throw new Error(`Equipo local ${equipoLocalId} no existe`)
        }
        if (!this.equipos.has(equipoVisitanteId)) {
            throw new Error(`Equipo visitante ${equipoVisitanteId} no existe`)
        }
        if (equipoLocalId === equipoVisitanteId) {
            throw new Error('Un equipo no puede jugar contra si mismo')
        }

        const nuevoPartido: IPartido = {
            id: this.nextPartidoId++,
            equipoLocalId,
            equipoVisitanteId,
            golesLocal: null,
            golesVisitante: null,
            fechaHora,
            estado: EstadoPartido.PROGRAMADO,
            fase,
        }

        this.partidos.set(nuevoPartido.id, nuevoPartido)
        return new Partido(nuevoPartido)
    }

    obtenerTodosPartidos(): Partido[] {
        return Array.from(this.partidos.values()).map((p) => new Partido(p))
    }

    obtenerPartidoPorId(id: number): Partido | null {
        const data = this.partidos.get(id)
        return data ? new Partido(data) : null
    }

    obtenerPartidosPorEquipo(equipoId: number): Partido[] {
        return Array.from(this.partidos.values())
            .filter((p) => p.equipoLocalId === equipoId || p.equipoVisitanteId === equipoId)
            .map((p) => new Partido(p))
    }

    obtenerPartidosPorEstado(estado: EstadoPartido): Partido[] {
        return Array.from(this.partidos.values())
            .filter((p) => p.estado === estado)
            .map((p) => new Partido(p))
    }

    obtenerPartidosPorFase(fase: FasePartido): Partido[] {
        return Array.from(this.partidos.values())
            .filter((p) => p.fase === fase)
            .map((p) => new Partido(p))
    }

    obtenerPartidosPorGrupo(grupo: string): Partido[] {
        return Array.from(this.partidos.values())
            .filter((p) => {
                const eqLocal = this.equipos.get(p.equipoLocalId)
                const eqVisitante = this.equipos.get(p.equipoVisitanteId)
                return eqLocal?.grupo === grupo || eqVisitante?.grupo === grupo
            })
            .map((p) => new Partido(p))
    }

    estaAbiertaApuesta(idPartido: number, minutosAntes: number = 15): boolean {
        const partido = this.partidos.get(idPartido)
        if (!partido) throw new Error(`Partido #${idPartido} no encontrado`)
        return new Partido(partido).estaDisponibleParaApuesta(minutosAntes)
    }

    editarResultado(idPartido: number, golesLocal: number, golesVisitante: number): Partido {
        const data = this.partidos.get(idPartido)
        if (!data) throw new Error(`Partido #${idPartido} no encontrado`)

        const partido = new Partido(data)
        partido.actualizarResultado(golesLocal, golesVisitante)
        this.partidos.set(idPartido, partido.toJSON())

        return partido
    }

    cambiarEstado(idPartido: number, nuevoEstado: EstadoPartido): Partido {
        const partido = this.partidos.get(idPartido)
        if (!partido) {
            throw new Error(`Partido #${idPartido} no encontrado`)
        }

        partido.estado = nuevoEstado
        return new Partido(partido)
    }

    eliminarPartido(idPartido: number): boolean {
        if (!this.partidos.has(idPartido)) {
            throw new Error(`Partido #${idPartido} no encontrado`)
        }
        this.partidos.delete(idPartido)
        return true
    }

    obtenerEstadisticas(): {
        total: number
        programados: number
        enCurso: number
        finalizados: number
        suspendidos: number
        pospuestos: number
    } {
        const total = this.partidos.size
        const programados = Array.from(this.partidos.values()).filter(
            (p) => p.estado === EstadoPartido.PROGRAMADO
        ).length
        const enCurso = Array.from(this.partidos.values()).filter(
            (p) => p.estado === EstadoPartido.EN_CURSO
        ).length
        const finalizados = Array.from(this.partidos.values()).filter(
            (p) => p.estado === EstadoPartido.FINALIZADO
        ).length
        const suspendidos = Array.from(this.partidos.values()).filter(
            (p) => p.estado === EstadoPartido.SUSPENDIDO
        ).length
        const pospuestos = Array.from(this.partidos.values()).filter(
            (p) => p.estado === EstadoPartido.POSPUESTO
        ).length

        return { total, programados, enCurso, finalizados, suspendidos, pospuestos }
    }

    obtenerPartidosOrdenados(ascendente: boolean = true): Partido[] {
        const partidos = Array.from(this.partidos.values())
        partidos.sort((a, b) => {
            const diff = a.fechaHora.getTime() - b.fechaHora.getTime()
            return ascendente ? diff : -diff
        })
        return partidos.map((p) => new Partido(p))
    }

    obtenerProximoPartido(): Partido | null {
        const ahora = new Date()
        const futuros = Array.from(this.partidos.values()).filter(
            (p) => p.fechaHora > ahora && p.estado === EstadoPartido.PROGRAMADO
        )
        if (futuros.length === 0) return null
        futuros.sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())
        return new Partido(futuros[0])
    }

    registrarEquipo(equipo: IEquipo): Equipo {
        this.equipos.set(equipo.id, equipo)
        return new Equipo(equipo)
    }

    obtenerTodosEquipos(): Equipo[] {
        return Array.from(this.equipos.values()).map((e) => new Equipo(e))
    }
}
