import { GestorPartidos } from "./GestorPartidos";
import { FasePartido, EstadoPartido } from "./enums";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CREAR INSTANCIA DEL GESTOR
// ═══════════════════════════════════════════════════════════════════════════

const gestor = new GestorPartidos();

console.log("✅ Gestor de Partidos inicializado\n");

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣ VER TODOS LOS PARTIDOS
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("1️⃣  VER TODOS LOS PARTIDOS");
console.log("═══════════════════════════════════════════════════════════════\n");

const todosPartidos = gestor.obtenerTodosPartidos();
console.log(`Total de partidos: ${todosPartidos.length}`);
todosPartidos.forEach((p, i) => {
  console.log(`${i + 1}. Partido #${p.id} - Fase: ${p.fase} - Estado: ${p.estado}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// 2️⃣ MOSTRAR PARTIDOS EN FORMATO BONITO
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("2️⃣  MOSTRAR PARTIDOS EN CONSOLA");
console.log("═══════════════════════════════════════════════════════════════\n");

gestor.mostrarPartidosEnConsola();

// ═══════════════════════════════════════════════════════════════════════════
// 3️⃣ AGREGAR UN NUEVO PARTIDO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("3️⃣  AGREGAR UN NUEVO PARTIDO");
console.log("═══════════════════════════════════════════════════════════════\n");

const nuevoPartido = gestor.agregarPartido(
  2, // Francia (ID 2)
  3, // Brasil (ID 3)
  new Date("2026-06-15T15:00:00"),
  FasePartido.GRUPOS
);

console.log(`Nuevo partido creado:`);
console.log(`  ID: ${nuevoPartido.id}`);
console.log(`  Fase: ${nuevoPartido.fase}`);
console.log(`  Estado: ${nuevoPartido.estado}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 4️⃣ FILTRAR PARTIDOS POR ESTADO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("4️⃣  FILTRAR PARTIDOS POR ESTADO");
console.log("═══════════════════════════════════════════════════════════════\n");

const programados = gestor.obtenerPartidosPorEstado(EstadoPartido.PROGRAMADO);
console.log(`Partidos PROGRAMADOS: ${programados.length}`);
programados.forEach(p => console.log(`  - Partido #${p.id}`));

const finalizados = gestor.obtenerPartidosPorEstado(EstadoPartido.FINALIZADO);
console.log(`\nPartidos FINALIZADOS: ${finalizados.length}`);
finalizados.forEach(p => console.log(`  - Partido #${p.id}`));

const enCurso = gestor.obtenerPartidosPorEstado(EstadoPartido.EN_CURSO);
console.log(`\nPartidos EN CURSO: ${enCurso.length}`);
enCurso.forEach(p => console.log(`  - Partido #${p.id}\n`));

// ═══════════════════════════════════════════════════════════════════════════
// 5️⃣ FILTRAR PARTIDOS POR FASE
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("5️⃣  FILTRAR PARTIDOS POR FASE");
console.log("═══════════════════════════════════════════════════════════════\n");

const partidosGrupos = gestor.obtenerPartidosPorFase(FasePartido.GRUPOS);
console.log(`Partidos de GRUPOS: ${partidosGrupos.length}`);

const partidosOctavos = gestor.obtenerPartidosPorFase(FasePartido.OCTAVOS);
console.log(`Partidos de OCTAVOS: ${partidosOctavos.length}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 6️⃣ OBTENER UN PARTIDO ESPECÍFICO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("6️⃣  OBTENER UN PARTIDO ESPECÍFICO");
console.log("═══════════════════════════════════════════════════════════════\n");

const partido = gestor.obtenerPartidoPorId(2);
if (partido) {
  console.log(`Partido encontrado:`);
  console.log(`  ID: ${partido.id}`);
  console.log(`  Equipo Local: ${partido.equipoLocalId}`);
  console.log(`  Equipo Visitante: ${partido.equipoVisitanteId}`);
  console.log(`  Resultado: ${partido.golesLocal} - ${partido.golesVisitante}`);
  console.log(`  Estado: ${partido.estado}\n`);
} else {
  console.log("Partido no encontrado\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// 7️⃣ EDITAR RESULTADO DE UN PARTIDO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("7️⃣  EDITAR RESULTADO DE UN PARTIDO");
console.log("═══════════════════════════════════════════════════════════════\n");

const partidoEditado = gestor.editarResultado(3, 2, 1);
console.log(`Resultado actualizado:`);
console.log(`  Partido #${partidoEditado.id}`);
console.log(`  Goles Local: ${partidoEditado.golesLocal}`);
console.log(`  Goles Visitante: ${partidoEditado.golesVisitante}`);
console.log(`  Estado: ${partidoEditado.estado}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 8️⃣ CAMBIAR ESTADO DE UN PARTIDO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("8️⃣  CAMBIAR ESTADO DE UN PARTIDO");
console.log("═══════════════════════════════════════════════════════════════\n");

const partidoCambiado = gestor.cambiarEstado(1, EstadoPartido.EN_CURSO);
console.log(`Estado actualizado:`);
console.log(`  Partido #${partidoCambiado.id}`);
console.log(`  Nuevo estado: ${partidoCambiado.estado}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 9️⃣ OBTENER ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("9️⃣  OBTENER ESTADÍSTICAS");
console.log("═══════════════════════════════════════════════════════════════\n");

const stats = gestor.obtenerEstadisticas();
console.log(`📊 ESTADÍSTICAS DE PARTIDOS:`);
console.log(`  Total: ${stats.total}`);
console.log(`  Programados: ${stats.programados}`);
console.log(`  En Curso: ${stats.enCurso}`);
console.log(`  Finalizados: ${stats.finalizados}`);
console.log(`  Suspendidos: ${stats.suspendidos}`);
console.log(`  Pospuestos: ${stats.pospuestos}\n`);

// ═══════════════════════════════════════════════════════════════════════════
// 🔟 OBTENER PRÓXIMO PARTIDO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("🔟  OBTENER PRÓXIMO PARTIDO");
console.log("═══════════════════════════════════════════════════════════════\n");

const proximo = gestor.obtenerProximoPartido();
if (proximo) {
  console.log(`Próximo partido:`);
  console.log(`  ID: ${proximo.id}`);
  console.log(`  Fecha: ${proximo.fechaHora.toLocaleString("es-ES")}`);
} else {
  console.log("No hay próximos partidos\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣1️⃣ OBTENER PARTIDOS POR EQUIPO
// ═══════════════════════════════════════════════════════════════════════════

console.log("═══════════════════════════════════════════════════════════════");
console.log("1️⃣1️⃣  OBTENER PARTIDOS POR EQUIPO");
console.log("═══════════════════════════════════════════════════════════════\n");

const partidosEquipo1 = gestor.obtenerPartidosPorEquipo(1); // Argentina
console.log(`Partidos de Argentina (ID 1): ${partidosEquipo1.length}`);
partidosEquipo1.forEach(p => console.log(`  - Partido #${p.id}`));

// ═══════════════════════════════════════════════════════════════════════════
// 1️⃣2️⃣ VER TODOS LOS PARTIDOS NUEVAMENTE
// ═══════════════════════════════════════════════════════════════════════════

console.log("\n═══════════════════════════════════════════════════════════════");
console.log("1️⃣2️⃣  VER TODOS LOS PARTIDOS DESPUÉS DE CAMBIOS");
console.log("═══════════════════════════════════════════════════════════════\n");

gestor.mostrarPartidosEnConsola();

console.log("\n✅ Demostración completada");
