(function () {
  "use strict";

  const nav = document.querySelector("#course-nav");
  const catalog = document.querySelector("#map-grid");
  const article = document.querySelector("#lesson-article");
  const aside = document.querySelector("#lesson-aside");
  const breadcrumb = document.querySelector("#breadcrumb-current");
  const progressBar = document.querySelector("#progress-bar");
  const progressValue = document.querySelector("#progress-value");
  const progressTrack = document.querySelector(".progress-track");
  const certificateDialog = document.querySelector("#certificate-dialog");
  let state = readState();
  let activeProgramId = null;

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem("orbita-academy-v1") || "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved)
        && saved.courses && typeof saved.courses === "object" && !Array.isArray(saved.courses)
        ? { courses: saved.courses }
        : { courses: {} };
    } catch (error) {
      console.warn("No se pudo leer el progreso guardado.", error);
      return { courses: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem("orbita-academy-v1", JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn("No se pudo guardar el progreso en este navegador.", error);
      return false;
    }
  }

  function courseState(programId) {
    let progress = state.courses[programId];
    if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
      progress = { modules: {}, projectComplete: false, projectAttempts: [], projectDraft: {}, activeExam: null, lastExam: null, examScore: null, certificate: null };
      state.courses[programId] = progress;
    }
    if (!progress.modules || typeof progress.modules !== "object" || Array.isArray(progress.modules)) progress.modules = {};
    if (!Array.isArray(progress.projectAttempts)) progress.projectAttempts = [];
    if (!progress.projectDraft || typeof progress.projectDraft !== "object" || Array.isArray(progress.projectDraft)) {
      progress.projectDraft = { responses: [], selfChecks: [] };
    }
    if (!Array.isArray(progress.projectDraft.responses)) progress.projectDraft.responses = [];
    if (!Array.isArray(progress.projectDraft.selfChecks)) progress.projectDraft.selfChecks = [];
    if (!Array.isArray(progress.activeExam)) progress.activeExam = null;
    if (progress.lastExam !== null && !Array.isArray(progress.lastExam)) progress.lastExam = null;
    if (typeof progress.projectComplete !== "boolean") progress.projectComplete = false;
    if (typeof progress.examScore !== "number" || !Number.isFinite(progress.examScore)) progress.examScore = null;
    if (!progress.certificate || typeof progress.certificate !== "object" || Array.isArray(progress.certificate)) progress.certificate = null;
    if (progress.projectComplete && progress.projectAttempts.length === 0) progress.projectComplete = false;
    if (progress.examScore !== null && !Array.isArray(progress.lastExam)) progress.examScore = null;
    return progress;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function getExam(program, progress) {
    const validSavedExam = Array.isArray(progress.activeExam)
      && progress.activeExam.length === program.modules.length + 1
      && progress.activeExam.every((item) => item && Number.isInteger(item.question)
        && program.quiz[item.question]
        && Array.isArray(item.options)
        && item.options.length === program.quiz[item.question].options.length);
    if (validSavedExam) return progress.activeExam;

    const selected = [];
    const used = new Set();
    program.modules.forEach((module, unit) => {
      const candidates = program.quiz
        .map((question, questionIndex) => ({ question, questionIndex }))
        .filter((entry) => entry.question.unit === unit);
      if (!candidates.length) {
        throw new Error("Falta un banco de preguntas para la unidad " + (unit + 1) + " del curso " + program.id + ".");
      }
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push(chosen);
      used.add(chosen.questionIndex);
    });

    const remaining = program.quiz
      .map((question, questionIndex) => ({ question, questionIndex }))
      .filter((entry) => !used.has(entry.questionIndex));
    if (!remaining.length) throw new Error("El banco de preguntas no contiene suficientes preguntas distintas.");
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);

    progress.activeExam = shuffle(selected).map((entry) => ({
      question: entry.questionIndex,
      options: shuffle(entry.question.options.map((option, optionIndex) => optionIndex))
    }));
    saveState();
    return progress.activeExam;
  }

  function readProjectForm(form, guide) {
    const formData = new FormData(form);
    return {
      responses: guide.fields.map((field, index) => String(formData.get("response-" + index) || "").trim()),
      selfChecks: guide.fields.length
        ? Array.from(form.querySelectorAll(".project-self-review input:checked"), (input) => Number(input.value))
        : []
    };
  }

  function updateProjectDraft(form, program) {
    const progress = courseState(program.id);
    if (progress.projectComplete) {
      progress.projectComplete = false;
      progress.examScore = null;
      progress.activeExam = null;
      progress.lastExam = null;
      progress.certificate = null;
    }
    progress.projectDraft = readProjectForm(form, PROJECT_GUIDES[program.id]);
    saveState();
  }

  function submitProject(form, program) {
    if (!form.reportValidity()) return;
    const checkboxes = Array.from(form.querySelectorAll(".project-self-review input"));
    const incompleteCheck = checkboxes.find((checkbox) => !checkbox.checked);
    checkboxes.forEach((checkbox) => checkbox.setCustomValidity(""));
    if (incompleteCheck) {
      incompleteCheck.setCustomValidity("Revisa todos los criterios de la rúbrica antes de guardar tu autoevaluación.");
      incompleteCheck.reportValidity();
      return;
    }

    const progress = courseState(program.id);
    const previousAttemptCount = progress.projectAttempts.length;
    const attempt = readProjectForm(form, PROJECT_GUIDES[program.id]);
    if (previousAttemptCount > 0) {
      progress.examScore = null;
      progress.activeExam = null;
      progress.lastExam = null;
      progress.certificate = null;
    }
    progress.projectAttempts.push({
      number: previousAttemptCount + 1,
      date: new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" }).format(new Date()),
      responses: attempt.responses,
      selfChecks: attempt.selfChecks
    });
    progress.projectDraft = attempt;
    progress.projectComplete = true;
    saveState();
    renderProgram(program.id);
    document.querySelector(".attempt-history").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function downloadProject(programId) {
    const program = PROGRAMS.find((item) => item.id === programId);
    if (!program) return;
    const progress = courseState(program.id);
    if (!progress.projectAttempts.length) return;
    const portfolio = {
      title: program.project.title,
      course: program.title,
      exportedAt: new Date().toISOString(),
      notice: "Portafolio creado localmente por la persona estudiante. No es una entrega recibida, evaluada ni aprobada por Órbita.",
      rubric: program.project.rubric,
      stages: PROJECT_GUIDES[program.id].stages.map(([title, instructions, evidence]) => ({ title, instructions, completionEvidence: evidence })),
      attempts: progress.projectAttempts
    };
    const file = new Blob([JSON.stringify(portfolio, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orbita-" + program.id + "-portafolio.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function updateProgress() {
    const total = PROGRAMS.reduce((count, program) => count + program.modules.length, 0);
    const finished = PROGRAMS.reduce((count, program) => {
      const progress = courseState(program.id);
      return count + program.modules.filter((module, index) => progress.modules[index]).length;
    }, 0);
    const percentage = total ? Math.round((finished / total) * 100) : 0;
    progressBar.style.width = percentage + "%";
    progressValue.textContent = percentage + "%";
    progressTrack.setAttribute("aria-valuenow", String(percentage));

    nav.querySelectorAll("[data-program-id]").forEach((button) => {
      const program = PROGRAMS.find((item) => item.id === button.dataset.programId);
      const progress = courseState(button.dataset.programId);
      const done = program.modules.filter((module, index) => progress.modules[index]).length;
      button.classList.toggle("is-complete", Boolean(progress.certificate));
      button.querySelector(".nav-check").textContent = progress.certificate ? "✓" : (done ? done + "/" + program.modules.length : "");
    });

    catalog.querySelectorAll("[data-program-id]").forEach((card) => {
      const program = PROGRAMS.find((item) => item.id === card.dataset.programId);
      const progress = courseState(card.dataset.programId);
      const done = program.modules.filter((module, index) => progress.modules[index]).length;
      const label = card.querySelector(".course-progress");
      label.textContent = progress.certificate
        ? "CURSO COMPLETADO · CONSTANCIA DISPONIBLE"
        : done + " DE " + program.modules.length + " UNIDADES COMPLETADAS";
    });
  }

  function renderNav() {
    nav.innerHTML = PROGRAMS.map((program, index) => `
      <button class="nav-item" type="button" data-program-id="${escapeHtml(program.id)}">
        <span class="nav-number">${String(index + 1).padStart(2, "0")}</span>
        <span>${escapeHtml(program.title)}</span><span class="nav-check" aria-hidden="true"></span>
      </button>`).join("");
    updateProgress();
  }

  function renderCatalog() {
    catalog.innerHTML = PROGRAMS.map((program, index) => `
      <button class="map-card course-card" type="button" data-program-id="${escapeHtml(program.id)}">
        <span class="map-card-top"><span>${escapeHtml(program.category)}</span><span>${String(index + 1).padStart(2, "0")}</span></span>
        <span class="map-card-title">${escapeHtml(program.title)}</span>
        <span class="map-card-description">${escapeHtml(program.subtitle)}</span>
        <span class="course-card-meta"><span>${escapeHtml(program.level)}</span><span>${escapeHtml(program.duration)}</span></span>
        <span class="course-progress"></span>
        <span class="map-card-arrow" aria-hidden="true">↗</span>
      </button>`).join("");
    updateProgress();
  }

  function renderProgram(programId) {
    const program = PROGRAMS.find((item) => item.id === programId);
    if (!program) return;
    activeProgramId = program.id;
    const progress = courseState(program.id);
    document.querySelector("#welcome").classList.add("is-collapsed");
    document.querySelector("#roadmap").classList.add("is-collapsed");
    document.querySelector("#lesson-content").classList.add("is-open");
    breadcrumb.textContent = program.title.toLocaleUpperCase("es");

    nav.querySelectorAll(".nav-item").forEach((button) => {
      const current = button.dataset.programId === program.id;
      button.classList.toggle("is-active", current);
      if (current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    const completedUnits = program.modules.filter((module, index) => progress.modules[index]).length;
    const allModulesComplete = completedUnits === program.modules.length;
    const projectReady = Boolean(progress.projectComplete);
    const examReady = allModulesComplete && projectReady;
    const extendedLessons = EXTENDED_LESSONS[program.id] || [];
    const startGuide = START_GUIDES[program.id];
    const startGuideMarkup = startGuide ? `
      <section class="start-guide" aria-labelledby="start-guide-title">
        <div class="lesson-kicker"><span>GUÍA PARA PRINCIPIANTES</span><span>EMPIEZA AQUÍ</span></div>
        <h2 id="start-guide-title">${escapeHtml(startGuide.title)}</h2>
        <p>${escapeHtml(startGuide.intro)}</p>
        <h3>Haz esto en orden</h3>
        <ol class="start-guide-steps">${startGuide.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        <h3>Palabras que verás en el curso</h3>
        <dl class="start-guide-glossary">${startGuide.glossary.map(([term, meaning]) => `
          <div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(meaning)}</dd></div>`).join("")}</dl>
        <h3>Recursos para continuar</h3>
        <ul class="start-guide-resources">${startGuide.resources.map(([label, url, detail]) => `
          <li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a><p>${escapeHtml(detail)}</p></li>`).join("")}</ul>
        <p class="start-guide-note"><strong>Recuerda:</strong> ${escapeHtml(startGuide.note)}</p>
      </section>` : "";
    const unitsMarkup = program.modules.map((module, index) => {
      const isComplete = Boolean(progress.modules[index]);
      const deepLessons = extendedLessons.filter((lesson) => lesson.unit === index);
      return `
        <section class="course-unit" id="unit-${index}">
          <div class="unit-heading">
            <span class="unit-index">UNIDAD ${String(index + 1).padStart(2, "0")}</span>
            <span class="unit-state ${isComplete ? "is-done" : ""}">${isComplete ? "COMPLETADA" : "EN CURSO"}</span>
          </div>
          <h2>${escapeHtml(module.title)}</h2>
          <p class="unit-objective"><strong>Objetivo de aprendizaje:</strong> ${escapeHtml(module.objective)}</p>
          ${module.topics.map((topic) => `
            <div class="unit-topic">
              <h3>${escapeHtml(topic.title)}</h3>
              ${topic.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
              <div class="worked-example"><span class="takeaway-label">EJEMPLO GUIADO</span><p>${escapeHtml(topic.example)}</p></div>
              <div class="practice-prompt"><span class="takeaway-label">PRÁCTICA DE LA CLASE</span><p>${escapeHtml(topic.activity)}</p></div>
            </div>`).join("")}
          ${deepLessons.map((lesson) => `
            <div class="unit-topic deep-lesson">
              <span class="deep-lesson-label">CLASE DE PROFUNDIZACIÓN</span>
              <h3>${escapeHtml(lesson.title)}</h3>
              ${lesson.explanation.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
              <div class="worked-example"><span class="takeaway-label">EJEMPLO PASO A PASO</span><p>${escapeHtml(lesson.example)}</p></div>
              <div class="practice-prompt"><span class="takeaway-label">ACTIVIDAD DE APLICACIÓN</span><p>${escapeHtml(lesson.practice)}</p></div>
            </div>`).join("")}
          <label class="unit-checkbox">
            <input type="checkbox" data-module="${index}" ${isComplete ? "checked" : ""}>
            <span>Marcar unidad como estudiada y práctica realizada</span>
          </label>
        </section>`;
    }).join("");

    const deliverables = program.project.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const rubric = program.project.rubric.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    const projectGuide = PROJECT_GUIDES[program.id];
    const projectStages = projectGuide.stages.map(([title, instructions, evidence]) => `
      <li class="project-stage"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(instructions)}</p><span>LISTO CUANDO: ${escapeHtml(evidence)}</span></li>`).join("");
    const projectDraft = progress.projectDraft;
    const projectAttempts = progress.projectAttempts;
    const attemptsMarkup = projectAttempts.length
      ? `<div class="attempt-history"><h3>Versiones guardadas en este navegador (${projectAttempts.length})</h3>
          <ol>${projectAttempts.map((attempt) => `
            <li><strong>Versión ${attempt.number} · ${escapeHtml(attempt.date)}</strong>
            <span>${escapeHtml(Array.isArray(attempt.responses) ? attempt.responses.join(" · ").slice(0, 180) : "Entrega guardada")}${Array.isArray(attempt.responses) && attempt.responses.join(" · ").length > 180 ? "…" : ""}</span></li>`).join("")}</ol>
          <button class="secondary-button" type="button" data-download-project="${escapeHtml(program.id)}">Descargar portafolio para compartir</button>
          <p>La descarga incluye tus versiones y autoevaluación; puedes enviarla manualmente a una persona instructora. Órbita no recibe el archivo.</p>
        </div>`
      : `<div class="attempt-history"><p>Aún no guardas una versión. El editor conserva el borrador localmente al escribir.</p></div>`;

    const skills = program.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("");
    let examMarkup = "";
    if (examReady && progress.examScore === null) {
      const exam = getExam(program, progress);
      examMarkup = `<form class="exam-form" id="exam-form">
        ${exam.map((item, questionIndex) => {
          const question = program.quiz[item.question];
          return `<fieldset class="exam-question">
            <legend>${questionIndex + 1}. ${escapeHtml(question.q)}</legend>
            ${item.options.map((originalOptionIndex) => `
            <label class="exam-option">
              <input type="radio" name="question-${questionIndex}" value="${originalOptionIndex}" required>
              <span>${escapeHtml(question.options[originalOptionIndex])}</span>
            </label>`).join("")}
          </fieldset>`;
        }).join("")}
        <button class="primary-button exam-submit" type="submit">Calificar evaluación <span aria-hidden="true">→</span></button>
        <p class="exam-help">Banco de ${program.quiz.length} preguntas. Cada intento elige una pregunta al azar por unidad y una adicional, mezclando el orden de preguntas y opciones. Necesitas 80% para aprobar.</p>
      </form>`;
    } else if (progress.examScore !== null) {
      const lastAnswers = Array.isArray(progress.lastExam) ? progress.lastExam : [];
      examMarkup = `
        <div class="exam-result ${progress.examScore >= 80 ? "is-passed" : "is-failed"}">
          <span class="takeaway-label">${progress.examScore >= 80 ? "EVALUACIÓN APROBADA" : "REPASO RECOMENDADO"}</span>
          <strong>${progress.examScore}%</strong>
          <p>${progress.examScore >= 80 ? "Ya cumpliste el criterio de evaluación del curso." : "Repasa las unidades y vuelve a intentar. Necesitas un 80% para aprobar."}</p>
          <div class="exam-review">${lastAnswers.map((answer) => {
            const question = program.quiz[answer.question];
            const correct = Number(answer.selected) === question.answer;
            return `<div><strong>${correct ? "Correcta" : "Para repasar"} · ${escapeHtml(question.q)}</strong>
            <p>${escapeHtml(question.why)}</p>
            <p>Respuesta correcta: ${escapeHtml(question.options[question.answer])}</p></div>`;
          }).join("")}</div>
          ${progress.examScore >= 80
            ? `<button class="primary-button" type="button" data-create-certificate="${escapeHtml(program.id)}">Preparar constancia <span aria-hidden="true">↗</span></button>`
            : `<button class="secondary-button" type="button" data-retry-exam>Intentar de nuevo</button>`}
        </div>`;
    }

    const certificateMarkup = progress.certificate
      ? `<div class="issued-certificate">
           <span class="takeaway-label">CONSTANCIA GENERADA</span>
           <strong>${escapeHtml(progress.certificate.name)}</strong>
           <span>Folio local: ${escapeHtml(progress.certificate.folio)}</span>
           <button class="secondary-button" type="button" data-print-certificate="${escapeHtml(program.id)}">Imprimir o guardar como PDF</button>
           <p>Este documento es una constancia privada de finalización, no una acreditación oficial ni un registro verificable en línea.</p>
         </div>`
      : "";

    article.innerHTML = `
      <div class="lesson-kicker"><span>${escapeHtml(program.category)}</span><span>CURSO · ${escapeHtml(program.level)}</span></div>
      <h1>${escapeHtml(program.title)}</h1>
      <p class="lesson-intro">${escapeHtml(program.subtitle)} Esta ruta se estudia de manera independiente, con ejercicios y un proyecto aplicado.</p>
      <div class="course-facts">
        <div><span>NIVEL</span><strong>${escapeHtml(program.level)}</strong></div>
        <div><span>DEDICACIÓN ORIENTATIVA</span><strong>${escapeHtml(program.duration)}</strong></div>
        <div><span>UNIDADES COMPLETADAS</span><strong>${completedUnits} / ${program.modules.length}</strong></div>
      </div>
      <div class="takeaway"><span class="takeaway-label">ANTES DE EMPEZAR</span><p>${escapeHtml(program.prerequisites)}</p></div>
      ${startGuideMarkup}
      <section class="course-overview"><h2>Al finalizar podrás</h2><ul>${program.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
      <div class="lesson-rule"></div>
      <h2 class="curriculum-title">Programa de estudios</h2>
      <p class="curriculum-intro">Estudia las explicaciones, revisa los ejemplos y realiza las prácticas. Marca cada unidad después de trabajarla; el avance se guarda en este navegador.</p>
      ${unitsMarkup}
      <section class="course-project" id="course-project">
        <div class="lesson-kicker"><span>TRABAJO INTEGRADOR</span><span>PROYECTO FINAL</span></div>
        <h2>${escapeHtml(program.project.title)}</h2>
        <p>${escapeHtml(program.project.brief)}</p>
        <h3>Ruta de trabajo y puntos de control</h3>
        <ol class="project-stages">${projectStages}</ol>
        <h3>Entregables</h3><ul>${deliverables}</ul>
        <h3>Rúbrica de revisión</h3><ul>${rubric}</ul>
        <div class="project-studio">
          <div class="project-studio-heading">
            <div><span class="takeaway-label">CUADERNO DE ENTREGA · VERSIÓN ${projectAttempts.length + 1}</span>
              <h3>Documenta lo que construiste.</h3></div>
            <span class="local-only-badge">SOLO EN ESTE NAVEGADOR</span>
          </div>
          <p>Completa cada apartado, contrasta tu trabajo con la rúbrica y guarda una versión. Si recibes comentarios, anótalos en la reflexión y guarda otra versión para practicar la mejora.</p>
          <form id="project-form" class="project-form">
            ${projectGuide.fields.map((field, index) => `
              <label class="project-response-field" for="project-response-${index}">
                <span>${index + 1}. ${escapeHtml(field)}</span>
                <textarea id="project-response-${index}" name="response-${index}" rows="4" minlength="25" maxlength="4000" required>${escapeHtml(projectDraft.responses[index] || "")}</textarea>
                <small>Escribe al menos 25 caracteres; incluye decisiones y evidencia concreta.</small>
              </label>`).join("")}
            <fieldset class="project-self-review">
              <legend>Autoevaluación: revisé cada criterio de la rúbrica antes de guardar.</legend>
              ${program.project.rubric.map((criterion, index) => `
                <label><input type="checkbox" name="self-check-${index}" value="${index}" ${projectDraft.selfChecks.includes(index) ? "checked" : ""}>
                  <span>${escapeHtml(criterion)}</span></label>`).join("")}
            </fieldset>
            <button class="primary-button" type="submit">Guardar esta versión <span aria-hidden="true">↓</span></button>
          </form>
          ${attemptsMarkup}
          <p class="honor-note">El cuaderno, los intentos y la autoevaluación se guardan localmente y no se envían a un administrador. No adjuntes información privada. La autoevaluación no es una calificación docente; puedes descargar el portafolio y compartirlo tú.</p>
        </div>
      </section>
      <section class="course-exam" id="course-exam">
        <div class="lesson-kicker"><span>EVALUACIÓN FINAL</span><span>5 PREGUNTAS · ${program.quiz.length} EN BANCO</span></div>
        <h2>Comprueba lo que aprendiste.</h2>
        ${examReady
          ? examMarkup
          : `<p class="exam-locked">Para habilitar el examen, completa las ${program.modules.length} unidades y confirma que realizaste el proyecto final. Vas ${completedUnits}/${program.modules.length} unidades y ${projectReady ? "proyecto confirmado" : "proyecto pendiente"}.</p>`}
        ${certificateMarkup}
      </section>
      <section class="skills-panel"><div class="takeaway-label">COMPETENCIAS TRABAJADAS</div><ul>${skills}</ul></section>
      <div class="course-end-note">Esta formación es educativa e independiente. No equivale a un título universitario, licencia profesional, certificación oficial ni garantía de empleo.</div>`;

    aside.innerHTML = `
      <div class="aside-card"><div class="aside-heading">CONTENIDO DEL CURSO</div>
        <ol>${program.modules.map((module, index) => `<li><a href="#unit-${index}">Unidad ${index + 1}: ${escapeHtml(module.title)}</a></li>`).join("")}
          <li><a href="#course-project">Proyecto final</a></li><li><a href="#course-exam">Evaluación y constancia</a></li>
        </ol>
      </div>
      <button class="back-to-map" type="button" id="back-to-map">← Volver al catálogo</button>`;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("#lesson-content").focus({ preventScroll: true });
    closeMenu();
    updateProgress();
  }

  function showCatalog() {
    activeProgramId = null;
    document.querySelector("#lesson-content").classList.remove("is-open");
    document.querySelector("#welcome").classList.remove("is-collapsed");
    document.querySelector("#roadmap").classList.remove("is-collapsed");
    breadcrumb.textContent = "INICIO";
    nav.querySelectorAll(".nav-item").forEach((button) => {
      button.classList.remove("is-active");
      button.removeAttribute("aria-current");
    });
    window.scrollTo({ top: document.querySelector("#roadmap").offsetTop, behavior: "smooth" });
    closeMenu();
  }

  function gradeExam(form, program) {
    const answers = new FormData(form);
    const progress = courseState(program.id);
    const exam = progress.activeExam;
    if (!Array.isArray(exam) || exam.some((item, index) => !answers.has("question-" + index))) {
      form.reportValidity();
      return;
    }
    const lastExam = exam.map((item, index) => ({
      question: item.question,
      selected: Number(answers.get("question-" + index))
    }));
    const correct = lastExam.reduce((score, item) =>
      score + (item.selected === program.quiz[item.question].answer ? 1 : 0), 0);
    const score = Math.round((correct / exam.length) * 100);
    progress.examScore = score;
    progress.lastExam = lastExam;
    progress.activeExam = null;
    saveState();
    renderProgram(program.id);
    const result = article.querySelector(".exam-result");
    if (result) result.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function createFolio(programId) {
    const suffix = window.crypto && typeof window.crypto.getRandomValues === "function"
      ? Array.from(window.crypto.getRandomValues(new Uint8Array(4)), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();
    const date = new Date();
    const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("");
    return "ORB-" + programId.toUpperCase() + "-" + day + "-" + suffix;
  }

  function openCertificateDialog(programId) {
    activeProgramId = programId;
    document.querySelector("#certificate-name").value = "";
    certificateDialog.showModal();
    document.querySelector("#certificate-name").focus();
  }

  function generateCertificate() {
    const program = PROGRAMS.find((item) => item.id === activeProgramId);
    const name = document.querySelector("#certificate-name").value.trim();
    if (!program || name.length < 2) {
      document.querySelector("#certificate-name").setCustomValidity("Escribe un nombre de al menos dos caracteres.");
      document.querySelector("#certificate-name").reportValidity();
      return;
    }
    document.querySelector("#certificate-name").setCustomValidity("");
    const progress = courseState(program.id);
    if (progress.examScore < 80 || !progress.projectComplete || program.modules.some((module, index) => !progress.modules[index])) {
      certificateDialog.close();
      renderProgram(program.id);
      return;
    }

    const date = new Intl.DateTimeFormat("es", { dateStyle: "long" }).format(new Date());
    if (!progress.certificate) {
      progress.certificate = { name, date, folio: createFolio(program.id), score: progress.examScore };
    } else {
      progress.certificate.name = name;
    }
    saveState();
    const certificate = progress.certificate;
    renderPrintableCertificate(program, certificate);
    certificateDialog.close();
    renderProgram(program.id);
    window.setTimeout(() => window.print(), 250);
  }

  function renderPrintableCertificate(program, certificate) {
    document.querySelector("#certificate-print").innerHTML = `
      <article class="certificate-sheet">
        <div class="certificate-orbit certificate-orbit-one"></div><div class="certificate-orbit certificate-orbit-two"></div>
        <div class="certificate-content">
          <div class="certificate-brand"><span class="certificate-mark">✳</span> ÓRBITA <span>· AULA DIGITAL</span></div>
          <div class="certificate-rule"></div>
          <p class="certificate-kicker">CONSTANCIA PRIVADA DE FINALIZACIÓN</p>
          <h1>Certificado<br><span>de finalización</span></h1>
          <p class="certificate-intro">Se otorga a</p>
          <p class="certificate-recipient">${escapeHtml(certificate.name)}</p>
          <p class="certificate-body">Por completar el programa formativo <strong>${escapeHtml(program.title)}</strong>, realizar el proyecto integrador y aprobar la evaluación final con <strong>${escapeHtml(String(certificate.score))}%</strong>.</p>
          <div class="certificate-skills"><span>COMPETENCIAS TRABAJADAS</span><p>${program.skills.map(escapeHtml).join(" · ")}</p></div>
          <div class="certificate-footer">
            <div><span>FECHA DE FINALIZACIÓN</span><strong>${escapeHtml(certificate.date)}</strong></div>
            <div><span>FOLIO LOCAL</span><strong>${escapeHtml(certificate.folio)}</strong></div>
            <div class="certificate-signature"><span>ÓRBITA · AULA DIGITAL</span><strong>Formación independiente</strong></div>
          </div>
          <p class="certificate-legal">Constancia privada de finalización. No es título académico, acreditación oficial, licencia profesional ni credencial verificable por terceros. El folio se genera localmente y no existe un registro central.</p>
        </div>
      </article>`;
  }

  function closeMenu() {
    document.body.classList.remove("menu-open");
    document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
  }

  function bindEvents() {
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("[data-program-id]");
      if (button) renderProgram(button.dataset.programId);
    });
    catalog.addEventListener("click", (event) => {
      const button = event.target.closest("[data-program-id]");
      if (button) renderProgram(button.dataset.programId);
    });
    article.addEventListener("change", (event) => {
      const checkbox = event.target;
      if (checkbox.matches("[data-module]") && activeProgramId) {
        courseState(activeProgramId).modules[checkbox.dataset.module] = checkbox.checked;
        saveState();
        renderProgram(activeProgramId);
      }
      if (checkbox.matches(".project-self-review input") && activeProgramId) {
        article.querySelectorAll(".project-self-review input").forEach((input) => input.setCustomValidity(""));
        const form = article.querySelector("#project-form");
        const program = PROGRAMS.find((item) => item.id === activeProgramId);
        if (form && program) updateProjectDraft(form, program);
      }
    });
    article.addEventListener("input", (event) => {
      if (event.target.closest("#project-form") && activeProgramId) {
        const program = PROGRAMS.find((item) => item.id === activeProgramId);
        if (program) updateProjectDraft(event.target.closest("#project-form"), program);
      }
    });
    article.addEventListener("submit", (event) => {
      if (event.target.matches("#project-form")) {
        event.preventDefault();
        const program = PROGRAMS.find((item) => item.id === activeProgramId);
        if (program) submitProject(event.target, program);
        return;
      }
      if (!event.target.matches("#exam-form")) return;
      event.preventDefault();
      const program = PROGRAMS.find((item) => item.id === activeProgramId);
      if (program) gradeExam(event.target, program);
    });
    article.addEventListener("click", (event) => {
      const certificateButton = event.target.closest("[data-create-certificate]");
      if (certificateButton) openCertificateDialog(certificateButton.dataset.createCertificate);
      const downloadButton = event.target.closest("[data-download-project]");
      if (downloadButton) downloadProject(downloadButton.dataset.downloadProject);
      if (event.target.closest("[data-retry-exam]") && activeProgramId) {
        const progress = courseState(activeProgramId);
        progress.examScore = null;
        progress.activeExam = null;
        progress.lastExam = null;
        saveState();
        renderProgram(activeProgramId);
        document.querySelector("#course-exam").scrollIntoView({ behavior: "smooth" });
      }
      const printButton = event.target.closest("[data-print-certificate]");
      if (printButton) {
        const program = PROGRAMS.find((item) => item.id === printButton.dataset.printCertificate);
        const certificate = courseState(printButton.dataset.printCertificate).certificate;
        if (program && certificate) {
          activeProgramId = program.id;
          renderPrintableCertificate(program, certificate);
          window.print();
        }
      }
    });
    aside.addEventListener("click", (event) => {
      if (event.target.closest("#back-to-map")) showCatalog();
    });
    document.querySelector("#close-certificate").addEventListener("click", () => certificateDialog.close());
    document.querySelector("#cancel-certificate").addEventListener("click", () => certificateDialog.close());
    document.querySelector("#generate-certificate").addEventListener("click", generateCertificate);
    document.querySelector("#certificate-name").addEventListener("input", (event) => event.target.setCustomValidity(""));
    certificateDialog.addEventListener("click", (event) => {
      if (event.target === certificateDialog) certificateDialog.close();
    });
    document.querySelector("#menu-toggle").addEventListener("click", (event) => {
      const opened = document.body.classList.toggle("menu-open");
      event.currentTarget.setAttribute("aria-expanded", String(opened));
    });
    document.querySelector("#nav-scrim").addEventListener("click", closeMenu);
    document.querySelector(".topbar-link").addEventListener("click", showCatalog);
    document.querySelector(".site-footer > a:last-child").addEventListener("click", showCatalog);
  }

  renderNav();
  renderCatalog();
  bindEvents();
})();
