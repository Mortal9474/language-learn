window.Loader = (() => {
  const loaded = {};

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (loaded[src]) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => { loaded[src] = true; resolve(); };
      s.onerror = () => reject(new Error("加载失败: " + src));
      document.head.appendChild(s);
    });
  }

  async function loadLanguage(lang) {
    // 清空旧数据，避免累加
    window.WORDS = [];
    window.GRAMMAR = [];
    window.ALPHABET = [];
    window.PHRASES = [];

    const tasks = [];
    if (lang.words)    tasks.push(loadScript(lang.words));
    if (lang.grammar)  tasks.push(loadScript(lang.grammar));
    if (lang.alphabet) tasks.push(loadScript(lang.alphabet));
    if (lang.phrases)  tasks.push(loadScript(lang.phrases));
    await Promise.all(tasks);
  }

  return { loadScript, loadLanguage };
})();