window.Quiz = (() => {
  function makeChoice(words, count = 4) {
    const pool = [...words];
    const answer = pool[Math.floor(Math.random() * pool.length)];
    const options = [answer];
    while (options.length < Math.min(count, pool.length)) {
      const w = pool[Math.floor(Math.random() * pool.length)];
      if (!options.find(o => o.id === w.id)) options.push(w);
    }
    options.sort(() => Math.random() - 0.5);
    return { answer, options };
  }

  function check(user, correct) {
    return String(user).trim() === String(correct).trim();
  }

  // 【改进】答错记录到错题本
  function recordWrong(id) {
    const m = JSON.parse(localStorage.getItem("wrongbook") || "{}");
    // 结构：{ id: { count: 错误次数, correct: 连续答对次数 } }
    if (!m[id]) m[id] = { count: 0, correct: 0 };
    m[id].count += 1;
    m[id].correct = 0; // 答错清零连续答对
    localStorage.setItem("wrongbook", JSON.stringify(m));
  }

  // 【新增】答对时更新，连续 3 次答对移除
  function recordCorrect(id) {
    const m = JSON.parse(localStorage.getItem("wrongbook") || "{}");
    if (!m[id]) return; // 不在错题本，无需处理
    m[id].correct = (m[id].correct || 0) + 1;
    if (m[id].correct >= 3) {
      delete m[id]; // 三次答对，移出错题本
    }
    localStorage.setItem("wrongbook", JSON.stringify(m));
  }

  // 【新增】取错题本列表
  function getWrongBook() {
    const m = JSON.parse(localStorage.getItem("wrongbook") || "{}");
    return Object.keys(m).map(id => ({ id, ...m[id] }));
  }

  return { makeChoice, check, recordWrong, recordCorrect, getWrongBook };
})();