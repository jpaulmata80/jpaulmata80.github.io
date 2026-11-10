# Bancos de Preguntas Académicos

Sitio disponible en https://jpaulmata80.github.io/bancos-preguntas/

## Organización

- Universidad: Sistemas Digitales, Programación de Redes y Domótica e Inmótica.
- Bachillerato: Matemática General (Tercero BGU) y Matemática Superior.
- Bancos actuales: Matemática General (206 preguntas) y Matemática Superior (133 preguntas), con alternativas de longitud variable. Los tres bancos universitarios están disponibles para futuras incorporaciones.
- Un banco JSON por asignatura, con preguntas organizadas por unidad, tema y subtema.
- Alimentación y revisión: consulta [la guía de alimentación](GUIA_ALIMENTACION.md) y [la plantilla JSON](plantillas/pregunta-seleccion-unica.json).

## Flujo de uso

1. Entrar en la sección **Configurar práctica**.
2. Seleccionar institución, asignatura y uno o más temas desplegables y sus subtemas; se pueden combinar diferentes temas en una misma práctica.
3. Configurar cantidad, tiempo por pregunta (segundos), fechas de apertura/cierre (zona Ecuador UTC-05), intentos y título.
4. Pulsar **Generar enlace de práctica** y compartirlo.
5. Los estudiantes responden preguntas al azar y ven nota y explicación al concluir.

La práctica se configura dentro del enlace (no se guarda en servidor). El control de fechas, intentos y tiempo depende del navegador y **no es apto para exámenes de alta seguridad**. Los datos y respuestas del banco piloto son públicos. Los límites de intentos por navegador pueden reiniciarse borrando datos locales. Las evaluaciones oficiales se gestionan en Moodle.

### Importante sobre fechas

Ingresar las fechas en la hora local de Ecuador continental (UTC-05). El navegador compara valores absolutos UTC, pero su reloj puede alterarse.

### Agregar preguntas

Editar el archivo JSON de la asignatura en `datos/`. Campos requeridos por pregunta:
`id, unidad, tema, subtema, dificultad, enunciado, opciones, respuesta, explicacion, puntaje`.
`opciones` es una lista flexible de dos o más objetos `{id:"A"|"B"|"C"|..., texto:"..."}`.
`respuesta` contiene el identificador de la alternativa correcta. Mantener identificadores únicos.
El catálogo de asignaturas está en `datos/catalogo.json`.

Las preguntas son de **demostración**, y deben ser revisadas por el docente antes de su uso académico formal.

## Estado

Primera versión: configurador docente, enlaces, aleatorización, temporizador y revisión final. La exportación Moodle XML está implementada mediante `exportar-moodle.html`: permite seleccionar bancos, contenidos, dificultades y un límite de preguntas por asignatura, y descargar uno o varios archivos XML (en ZIP para varias asignaturas). La compatibilidad completa debe confirmarse mediante una prueba de importación en el Moodle institucional.

## Exportar a Moodle XML

1. Abrir [Exportar a Moodle](exportar-moodle.html), también accesible desde el configurador docente.
2. Seleccionar una o varias asignaturas y marcar los temas o subtemas que se incluirán.
3. Filtrar dificultades si es necesario. Dejar `0` en el límite para descargar todas las preguntas; cualquier otro valor genera una selección aleatoria independiente por asignatura.
4. Revisar el recuento y las exclusiones detectadas por la validación estructural.
5. Descargar un XML cuando se selecciona una sola asignatura o un ZIP con XML separados cuando se seleccionan varias.
6. En Moodle, entrar en **Banco de preguntas → Importar → Moodle XML**, activar **Obtener categoría desde el archivo**, extraer el ZIP si se descargó uno y cargar el XML correspondiente al curso.
7. Comprobar categorías, alternativas, retroalimentación y claves en un cuestionario de prueba antes de una evaluación oficial.

El formato generado es de preguntas de **selección única** (`multichoice`, `single=true`) con todas las alternativas originales, una fracción `100` para la correcta y `0` para las incorrectas. Se incluyen en el XML las categorías `Asignatura / Unidad / Tema / Subtema` bajo `$course$/top`, el enunciado y la explicación general. No convierte preguntas a selección múltiple ni crea exámenes oficiales automáticamente. Si los bancos de origen son públicos, sus respuestas también son públicas.
