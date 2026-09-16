window.Pad = (() => {
  function getVar(name, fallback = "") {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim() || fallback;
  }
  function getPadBg() {
    return getVar("--pad-bg", "#ffffff");
  }
  function getBrightness(hex) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    if (hex.length !== 6) return 255;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
  function autoContrast(bgHex) {
    return getBrightness(bgHex) > 128 ? "#222222" : "#f0f0f0";
  }
  function autoGhost(bgHex) {
    return getBrightness(bgHex) > 128 ? "#c8c8c8" : "#555555";
  }

  function getPadColors() {
    const padBg = getPadBg();
    const auto = getVar("--pad-stroke-auto") === "1";
    const stroke = auto ? autoContrast(padBg) : getVar("--pad-stroke", "#333333");
    const ghost = autoGhost(padBg);
    return { padBg, stroke, ghost };
  }

  function init(canvas, options = {}) {
    const ctx = canvas.getContext("2d");
    let drawing = false;
    let erasing = false;
    let history = [];
    let currentStroke = null;

    function resizeToContainer() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        redraw();
      }
    }

    function drawGhost(color) {
      if (!options.ghost) return;
      const rect = canvas.getBoundingClientRect();
      ctx.save();
      ctx.font = `${rect.height * 0.7}px system-ui, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(options.ghost, rect.width / 2, rect.height / 2);
      ctx.restore();
    }

    function redraw() {
      const rect = canvas.getBoundingClientRect();
      const { padBg, stroke, ghost } = getPadColors();

      ctx.fillStyle = padBg;
      ctx.fillRect(0, 0, rect.width, rect.height);

      drawGhost(ghost);

      history.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = s.eraser ? padBg : stroke;
        ctx.lineWidth = s.eraser ? 20 : 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        s.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      });
    }

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    canvas.addEventListener("pointerdown", e => {
      e.preventDefault();
      drawing = true;
      const p = pos(e);
      currentStroke = { points: [p], eraser: erasing };
      history.push(currentStroke);
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener("pointermove", e => {
      if (!drawing) return;
      const p = pos(e);
      currentStroke.points.push(p);
      const { padBg, stroke } = getPadColors();
      const pts = currentStroke.points;
      const last = pts[pts.length - 2];

      ctx.beginPath();
      ctx.strokeStyle = currentStroke.eraser ? padBg : stroke;
      ctx.lineWidth = currentStroke.eraser ? 20 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    const stop = () => { drawing = false; currentStroke = null; };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointerleave", stop);
    canvas.addEventListener("pointercancel", stop);

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => resizeToContainer());
      ro.observe(canvas);
    } else {
      window.addEventListener("resize", resizeToContainer);
    }

    requestAnimationFrame(() => resizeToContainer());

    return {
      clear() { history = []; redraw(); },
      undo()  { history.pop(); redraw(); },
      setEraser(on) {
        erasing = !!on;
        canvas.style.cursor = erasing ? "cell" : "crosshair";
      },
      isEraser() { return erasing; },
      save(key) {
        try {
          localStorage.setItem("pad_data_" + key, JSON.stringify({
            ghost: options.ghost || null,
            history
          }));
        } catch (e) {}
      },
      load(key) {
        const raw = localStorage.getItem("pad_data_" + key);
        if (!raw) { history = []; redraw(); return; }
        try {
          const data = JSON.parse(raw);
          if (data.ghost && !options.ghost) options.ghost = data.ghost;
          history = data.history || [];
        } catch (e) { history = []; }
        redraw();
      },
      setGhost(ch) { options.ghost = ch; redraw(); },
      refreshTheme() { redraw(); },
      getHistory() { return history; }
    };
  }

  return { init };
})();