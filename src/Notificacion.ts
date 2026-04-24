import { INotificacion } from "./Interfaces";
import { TipoNotificacion } from "./enums";

export class Notificacion implements INotificacion {
  id: number;
  usuarioId: number;
  mensaje: string;
  tipo: TipoNotificacion;
  leida: boolean;
  fechaEnvio: Date;

  constructor(data: INotificacion) {
    this.id = data.id;
    this.usuarioId = data.usuarioId;
    this.mensaje = data.mensaje;
    this.tipo = data.tipo;
    this.leida = data.leida;
    this.fechaEnvio = data.fechaEnvio;
  }

  /**
   * RF-09 — Marca la notificación como leída.
   */
  marcarComoLeida(): void {
    this.leida = true;
  }

  /**
   * RF-09 — Marca la notificación como no leída.
   */
  marcarComoNoLeida(): void {
    this.leida = false;
  }

  /**
   * RF-09 — Verifica si la notificación es de tipo PUSH.
   */
  esPush(): boolean {
    return this.tipo === TipoNotificacion.PUSH;
  }

  /**
   * RF-09 — Verifica si la notificación es de tipo IN_APP.
   */
  esInApp(): boolean {
    return this.tipo === TipoNotificacion.IN_APP;
  }

  /**
   * RF-09 — Verifica si la notificación es de tipo EMAIL.
   */
  esEmail(): boolean {
    return this.tipo === TipoNotificacion.EMAIL;
  }

  /**
   * RF-09 — Obtiene el tiempo transcurrido desde el envío en segundos.
   */
  obtenerTiempoTranscurrido(): number {
    return Math.floor((new Date().getTime() - this.fechaEnvio.getTime()) / 1000);
  }

  toJSON(): INotificacion {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      mensaje: this.mensaje,
      tipo: this.tipo,
      leida: this.leida,
      fechaEnvio: this.fechaEnvio,
    };
  }
}
