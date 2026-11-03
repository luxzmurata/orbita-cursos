# Órbita — Cursos de tecnología

Portal educativo estático, en español, creado con HTML, CSS y JavaScript sin dependencias ni proceso de compilación. Incluye seis cursos independientes con una guía de primeros pasos y recursos para cada ruta, clases de profundización, ejemplos, prácticas, proyectos por etapas, rúbricas, bancos de preguntas aleatorias y una constancia privada imprimible.

## Estructura

```text
index.html       Estructura de la página y diálogo para la constancia
styles.css       Diseño adaptable, accesibilidad visual y plantilla de impresión
js/programs.js       Objetivos, módulos, proyectos, competencias y bancos de preguntas
js/lessons.js        Guías de inicio, glosarios, recursos y clases ampliadas
js/project-guides.js Hitos, evidencia y campos del portafolio final
js/app.js            Catálogo, evaluaciones aleatorias y progreso/portafolio local
```

## Cursos

- **Inteligencia artificial aplicada:** aprendizaje supervisado/no supervisado, entrenamiento, evaluación, Transformer, contexto, prompts, pose y composición de imagen, RAG, privacidad y pruebas del asistente de estudio.
- **Desarrollo guiado por especificaciones (SDD):** descubrimiento, escenarios, reglas, requisitos de calidad, arquitectura, decisiones, trazabilidad, pruebas y colaboración responsable con IA.
- **Programación con Java:** ciclo JDK/JVM, tipos y referencias, algoritmos, objetos, encapsulación, colecciones, excepciones, JUnit y gestor de biblioteca.
- **Programación con JavaScript:** fundamentos, referencias, funciones, DOM, formularios accesibles, asincronía, módulos, depuración y gestor de tareas.
- **Bases de datos y SQL:** modelado y normalización, consultas, joins, agregaciones, índices, transacciones, migraciones, parametrización y respaldos.
- **Desarrollo de páginas web:** HTML semántico, formularios, CSS, responsive design, accesibilidad, JavaScript y publicación con GitHub Pages.

Cada curso ofrece una guía para empezar desde cero (herramientas, pasos, glosario y recursos enlazados), lecciones de profundización con una explicación, ejemplo guiado y actividad, además de un proyecto final por hitos. Java incluye rutas con y sin instalación, instrucciones para instalar el JDK y usar VS Code con el Extension Pack for Java o un IDE alternativo. JavaScript y desarrollo web se pueden comenzar con un navegador, sin instalar Node.js. Cada examen selecciona cinco preguntas aleatorias: una de cada unidad y una adicional, mezclando preguntas y opciones de respuesta. El banco actual contiene catorce preguntas por curso.

## Progreso, evaluación y constancias

El progreso, los borradores y las distintas versiones del portafolio se guardan en el almacenamiento local de ese navegador. Para habilitar el examen hay que completar las unidades y guardar la autoevaluación del proyecto. El examen elige cinco preguntas de un banco de catorce (una por unidad y una adicional) y requiere un 80% para aprobar. Si se edita una versión ya entregada, se guarda una nueva autoevaluación y se vuelve a rendir el examen; los comentarios externos se deben incorporar manualmente. El portafolio se puede descargar como JSON y compartir directamente.

**No hay usuarios, inicio de sesión, base de datos central ni panel de administración.** El sitio es estático y no recibe proyectos. No almacenes información sensible en el editor; las entregas y el avance no se sincronizan entre dispositivos. La lista de comprobación y el examen local son autoevaluaciones, no una revisión docente independiente.

Al completar esos pasos se puede generar e imprimir una constancia personalizada o guardarla como PDF. Su folio se genera localmente; no hay servicio de verificación, servidor, identidad autenticada ni registro compartido. El progreso y la emisión se basan en la declaración de la persona que estudia y se pueden modificar desde el navegador.

**Las constancias de este sitio son comprobantes privados, generados localmente. No son títulos universitarios, acreditaciones oficiales, licencias profesionales ni certificaciones verificables por empleadores o terceros.** No se debe presentar la formación como acreditada ni atribuirse validación institucional.

### Cómo obtener una credencial con reconocimiento

No existe una entidad única que acredite automáticamente todos los cursos en todos los países. La acreditación académica debe consultarse con las autoridades y registros oficiales de la jurisdicción donde se ofrecerá el curso, o con una institución educativa autorizada que revise el programa y sus evaluaciones. Para credenciales de competencias profesionales, hay que comprobar qué certificadores reconoce el sector y el empleador al que se dirige.

**1EdTech Open Badges 3.0 no es un organismo que certifique el nivel académico de Órbita.** Es un estándar técnico para que una organización emisora entregue una credencial digital firmada, portable y comprobable, con criterios de logro y posible evidencia. Las especificaciones también contemplan avales de organizaciones externas. El formato ayuda a verificar quién emitió una afirmación y si cambió; no garantiza que una universidad, empleador o autoridad acepte la credencial.

Referencias primarias:

- [1EdTech: Open Badges](https://www.1edtech.org/standards/open-badges)
- [Especificación oficial de Open Badges 3.0](https://www.imsglobal.org/spec/ob/v3p0/)
- [W3C: Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/)

Para avanzar hacia ese estándar, Órbita necesitaría evaluación real de entregas por personas instructoras, identidad de estudiante verificada según un procedimiento acordado, criterios publicados, una entidad emisora que asuma responsabilidad y una plataforma/proveedor compatible que permita verificar firmas. Para acreditar el curso, además, debe revisarlo o avalarlo una institución con autoridad/reconocimiento pertinente. El país y el sector determinan qué entidad sería apropiada; por eso el sitio no afirma tener acreditación ni recomienda una entidad nacional sin conocer la jurisdicción.

## Ejecutarlo localmente

Abre `index.html` en un navegador moderno o sirve la carpeta con un servidor estático local. No requiere instalar paquetes. Las funciones de guardar progreso usan el almacenamiento local del navegador.

## Publicarlo en GitHub Pages

No hace falta compartir contraseñas, tokens ni credenciales con otra persona o con este sitio.

1. Inicia sesión en GitHub y crea un repositorio público, por ejemplo `orbita-cursos`.
2. Sube `index.html`, `styles.css`, `README.md` y la carpeta `js` a la raíz del repositorio. Puedes usar **Add file → Upload files** desde la web de GitHub, o Git:

   ```sh
   git init
   git add index.html styles.css README.md js
   git commit -m "Create Orbita learning portal"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/orbita-cursos.git
   git push -u origin main
   ```

3. En el repositorio, abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**; selecciona `main` y la carpeta `/(root)`, y guarda.
5. Espera a que termine el despliegue. Pages mostrará la dirección, normalmente `https://TU-USUARIO.github.io/orbita-cursos/`.
6. Visita esa dirección y prueba el menú, cursos, progreso, examen e impresión del certificado. En GitHub también puedes revisar **Actions** para ver el estado de publicación.

El repositorio y todos los archivos publicados en GitHub Pages son públicos. No añadas contraseñas, llaves privadas ni información personal. El progreso se conserva solo en el navegador y no se sincroniza entre dispositivos.
