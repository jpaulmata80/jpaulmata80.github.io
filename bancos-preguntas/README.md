# Bancos de Preguntas Académicos

Sitio disponible en https://jpaulmata80.github.io/bancos-preguntas/

## Organización

- Universidad: Sistemas Digitales, Programación de Redes y Domótica e Inmótica.
- Bachillerato: Matemática General (Tercero BGU) y Matemática Superior.
- Bancos piloto: Matemática General (46 preguntas demostrativas) y Matemática Superior (103 preguntas: 60 de Ecuación de la Recta y 43 de Fundamentos de Geometría Analítica). Las 43 preguntas importadas conservan sus seis alternativas originales.
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

Primera versión: configurador docente, enlaces, aleatorización, temporizador y revisión final. La exportación Moodle XML queda para la siguiente etapa y todavía no está implementada.
