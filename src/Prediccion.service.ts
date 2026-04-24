import { Prediccion } from "./Prediccion";
import { PrediccionGlobal } from "./PrediccionGlobal";
import { IPrediccion, IPrediccionGlobal, IReglaPuntuacion } from "./Interfaces";
import { EstadoPrediccion } from "./enums";

export class PrediccionService {
  private static predicciones = new Map<number, IPrediccion>();
  private static prediccionesGlobales = new Map<number, IPrediccionGlobal>();
  private static nextId = 1;
  private static nextGlobalId = 1;

  /**
   * RF-04 — Crea una nueva predicción de partido.
   */
  static crearPrediccion(
    usuarioId: number,
    partidoId: number,
    pollaId: number,
    golesLocalPredicho: number,
    golesVisitantePredicho: number
  ): Prediccion {
    const data: IPrediccion = {
      id: this.nextId++,
      usuarioId,
      partidoId,
      pollaId,
      golesLocalPredicho,
      golesVisitantePredicho,
      estado: EstadoPrediccion.PENDIENTE,
      puntosObtenidos: 0,
    };
    this.predicciones.set(data.id, data);
    return new Prediccion(data);
  }

  /**
   * RF-04 — Obtiene una predicción por id.
   */
  static obtenerPrediccion(id: number): Prediccion | null {
    const data = this.predicciones.get(id);
    return data ? new Prediccion(data) : null;
  }

  /**
   * RF-04 — Obtiene predicciones de un usuario en una polla.
   */
  static obtenerPrediccionesUsuario(usuarioId: number, pollaId: number): Prediccion[] {
    return Array.from(this.predicciones.values())
      .filter(p => p.usuarioId === usuarioId && p.pollaId === pollaId)
      .map(p => new Prediccion(p));
  }

  /**
   * RF-04 — Obtiene predicciones de un partido.
   */
  static obtenerPrediccionesPartido(partidoId: number): Prediccion[] {
    return Array.from(this.predicciones.values())
      .filter(p => p.partidoId === partidoId)
      .map(p => new Prediccion(p));
  }

  /**
   * RF-04 / RF-07 — Evalúa una predicción contra el resultado real.
   */
  static evaluarPrediccion(
    prediccionId: number,
    golesLocalReal: number,
    golesVisitanteReal: number,
    reglas: IReglaPuntuacion
  ): Prediccion {
    const data = this.predicciones.get(prediccionId);
    if (!data) throw new Error(`Predicción ${prediccionId} no encontrada.`);

    const prediccion = new Prediccion(data);
    prediccion.evaluar(
      golesLocalReal,
      golesVisitanteReal,
      reglas.puntosExacto,
      reglas.puntosResultadoCorrecto
    );

    this.predicciones.set(prediccionId, prediccion.toJSON());
    return prediccion;
  }

  /**
   * RF-07 — Calcula el puntaje total de un usuario en una polla.
   */
  static calcularPuntajeUsuario(usuarioId: number, pollaId: number): number {
    const predicciones = Array.from(this.predicciones.values())
      .filter(p => p.usuarioId === usuarioId && p.pollaId === pollaId);

    const puntajePartidos = predicciones.reduce((sum, p) => sum + p.puntosObtenidos, 0);

    const prediccionGlobal = Array.from(this.prediccionesGlobales.values())
      .find(pg => pg.usuarioId === usuarioId && pg.pollaId === pollaId);

    const puntajeGlobal = prediccionGlobal?.puntosObtenidos || 0;

    return puntajePartidos + puntajeGlobal;
  }

  /**
   * RF-14 — Crea una predicción global del torneo.
   */
  static crearPrediccionGlobal(
    usuarioId: number,
    pollaId: number
  ): PrediccionGlobal {
    const data: IPrediccionGlobal = {
      id: this.nextGlobalId++,
      usuarioId,
      pollaId,
      maxGoleador: "",
      bloqueada: false,
      puntosObtenidos: 0,
    };
    this.prediccionesGlobales.set(data.id, data);
    return new PrediccionGlobal(data);
  }

  /**
   * RF-14 — Obtiene la predicción global de un usuario en una polla.
   */
  static obtenerPrediccionGlobal(usuarioId: number, pollaId: number): PrediccionGlobal | null {
    const data = Array.from(this.prediccionesGlobales.values())
      .find(pg => pg.usuarioId === usuarioId && pg.pollaId === pollaId);
    return data ? new PrediccionGlobal(data) : null;
  }

  /**
   * RF-14 — Actualiza la predicción global de un usuario.
   */
  static actualizarPrediccionGlobal(
    usuarioId: number,
    pollaId: number,
    campeonId?: number,
    subcampeonId?: number,
    maxGoleador?: string
  ): PrediccionGlobal {
    let prediccion = this.obtenerPrediccionGlobal(usuarioId, pollaId);
    
    if (!prediccion) {
      prediccion = this.crearPrediccionGlobal(usuarioId, pollaId);
    }

    prediccion.actualizar(campeonId, subcampeonId, maxGoleador);
    
    const data = prediccion.toJSON();
    this.prediccionesGlobales.set(data.id, data);
    
    return prediccion;
  }

  /**
   * RF-14 — Bloquea todas las predicciones globales de una polla.
   */
  static bloquearPrediccionesGlobales(pollaId: number): void {
    for (const [id, data] of this.prediccionesGlobales.entries()) {
      if (data.pollaId === pollaId) {
        const prediccion = new PrediccionGlobal(data);
        prediccion.bloquear();
        this.prediccionesGlobales.set(id, prediccion.toJSON());
      }
    }
  }
}
