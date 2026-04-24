import { Polla } from "./Polla";
import { IPolla, IReglaPuntuacion, IParticipacionPolla } from "./Interfaces";
import { EstadoPolla, VisibilidadPolla, RolPolla } from "./enums";

export class PollaService {
  private static db = new Map<number, IPolla>();
  private static reglas = new Map<number, IReglaPuntuacion>();
  private static participaciones = new Map<string, IParticipacionPolla>();
  private static nextId = 1;

  /**
   * RF-02 — Crea una nueva polla.
   */
  static crearPolla(
    nombre: string,
    visibilidad: VisibilidadPolla,
    reglasCustom?: Partial<IReglaPuntuacion>
  ): Polla {
    const enlace = this.generarEnlaceInvitacion();
    const reglasDefault = this.getReglasDefault();
    const reglas = { ...reglasDefault, ...reglasCustom };

    const data: IPolla = {
      id: this.nextId,
      nombre,
      enlaceInvitacion: enlace,
      visibilidad,
      estado: EstadoPolla.ACTIVA,
      fechaCreacion: new Date(),
      reglasBlockeadas: false,
    };

    this.db.set(data.id, data);
    this.reglas.set(data.id, reglas);
    this.nextId++;

    return new Polla(data, reglas);
  }

  /**
   * RF-02 — Obtiene una polla por id.
   */
  static obtenerPolla(id: number): Polla | null {
    const data = this.db.get(id);
    if (!data) return null;
    const reglas = this.reglas.get(id) || this.getReglasDefault();
    return new Polla(data, reglas);
  }

  /**
   * RF-02 — Obtiene todas las pollas públicas.
   */
  static obtenerPollasPublicas(): Polla[] {
    return Array.from(this.db.values())
      .filter(p => p.visibilidad === VisibilidadPolla.PUBLICA)
      .map(p => {
        const reglas = this.reglas.get(p.id) || this.getReglasDefault();
        return new Polla(p, reglas);
      });
  }

  /**
   * RF-02 — Obtiene una polla por enlace de invitación.
   */
  static obtenerPollaPorEnlace(enlace: string): Polla | null {
    const data = Array.from(this.db.values()).find(p => p.enlaceInvitacion === enlace);
    if (!data) return null;
    const reglas = this.reglas.get(data.id) || this.getReglasDefault();
    return new Polla(data, reglas);
  }

  /**
   * RF-03 / RF-17 — Agrega un usuario a una polla.
   * Equivalente dashboard: agregarUsuario() en TabRanking
   */
  static agregarParticipante(
    pollaId: number,
    usuarioId: number,
    rol: RolPolla = RolPolla.PARTICIPANTE
  ): IParticipacionPolla {
    const polla = this.obtenerPolla(pollaId);
    if (!polla) throw new Error(`Polla ${pollaId} no encontrada.`);

    const participacion = polla.agregarParticipante(usuarioId, rol);
    const key = `${pollaId}-${usuarioId}`;
    this.participaciones.set(key, participacion);

    return participacion;
  }

  /**
   * RF-03 / RF-17 — Elimina un participante de una polla.
   * No permite eliminar al CREADOR (validado en Polla.eliminarParticipante).
   * Equivalente dashboard: eliminarUsuario() en TabRanking
   */
  static eliminarParticipante(pollaId: number, usuarioId: number): void {
    const polla = this.obtenerPolla(pollaId);
    if (!polla) throw new Error(`Polla ${pollaId} no encontrada.`);

    polla.eliminarParticipante(usuarioId);
    const key = `${pollaId}-${usuarioId}`;
    this.participaciones.delete(key);
  }

  /**
   * RF-17 — Obtiene los participantes de una polla.
   */
  static obtenerParticipantes(pollaId: number): IParticipacionPolla[] {
    const polla = this.obtenerPolla(pollaId);
    if (!polla) throw new Error(`Polla ${pollaId} no encontrada.`);
    return polla.obtenerParticipantes();
  }

  /**
   * RF-12 — Actualiza las reglas de una polla.
   */
  static actualizarReglas(pollaId: number, reglas: Partial<IReglaPuntuacion>): IReglaPuntuacion {
    const polla = this.obtenerPolla(pollaId);
    if (!polla) throw new Error(`Polla ${pollaId} no encontrada.`);

    polla.actualizarReglas(reglas);
    const reglasActuales = this.reglas.get(pollaId) || this.getReglasDefault();
    const reglasActualizadas: IReglaPuntuacion = { ...reglasActuales, ...reglas };
    this.reglas.set(pollaId, reglasActualizadas);

    return reglasActualizadas;
  }

  /**
   * RF-10 — Cierra una polla.
   */
  static cerrarPolla(id: number): Polla {
    const polla = this.obtenerPolla(id);
    if (!polla) throw new Error(`Polla ${id} no encontrada.`);
    polla.cerrar();
    this.db.set(id, polla.toJSON());
    return polla;
  }

  /**
   * RF-10 — Archiva una polla.
   */
  static archivarPolla(id: number): Polla {
    const polla = this.obtenerPolla(id);
    if (!polla) throw new Error(`Polla ${id} no encontrada.`);
    polla.archivar();
    this.db.set(id, polla.toJSON());
    return polla;
  }

  /**
   * Genera un enlace único de invitación.
   */
  private static generarEnlaceInvitacion(): string {
    return `polla_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene las reglas de puntuación por defecto.
   */
  private static getReglasDefault(): IReglaPuntuacion {
    return {
      puntosExacto: 3,
      puntosResultadoCorrecto: 1,
      puntosFallo: 0,
      bonusPrediccionGlobal: 5,
      bloqueada: false,
    };
  }
}
