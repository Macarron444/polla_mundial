/**
 * contexts/usuario/usuario.service.ts
 * Lógica de negocio del contexto Usuario.
 * SRS: RF-01 (registro, autenticación, perfil), RNF-03 (seguridad / JWT)
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "./usuario";
import { IUsuario } from "./Interfaces";

const SALT_ROUNDS = 12;
const JWT_SECRET  = process.env.JWT_SECRET ?? "cambia_este_secreto";
const JWT_EXPIRES = "7d";

export class UsuarioService {
  private static db = new Map<number, IUsuario>();
  private static nextId = 1;

  /**
   * RF-01 — Registra un usuario con credenciales válidas.
   * Lanza error si el email ya existe.
   */
  static async registrar(email: string, password: string, nombre: string): Promise<Usuario> {
    const existe = [...this.db.values()].find(u => u.email === email);
    if (existe) throw new Error("El correo ya está registrado.");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const data: IUsuario = {
      ...Usuario.prepararRegistro(email, nombre),
      id: this.nextId++,
      passwordHash,
    };
    this.db.set(data.id, data);
    return new Usuario(data);
  }

  /**
   * RF-01 — Autentica al usuario y devuelve un token JWT.
   * RNF-03 — Uso de bcrypt y JWT firmado.
   */
  static async autenticar(email: string, password: string): Promise<string> {
    const data = [...this.db.values()].find(u => u.email === email);
    if (!data) throw new Error("Credenciales inválidas.");

    const valido = await bcrypt.compare(password, data.passwordHash);
    if (!valido) throw new Error("Credenciales inválidas.");

    return jwt.sign({ sub: data.id, email: data.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  }

  /** RF-01 — Obtiene los datos de perfil de un usuario por id. */
  static obtenerPorId(id: number): Usuario {
    const data = this.db.get(id);
    if (!data) throw new Error(`Usuario ${id} no encontrado.`);
    return new Usuario(data);
  }

  /** RF-01 — Actualiza el nombre del usuario en base de datos. */
  static actualizarPerfil(id: number, nombre: string): Usuario {
    const data = this.db.get(id);
    if (!data) throw new Error(`Usuario ${id} no encontrado.`);
    const usuario = new Usuario(data);
    usuario.actualizarPerfil(nombre);
    this.db.set(id, usuario.toJSON());
    return usuario;
  }

  /** RF-09 — Guarda las preferencias de notificación del usuario. */
  static configurarNotificaciones(id: number, push: boolean, email: boolean): Usuario {
    const data = this.db.get(id);
    if (!data) throw new Error(`Usuario ${id} no encontrado.`);
    const usuario = new Usuario(data);
    usuario.configurarNotificaciones(push, email);
    this.db.set(id, usuario.toJSON());
    return usuario;
  }
}