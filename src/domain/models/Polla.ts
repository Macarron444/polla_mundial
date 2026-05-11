import { IPolla, IReglaPuntuacion, IParticipacionPolla } from '../interfaces'
import { EstadoPolla, VisibilidadPolla, RolPolla } from '../enums'

export class Polla implements IPolla {
    id: number
    nombre: string
    enlaceInvitacion: string
    visibilidad: VisibilidadPolla
    estado: EstadoPolla
    fechaCreacion: Date
    reglasBlockeadas: boolean
    private reglasPuntuacion: IReglaPuntuacion
    private participantes: Map<number, IParticipacionPolla>

    constructor(data: IPolla, reglas?: IReglaPuntuacion) {
        this.id = data.id
        this.nombre = data.nombre
        this.enlaceInvitacion = data.enlaceInvitacion
        this.visibilidad = data.visibilidad
        this.estado = data.estado
        this.fechaCreacion = data.fechaCreacion
        this.reglasBlockeadas = data.reglasBlockeadas
        this.reglasPuntuacion = reglas || Polla.getReglasDefault()
        this.participantes = new Map()
    }

    /** RF-12 — Obtiene las reglas de puntuacion por defecto. */
    private static getReglasDefault(): IReglaPuntuacion {
        return {
            puntosExacto: 3,
            puntosResultadoCorrecto: 1,
            puntosFallo: 0,
            bonusPrediccionGlobal: 5,
            bloqueada: false,
        }
    }

    /** RF-12 — Actualiza las reglas de puntuacion si no estan bloqueadas. */
    actualizarReglas(reglas: Partial<IReglaPuntuacion>): void {
        if (this.reglasBlockeadas) {
            throw new Error('Las reglas de puntuacion estan bloqueadas')
        }
        this.reglasPuntuacion = { ...this.reglasPuntuacion, ...reglas }
    }

    /** RF-12 — Bloquea las reglas de puntuacion. */
    bloquearReglas(): void {
        this.reglasBlockeadas = true
        this.reglasPuntuacion.bloqueada = true
    }

    /** RF-02 — Obtiene las reglas de puntuacion. */
    obtenerReglas(): IReglaPuntuacion {
        return { ...this.reglasPuntuacion }
    }

    /** RF-10 — Cierra la polla (no se pueden hacer mas predicciones). */
    cerrar(): void {
        if (this.estado === EstadoPolla.CERRADA) {
            throw new Error('La polla ya esta cerrada')
        }
        this.estado = EstadoPolla.CERRADA
    }

    /** RF-10 — Archiva la polla. */
    archivar(): void {
        this.estado = EstadoPolla.ARCHIVADA
    }

    /** RF-17 — Agrega un participante a la polla. */
    agregarParticipante(usuarioId: number, rol: RolPolla = RolPolla.PARTICIPANTE): IParticipacionPolla {
        if (this.participantes.has(usuarioId)) {
            throw new Error('El usuario ya es participante de esta polla')
        }
        const participacion: IParticipacionPolla = {
            usuarioId,
            pollaId: this.id,
            rol,
            fechaUnion: new Date(),
            puntajeTotal: 0,
            posicionRanking: this.participantes.size + 1,
        }
        this.participantes.set(usuarioId, participacion)
        return participacion
    }

    /** RF-17 — Elimina un participante de la polla. */
    eliminarParticipante(usuarioId: number): void {
        const participacion = this.participantes.get(usuarioId)
        if (!participacion) {
            throw new Error('El usuario no es participante de esta polla')
        }
        if (participacion.rol === RolPolla.CREADOR) {
            throw new Error('No se puede eliminar al CREADOR de la polla')
        }
        this.participantes.delete(usuarioId)
    }

    /** RF-17 — Obtiene un participante por usuario ID. */
    obtenerParticipante(usuarioId: number): IParticipacionPolla | undefined {
        return this.participantes.get(usuarioId)
    }

    /** RF-17 — Obtiene todos los participantes ordenados por puntaje. */
    obtenerParticipantes(): IParticipacionPolla[] {
        return Array.from(this.participantes.values()).sort((a, b) => b.puntajeTotal - a.puntajeTotal)
    }

    /** RF-03 — Verifica si la polla es publica. */
    esPublica(): boolean {
        return this.visibilidad === VisibilidadPolla.PUBLICA
    }

    toJSON(): IPolla {
        return {
            id: this.id,
            nombre: this.nombre,
            enlaceInvitacion: this.enlaceInvitacion,
            visibilidad: this.visibilidad,
            estado: this.estado,
            fechaCreacion: this.fechaCreacion,
            reglasBlockeadas: this.reglasBlockeadas,
        }
    }
}
