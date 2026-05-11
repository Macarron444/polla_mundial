import { IEquipo } from '../interfaces'

export class Equipo implements IEquipo {
    id: number
    nombre: string
    grupo: string
    codigoPais: string

    constructor(data: IEquipo) {
        this.id = data.id
        this.nombre = data.nombre
        this.grupo = data.grupo
        this.codigoPais = data.codigoPais
    }

    /** RF-05 — Obtiene la representacion textual del equipo. */
    obtenerNombre(): string {
        return `${this.nombre} (${this.codigoPais})`
    }

    /** RF-05 — Valida que el equipo pertenece a un grupo valido. */
    pertenecerAGrupo(grupo: string): boolean {
        return this.grupo === grupo
    }

    toJSON(): IEquipo {
        return {
            id: this.id,
            nombre: this.nombre,
            grupo: this.grupo,
            codigoPais: this.codigoPais,
        }
    }
}
