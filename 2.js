// ═══════════════════════════════════════════════════════════════════
// CS-TEACHER-PANEL.js
// UI панели "AI Teacher" — рендерит объяснения концепций локально
// Зависит от: cs-concepts-engine.js
// Без внешних API. Подключи оба файла в polyglot-ide.html
// ═══════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Ссылки на DOM ────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  let teacherOpen = false;
  let lastRunOutput = [];
  let lastCode = '';
  let lastLang = '';

  // ── Открыть/закрыть панель ───────────────────────────────────────
  window.toggleTeacher = function () {
    teacherOpen = !teacherOpen;
    const panel = $('teacherPanel');
    if (!panel) return;
    panel.classList.toggle('open', teacherOpen);

    // Если открыли — анализируем текущий код
    if (teacherOpen && lastCode) {
      analyzeAndRender(lastCode, lastRunOutput, false);
    }
  };

  // ── Вызывается после каждого запуска C# файла ───────────────────
  // В основном коде IDE добавь вызов: notifyTeacher(code, outputLines, lang)
  window.notifyTeacher = function (code, outputLines, lang) {
    lastCode = code || '';
    lastRunOutput = outputLines || [];
    lastLang = lang || '';

    // Обновляем статус
    const status = $('teacherStatus');
    if (status) {
      if (lang === 'csharp') {
        status.textContent = `● ${new Date().toLocaleTimeString()}`;
        status.style.color = '#aaff00';
      } else {
        status.textContent = '○ не C#';
        status.style.color = 'var(--muted)';
      }
    }

    // Если панель открыта — перерисовать
    if (teacherOpen) {
      analyzeAndRender(code, outputLines, lang !== 'csharp');
    }
  };

  // ── Основная функция анализа и рендера ──────────────────────────
  function analyzeAndRender(code, output, nonCSharp) {
    const engine = window.CS_CONCEPTS_ENGINE;
    if (!engine) {
      renderError('cs-concepts-engine.js не подключён');
      return;
    }

    const body = $('teacherBody');
    const concepts = $('teacherConcepts');
    if (!body || !concepts) return;

    if (nonCSharp) {
      concepts.innerHTML = '<span style="font-size:10px;color:var(--muted);">Учитель работает только с C# файлами</span>';
      body.innerHTML = '<div style="color:var(--muted);font-size:11px;padding:16px 0;">Открой файл .cs и запусти — объясню код!</div>';
      return;
    }

    if (!code.trim()) {
      concepts.innerHTML = '<span style="font-size:10px;color:var(--muted);">Файл пустой...</span>';
      body.innerHTML = '';
      return;
    }

    // 1. Определяем концепции в коде
    const detected = engine.detectConcepts(code);

    // 2. Анализируем ошибки в выводе
    const errors = engine.analyzeErrors(output);
    const hasErrors = errors.length > 0;

    // 3. Рендерим пиллюли концепций
    renderConceptPills(concepts, detected, hasErrors);

    // 4. Рендерим тело
    renderTeacherBody(body, detected, errors, output, code);
  }

  // ── Пиллюли концепций ────────────────────────────────────────────
  function renderConceptPills(container, detected, hasErrors) {
    if (!detected.length) {
      container.innerHTML = '<span style="font-size:10px;color:var(--muted);">Концепции не распознаны</span>';
      return;
    }

    const pills = detected.slice(0, 12).map(c => {
      const cls = hasErrors ? 'has-error' : 'ok';
      return `<span class="concept-pill ${cls}" onclick="showConceptDetail('${c.id}')" title="${c.name}">${c.name}</span>`;
    });

    // Остаток
    if (detected.length > 12) {
      pills.push(`<span style="font-size:9px;color:var(--muted);">+${detected.length - 12} ещё</span>`);
    }

    container.innerHTML = pills.join('');
  }

  // ── Тело учителя ─────────────────────────────────────────────────
  function renderTeacherBody(container, detected, errors, output, code) {
    let html = '';

    // Блок ошибок (если есть)
    if (errors.length) {
      html += `<div class="teach-error-banner">
        <div class="err-title">⚠ Обнаружены ошибки (${errors.length})</div>
        <div class="err-msg">${errors.map(e => `<b>${e.title}</b>: ${e.fix}`).join('<br>')}</div>
      </div>`;

      // Примеры исправлений
      for (const err of errors) {
        if (err.example) {
          html += `<div class="teach-block eb">
            <div class="teach-block-title">
              <span>🔧 Как исправить: ${err.title}</span>
              <span class="teach-block-type et">ОШИБКА</span>
            </div>
            <div class="teach-block-code">${escHtml(err.example)}</div>
          </div>`;
        }
      }
    }

    // Нет кода — подсказка
    if (!detected.length) {
      html += `<div style="color:var(--muted);font-size:11px;padding:16px 0;">
        Запусти C# код — объясню все концепции которые найду!<br><br>
        <span style="color:#c39bd3;">Всего знаю: ${Object.keys(window.CS_CONCEPTS_ENGINE.CS_CONCEPTS).length} концепций</span>
      </div>`;
      container.innerHTML = html;
      return;
    }

    // Блоки концепций (первые 6)
    const toShow = detected.slice(0, 6);
    for (const concept of toShow) {
      const isFirst = toShow[0] === concept;
      html += renderConceptBlock(concept, isFirst && !errors.length);
    }

    // Если больше 6 — кнопка "показать ещё"
    if (detected.length > 6) {
      html += `<div style="text-align:center;padding:8px 0;">
        <button onclick="showAllConcepts()" class="teach-btn" style="width:100%;background:rgba(155,89,182,0.15);color:#c39bd3;border:1px solid rgba(155,89,182,0.3);">
          ↓ Ещё ${detected.length - 6} концепций
        </button>
      </div>`;
    }

    container.innerHTML = html;
  }

  // ── Блок одной концепции ─────────────────────────────────────────
  function renderConceptBlock(concept, highlight) {
    const tagsHtml = concept.tags.map(t =>
      `<span class="teach-block-type">${t.toUpperCase()}</span>`
    ).join(' ');

    return `<div class="teach-block${highlight ? ' highlight' : ''}">
      <div class="teach-block-title">
        <span>${concept.name}</span>
        ${tagsHtml}
      </div>
      <div class="teach-block-desc">${escHtml(concept.explain)}</div>
      ${concept.example ? `<div class="teach-block-code">${escHtml(concept.example)}</div>` : ''}
      ${concept.tip ? `<div class="teach-block-fix">💡 ${escHtml(concept.tip)}</div>` : ''}
    </div>`;
  }

  // ── Показать конкретную концепцию по клику на пиллюлю ───────────
  window.showConceptDetail = function (id) {
    const engine = window.CS_CONCEPTS_ENGINE;
    if (!engine) return;
    const concept = engine.teachConcept(id);
    if (!concept) return;

    const body = $('teacherBody');
    if (!body) return;

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <button onclick="restoreTeacherBody()" class="teach-btn" style="background:var(--s2);border:1px solid var(--b2);color:var(--muted);">← Назад</button>
        <span style="font-size:12px;color:#c39bd3;font-weight:700;">${concept.name}</span>
      </div>
      ${renderConceptBlock(concept, true)}
    `;
  };

  // ── Восстановить тело после детального просмотра ────────────────
  window.restoreTeacherBody = function () {
    if (lastCode) analyzeAndRender(lastCode, lastRunOutput, lastLang !== 'csharp');
  };

  // ── Показать все концепции ───────────────────────────────────────
  window.showAllConcepts = function () {
    const engine = window.CS_CONCEPTS_ENGINE;
    if (!engine) return;
    const detected = engine.detectConcepts(lastCode);
    const body = $('teacherBody');
    if (!body) return;

    let html = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <button onclick="restoreTeacherBody()" class="teach-btn" style="background:var(--s2);border:1px solid var(--b2);color:var(--muted);">← Назад</button>
      <span style="font-size:12px;color:#c39bd3;">Все концепции (${detected.length})</span>
    </div>`;

    for (const concept of detected) {
      html += renderConceptBlock(concept, false);
    }

    body.innerHTML = html;
  };

  // ── Поиск по вопросу пользователя ───────────────────────────────
  window.teachAsk = function () {
    const engine = window.CS_CONCEPTS_ENGINE;
    const input = $('teachAskInput');
    const btn = $('teachAskBtn');
    const body = $('teacherBody');
    if (!engine || !input || !body) return;

    const query = input.value.trim();
    if (!query) return;

    btn.disabled = true;
    input.value = '';

    // Ищем в локальной базе
    const results = engine.searchConcepts(query);

    if (!results.length) {
      const noResult = document.createElement('div');
      noResult.className = 'teach-block';
      noResult.innerHTML = `
        <div class="teach-block-title">🔍 «${escHtml(query)}»</div>
        <div class="teach-block-desc">Концепция не найдена в базе. Попробуй: переменные, цикл, класс, LINQ, async, generics, delegates, lambda, exception, reflection, struct, enum, interface, наследование, указатели, сокеты, HTTP, JSON</div>
      `;
      body.insertBefore(noResult, body.firstChild);
    } else {
      // Добавляем результаты вверху
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `<div style="font-size:10px;color:#c39bd3;margin-bottom:8px;">🔍 Результаты для «${escHtml(query)}»:</div>`;
      for (const r of results.slice(0, 3)) {
        wrapper.innerHTML += renderConceptBlock(r, false);
      }
      body.insertBefore(wrapper, body.firstChild);
      body.scrollTop = 0;
    }

    btn.disabled = false;
  };

  // ── Вспомогательные ─────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  function renderError(msg) {
    const body = $('teacherBody');
    if (body) body.innerHTML = `<div style="color:#ff5555;font-size:11px;">${msg}</div>`;
  }

  // ── Интеграция с кнопкой Run ─────────────────────────────────────
  // Патчим существующий runCurrent чтобы уведомлять учителя
  // Вызывается после загрузки обоих скриптов
  function patchRunCurrent() {
    const origRun = window.runCurrent;
    if (!origRun) return;

    window.runCurrent = async function () {
      // Сохраняем текущий код ДО запуска
      const curActive = window.active;
      const curFiles = window.files;
      if (curActive && curFiles && curFiles[curActive]) {
        const f = curFiles[curActive];
        // Запускаем оригинальный run
        await origRun();
        // После запуска — собираем вывод из DOM
        const outBody = document.getElementById('outBody');
        const lines = outBody ? Array.from(outBody.querySelectorAll('.out-line')).map(el => ({
          t: el.classList[1] || 'out',
          v: el.textContent.replace(/^\[[\d:]+\] /, ''),
        })) : [];
        // Уведомляем учителя
        window.notifyTeacher(f.code, lines, f.lang);
      } else {
        await origRun();
      }
    };
  }

  // Ждём загрузки страницы, потом патчим
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchRunCurrent);
  } else {
    setTimeout(patchRunCurrent, 100);
  }

  console.log('[CS-Teacher] Panel loaded, ready.');
})();
