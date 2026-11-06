# Guía de alimentación del banco de preguntas

## Estructura académica

Cada asignatura tiene un archivo JSON en `datos/universidad/` o `datos/bachillerato/`.
En el JSON, cada pregunta tiene `unidad`, `tema` y `subtema`. No hay que crear un HTML por pregunta.

Ejemplo en Matemática Superior:
- Asignatura: Matemática Superior
- Unidad: Geometría analítica
- Tema: Ecuación de la Recta
- Subtemas: Pendiente de una recta; Forma explícita e interpretación; Recta por un punto y pendiente; Recta por dos puntos; Paralelas y perpendiculares; Forma general e intersecciones.

## Cómo proporcionar preguntas nuevas

Puedes facilitar a ChatGPT las preguntas en Word, PDF, Excel, texto o como listado en el chat. Para cada lote informa:
1. Institución y asignatura.
2. Unidad, tema y subtema (puede haber varios).
3. Número de preguntas y dificultad deseada.
4. Tipo: inicialmente selección única (cuatro alternativas, solo una correcta).
5. Si las preguntas deben basarse en materiales curriculares adjuntos o ser originales.

ChatGPT puede transformarlas al JSON utilizado por la plataforma y publicarlas directamente en GitHub con la conexión autorizada. Antes de publicar, verificar resultados matemáticos, alternativas, explicación y cantidad de preguntas disponibles.

## Campos del formato JSON

- `id`: identificador único, **no reutilizar** ni renumerar durante revisiones.
- `unidad`: organización curricular.
- `tema`: título del tema.
- `subtema`: contenido específico, utilizado por el configurador docente.
- `dificultad`: `basico`, `intermedio` o `avanzado`.
- `tipo`: `seleccion_unica` en la versión piloto.
- `enunciado`: pregunta completa, con datos necesarios.
- `opciones`: cuatro objetos con `id` (A–D) y `texto`.
- `respuesta`: identificador A–D de la alternativa correcta.
- `explicacion`: justificación o procedimiento correcto.
- `puntaje`: puntuación de referencia (normalmente 1).

Consulta `plantillas/pregunta-seleccion-unica.json` para un ejemplo.

## Reglas de calidad

1. Cada pregunta tiene una sola respuesta matemáticamente correcta, verificada independientemente.
2. Los distractores deben ser distintos entre sí y no equivalentes a la respuesta correcta.
3. Identificadores únicos, sin preguntas duplicadas.
4. Se revisan signos, paréntesis, fracciones y operaciones antes de importar.
5. El enunciado no depende de imágenes ausentes ni de información oculta.
6. La explicación debe permitir al estudiante comprender el resultado al final de la práctica.
7. Las preguntas piloto deben contar con revisión del docente antes de una evaluación oficial en Moodle.

## Cómo publicar un lote

Para agregar un nuevo tema, proporcionar a ChatGPT un mensaje como:

> Añade 30 preguntas a Matemática Superior, unidad Geometría analítica, tema Circunferencia, subtema Ecuación canónica. Incluye 10 básicas, 15 intermedias y 5 avanzadas. Cuatro alternativas, explicación y validación. Actualiza el JSON en GitHub conservando todas las preguntas existentes y comprueba el banco.

Se añadirán al archivo JSON de la asignatura; el configurador detectará automáticamente el nuevo tema/subtema. No hace falta tocar HTML.

## Uso de la plataforma

1. Abrir https://jpaulmata80.github.io/bancos-preguntas/#docente
2. Seleccionar Bachillerato > Matemática Superior.
3. Marcar uno o varios subtemas de Ecuación de la Recta.
4. Configurar 10 preguntas y, por ejemplo, 180 segundos por pregunta; indicar fechas y copiar el enlace generado.
5. Compartir el enlace de práctica con los estudiantes.

**Restricciones:** el banco público incluye respuestas; el horario y el límite de intentos se controlan en el navegador, y no son controles seguros para una evaluación oficial. Para evaluación calificada utilizar Moodle. La exportación XML sigue pendiente.

## Pruebas sugeridas

- Seleccionar un solo subtema con 10 preguntas y generar una práctica de 10.
- Seleccionar varios subtemas y comprobar la mezcla aleatoria.
- Concluir una práctica y revisar la nota y las explicaciones.
- Iniciar otra práctica para ver una selección diferente.
- Verificar la versión móvil.

