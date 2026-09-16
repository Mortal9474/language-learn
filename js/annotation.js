window.Annotation = (() => {
  function html(key) {
    const text = localStorage.getItem("anno_text_" + key) || "";
    const hasPad = !!localStorage.getItem("pad_data_anno_" + key);
    return `
      <div class="anno-box" data-anno-key="${key}">
        <div class="anno-title">批注</div>
        <textarea class="anno-text" placeholder="打字批注...">${text}</textarea>

        <div class="anno-pad-wrap" style="display:${hasPad ? 'block' : 'none'}">
          <canvas class="anno-pad"></canvas>
          <div class="anno-pad-toolbar">
            <button class="pad-btn pad-eraser" title="橡皮">🩹 橡皮</button>
            <button class="pad-btn pad-undo" title="撤销">↶ 撤销</button>
            <button class="pad-btn pad-clear" title="清空">🗑 清空</button>
          </div>
        </div>

        <div class="anno-actions">
          <button class="anno-toggle-pad">${hasPad ? '隐藏手写' : '手写批注'}</button>
          <button class="anno-save">保存</button>
          <button class="anno-clear">清除</button>
        </div>
      </div>
    `;
  }

  function bind(root, key) {
    const box = root.querySelector(`.anno-box[data-anno-key="${key}"]`);
    if (!box) return;
    const textarea = box.querySelector(".anno-text");
    const padWrap = box.querySelector(".anno-pad-wrap");
    const canvas = box.querySelector(".anno-pad");
    const toggleBtn = box.querySelector(".anno-toggle-pad");
    const saveBtn = box.querySelector(".anno-save");
    const clearBtn = box.querySelector(".anno-clear");
    const eraserBtn = box.querySelector(".pad-eraser");
    const undoBtn = box.querySelector(".pad-undo");
    const padClearBtn = box.querySelector(".pad-clear");

    let pad = null;

    function ensurePad() {
      if (!pad) pad = window.Pad.init(canvas);
      return pad;
    }

    // 显示画板时懒加载，并恢复笔迹
    if (padWrap.style.display !== "none") {
      requestAnimationFrame(() => ensurePad().load("anno_" + key));
    }

    toggleBtn.onclick = () => {
      if (padWrap.style.display === "none") {
        padWrap.style.display = "block";
        requestAnimationFrame(() => ensurePad().load("anno_" + key));
        toggleBtn.textContent = "隐藏手写";
      } else {
        padWrap.style.display = "none";
        toggleBtn.textContent = "手写批注";
      }
    };

    saveBtn.onclick = () => {
      localStorage.setItem("anno_text_" + key, textarea.value);
      if (padWrap.style.display !== "none") {
        ensurePad().save("anno_" + key);
      }
      saveBtn.textContent = "已保存";
      setTimeout(() => saveBtn.textContent = "保存", 1000);
    };

    clearBtn.onclick = () => {
      if (!confirm("清除此批注？")) return;
      localStorage.removeItem("anno_text_" + key);
      localStorage.removeItem("pad_data_anno_" + key);
      textarea.value = "";
      if (pad) pad.clear();
    };

    // 工具栏
    eraserBtn.onclick = () => {
      const p = ensurePad();
      p.setEraser(!p.isEraser());
      eraserBtn.classList.toggle("active", p.isEraser());
    };
    undoBtn.onclick = () => ensurePad().undo();
    padClearBtn.onclick = () => ensurePad().clear();
  }

  return { html, bind };
})();