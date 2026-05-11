import { IPrediccion } from '../interfaces'
import { EstadoPrediccion } from '../enums'

export class Prediccion implements IPrediccion {
    id: number
    usuarioId: number
    partidoId: number
    pollaId: number
    golesLocalPredicho: number
    golesVisitantePredicho: number
    equipoClasificadoId?: number
    estado: EstadoPrediccion
    puntosObtenidos: number

    constructor(data: IPrediccion) {
        this.id = data.id
        this.usuarioId = data.usuarioId
        this.partidoId = data.partidoId
        this.pollaId = data.pollaId
        this.golesLocalPredicho = data.golesLocalPredicho
        this.golesVisitantePredicho = data.golesVisitantePredicho
        this.equipoClasificadoId = data.equipoClasificadoId
        this.estado = data.estado
        this.puntosObtenidos = data.puntosObtenidos
    }

    /** RF-04 — Evalua la prediccion contra el resultado real. */
    evaluar(golesLocalReal: number, golesVisitanteReal: number, puntosExacto: number, puntosResultado: number): void {
        if (this.golesLocalPredicho === golesLocalReal && this.golesVisitantePredicho === golesVisitanteReal) {
            this.estado = EstadoPrediccion.EXACTA
            this.puntosObtenidos = puntosExacto
        } else if (this.obtenerGanadorPredicho() === this.obtenerGanadorReal(golesLocalReal, golesVisitanteReal)) {
            this.estado = EstadoPrediccion.CORRECTA
            this.puntosObtenidos = puntosResultado
        } else {
            this.estado = EstadoPrediccion.FALLIDA
            this.puntosObtenidos = 0
        }
    }

    /** RF-04 — Obtiene el ganador predicho (0=empate, 1=local, 2=visitante). */
    obtenerGanadorPredicho(): number {
        if (this.golesLocalPredicho > this.golesVisitantePredicho) return 1
        if (this.golesVisitantePredicho > this.golesLocalPredicho) return 2
        return 0
    }

    /** RF-04 — Obtiene el ganador real basado en goles. */
    private obtenerGanadorReal(golesLocalReal: number, golesVisitanteReal: number): number {
        if (golesLocalReal > golesVisitanteReal) return 1
        if (golesVisitanteReal > golesLocalReal) return 2
        return 0
    }

    /** RF-04 — Verifica si la prediccion esta finalizada. */
    estaFinalizada(): boolean {
        return this.estado !== EstadoPrediccion.PENDIENTE
    }

    toJSON(): IPrediccion {
        return {
            id: this.id,
            usuarioId: this.usuarioId,
            partidoId: this.partidoId,
            pollaId: this.pollaId,
            golesLocalPredicho: this.golesLocalPredicho,
            golesVisitantePredicho: this.golesVisitantePredicho,
            equipoClasificadoId: this.equipoClasificadoId,
            estado: this.estado,
            puntosObtenidos: this.puntosObtenidos,
        }
    }
}
