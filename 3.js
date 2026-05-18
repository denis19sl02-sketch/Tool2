// ═══════════════════════════════════════════════════════════════════
// CS-INTERPRETER-PATCH.js
// Расширяет встроенный C# интерпретатор: LINQ, nullable, Dictionary,
// StringBuilder, Math расширенный, string методы, более сложные паттерны
// Подключи ПОСЛЕ polyglot-ide.html скриптов
// ═══════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Ждём готовности основного execCSharpBuiltin
  function waitAndPatch() {
    if (typeof window.execCSharpBuiltin !== 'function') {
      setTimeout(waitAndPatch, 100);
      return;
    }
    applyPatches();
  }

  function applyPatches() {
    const origBuiltin = window.execCSharpBuiltin;

    window.execCSharpBuiltin = function (code) {
      // Предобработка — дополнительные паттерны ДО передачи в оригинал
      const patched = preProcess(code);

      // Пробуем оригинальный интерпретатор на патченном коде
      const result = origBuiltin(patched);

      // Если ошибка — пробуем ещё раз с агрессивной очисткой
      const hasError = result.some(r => r.t === 'err');
      if (hasError) {
        const aggressivePatched = aggressiveClean(patched);
        if (aggressivePatched !== patched) {
          const result2 = origBuiltin(aggressivePatched);
          const hasError2 = result2.some(r => r.t === 'err');
          if (!hasError2) {
            result2.push({ t: 'cs', v: '✓ Запущено с расширенным патчем' });
            return result2;
          }
        }
      }

      return result;
    };

    console.log('[CS-Patch] Interpreter patched with extended transpiler');
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRE-PROCESS — дополнительная трансляция C# → JS
  // ═══════════════════════════════════════════════════════════════════

  function preProcess(code) {
    let js = code;

    // ── 1. Убираем namespace и using ────────────────────────────────
    js = js.replace(/^\s*namespace\s+[\w.]+\s*\{?/gm, '');
    js = js.replace(/^\s*using\s+static\s+[^;]+;\s*$/gm, '');
    js = js.replace(/^\s*#\w+[^\n]*/gm, ''); // директивы препроцессора

    // ── 2. Атрибуты ─────────────────────────────────────────────────
    js = js.replace(/\[[^\]]+\]\s*\n/g, '');

    // ── 3. Generic типы → убрать <T> ────────────────────────────────
    js = js.replace(/\b(List|Dictionary|Queue|Stack|HashSet|IEnumerable|IList)\s*<[^>]+>/g, (match) => {
      if (match.startsWith('List')) return 'Array';
      if (match.startsWith('Dictionary')) return 'Object';
      return 'Array';
    });

    // ── 4. Объявление переменных с generic ──────────────────────────
    js = js.replace(/\b(?:var|Array|Object)\s+(\w+)\s*=\s*new\s+(?:Dictionary|Hashtable)\s*\([^)]*\)/g, 'let $1 = {}');
    js = js.replace(/\b(?:var|Array)\s+(\w+)\s*=\s*new\s+(?:Array|List)\s*\([^)]*\)/g, 'let $1 = []');
    js = js.replace(/\b(?:var|Array)\s+(\w+)\s*=\s*new\s+(?:Queue|Stack|HashSet)\s*\([^)]*\)/g, 'let $1 = []');

    // ── 5. LINQ методы ──────────────────────────────────────────────
    js = js.replace(/\.Where\s*\(([^)]+)\)/g,         '.filter($1)');
    js = js.replace(/\.Select\s*\(([^)]+)\)/g,         '.map($1)');
    js = js.replace(/\.Any\s*\(([^)]*)\)/g,            '.some($1)');
    js = js.replace(/\.All\s*\(([^)]*)\)/g,            '.every($1)');
    js = js.replace(/\.FirstOrDefault\s*\(\s*\)/g,     '[0]');
    js = js.replace(/\.FirstOrDefault\s*\(([^)]+)\)/g, '.find($1)');
    js = js.replace(/\.First\s*\(\s*\)/g,              '[0]');
    js = js.replace(/\.Last\s*\(\s*\)/g,               '.at(-1)');
    js = js.replace(/\.Sum\s*\(\s*\)/g,                '.reduce((a,b)=>a+b,0)');
    js = js.replace(/\.Sum\s*\(([^)]+)\)/g,            '.reduce((acc,x)=>acc+($1)(x),0)');
    js = js.replace(/\.Min\s*\(\s*\)/g,                '.reduce((a,b)=>Math.min(a,b))');
    js = js.replace(/\.Max\s*\(\s*\)/g,                '.reduce((a,b)=>Math.max(a,b))');
    js = js.replace(/\.Average\s*\(\s*\)/g,            '.reduce((a,b,_,arr)=>a+b/arr.length,0)');
    js = js.replace(/\.Distinct\s*\(\s*\)/g,           '.filter((v,i,a)=>a.indexOf(v)===i)');
    js = js.replace(/\.Skip\s*\(([^)]+)\)/g,           '.slice($1)');
    js = js.replace(/\.Take\s*\(([^)]+)\)/g,           '.slice(0,$1)');
    js = js.replace(/\.ToList\s*\(\s*\)/g,             '');
    js = js.replace(/\.ToArray\s*\(\s*\)/g,            '');
    js = js.replace(/\.ToDictionary\s*\(([^)]+)\)/g,   '.reduce((d,x)=>{const k=($1)(x);d[k]=x;return d;},{})');
    js = js.replace(/\.Concat\s*\(([^)]+)\)/g,         '.concat($1)');
    js = js.replace(/\.Zip\s*\(([^,]+),([^)]+)\)/g,    '.map((x,i)=>($2)(x,$1[i]))');
    js = js.replace(/\.GroupBy\s*\(([^)]+)\)/g,        '.reduce((g,x)=>{const k=($1)(x);if(!g[k])g[k]=[];g[k].push(x);return g;},{})');
    js = js.replace(/\.OrderBy\s*\(([^)]+)\)/g,        '.slice().sort((a,b)=>($1)(a)<($1)(b)?-1:1)');
    js = js.replace(/\.OrderByDescending\s*\(([^)]+)\)/g, '.slice().sort((a,b)=>($1)(a)>($1)(b)?-1:1)');
    js = js.replace(/\.ThenBy\s*\(([^)]+)\)/g,         '.sort((a,b)=>($1)(a)<($1)(b)?-1:1)');
    js = js.replace(/Enumerable\.Range\s*\(([^,]+),([^)]+)\)/g,
      '__range($1,$2)');

    // ── 6. Dictionary операции ──────────────────────────────────────
    js = js.replace(/(\w+)\[([^\]]+)\]\s*=/g, '$1[$2] ='); // уже OK
    js = js.replace(/(\w+)\.ContainsKey\s*\(([^)]+)\)/g,   '(($2) in $1)');
    js = js.replace(/(\w+)\.ContainsValue\s*\(([^)]+)\)/g, 'Object.values($1).includes($2)');
    js = js.replace(/(\w+)\.TryGetValue\s*\(([^,]+),\s*out\s+\w+\s+(\w+)\)/g,
      '(($1[$2] !== undefined) && (($3 = $1[$2]) || true))');
    js = js.replace(/(\w+)\.Keys\b/g,   'Object.keys($1)');
    js = js.replace(/(\w+)\.Values\b/g, 'Object.values($1)');

    // ── 7. Nullable ─────────────────────────────────────────────────
    js = js.replace(/\w+\?\s+(\w+)\s*=/g, 'let $1 =');          // string? x =
    js = js.replace(/(\w+)\?\.\s*(\w+)/g, '($1 == null ? null : $1.$2)');
    js = js.replace(/([^?])\?\?=\s*/g, '$1 ??= ');              // ??= оператор

    // ── 8. String методы (расширенные) ──────────────────────────────
    js = js.replace(/string\.IsNullOrEmpty\s*\(([^)]+)\)/g,     '(!($1) || ($1).length===0)');
    js = js.replace(/string\.IsNullOrWhiteSpace\s*\(([^)]+)\)/g,'(!($1) || ($1).trim().length===0)');
    js = js.replace(/string\.Concat\s*\(([^)]+)\)/g,            '[].concat($1).join("")');
    js = js.replace(/string\.Join\s*\(\s*"([^"]*)"\s*,\s*([^)]+)\)/g, 'Array.from($2).join("$1")');
    js = js.replace(/string\.Join\s*\(\s*'([^']*)'\s*,\s*([^)]+)\)/g, 'Array.from($2).join("$1")');
    js = js.replace(/\.CompareTo\s*\(([^)]+)\)/g, '>.localeCompare($1)');

    // ── 9. Enum.Parse / Enum.GetValues ──────────────────────────────
    js = js.replace(/Enum\.Parse\s*<[^>]+>\s*\(([^)]+)\)/g, '$1');
    js = js.replace(/Enum\.GetValues\s*<[^>]+>\s*\(\s*\)/g, '[]');

    // ── 10. Type checking ────────────────────────────────────────────
    js = js.replace(/(\w+)\s+is\s+([A-Z]\w+)\s+(\w+)/g, '(($3 = $1) instanceof Object && $1 !== null)');
    js = js.replace(/(\w+)\s+is\s+not\s+null/g, '$1 !== null');
    js = js.replace(/(\w+)\s+is\s+null/g,        '$1 === null');

    // ── 11. Pattern matching ─────────────────────────────────────────
    js = js.replace(/switch\s*\((\w+)\)\s*\{([^}]+)\}/g, (_, expr, body) => {
      // Простая трансляция switch expression
      return `switch(${expr}) {${body}}`;
    });

    // ── 12. Деструктуризация кортежей ───────────────────────────────
    js = js.replace(/\(([^)]+)\)\s*=\s*([^;]+);/g, (match, vars, value) => {
      if (vars.includes(',')) {
        const varList = vars.split(',').map(v => v.trim().replace(/^\w+\s+/, ''));
        return `let [${varList.join(',')}] = ${value};`;
      }
      return match;
    });

    // ── 13. out параметры ────────────────────────────────────────────
    js = js.replace(/,\s*out\s+\w+\s+(\w+)/g, '');   // убираем out декларации
    js = js.replace(/\bout\s+\w+\s+(\w+)/g,   'let $1');

    // ── 14. ref параметры ────────────────────────────────────────────
    js = js.replace(/\bref\s+(\w+)/g, '$1');

    // ── 15. var с несколькими объявлениями ──────────────────────────
    js = js.replace(/\b(?:int|long|double|float|string|bool|char|decimal)\s+(\w+)\s*,\s*(\w+)\s*=/g, 'let $1; let $2 =');

    // ── 16. Постфикс-инкремент в объявлении ─────────────────────────
    // (уже ОК в JS)

    // ── 17. @-строки (verbatim) ──────────────────────────────────────
    js = js.replace(/@"((?:[^""]|"")*)"/g, (_, s) => '`' + s.replace(/""/g, '"').replace(/\\/g, '\\\\') + '`');

    // ── 18. Console.Error.WriteLine ─────────────────────────────────
    js = js.replace(/Console\.Error\.WriteLine\s*\(([^)]+)\)/g, '__println("ERR: " + $1)');

    // ── 19. Environment ─────────────────────────────────────────────
    js = js.replace(/Environment\.Exit\s*\([^)]*\)/g, '');
    js = js.replace(/Environment\.NewLine\b/g, '"\\n"');

    // ── 20. Object.ToString по умолчанию ────────────────────────────
    js = js.replace(/\.ToString\s*\("([^"]+)"\)/g, '.toString()'); // упрощаем форматирование

    return js;
  }

  // ═══════════════════════════════════════════════════════════════════
  // AGGRESSIVE CLEAN — если первый прогон не помог
  // ═══════════════════════════════════════════════════════════════════
  function aggressiveClean(code) {
    let js = code;

    // Убрать всё что выглядит как типы с параметрами
    js = js.replace(/\b[A-Z]\w*<[^>]+>\s+(\w+)/g, 'let $1');
    js = js.replace(/\b(int|long|double|float|string|bool|char)\s+(\w+)/g, 'let $2');

    // Убрать abstract, sealed, virtual, override, new (keyword)
    js = js.replace(/\b(abstract|sealed|virtual|override|extern|partial|internal)\s+/g, '');

    // Убрать типы в параметрах методов
    js = js.replace(/\(([^)]+)\)/g, (match, params) => {
      const cleaned = params.replace(/\b(?:int|long|double|float|string|bool|char|var|decimal|List|Dictionary|IEnumerable|params)\s+/g, '');
      return '(' + cleaned + ')';
    });

    return js;
  }

  // ═══════════════════════════════════════════════════════════════════
  // INJECT HELPERS в глобальный execCSharpBuiltin
  // Добавляем __range и другие вспомогательные функции
  // ═══════════════════════════════════════════════════════════════════

  // Патчим execCSharpBuiltin чтобы добавить __range в контекст
  // Это делается через monkey-patch на весь execCSharpBuiltin
  function injectHelpers() {
    const origBuiltin = window.execCSharpBuiltin;
    if (!origBuiltin) return;

    // Добавляем доп. хелперы в глобальный контекст при каждом вызове
    const helperCode = `
function __range(start, count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(start + i);
  return arr;
}
function __repeat(str, n) {
  return str.repeat ? str.repeat(n) : Array(n+1).join(str);
}
`;

    window.__helperCode = helperCode;
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT TABLE — интеграция таблицы концепций в вывод IDE
  // При ошибке Built-in подсказывает какую концепцию изучить
  // ═══════════════════════════════════════════════════════════════════

  function patchOutputWithHints() {
    // Расширяем log функцию для добавления ссылок на концепции при ошибках
    const origLog = window.log;
    if (!origLog) return;

    window.log = function (msg, type) {
      origLog(msg, type);

      // Если ошибка и есть движок — подсветить концепцию
      if (type === 'err' && window.CS_CONCEPTS_ENGINE && window.active && window.files) {
        const f = window.files[window.active];
        if (f && f.lang === 'csharp') {
          // Анализируем ошибку асинхронно (не блокируем UI)
          setTimeout(() => {
            const errors = window.CS_CONCEPTS_ENGINE.analyzeErrors([{ t: 'err', v: msg }]);
            if (errors.length) {
              const hint = errors[0];
              origLog(`💡 Подсказка: ${hint.title} → ${hint.fix}`, 'cs');
            }
          }, 50);
        }
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitAndPatch();
      injectHelpers();
      setTimeout(patchOutputWithHints, 200);
    });
  } else {
    waitAndPatch();
    injectHelpers();
    setTimeout(patchOutputWithHints, 200);
  }

  console.log('[CS-Patch] Interpreter patch module loaded');
})();
