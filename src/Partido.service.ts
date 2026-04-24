import { Partido } from "./Partido";
import { Equipo } from "./Equipo";
import { IPartido, IEquipo } from "./Interfaces";
import { EstadoPartido, FasePartido } from "./enums";

export class PartidoService {
  private static db = new Map<number, IPartido>();
  private static equipos = new Map<number, IEquipo>();
  private static nextId = 1;

  /**
   * RF-05 — Registra un nuevo equipo en la base de datos.
   */
  static registrarEquipo(equipo: IEquipo): Equipo {
    this.equipos.set(equipo.id, equipo);
    return new Equipo(equipo);
  }

  /**
   * RF-05 — Obtiene un equipo por id.
   */
  static obtenerEquipo(id: number): Equipo | null {
    const data = this.equipos.get(id);
    return data ? new Equipo(data) : null;
  }

  /**
   * RF-05 — Obtiene todos los equipos de un grupo.
   */
  static obtenerEquiposPorGrupo(grupo: string): Equipo[] {
    return Array.from(this.equipos.values())
      .filter(e => e.grupo === grupo)
      .map(e => new Equipo(e));
  }

  /**
   * RF-15 — Crea un nuevo partido.
   */
  static crearPartido(
    equipoLocalId: number,
    equipoVisitanteId: number,
    fechaHora: Date,
    fase: FasePartido
  ): Partido {
    const data: IPartido = {
      id: this.nextId++,
      equipoLocalId,
      equipoVisitanteId,
      golesLocal: null,
      golesVisitante: null,
      fechaHora,
      estado: EstadoPartido.PROGRAMADO,
      fase,
    };
    this.db.set(data.id, data);
    return new Partido(data);
  }

  /**
   * RF-15 — Obtiene un partido por id.
   */
  static obtenerPartido(id: number): Partido | null {
    const data = this.db.get(id);
    return data ? new Partido(data) : null;
  }

  /**
   * RF-15 — Obtiene todos los partidos.
   */
  static obtenerTodosPartidos(): Partido[] {
    return Array.from(this.db.values()).map(p => new Partido(p));
  }

  /**
   * RF-15 — Obtiene partidos por fase.
   */
  static obtenerPartidosPorFase(fase: FasePartido): Partido[] {
    return Array.from(this.db.values())
      .filter(p => p.fase === fase)
      .map(p => new Partido(p));
  }

  /**
   * RF-15 — Obtiene partidos por estado.
   */
  static obtenerPartidosPorEstado(estado: EstadoPartido): Partido[] {
    return Array.from(this.db.values())
      .filter(p => p.estado === estado)
      .map(p => new Partido(p));
  }

  /**
   * RF-15 — Actualiza el resultado de un partido.
   */
  static registrarResultado(id: number, golesLocal: number, golesVisitante: number): Partido {
    const data = this.db.get(id);
    if (!data) throw new Error(`Partido ${id} no encontrado.`);
    
    const partido = new Partido(data);
    partido.registrarResultado(golesLocal, golesVisitante);
    
    this.db.set(id, partido.toJSON());
    return partido;
  }
}
