import { IPrediccionGlobal } from '../interfaces'

export class PrediccionGlobal implements IPrediccionGlobal {
    id: number
    usuarioId: number
    pollaId: number
    campeonId?: number
    subcampeonId?: number
    maxGoleador: string
    bloqueada: boolean
    puntosObtenidos: number

    constructor(data: IPrediccionGlobal) {
        this.id = data.id
        this.usuarioId = data.usuarioId
        this.pollaId = data.pollaId
        this.campeonId = data.campeonId
        this.subcampeonId = data.subcampeonId
        this.maxGoleador = data.maxGoleador
        this.bloqueada = data.bloqueada
        this.puntosObtenidos = data.puntosObtenidos
    }

    /** RF-14 — Bloquea la prediccion global (no se puede modificar). */
    bloquear(): void {
        this.bloqueada = true
    }

    /** RF-14 — Desbloquea la prediccion global. */
    desbloquear(): void {
        this.bloqueada = false
    }

    /** RF-14 — Actualiza la prediccion si no esta bloqueada. */
    actualizar(campeonId?: number, subcampeonId?: number, maxGoleador?: string): void {
        if (this.bloqueada) {
            throw new Error('La prediccion global esta bloqueada')
        }
        if (campeonId !== undefined) this.campeonId = campeonId
        if (subcampeonId !== undefined) this.subcampeonId = subcampeonId
        if (maxGoleador !== undefined) this.maxGoleador = maxGoleador
    }

    /** RF-14 — Verifica si la prediccion esta completa. */
    estaCompleta(): boolean {
        return this.campeonId !== undefined && this.subcampeonId !== undefined && this.maxGoleador.length > 0
    }

    toJSON(): IPrediccionGlobal {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            pollaId: this.pollaId,
            campeonId: this.campeonId,
            subcampeonId: this.subcampeonId,
            maxGoleador: this.maxGoleador,
            bloqueada: this.bloqueada,
            puntosObtenidos: this.puntosObtenidos,
        }
    }
}
