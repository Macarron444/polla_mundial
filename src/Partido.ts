import { IPartido } from "./Interfaces";
import { EstadoPartido, FasePartido } from "./enums";

export class Partido implements IPartido {
  id: number;
  equipoLocalId: number;
  equipoVisitanteId: number;
  golesLocal: number | null;
  golesVisitante: number | null;
  fechaHora: Date;
  estado: EstadoPartido;
  fase: FasePartido;

  constructor(data: IPartido) {
    this.id = data.id;
    this.equipoLocalId = data.equipoLocalId;
    this.equipoVisitanteId = data.equipoVisitanteId;
    this.golesLocal = data.golesLocal;
    this.golesVisitante = data.golesVisitante;
    this.fechaHora = data.fechaHora;
    this.estado = data.estado;
    this.fase = data.fase;
  }

  /**
   * RF-15 — Avanza el estado del partido en el ciclo de vida.
   * PROGRAMADO → EN_CURSO → FINALIZADO
   */
  avanzarEstado(): void {
    const ciclo = [EstadoPartido.PROGRAMADO, EstadoPartido.EN_CURSO, EstadoPartido.FINALIZADO];
    const idx = ciclo.indexOf(this.estado);
    if (idx >= 0 && idx < ciclo.length - 1) {
      this.estado = ciclo[idx + 1];
    }
  }

  /**
   * RF-15 — Registra el resultado final del partido.
   */
  registrarResultado(golesLocal: number, golesVisitante: number): void {
    if (this.estado !== EstadoPartido.EN_CURSO) {
      throw new Error("Solo se puede registrar resultado en partidos EN_CURSO");
    }
    this.golesLocal = golesLocal;
    this.golesVisitante = golesVisitante;
    this.estado = EstadoPartido.FINALIZADO;
  }

  /**
   * RF-15 — Verifica si el partido ha finalizado.
   */
  estaFinalizado(): boolean {
    return this.estado === EstadoPartido.FINALIZADO;
  }

  /**
   * RF-15 — Obtiene el ganador del partido (0=empate, 1=local, 2=visitante).
   */
  obtenerGanador(): number | null {
    if (this.golesLocal === null || this.golesVisitante === null) {
      return null;
    }
    if (this.golesLocal > this.golesVisitante) return 1;
    if (this.golesVisitante > this.golesLocal) return 2;
    return 0; // empate
  }

  toJSON(): IPartido {
    return {
      id: this.id,
      equipoLocalId: this.equipoLocalId,
      equipoVisitanteId: this.equipoVisitanteId,
      golesLocal: this.golesLocal,
      golesVisitante: this.golesVisitante,
      fechaHora: this.fechaHora,
      estado: this.estado,
      fase: this.fase,
    };
  }
}
