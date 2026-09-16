window.Theme = (() => {
  const STORAGE_KEY = "currentTheme";
  const CUSTOM_KEY = "customThemes";

  // 所有主题 = 预设 + 自定义
  function getAllThemes() {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    return [...window.THEMES, ...custom];
  }

  function getTheme(code) {
    return getAllThemes().find(t => t.code === code);
  }

  function getCurrent() {
    const code = localStorage.getItem(STORAGE_KEY) || "simple";
    return getTheme(code) || window.THEMES[0];
  }

  // 应用主题到 DOM
  function apply(theme) {
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
    root.setAttribute("data-theme", theme.code);
    localStorage.setItem(STORAGE_KEY, theme.code);
  }

  function setTheme(code) {
    const t = getTheme(code);
    if (t) apply(t);
  }

  // 创建自定义主题（基于当前主题改色）
  function createCustom(name, vars) {
    const code = "custom_" + Date.now();
    const theme = { code, name, vars, custom: true };
    const list = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    list.push(theme);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    return theme;
  }

  function deleteCustom(code) {
    let list = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    list = list.filter(t => t.code !== code);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    if (localStorage.getItem(STORAGE_KEY) === code) {
      apply(window.THEMES[0]);
    }
  }

  // 获取当前主题的变量快照（用于自定义编辑）
  function snapshotVars() {
    const t = getCurrent();
    return { ...t.vars };
  }

  return {
    getAllThemes,
    getTheme,
    getCurrent,
    setTheme,
    apply,
    createCustom,
    deleteCustom,
    snapshotVars
  };
})();