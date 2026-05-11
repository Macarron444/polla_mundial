import { Notificacion } from '../models/Notificacion'
import { INotificacion } from '../interfaces'
import { TipoNotificacion } from '../enums'

export class NotificacionService {
    private static notificaciones = new Map<number, INotificacion>()
    private static nextId = 1

    /** RF-09 — Crea y envia una notificacion. */
    static crearNotificacion(
        usuarioId: number,
        mensaje: string,
        tipo: TipoNotificacion = TipoNotificacion.IN_APP
    ): Notificacion {
        const data: INotificacion = {
            id: this.nextId++,
            usuarioId,
            mensaje,
            tipo,
            leida: false,
            fechaEnvio: new Date(),
        }
        this.notificaciones.set(data.id, data)
        return new Notificacion(data)
    }

    /** RF-09 — Obtiene una notificacion por id. */
    static obtenerNotificacion(id: number): Notificacion | null {
        const data = this.notificaciones.get(id)
        return data ? new Notificacion(data) : null
    }

    /** RF-09 — Obtiene todas las notificaciones de un usuario. */
    static obtenerNotificacionesUsuario(usuarioId: number): Notificacion[] {
        return Array.from(this.notificaciones.values())
            .filter((n) => n.usuarioId === usuarioId)
            .map((n) => new Notificacion(n))
            .sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
    }

    /** RF-09 — Obtiene notificaciones no leidas de un usuario. */
    static obtenerNotificacionesNoLeidas(usuarioId: number): Notificacion[] {
        return Array.from(this.notificaciones.values())
            .filter((n) => n.usuarioId === usuarioId && !n.leida)
            .map((n) => new Notificacion(n))
            .sort((a, b) => b.fechaEnvio.getTime() - a.fechaEnvio.getTime())
    }

    /** RF-09 — Obtiene notificaciones de un tipo especifico. */
    static obtenerNotificacionesPorTipo(usuarioId: number, tipo: TipoNotificacion): Notificacion[] {
        return Array.from(this.notificaciones.values())
            .filter((n) => n.usuarioId === usuarioId && n.tipo === tipo)
            .map((n) => new Notificacion(n))
    }

    /** RF-09 — Marca una notificacion como leida. */
    static marcarComoLeida(id: number): Notificacion {
        const data = this.notificaciones.get(id)
        if (!data) throw new Error(`Notificacion ${id} no encontrada.`)

        const notificacion = new Notificacion(data)
        notificacion.marcarComoLeida()

        this.notificaciones.set(id, notificacion.toJSON())
        return notificacion
    }

    /** RF-09 — Marca todas las notificaciones de un usuario como leidas. */
    static marcarTodasComoLeidas(usuarioId: number): void {
        for (const [id, data] of this.notificaciones.entries()) {
            if (data.usuarioId === usuarioId && !data.leida) {
                const notificacion = new Notificacion(data)
                notificacion.marcarComoLeida()
                this.notificaciones.set(id, notificacion.toJSON())
            }
        }
    }

    /** RF-09 — Elimina una notificacion. */
    static eliminarNotificacion(id: number): void {
        this.notificaciones.delete(id)
    }

    /** RF-09 — Elimina todas las notificaciones leidas de un usuario. */
    static eliminarNotificacionesLeidas(usuarioId: number): void {
        for (const [id, data] of this.notificaciones.entries()) {
            if (data.usuarioId === usuarioId && data.leida) {
                this.notificaciones.delete(id)
            }
        }
    }

    /** RF-09 — Obtiene el conteo de notificaciones no leidas. */
    static obtenerContenoLeidas(usuarioId: number): number {
        return Array.from(this.notificaciones.values()).filter(
            (n) => n.usuarioId === usuarioId && !n.leida
        ).length
    }
}
