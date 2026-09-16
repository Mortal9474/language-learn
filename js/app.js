window.App = (() => {
  const STATUS = {
    familiar: { label: "熟悉" },
    vague:    { label: "模糊" },
    unknown:  { label: "陌生" }
  };

  let currentLang = null;
  let currentWordIndex = 0;
  let currentPhraseIndex = 0;
  let wordFilter = "all";
  let favTab = "words";

  const app = () => document.getElementById("app");

  // ---------- 状态存取 ----------
  function getWordStatus(id) {
    return JSON.parse(localStorage.getItem("wordStatus") || "{}")[id] || null;
  }
  function setWordStatus(id, s) {
    const m = JSON.parse(localStorage.getItem("wordStatus") || "{}");
    if (m[id] === s) delete m[id]; else m[id] = s;
    localStorage.setItem("wordStatus", JSON.stringify(m));
    recordStudyToday();
  }

  // ---------- 收藏系统 ----------
  function getFav() {
    return JSON.parse(localStorage.getItem("favorites") || '{"words":[],"sentences":[],"grammar":[]}');
  }
  function saveFav(f) { localStorage.setItem("favorites", JSON.stringify(f)); }
  function toggleFav(list, id) {
    const idx = list.indexOf(id);
    if (idx >= 0) list.splice(idx, 1); else list.push(id);
  }
  function isFavWord(id)   { return getFav().words.includes(id); }
  function isFavGrammar(id){ return getFav().grammar.includes(id); }
  function sentenceKey(wordId, idx) { return wordId + "#" + idx; }
  function isFavSentence(wordId, idx) { return getFav().sentences.includes(sentenceKey(wordId, idx)); }
  function toggleFavWord(id) {
    const f = getFav(); toggleFav(f.words, id); saveFav(f);
  }
  function toggleFavGrammar(id) {
    const f = getFav(); toggleFav(f.grammar, id); saveFav(f);
  }
  function toggleFavSentence(wordId, idx) {
    const f = getFav(); toggleFav(f.sentences, sentenceKey(wordId, idx)); saveFav(f);
  }

  // ---------- 学习统计 ----------
  function getStats() {
    return JSON.parse(localStorage.getItem("learning_stats") || '{"quizTotal":0,"quizCorrect":0,"daily":{}}');
  }
  function saveStats(s) { localStorage.setItem("learning_stats", JSON.stringify(s)); }
  function recordQuizStat(correct) {
    const s = getStats();
    s.quizTotal = (s.quizTotal || 0) + 1;
    if (correct) s.quizCorrect = (s.quizCorrect || 0) + 1;
    saveStats(s);
    recordStudyToday();
  }
  function recordStudyToday() {
    const s = getStats();
    const today = new Date().toISOString().slice(0, 10);
    s.daily = s.daily || {};
    s.daily[today] = (s.daily[today] || 0) + 1;
    saveStats(s);
  }

  // ---------- 通用渲染 ----------
  function statusButtonsHTML(id) {
    const st = getWordStatus(id);
    return Object.entries(STATUS).map(([k, c]) =>
      `<button class="status-btn status-btn-${k} ${st === k ? 'active' : ''}" data-status="${k}">${c.label}</button>`
    ).join("");
  }
  function bindStatusButtons(root, id, rerender) {
    root.querySelectorAll(".status-btn").forEach(b => {
      b.onclick = () => { setWordStatus(id, b.dataset.status); rerender(); };
    });
  }

  // 【改】搭配渲染（带收藏按钮）
  function examplesHTML(examples, prefix, wordId) {
    return (examples || []).map((ex, i) => {
      const fav = wordId ? isFavSentence(wordId, i) : false;
      return `<div class="example">
         <div class="en">${ex.con || ex.en || ""}
           <button class="icon-btn" data-${prefix}="${i}">🔊</button>
           ${wordId ? `<button class="icon-btn fav-sentence ${fav ? 'active' : ''}" data-fav-sentence="${i}">${fav ? '★' : '☆'}</button>` : ''}
         </div>
         <div class="zh">${ex.zh || ""}</div>
       </div>`;
    }).join("");
  }
  function bindExampleSpeak(root, examples, prefix = "ex") {
    root.querySelectorAll(`[data-${prefix}]`).forEach(b => {
      b.onclick = () => {
        const ex = examples[Number(b.dataset[prefix])];
        window.TTS.speakItem({ ipa: ex.ipa, phonetic: ex.phonetic, word: ex.con || ex.en });
      };
    });
  }

  function insertAnnotation(root, key) {
    const holder = root.querySelector(".anno-holder");
    if (!holder) return;
    holder.innerHTML = window.Annotation.html(key);
    window.Annotation.bind(root, key);
  }

  function padToolbarHTML() {
    return `
      <div class="pad-toolbar">
        <button class="pad-btn pad-eraser" title="橡皮">🩹 橡皮</button>
        <button class="pad-btn pad-undo" title="撤销">↶ 撤销</button>
        <button class="pad-btn pad-clear" title="清空">🗑 清空</button>
      </div>
    `;
  }
  function bindPad(root, id) {
    const openBtn = root.querySelector("#openPad");
    if (!openBtn) return;
    const wrap = root.querySelector("#padWrap");
    const canvas = root.querySelector("#pad");
    const saveBtn = root.querySelector("#padSave");
    const closeBtn = root.querySelector("#padClose");
    const eraserBtn = root.querySelector("#padEraser");
    const undoBtn = root.querySelector("#padUndo");
    const clearBtn = root.querySelector("#padClear");
    let pad = null;
    openBtn.onclick = () => {
      wrap.style.display = "block";
      if (!pad) pad = window.Pad.init(canvas);
      requestAnimationFrame(() => pad.load(id));
    };
    if (saveBtn) saveBtn.onclick = () => pad && pad.save(id);
    if (closeBtn) closeBtn.onclick = () => { wrap.style.display = "none"; };
    if (eraserBtn) eraserBtn.onclick = () => {
      if (!pad) return;
      pad.setEraser(!pad.isEraser());
      eraserBtn.classList.toggle("active", pad.isEraser());
    };
    if (undoBtn) undoBtn.onclick = () => pad && pad.undo();
    if (clearBtn) clearBtn.onclick = () => pad && pad.clear();
  }

  // ---------- 工具 ----------
  function getBrightness(hex) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    if (hex.length !== 6) return 255;
    return (parseInt(hex.substr(0,2),16)*299 + parseInt(hex.substr(2,2),16)*587 + parseInt(hex.substr(4,2),16)*114) / 1000;
  }
  function autoContrast(bg) { return getBrightness(bg) > 128 ? "#222222" : "#f0f0f0"; }
  function autoGhost(bg)    { return getBrightness(bg) > 128 ? "#c8c8c8" : "#555555"; }

  // ========== 单词总览 ==========
  function renderWordsOverview() {
    const WORDS = window.WORDS || [];
    const filters = [
      { key: "all",      label: "全部" },
      { key: "familiar", label: "熟悉" },
      { key: "vague",    label: "模糊" },
      { key: "unknown",  label: "陌生" },
      { key: "new",      label: "未学习" }
    ];
    const filtered = WORDS.filter(w => {
      const st = getWordStatus(w.id);
      if (wordFilter === "all") return true;
      if (wordFilter === "new") return !st;
      return st === wordFilter;
    });

    const filterBar = filters.map(f => {
      const count = WORDS.filter(w => {
        const st = getWordStatus(w.id);
        if (f.key === "all") return true;
        if (f.key === "new") return !st;
        return st === f.key;
      }).length;
      return `<button class="filter-btn ${wordFilter === f.key ? 'active' : ''}" data-filter="${f.key}">${f.label} (${count})</button>`;
    }).join("");

    const tiles = filtered.map(w => {
      const st = getWordStatus(w.id);
      const cls = st ? `status-${st}` : "status-default";
      return `<div class="word-tile ${cls}" data-id="${w.id}">${w.display || w.word}</div>`;
    }).join("");

    app().innerHTML = `
      <h2>单词总览</h2>
      <div class="filter-bar">${filterBar}</div>
      ${filtered.length === 0 ? '<p class="hint">此分类下暂无单词</p>' : `<div class="word-grid">${tiles}</div>`}
      <div class="anno-holder"></div>`;

    app().querySelectorAll(".filter-btn").forEach(b => {
      b.onclick = () => { wordFilter = b.dataset.filter; renderWordsOverview(); };
    });
    app().querySelectorAll(".word-tile").forEach(el => {
      el.onclick = () => {
        const i = WORDS.findIndex(w => w.id === el.dataset.id);
        if (i >= 0) { currentWordIndex = i; renderWordCard(); }
      };
    });
    insertAnnotation(app(), "words_overview_" + currentLang.code);
  }

  // ========== 单词卡片【改：标题改为"搭配"】 ==========
  function renderWordCard() {
    const WORDS = window.WORDS || [];
    const w = WORDS[currentWordIndex];
    if (!w) return;
    const favWord = isFavWord(w.id);
    const hasExamples = w.examples && w.examples.length > 0;

    app().innerHTML = `
      <div class="card">
        <div class="word">${w.display || w.word}</div>
        <div class="phonetic">${w.phonetic || ""}</div>
        <button class="icon-btn" id="speakWord">🔊</button>
        <button class="icon-btn fav-word ${favWord ? 'active' : ''}" id="favWord">${favWord ? '★' : '☆'}</button>
        <div class="pos">${w.pos || ""}</div>
        <div class="meaning">${w.meaning || ""}</div>
        ${hasExamples ? `<div class="example-title">搭配</div>` : ''}
        <div class="example-list">${examplesHTML(w.examples, "ex", w.id)}</div>
        <div class="status-row">${statusButtonsHTML(w.id)}</div>
        <div class="card-actions">
          <button id="prevWord">上一个</button>
          <button id="nextWord">下一个</button>
          <button id="openPad">手写</button>
          <button id="backOverview">返回总览</button>
        </div>
        <div class="pad-wrap" id="padWrap" style="display:none">
          <canvas class="pad" id="pad"></canvas>
          ${padToolbarHTML()}
          <div class="pad-actions">
            <button id="padSave">保存</button>
            <button id="padClose">关闭</button>
          </div>
        </div>
        <div class="anno-holder"></div>
      </div>`;

    document.getElementById("speakWord").onclick = () => window.TTS.speakItem(w);
    document.getElementById("favWord").onclick = () => { toggleFavWord(w.id); renderWordCard(); };
    bindExampleSpeak(app(), w.examples);
    app().querySelectorAll("[data-fav-sentence]").forEach(b => {
      b.onclick = () => {
        toggleFavSentence(w.id, Number(b.dataset.favSentence));
        renderWordCard();
      };
    });
    bindStatusButtons(app(), w.id, renderWordCard);
    document.getElementById("prevWord").onclick = () => {
      currentWordIndex = (currentWordIndex - 1 + WORDS.length) % WORDS.length;
      renderWordCard();
    };
    document.getElementById("nextWord").onclick = () => {
      currentWordIndex = (currentWordIndex + 1) % WORDS.length;
      renderWordCard();
    };
    document.getElementById("backOverview").onclick = renderWordsOverview;
    bindPad(app(), w.id);
    insertAnnotation(app(), "word_" + w.id);
  }

  // ========== 语法 ==========
  function renderGrammarList() {
    const GRAMMAR = window.GRAMMAR || [];
    app().innerHTML = `<h2>语法</h2>` + GRAMMAR.map(g => {
      const fav = isFavGrammar(g.id);
      return `<div class="list-item" data-id="${g.id}">
         <div class="title">${g.title}
           <span class="fav-grammar ${fav ? 'active' : ''}" data-fav-grammar="${g.id}">${fav ? '★' : '☆'}</span>
         </div>
         <div class="sub">${g.level || ""}</div>
       </div>`;
    }).join("") + `<div class="anno-holder"></div>`;

    app().querySelectorAll(".list-item").forEach(el => {
      el.onclick = (e) => {
        if (e.target.dataset.favGrammar) return;
        renderGrammarDetail(el.dataset.id);
      };
    });
    app().querySelectorAll("[data-fav-grammar]").forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        toggleFavGrammar(el.dataset.favGrammar);
        renderGrammarList();
      };
    });
    insertAnnotation(app(), "grammar_list_" + currentLang.code);
  }
  function renderGrammarDetail(id) {
    const GRAMMAR = window.GRAMMAR || [];
    const g = GRAMMAR.find(x => x.id === id);
    if (!g) return;
    const fav = isFavGrammar(g.id);
    app().innerHTML = `
      <button id="backGrammar">← 返回</button>
      <div class="card" style="text-align:left">
        <h2>${g.title}
          <span class="fav-grammar ${fav ? 'active' : ''}" id="favGrammar">${fav ? '★' : '☆'}</span>
        </h2>
        <p>${g.explanation || ""}</p>
        <p><b>结构：</b>${g.structure || ""}</p>
        ${g.examples && g.examples.length ? `<div class="example-title">例句</div>` : ''}
        ${examplesHTML(g.examples)}
        <div class="anno-holder"></div>
      </div>`;
    document.getElementById("backGrammar").onclick = renderGrammarList;
    document.getElementById("favGrammar").onclick = () => { toggleFavGrammar(g.id); renderGrammarDetail(g.id); };
    bindExampleSpeak(app(), g.examples);
    insertAnnotation(app(), "grammar_" + g.id);
  }

  // ========== 字母表 ==========
  function renderAlphabet() {
    const ALPHABET = window.ALPHABET || [];
    app().innerHTML = `<h2>字母表</h2>
      <p class="hint">点击字母可听发音，下方可描红练习</p>
      <div class="grid">
        ${ALPHABET.map((l, i) =>
          `<div class="cell" data-index="${i}">
             <div class="char">${l.display || l.char}</div>
             <div class="ph">${l.phonetic || ""}</div>
           </div>`).join("")}
      </div>
      <div class="alphabet-pad-wrap">
        <h3>描红练习：<span id="ghostChar">—</span></h3>
        <canvas class="ghost-pad" id="alphabetPad"></canvas>
        <div class="pad-toolbar">
          <button class="pad-btn" id="ghostEraser">🩹 橡皮</button>
          <button class="pad-btn" id="ghostUndo">↶ 撤销</button>
          <button class="pad-btn" id="ghostClear">🗑 清空</button>
        </div>
        <div class="pad-actions"><button id="ghostSave">保存</button></div>
      </div>
      <div class="anno-holder"></div>`;

    let currentChar = null, pad = null;
    app().querySelectorAll(".cell").forEach(el => {
      el.onclick = () => {
        const l = ALPHABET[Number(el.dataset.index)];
        window.TTS.speakItem(l);
        currentChar = l.char || l.display;
        document.getElementById("ghostChar").textContent = currentChar;
        const canvas = document.getElementById("alphabetPad");
        if (!pad) pad = window.Pad.init(canvas, { ghost: currentChar });
        else pad.setGhost(currentChar);
      };
    });
    document.getElementById("ghostSave").onclick = () => { if (pad && currentChar) pad.save("alpha_" + currentChar); };
    document.getElementById("ghostClear").onclick = () => pad && pad.clear();
    document.getElementById("ghostUndo").onclick = () => pad && pad.undo();
    document.getElementById("ghostEraser").onclick = (e) => {
      if (!pad) return;
      pad.setEraser(!pad.isEraser());
      e.target.classList.toggle("active", pad.isEraser());
    };
    insertAnnotation(app(), "alphabet_" + currentLang.code);
  }

  // ========== 短语【改：标题改为"搭配"】 ==========
  function renderPhrasesOverview() {
    const PHRASES = window.PHRASES || [];
    app().innerHTML = `<h2>短语</h2>
      <div class="word-grid">
        ${PHRASES.map((p, i) => {
          const st = getWordStatus(p.id);
          const cls = st ? `status-${st}` : "status-default";
          return `<div class="word-tile ${cls}" data-index="${i}">${p.display || p.text}</div>`;
        }).join("")}
      </div>
      <div class="anno-holder"></div>`;
    app().querySelectorAll(".word-tile").forEach(el => {
      el.onclick = () => { currentPhraseIndex = Number(el.dataset.index); renderPhraseCard(); };
    });
    insertAnnotation(app(), "phrases_overview_" + currentLang.code);
  }
  function renderPhraseCard() {
    const PHRASES = window.PHRASES || [];
    const p = PHRASES[currentPhraseIndex];
    if (!p) return;
    const examples = p.examples || [];
    const favWord = isFavWord(p.id);
    const hasExamples = examples.length > 0;

    app().innerHTML = `
      <div class="card">
        <div class="word">${p.display || p.text}</div>
        <div class="phonetic">${p.phonetic || ""}</div>
        <button class="icon-btn" id="speakPhrase">🔊</button>
        <button class="icon-btn fav-word ${favWord ? 'active' : ''}" id="favPhrase">${favWord ? '★' : '☆'}</button>
        <div class="meaning">${p.meaning || ""}</div>
        ${hasExamples ? `<div class="example-title">搭配</div>` : ''}
        <div class="example-list">${examplesHTML(examples, "pex", p.id)}</div>
        <div class="status-row">${statusButtonsHTML(p.id)}</div>
        <div class="card-actions">
          <button id="prevPhrase">上一个</button>
          <button id="nextPhrase">下一个</button>
          <button id="openPadPhrase">手写</button>
          <button id="backPhrases">返回列表</button>
        </div>
        <div class="pad-wrap" id="padWrapPhrase" style="display:none">
          <canvas class="pad" id="padPhrase"></canvas>
          <div class="pad-toolbar">
            <button class="pad-btn" id="phrasePadEraser">🩹 橡皮</button>
            <button class="pad-btn" id="phrasePadUndo">↶ 撤销</button>
            <button class="pad-btn" id="phrasePadClear">🗑 清空</button>
          </div>
          <div class="pad-actions">
            <button id="padPhraseSave">保存</button>
            <button id="padPhraseClose">关闭</button>
          </div>
        </div>
        <div class="anno-holder"></div>
      </div>`;

    document.getElementById("speakPhrase").onclick = () => window.TTS.speakItem(p);
    document.getElementById("favPhrase").onclick = () => { toggleFavWord(p.id); renderPhraseCard(); };
    bindExampleSpeak(app(), examples, "pex");
    app().querySelectorAll("[data-fav-sentence]").forEach(b => {
      b.onclick = () => {
        toggleFavSentence(p.id, Number(b.dataset.favSentence));
        renderPhraseCard();
      };
    });
    bindStatusButtons(app(), p.id, renderPhraseCard);
    document.getElementById("prevPhrase").onclick = () => {
      currentPhraseIndex = (currentPhraseIndex - 1 + PHRASES.length) % PHRASES.length;
      renderPhraseCard();
    };
    document.getElementById("nextPhrase").onclick = () => {
      currentPhraseIndex = (currentPhraseIndex + 1) % PHRASES.length;
      renderPhraseCard();
    };
    document.getElementById("backPhrases").onclick = renderPhrasesOverview;

    let pad = null;
    document.getElementById("openPadPhrase").onclick = () => {
      document.getElementById("padWrapPhrase").style.display = "block";
      if (!pad) pad = window.Pad.init(document.getElementById("padPhrase"));
      requestAnimationFrame(() => pad.load(p.id));
    };
    document.getElementById("padPhraseSave").onclick = () => pad && pad.save(p.id);
    document.getElementById("padPhraseClose").onclick = () => {
      document.getElementById("padWrapPhrase").style.display = "none";
    };
    document.getElementById("phrasePadEraser").onclick = (e) => {
      if (!pad) return;
      pad.setEraser(!pad.isEraser());
      e.target.classList.toggle("active", pad.isEraser());
    };
    document.getElementById("phrasePadUndo").onclick = () => pad && pad.undo();
    document.getElementById("phrasePadClear").onclick = () => pad && pad.clear();
    insertAnnotation(app(), "phrase_" + p.id);
  }

  // ========== 测验 ==========
  function renderQuiz() {
    const WORDS = window.WORDS || [];
    if (!WORDS.length) { app().innerHTML = "<p>暂无单词</p>"; return; }
    const q = window.Quiz.makeChoice(WORDS);
    app().innerHTML = `
      <h2>测验</h2>
      <div class="card" style="text-align:left">
        <p>选出正确的释义：</p>
        <p style="font-size:24px;font-weight:700">${q.answer.display || q.answer.word}</p>
        <button class="icon-btn" id="quizSpeak">🔊</button>
        <div id="options" style="margin-top:16px">
          ${q.options.map((o, i) => `<button class="list-item" style="width:100%" data-index="${i}">${o.meaning}</button>`).join("")}
        </div>
        <p id="quizResult" style="margin-top:12px"></p>
        <button id="quizNext" style="margin-top:12px">下一题</button>
        <div class="anno-holder"></div>
      </div>`;
    document.getElementById("quizSpeak").onclick = () => window.TTS.speakItem(q.answer);
    let answered = false;
    document.getElementById("options").querySelectorAll("button").forEach(b => {
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const chosen = q.options[Number(b.dataset.index)];
        const ok = chosen.id === q.answer.id;
        document.getElementById("quizResult").textContent =
          ok ? "✅ 正确" : "❌ 错误，正确答案：" + q.answer.meaning;
        recordQuizStat(ok);
        if (ok) window.Quiz.recordCorrect(q.answer.id);
        else window.Quiz.recordWrong(q.answer.id);
      };
    });
    document.getElementById("quizNext").onclick = renderQuiz;
    insertAnnotation(app(), "quiz_" + currentLang.code);
  }

  // ========== 错题本 ==========
  function renderWrongBook() {
    const list = window.Quiz.getWrongBook();
    const WORDS = window.WORDS || [];
    if (!list.length) {
      app().innerHTML = `<h2>错题本</h2><p class="hint">暂无错题。答错的单词会出现在这里，连续答对 3 次自动移除。</p>`;
      return;
    }
    const items = list.map(item => {
      const w = WORDS.find(x => x.id === item.id);
      if (!w) return "";
      return `<div class="list-item">
        <div class="title">${w.display || w.word} — ${w.meaning || ""}</div>
        <div class="sub">错误 ${item.count} 次 · 已连续答对 ${item.correct || 0}/3</div>
      </div>`;
    }).join("");
    app().innerHTML = `<h2>错题本</h2>
      <p class="hint">连续答对 3 次自动移出错题本</p>
      ${items}`;
  }

  // ========== 收藏页【改：标签"例句"→"搭配"】 ==========
  function renderFavorites() {
    const fav = getFav();
    const WORDS = window.WORDS || [];
    const GRAMMAR = window.GRAMMAR || [];

    const tabs = [
      { key: "words",     label: `单词 (${fav.words.length})` },
      { key: "sentences", label: `搭配 (${fav.sentences.length})` },
      { key: "grammar",   label: `语法 (${fav.grammar.length})` }
    ];

    let content = "";
    if (favTab === "words") {
      const favWords = WORDS.filter(w => fav.words.includes(w.id));
      content = favWords.length ? `<div class="word-grid">
        ${favWords.map(w => {
          const st = getWordStatus(w.id);
          const cls = st ? `status-${st}` : "status-default";
          return `<div class="word-tile ${cls}" data-id="${w.id}">${w.display || w.word}</div>`;
        }).join("")}
      </div>` : '<p class="hint">暂无收藏单词</p>';
    } else if (favTab === "sentences") {
      const items = [];
      fav.sentences.forEach(key => {
        const [wordId, idxStr] = key.split("#");
        const idx = Number(idxStr);
        const w = WORDS.find(x => x.id === wordId);
        if (!w || !w.examples || !w.examples[idx]) return;
        const ex = w.examples[idx];
        items.push(`<div class="list-item" data-word="${w.id}" data-idx="${idx}">
          <div class="title">${ex.con}</div>
          <div class="sub">${ex.zh || ""} · 来自：${w.word}</div>
          <button class="icon-btn fav-sentence active" data-fav-sentence-remove="${key}">★</button>
        </div>`);
      });
      content = items.length ? items.join("") : '<p class="hint">暂无收藏搭配</p>';
    } else if (favTab === "grammar") {
      const favGrammar = GRAMMAR.filter(g => fav.grammar.includes(g.id));
      content = favGrammar.length ? favGrammar.map(g => `
        <div class="list-item" data-grammar="${g.id}">
          <div class="title">${g.title}</div>
          <div class="sub">${g.level || ""}</div>
        </div>`).join("") : '<p class="hint">暂无收藏语法</p>';
    }

    app().innerHTML = `
      <h2>收藏</h2>
      <div class="filter-bar">
        ${tabs.map(t => `<button class="filter-btn ${favTab === t.key ? 'active' : ''}" data-fav-tab="${t.key}">${t.label}</button>`).join("")}
      </div>
      ${content}
      <div class="anno-holder"></div>`;

    app().querySelectorAll("[data-fav-tab]").forEach(b => {
      b.onclick = () => { favTab = b.dataset.favTab; renderFavorites(); };
    });
    app().querySelectorAll(".word-tile[data-id]").forEach(el => {
      el.onclick = () => {
        const i = WORDS.findIndex(w => w.id === el.dataset.id);
        if (i >= 0) { currentWordIndex = i; renderWordCard(); }
      };
    });
    app().querySelectorAll("[data-word]").forEach(el => {
      el.onclick = () => {
        const i = WORDS.findIndex(w => w.id === el.dataset.word);
        if (i >= 0) { currentWordIndex = i; renderWordCard(); }
      };
    });
    app().querySelectorAll("[data-fav-sentence-remove]").forEach(b => {
      b.onclick = (e) => {
        e.stopPropagation();
        const [wId, idx] = b.dataset.favSentenceRemove.split("#");
        toggleFavSentence(wId, Number(idx));
        renderFavorites();
      };
    });
    app().querySelectorAll("[data-grammar]").forEach(el => {
      el.onclick = () => renderGrammarDetail(el.dataset.grammar);
    });
    insertAnnotation(app(), "favorites");
  }

  // ========== 统计页 ==========
  function renderStats() {
    const WORDS = window.WORDS || [];
    const status = JSON.parse(localStorage.getItem("wordStatus") || "{}");
    const stats = getStats();
    const fav = getFav();
    const wrongCount = Object.keys(JSON.parse(localStorage.getItem("wrongbook") || "{}")).length;

    let familiar = 0, vague = 0, unknown = 0, newCount = 0;
    WORDS.forEach(w => {
      const st = status[w.id];
      if (st === "familiar") familiar++;
      else if (st === "vague") vague++;
      else if (st === "unknown") unknown++;
      else newCount++;
    });

    const learned = familiar + vague + unknown;
    const total = WORDS.length;
    const learnedPct = total ? Math.round(learned / total * 100) : 0;

    const quizTotal = stats.quizTotal || 0;
    const quizCorrect = stats.quizCorrect || 0;
    const quizPct = quizTotal ? Math.round(quizCorrect / quizTotal * 100) : 0;

    const daily = stats.daily || {};
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      last7.push({ date: key.slice(5), count: daily[key] || 0 });
    }
    const maxDaily = Math.max(1, ...last7.map(d => d.count));

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (daily[key]) streak++;
      else if (i > 0) break;
    }

    app().innerHTML = `
      <h2>学习统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">${total}</div>
          <div class="stat-label">总单词数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${learned}</div>
          <div class="stat-label">已学习 (${learnedPct}%)</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${streak}</div>
          <div class="stat-label">连续学习天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${quizPct}%</div>
          <div class="stat-label">测验正确率 (${quizCorrect}/${quizTotal})</div>
        </div>
      </div>

      <div class="stat-section">
        <h3>单词掌握情况</h3>
        <div class="stat-bar-row"><span class="stat-bar-label">熟悉</span><div class="stat-bar-bg"><div class="stat-bar status-familiar" style="width:${total ? familiar/total*100 : 0}%"></div></div><span>${familiar}</span></div>
        <div class="stat-bar-row"><span class="stat-bar-label">模糊</span><div class="stat-bar-bg"><div class="stat-bar status-vague" style="width:${total ? vague/total*100 : 0}%"></div></div><span>${vague}</span></div>
        <div class="stat-bar-row"><span class="stat-bar-label">陌生</span><div class="stat-bar-bg"><div class="stat-bar status-unknown" style="width:${total ? unknown/total*100 : 0}%"></div></div><span>${unknown}</span></div>
        <div class="stat-bar-row"><span class="stat-bar-label">未学习</span><div class="stat-bar-bg"><div class="stat-bar status-default" style="width:${total ? newCount/total*100 : 0}%"></div></div><span>${newCount}</span></div>
      </div>

      <div class="stat-section">
        <h3>最近 7 天学习</h3>
        <div class="daily-chart">
          ${last7.map(d => `
            <div class="daily-bar-wrap">
              <div class="daily-bar" style="height:${d.count/maxDaily*100}%" title="${d.count} 次"></div>
              <div class="daily-label">${d.date}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="stat-section">
        <h3>收藏与错题</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">${fav.words.length}</div>
            <div class="stat-label">收藏单词</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${fav.sentences.length}</div>
            <div class="stat-label">收藏搭配</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${fav.grammar.length}</div>
            <div class="stat-label">收藏语法</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${wrongCount}</div>
            <div class="stat-label">错题本</div>
          </div>
        </div>
      </div>

      <div class="anno-holder"></div>`;

    insertAnnotation(app(), "stats");
  }

  // ========== 设置 ==========
  function renderSettings() {
    app().innerHTML = `
      <h2>设置</h2>
      <div class="card" style="text-align:left">
        <p>当前语言：${currentLang?.name || ""}</p>
        <p>eSpeak 语音：${currentLang?.espeakVoice || ""}</p>
        <button id="clearAll">清空所有进度</button>
        <div class="anno-holder"></div>
      </div>`;
    document.getElementById("clearAll").onclick = () => {
      if (confirm("确定清空所有进度、标记、画板、批注、收藏、统计吗？")) {
        localStorage.clear();
        alert("已清空");
      }
    };
    insertAnnotation(app(), "settings");
  }

  // ========== 语言切换 ==========
  function renderLangMenu() {
    const menu = document.getElementById("langMenu");
    if (!menu) return;
    menu.innerHTML = window.LANGUAGES.map(l => `
      <div class="item ${currentLang.code === l.code ? 'active' : ''}"
           data-code="${l.code}">${l.name}</div>
    `).join("");
    menu.querySelectorAll(".item").forEach(el => {
      el.onclick = () => switchLang(el.dataset.code);
    });
  }
  async function switchLang(code) {
    const lang = window.LANGUAGES.find(l => l.code === code);
    if (!lang || lang.code === currentLang?.code) return;
    document.getElementById("langMenu").style.display = "none";
    try {
      await window.Loader.loadLanguage(lang);
      currentLang = lang;
      localStorage.setItem("currentLang", code);
      document.getElementById("langName").textContent = lang.name;
      await window.TTS.setup({ espeakVoice: lang.espeakVoice });
      currentWordIndex = 0;
      currentPhraseIndex = 0;
      wordFilter = "all";
      renderWordsOverview();
      renderLangMenu();
    } catch (e) {
      alert("切换语言失败：" + e.message);
    }
  }
  function bindLangButton() {
    const btn = document.getElementById("langBtn");
    const menu = document.getElementById("langMenu");
    btn.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };
    document.addEventListener("click", () => { menu.style.display = "none"; });
  }

  // ========== 主题 ==========
  function renderThemeMenu() {
    const menu = document.getElementById("themeMenu");
    if (!menu) return;
    const themes = window.Theme.getAllThemes();
    const current = window.Theme.getCurrent();
    menu.innerHTML = themes.map(t => {
      const swatch = ["--primary", "--bg", "--text"]
        .map(v => `<i style="background:${t.vars[v]}"></i>`).join("");
      return `<div class="item ${current.code === t.code ? 'active' : ''}" data-code="${t.code}">
        <span>${t.name}</span>
        <span class="swatch">${swatch}</span>
      </div>`;
    }).join("") + `
      <div class="divider"></div>
      <div class="item add-btn" id="addCustomTheme">+ 自定义主题</div>
    `;
    menu.querySelectorAll(".item[data-code]").forEach(el => {
      el.onclick = () => {
        window.Theme.setTheme(el.dataset.code);
        updateThemeName();
        renderThemeMenu();
        menu.style.display = "none";
        const activeBtn = document.querySelector("nav button.active-view");
        if (activeBtn) views[activeBtn.dataset.view]();
      };
    });
    const addBtn = menu.querySelector("#addCustomTheme");
    if (addBtn) addBtn.onclick = () => {
      menu.style.display = "none";
      openCustomThemeEditor();
    };
  }
  function updateThemeName() {
    const t = window.Theme.getCurrent();
    const el = document.getElementById("themeName");
    if (el) el.textContent = t.name;
  }
  function bindThemeButton() {
    const btn = document.getElementById("themeBtn");
    const menu = document.getElementById("themeMenu");
    if (!btn || !menu) return;
    btn.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };
    document.addEventListener("click", () => { menu.style.display = "none"; });
  }
  function toHex(c) {
    if (/^#[0-9a-f]{6}$/i.test(c)) return c;
    const d = document.createElement("div");
    d.style.color = c;
    document.body.appendChild(d);
    const rgb = getComputedStyle(d).color;
    document.body.removeChild(d);
    const m = rgb.match(/\d+/g);
    if (!m) return "#ffffff";
    return "#" + m.slice(0,3).map(x => (+x).toString(16).padStart(2,"0")).join("");
  }
  function openCustomThemeEditor() {
    const base = window.Theme.snapshotVars();
    const fields = [
      ["--bg","背景"],["--surface","卡片"],["--surface-2","次级背景"],
      ["--text","文字"],["--text-muted","次要文字"],["--border","边框"],
      ["--primary","主色"],["--primary-text","主色文字"],["--accent","强调色"],
      ["--pad-bg","画板背景"]
    ];
    const modal = document.createElement("div");
    modal.className = "modal-mask";
    modal.innerHTML = `
      <div class="modal">
        <h3>自定义主题</h3>
        <div class="field"><label>主题名</label><input type="text" id="ctName" value="我的主题" /></div>
        ${fields.map(([k,label]) => `
          <div class="field"><label>${label}</label>
            <input type="color" data-var="${k}" value="${toHex(base[k] || '#ffffff')}" />
          </div>`).join("")}
        <div class="field">
          <label>画笔颜色</label>
          <span><input type="checkbox" id="ctAutoStroke" ${base["--pad-stroke-auto"] === "1" ? "checked" : ""} /> 自动对比</span>
        </div>
        <div class="field" id="ctStrokeRow">
          <label>指定颜色</label>
          <input type="color" data-var="--pad-stroke" value="${toHex(base["--pad-stroke"] || '#333333')}" />
        </div>
        <div class="actions">
          <button id="ctCancel">取消</button>
          <button class="primary" id="ctSave">保存</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const autoChk = modal.querySelector("#ctAutoStroke");
    const strokeRow = modal.querySelector("#ctStrokeRow");
    function toggleStrokeRow() { strokeRow.style.display = autoChk.checked ? "none" : "flex"; }
    autoChk.onchange = toggleStrokeRow;
    toggleStrokeRow();
    modal.querySelector("#ctCancel").onclick = () => modal.remove();
    modal.querySelector("#ctSave").onclick = () => {
      const name = modal.querySelector("#ctName").value.trim() || "我的主题";
      const vars = {};
      modal.querySelectorAll("input[type=color]").forEach(inp => { vars[inp.dataset.var] = inp.value; });
      const padBg = vars["--pad-bg"] || base["--pad-bg"] || "#ffffff";
      if (autoChk.checked) {
        vars["--pad-stroke-auto"] = "1";
        vars["--pad-stroke"] = autoContrast(padBg);
      } else {
        vars["--pad-stroke-auto"] = "0";
        if (!vars["--pad-stroke"]) vars["--pad-stroke"] = base["--pad-stroke"] || "#333333";
      }
      vars["--ghost"] = autoGhost(padBg);
      Object.keys(base).forEach(k => { if (!vars[k]) vars[k] = base[k]; });
      const theme = window.Theme.createCustom(name, vars);
      window.Theme.apply(theme);
      updateThemeName();
      renderThemeMenu();
      modal.remove();
    };
  }

  // ========== 路由 ==========
  const views = {
    words: renderWordsOverview,
    grammar: renderGrammarList,
    alphabet: renderAlphabet,
    phrases: renderPhrasesOverview,
    quiz: renderQuiz,
    wrongbook: renderWrongBook,
    favorites: renderFavorites,
    stats: renderStats,
    settings: renderSettings
  };
  function bindNav() {
    document.querySelectorAll("nav button").forEach(b => {
      b.onclick = () => {
        document.querySelectorAll("nav button").forEach(x => x.classList.remove("active-view"));
        b.classList.add("active-view");
        views[b.dataset.view]();
      };
    });
  }

  // ========== 启动 ==========
  async function init() {
    try {
      window.Theme.apply(window.Theme.getCurrent());
      updateThemeName();

      await window.Loader.loadScript("data/languages.js");
      if (!window.LANGUAGES || !window.LANGUAGES.length) {
        throw new Error("languages.js 未加载或为空");
      }

      const saved = localStorage.getItem("currentLang");
      currentLang = window.LANGUAGES.find(l => l.code === saved)
        || window.LANGUAGES.find(l => l.code === window.CONFIG.defaultLang)
        || window.LANGUAGES[0];

      document.getElementById("appName").textContent = window.CONFIG.appName || "语言学习";
      document.getElementById("langName").textContent = currentLang.name;

      await window.Loader.loadLanguage(currentLang);
      await window.TTS.setup({ espeakVoice: currentLang.espeakVoice });

      bindLangButton();
      renderLangMenu();
      bindThemeButton();
      renderThemeMenu();
      bindNav();
      renderWordsOverview();
    } catch (e) {
      app().innerHTML =
        '<p style="color:red">启动失败：' + e.message + '</p>' +
        '<p class="hint">请按 F12 查看控制台详细错误。</p>';
      const st = document.getElementById("ttsStatus");
      if (st) st.textContent = "启动失败";
    }
  }

  return { init };
})();

window.App.init();