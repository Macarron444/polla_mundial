import { UsuarioService } from './Usuario.service';
import { PartidoService } from './Partido.service';
import { PollaService } from './Polla.service';
import { PrediccionService } from './Prediccion.service';
import { NotificacionService } from './Notificacion.service';

import { EstadoPolla, VisibilidadPolla, RolPolla, FasePartido, TipoNotificacion } from './enums';
import { IReglaPuntuacion } from './Interfaces';

// ============================================================================
// EJEMPLO 1: Crear Usuario y Autenticar (RF-01, RNF-03)
// ============================================================================

async function ejemploRegistroYAutenticacion() {
  console.log('=== EJEMPLO 1: Registro y Autenticación ===\n');

  try {
    // RF-01: Registrar nuevo usuario
    const nuevoUsuario = await UsuarioService.registrar(
      'juan@example.com',
      'MiPassword123!',
      'Juan Diego'
    );
    console.log('✓ Usuario registrado:', nuevoUsuario.nombre);

    // RNF-03: Autenticar y obtener JWT
    const token = await UsuarioService.autenticar(
      'juan@example.com',
      'MiPassword123!'
    );
    console.log('✓ JWT obtenido:', token.substring(0, 20) + '...');

    // RF-01: Obtener perfil
    const perfil = UsuarioService.obtenerPorId(nuevoUsuario.id);
    console.log('✓ Perfil obtenido:', perfil.toJSON());

    // RF-09: Configurar notificaciones
    const usuarioConNotif = UsuarioService.configurarNotificaciones(
      nuevoUsuario.id,
      true,  // push activo
      false  // email inactivo
    );
    console.log('✓ Notificaciones configuradas');

    return nuevoUsuario.id;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// EJEMPLO 2: Crear Polla y Agregar Participantes (RF-02, RF-03, RF-17)
// ============================================================================

async function ejemploCrearPollaYParticipantes(usuarioId: number) {
  console.log('\n=== EJEMPLO 2: Crear Polla y Participantes ===\n');

  try {
    // RF-02: Crear nueva polla con reglas personalizadas
    const reglas: Partial<IReglaPuntuacion> = {
      puntosExacto: 5,              // Más puntos por predicción exacta
      puntosResultadoCorrecto: 2,   // Más puntos por resultado correcto
      bonusPrediccionGlobal: 10,    // Bonus mayor por predicción global
    };

    const polla = PollaService.crearPolla(
      'Polla Amigos - Mundial 2026',
      VisibilidadPolla.PRIVADA,
      reglas
    );
    console.log('✓ Polla creada:', polla.nombre);
    console.log('  Enlace de invitación:', polla.enlaceInvitacion);

    // RF-17: Agregar participantes con roles
    const creador = PollaService.agregarParticipante(
      polla.id,
      usuarioId,
      RolPolla.CREADOR
    );
    console.log('✓ Creador agregado:', creador.rol);

    // Simular otros participantes
    const admin = PollaService.agregarParticipante(
      polla.id,
      2,
      RolPolla.ADMINISTRADOR
    );
    console.log('✓ Administrador agregado');

    const participante1 = PollaService.agregarParticipante(
      polla.id,
      3,
      RolPolla.PARTICIPANTE
    );
    const participante2 = PollaService.agregarParticipante(
      polla.id,
      4,
      RolPolla.PARTICIPANTE
    );
    console.log('✓ Participantes agregados: 2');

    // Obtener lista de participantes
    const participantes = PollaService.obtenerParticipantes(polla.id);
    console.log('✓ Total de participantes:', participantes.length);

    return polla.id;
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// EJEMPLO 3: Crear Equipos y Partidos (RF-05, RF-15)
// ============================================================================

async function ejemploCrearEquiposYPartidos() {
  console.log('\n=== EJEMPLO 3: Crear Equipos y Partidos ===\n');

  try {
    // RF-05: Registrar equipos
    const argentina = PartidoService.registrarEquipo({
      id: 1,
      nombre: 'Argentina',
      grupo: 'A',
      codigoPais: 'ARG',
    });
    console.log('✓ Equipo registrado:', argentina.nombre);

    const francia = PartidoService.registrarEquipo({
      id: 2,
      nombre: 'Francia',
      grupo: 'A',
      codigoPais: 'FRA',
    });

    const brasil = PartidoService.registrarEquipo({
      id: 3,
      nombre: 'Brasil',
      grupo: 'B',
      codigoPais: 'BRA',
    });

    const españa = PartidoService.registrarEquipo({
      id: 4,
      nombre: 'España',
      grupo: 'B',
      codigoPais: 'ESP',
    });
    console.log('✓ 4 equipos registrados');

    // RF-05: Obtener equipos por grupo
    const equiposGrupoA = PartidoService.obtenerEquiposPorGrupo('A');
    console.log('✓ Equipos Grupo A:', equiposGrupoA.length);

    // RF-15: Crear partidos
    const fecha = new Date('2026-06-11');
    const partido1 = PartidoService.crearPartido(
      1, // Argentina
      2, // Francia
      fecha,
      FasePartido.GRUPOS
    );
    console.log('✓ Partido creado: Argentina vs Francia');
    console.log('  Estado:', partido1.estado);

    const partido2 = PartidoService.crearPartido(
      3, // Brasil
      4, // España
      fecha,
      FasePartido.GRUPOS
    );
    console.log('✓ Partido creado: Brasil vs España');

    // Obtener todos los partidos
    const todosPartidos = PartidoService.obtenerTodosPartidos();
    console.log('✓ Total partidos en sistema:', todosPartidos.length);

    return [partido1.id, partido2.id];
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// EJEMPLO 4: Hacer Predicciones (RF-04, RF-14)
// ============================================================================

async function ejemploHacerPredicciones(
  usuarioId: number,
  pollaId: number,
  partidoIds: number[]
) {
  console.log('\n=== EJEMPLO 4: Hacer Predicciones ===\n');

  try {
    // RF-04: Crear predicción de partido 1
    const pred1 = PrediccionService.crearPrediccion(
      usuarioId,
      partidoIds[0], // Argentina vs Francia
      pollaId,
      2, // Predice 2 goles Argentina
      1  // Predice 1 gol Francia
    );
    console.log('✓ Predicción 1 creada: Argentina 2 - Francia 1');

    // RF-04: Crear predicción de partido 2
    const pred2 = PrediccionService.crearPrediccion(
      usuarioId,
      partidoIds[1], // Brasil vs España
      pollaId,
      1, // Predice 1 gol Brasil
      1  // Predice 1 gol España (empate)
    );
    console.log('✓ Predicción 2 creada: Brasil 1 - España 1');

    // RF-14: Crear predicción global del torneo
    const predGlobal = PrediccionService.crearPrediccionGlobal(
      usuarioId,
      pollaId
    );
    console.log('✓ Predicción global creada');

    // RF-14: Actualizar predicción global
    const predGlobalActualizada = PrediccionService.actualizarPrediccionGlobal(
      usuarioId,
      pollaId,
      1, // Campeón: Argentina (ID 1)
      2, // Subcampeón: Francia (ID 2)
      'Lionel Messi' // Máximo goleador
    );
    console.log('✓ Predicción global actualizada:');
    console.log('  Campeón: Argentina');
    console.log('  Subcampeón: Francia');
    console.log('  Goleador: Lionel Messi');

    return [pred1.id, pred2.id];
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// EJEMPLO 5: Registrar Resultados y Evaluar Predicciones (RF-15, RF-07)
// ============================================================================

async function ejemploRegistrarResultadosYEvaluar(
  prediccionIds: number[],
  partidoIds: number[],
  pollaId: number
) {
  console.log('\n=== EJEMPLO 5: Registrar Resultados y Evaluar ===\n');

  try {
    // RF-15: Registrar resultado del partido 1
    const resultado1 = PartidoService.registrarResultado(
      partidoIds[0],
      2, // Argentina anotó 2
      1  // Francia anotó 1
    );
    console.log('✓ Resultado partido 1 registrado: Argentina 2 - Francia 1');
    console.log('  Estado:', resultado1.estado);

    // RF-15: Obtener ganador
    const ganador = resultado1.obtenerGanador();
    console.log('  Ganador: Equipo local (1)');

    // RF-07: Evaluar la predicción del partido 1
    const reglas: IReglaPuntuacion = {
      puntosExacto: 5,
      puntosResultadoCorrecto: 2,
      puntosFallo: 0,
      bonusPrediccionGlobal: 10,
      bloqueada: true,
    };

    const predEvaluada1 = PrediccionService.evaluarPrediccion(
      prediccionIds[0],
      2, // Resultado real local
      1, // Resultado real visitante
      reglas
    );
    console.log('✓ Predicción 1 evaluada:');
    console.log('  Estado:', predEvaluada1.estado); // EXACTA
    console.log('  Puntos obtenidos:', predEvaluada1.puntosObtenidos); // 5

    // RF-15: Registrar resultado del partido 2
    const resultado2 = PartidoService.registrarResultado(
      partidoIds[1],
      1, // Brasil anotó 1
      2  // España anotó 2
    );
    console.log('✓ Resultado partido 2 registrado: Brasil 1 - España 2');

    // RF-07: Evaluar predicción del partido 2
    const predEvaluada2 = PrediccionService.evaluarPrediccion(
      prediccionIds[1],
      1, // Resultado real
      2, // Resultado real
      reglas
    );
    console.log('✓ Predicción 2 evaluada:');
    console.log('  Estado:', predEvaluada2.estado); // FALLIDA
    console.log('  Puntos obtenidos:', predEvaluada2.puntosObtenidos); // 0

    // RF-07: Calcular puntaje total del usuario
    const usuarioId = 1;
    const puntajeTotal = PrediccionService.calcularPuntajeUsuario(
      usuarioId,
      pollaId
    );
    console.log('✓ Puntaje total del usuario en polla:');
    console.log('  Puntos:', puntajeTotal); // 5 + 0 = 5
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// EJEMPLO 6: Gestionar Notificaciones (RF-09)
// ============================================================================

async function ejemploGestionarNotificaciones(usuarioId: number) {
  console.log('\n=== EJEMPLO 6: Gestionar Notificaciones ===\n');

  try {
    // RF-09: Enviar notificación PUSH
    const notif1 = NotificacionService.crearNotificacion(
      usuarioId,
      '¡Argentina ganó 2-1 contra Francia! Revisa tus predicciones.',
      TipoNotificacion.PUSH
    );
    console.log('✓ Notificación PUSH enviada');

    // RF-09: Enviar notificación IN_APP
    const notif2 = NotificacionService.crearNotificacion(
      usuarioId,
      'Tu predicción en el partido fue EXACTA. +5 puntos',
      TipoNotificacion.IN_APP
    );
    console.log('✓ Notificación IN_APP enviada');

    // RF-09: Enviar notificación EMAIL
    const notif3 = NotificacionService.crearNotificacion(
      usuarioId,
      'Resumen de tu desempeño en la polla',
      TipoNotificacion.EMAIL
    );
    console.log('✓ Notificación EMAIL enviada');

    // RF-09: Obtener notificaciones no leídas
    const noLeidas = NotificacionService.obtenerNotificacionesNoLeidas(usuarioId);
    console.log('✓ Notificaciones no leídas:', noLeidas.length);

    // RF-09: Obtener notificaciones por tipo
    const pushes = NotificacionService.obtenerNotificacionesPorTipo(
      usuarioId,
      TipoNotificacion.PUSH
    );
    console.log('✓ Notificaciones PUSH:', pushes.length);

    // RF-09: Marcar como leída
    const leida = NotificacionService.marcarComoLeida(notif1.id);
    console.log('✓ Notificación marcada como leída');

    // RF-09: Obtener contador
    const pendientes = NotificacionService.obtenerContenoLeidas(usuarioId);
    console.log('✓ Notificaciones pendientes:', pendientes);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL: Ejecutar todos los ejemplos en secuencia
// ============================================================================

async function ejecutarTodosEjemplos() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   EJEMPLOS DE USO - SISTEMA POLLA MUNDIAL 2026       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Registro y autenticación
    const usuarioId = await ejemploRegistroYAutenticacion();

    // 2. Crear polla
    const pollaId = await ejemploCrearPollaYParticipantes(usuarioId);

    // 3. Crear equipos y partidos
    const partidoIds = await ejemploCrearEquiposYPartidos();

    // 4. Hacer predicciones
    const prediccionIds = await ejemploHacerPredicciones(
      usuarioId,
      pollaId,
      partidoIds
    );

    // 5. Registrar resultados y evaluar
    await ejemploRegistrarResultadosYEvaluar(
      prediccionIds,
      partidoIds,
      pollaId
    );

    // 6. Gestionar notificaciones
    await ejemploGestionarNotificaciones(usuarioId);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✓ TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('✗ Error fatal:', error.message);
  }
}

// Ejecutar
// ejecutarTodosEjemplos();

export { 
  ejemploRegistroYAutenticacion,
  ejemploCrearPollaYParticipantes,
  ejemploCrearEquiposYPartidos,
  ejemploHacerPredicciones,
  ejemploRegistrarResultadosYEvaluar,
  ejemploGestionarNotificaciones,
};
