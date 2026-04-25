import { IUsuario } from "./Interfaces";

export class Usuario implements IUsuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  notifPushActiva: boolean;
  notifEmailActiva: boolean;
  fechaRegistro: Date;

  constructor(data: IUsuario) {
    this.id              = data.id;
    this.nombre          = data.nombre;
    this.email           = data.email;
    this.passwordHash    = data.passwordHash;
    this.notifPushActiva = data.notifPushActiva;
    this.notifEmailActiva= data.notifEmailActiva;
    this.fechaRegistro   = data.fechaRegistro;
  }

  /**
   * RF-01 — Prepara el payload para registrar un usuario nuevo.
   * El hash de contraseña se genera en usuario.service.ts (bcrypt).
   */
  static prepararRegistro(
    email: string,
    nombre: string
  ): Omit<IUsuario, "id" | "passwordHash"> {
    return {
      email,
      nombre,
      notifPushActiva:  false,
      notifEmailActiva: false,
      fechaRegistro:    new Date(),
    };
  }

  /** RF-01 — Actualiza el nombre visible del usuario. */
  actualizarPerfil(nombre: string): void {
    this.nombre = nombre.trim();
  }

  /** RF-01 — Cierra la sesión (el token JWT se invalida en el middleware). */
  cerrarSesion(): void {
    // La lógica de invalidación del token se delega a usuario.middleware.ts
  }

  /**
   * RF-09 — Configura qué canales de notificación tiene activos el usuario.
   * push  → Service Worker + VAPID (requiere consentimiento explícito)
   * email → SendGrid/SMTP (opcional, configurable en perfil)
   */
  configurarNotificaciones(push: boolean, email: boolean): void {
    this.notifPushActiva  = push;
    this.notifEmailActiva = email;
  }

  toJSON(): IUsuario {
    return {
      id:               this.id,
      nombre:           this.nombre,
      email:            this.email,
      passwordHash:     this.passwordHash,
      notifPushActiva:  this.notifPushActiva,
      notifEmailActiva: this.notifEmailActiva,
      fechaRegistro:    this.fechaRegistro,
    };
  }
}
