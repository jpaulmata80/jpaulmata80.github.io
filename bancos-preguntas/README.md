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

Desde [Exportar a Moodle](exportar-moodle.html), accesible desde el menú y el configurador docente:

1. Seleccionar una o varias asignaturas y los temas o subtemas que se incluirán.
2. Filtrar por dificultad; dejar `0` en el límite para exportar todas las preguntas o definir un número para una selección aleatoria independiente por asignatura.
3. Elegir la **modalidad de categorías** antes de descargar:
   - **Sin categorías en el XML** (predeterminada): exporta únicamente las preguntas. En Moodle, seleccionar manualmente la categoría de destino y **desmarcar** «Obtener categoría desde el archivo». Todas las preguntas de ese XML irán a la categoría elegida.
   - **Bajo una categoría padre existente**: escribir una ruta que ya existe en Moodle, por ejemplo `Matemática Superior / Geometría analítica`; elegir si debajo se incorporará **Unidad**, **Tema** y/o **Subtema**. El XML tendrá rutas basadas en `$course$/top/` y esta categoría padre. En Moodle, **activar** «Obtener categoría desde el archivo». La herramienta no consulta Moodle; el usuario debe introducir la ruta de forma exacta.
   - **Jerarquía completa**: exporta la ruta `$course$/top/Asignatura/Unidad/Tema/Subtema`, igual que la primera versión del exportador. En Moodle, **activar** «Obtener categoría desde el archivo».
4. Verificar la **vista previa de las rutas** y la validación estructural de preguntas. Si se configuró un límite aleatorio, la vista previa muestra rutas posibles, no necesariamente todas las que aparecerán en la muestra.
5. Descargar un XML por asignatura, o un ZIP con XML separados si se seleccionaron varias. Descomprimir el ZIP antes de importar en Moodle.
6. En el curso Moodle correspondiente, ir a **Banco de preguntas → Importar → Moodle XML** y seguir las instrucciones específicas que muestra el exportador según la modalidad.
7. Comprobar categorías, alternativas, respuestas y retroalimentación mediante un cuestionario de prueba antes de la evaluación oficial.

Cada pregunta de selección única conserva todas sus alternativas, una fracción de calificación de `100` en la correcta, `0` en las incorrectas y la explicación general. No se alteran los bancos JSON ni se crean automáticamente cuestionarios oficiales.

**Importante:** elegir la misma categoría padre no previene que Moodle pueda incorporar de nuevo preguntas ya importadas; para evitar duplicarlas, exporta solo los contenidos nuevos y verifica su existencia antes de repetir una importación. Las categorías son propias de cada curso y contexto de Moodle, y el exportador no verifica su existencia porque no está conectado a Moodle.
