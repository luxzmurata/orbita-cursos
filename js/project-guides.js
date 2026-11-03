/* Hitos evaluables de los proyectos finales; sirven para planear y auto-revisar. */
window.PROJECT_GUIDES = {
  ia: {
    stages: [
      ["1. Define la pregunta", "Escribe quién estudiará, qué material necesita consultar y qué no debería responder la herramienta.", "Una persona puede describir el objetivo y los límites sin mencionar marcas de modelos."],
      ["2. Prepara fuentes seguras", "Usa apuntes propios o material público cuyo uso esté permitido. Numera y registra de qué documento viene cada fragmento.", "Cada fragmento tiene origen identificado; no incluyes información personal o confidencial."],
      ["3. Diseña el flujo y el prompt", "Solicita una pregunta, recupera un pasaje pertinente, pide una respuesta basada en ese pasaje y muestra su referencia. Diseña una salida clara cuando no haya evidencia.", "La respuesta incorpora una fuente concreta y puede negarse a inventar una respuesta fuera del material."],
      ["4. Evalúa con casos preparados", "Escribe preguntas sencillas, ambiguas, fuera del material y relacionadas con un fragmento incorrecto. Define antes qué sería una respuesta correcta.", "Guarda entrada, evidencia recuperada, respuesta, resultado esperado y error observado de cada prueba."],
      ["5. Mejora y presenta", "Revisa fallos, cambia una decisión a la vez, vuelve a ejecutar las pruebas y comunica límites, riesgos y privacidad.", "La presentación muestra una mejora basada en pruebas y explica al menos una limitación que sigue abierta."]
    ],
    fields: ["Objetivo y usuario", "Fuentes y permisos", "Prompt y diseño del flujo", "Casos y resultados de evaluación", "Riesgos, límites y reflexión"]
  },
  sdd: {
    stages: [
      ["1. Descubre la necesidad", "Describe una situación real, quién la experimenta, evidencia disponible y supuestos que todavía necesitan comprobarse.", "El problema no presupone una solución y puede discutirse con una persona afectada."],
      ["2. Aclara alcance y requisitos", "Define incluidos, excluidos, escenarios normales y alternativos y requisitos de calidad con condiciones observables.", "Cada requisito importante tiene un criterio verificable y ningún «rápido/fácil/seguro» queda sin explicación."],
      ["3. Diseña y registra decisiones", "Dibuja los componentes, flujo de datos y decisiones principales. Anota al menos una alternativa descartada y el motivo.", "Cada componente responde a un requisito; las decisiones exponen consecuencias y preguntas abiertas."],
      ["4. Construye trazabilidad", "Vincula requisitos con tareas y pruebas; identifica dependencias y empieza por riesgos o bloqueos.", "Un lector puede seguir un requisito desde su evidencia hasta la prueba que lo valida."],
      ["5. Revisa cambios", "Simula un nuevo requisito, actualiza plan, tareas y pruebas; ejecuta pruebas y explica cualquier diferencia.", "No quedan documentos contradictorios y el cambio tiene evidencia de validación."]
    ],
    fields: ["Problema, usuario y evidencia", "Requisitos y criterios de aceptación", "Diagrama y decisiones", "Matriz requisito/tarea/prueba", "Cambio simulado y validación"]
  },
  java: {
    stages: [
      ["1. Modela el catálogo", "Define qué información tiene un libro, qué lo identifica y qué reglas hacen válida la entrada.", "El modelo distingue título, autor, identificador y disponibilidad sin aceptar registros vacíos o duplicados."],
      ["2. Construye las operaciones", "Implementa agregar, buscar, listar y retirar con métodos pequeños y estructuras de colección adecuadas.", "Cada operación tiene entrada y resultado definidos, incluso para catálogo vacío y búsqueda sin coincidencias."],
      ["3. Añade interacción segura", "Presenta un menú que valida selecciones y vuelve a pedir una entrada inválida sin cerrar el programa inesperadamente.", "Una opción incorrecta produce un mensaje claro y permite continuar; los ciclos siempre pueden terminar."],
      ["4. Comprueba reglas", "Prueba entradas válidas, duplicadas, vacías y límites. Añade pruebas automatizadas si puedes y registra instrucciones de ejecución.", "Los casos de prueba indican resultado esperado y observado; ninguna excepción inesperada se oculta."],
      ["5. Documenta y entrega", "Organiza paquetes, explica JDK y comando de ejecución, y resume decisiones y mejoras pendientes.", "Otra persona puede compilar y ejecutar desde una copia limpia siguiendo el README."]
    ],
    fields: ["Modelo y reglas del libro", "Código y operaciones", "Pruebas con resultados", "Instrucciones de compilación", "Errores corregidos y aprendizajes"]
  },
  javascript: {
    stages: [
      ["1. Define comportamiento", "Especifica cómo se crea una tarea, qué campos requiere, cómo se filtra y qué estados se muestran.", "Cada acción tiene un resultado visible y un tratamiento definido para lista vacía o entrada inválida."],
      ["2. Estructura interfaz semántica", "Crea formulario, etiqueta, botón, lista, mensajes y región de estado con HTML apropiado.", "El recorrido puede completarse por teclado sin usar solo mouse y sin controles engañosos."],
      ["3. Implementa estado y acciones", "Mantén las tareas en una estructura comprensible; separa validación, operaciones de datos y renderizado.", "Añadir, completar, filtrar y eliminar actualizan la vista sin duplicados ni errores de consola."],
      ["4. Prueba errores y persistencia", "Comprueba texto vacío, símbolos, acciones repetidas y, si usas localStorage, explica qué almacena y cómo se recupera.", "La aplicación sigue siendo comprensible sin persistencia y nunca guarda secretos o contraseñas."],
      ["5. Revisa y presenta", "Prueba teclado, lector/inspección de nombres accesibles, pantalla estrecha y consola limpia; describe una limitación.", "Incluyes evidencia de casos probados y el enlace o paquete del código si decides compartirlo."]
    ],
    fields: ["Especificación de la tarea", "Interfaz y comportamiento", "Casos de prueba y resultado", "Accesibilidad y móvil", "Errores corregidos y reflexión"]
  },
  datos: {
    stages: [
      ["1. Dibuja el dominio", "Identifica entidades, atributos, relaciones y multiplicidades. Indica qué datos son realmente necesarios.", "El modelo distingue cursos, estudiantes e inscripciones y muestra las claves de cada relación."],
      ["2. Declara integridad", "Escribe esquema con tipos, claves, restricciones de unicidad y reglas para referencias faltantes.", "Un registro inválido no puede introducirse accidentalmente; la regla se explica junto a la tabla."],
      ["3. Consulta y comprueba", "Crea datos ficticios y consultas de búsqueda, unión y agregación; escribe resultados esperados antes de ejecutarlas.", "Incluyes relaciones vacías y evitas que los joins multipliquen los totales."],
      ["4. Implementa seguridad y transacciones", "Demuestra consultas parametrizadas y una operación que debe revertirse completa si falla un paso.", "No concatenas entrada en SQL, no usas permisos administrativos para la aplicación y documentas el rollback."],
      ["5. Mide y recupera", "Justifica un índice a partir de una consulta; documenta copia, restauración y limitaciones del motor.", "La propuesta identifica costes de escritura y explica cómo comprobar una restauración."]
    ],
    fields: ["Diagrama y supuestos", "Esquema y restricciones", "Consultas y resultados esperados", "Parámetros y transacción", "Índice, respaldo y reflexión"]
  },
  web: {
    stages: [
      ["1. Planifica contenido y páginas", "Define usuario, objetivo de cada página, mapa de navegación y contenido principal antes de elegir estilos.", "El mapa tiene una ruta comprensible y cada pantalla responde a una tarea concreta."],
      ["2. Construye HTML semántico", "Organiza encabezados, navegación, contenido, enlaces, botones y formularios según su significado.", "Todos los enlaces y controles tienen nombre y función comprensibles sin depender del color."],
      ["3. Diseña y adapta CSS", "Implementa tokens, composición adaptable, foco visible y estados; comprueba tamaños estrechos y ampliación.", "No hay desbordamiento horizontal en el ancho probado y el contenido permanece legible."],
      ["4. Añade interacción accesible", "Implementa solo el JavaScript necesario y define carga, éxito, vacío y error para cada interacción.", "Los controles funcionan con teclado; el contenido de usuario se trata como texto y no se exponen secretos."],
      ["5. Publica y verifica", "Revisa enlaces y licencias, configura Pages desde la raíz correcta, prueba rutas en la URL publicada y registra hallazgos.", "La web publicada carga recursos y funciona en móvil; el README explica dónde está y cómo repetir el despliegue."]
    ],
    fields: ["Objetivo y mapa del sitio", "HTML y contenido", "Pruebas adaptables y accesibles", "Interacción y estados", "Enlace publicado y comprobaciones"]
  }
};
