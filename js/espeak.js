window.ESPEAK = (() => {
  let espeak = null;
  let ready = false;
  let voice = "en";

  function statusEl() { return document.getElementById("ttsStatus"); }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function init(v = "en") {
    voice = v;
    const cdns = [
      "https://unpkg.com/espeak-ng@1.0.0/dist/espeak-ng.js",
      "https://cdn.jsdelivr.net/npm/espeak-ng@1.0.0/dist/espeak-ng.js"
    ];
    for (const url of cdns) {
      try {
        if (typeof window.EspeakNG !== "function") {
          await loadScript(url);
        }
        if (typeof window.EspeakNG === "function") {
          espeak = await window.EspeakNG({ arguments: ["-v", v, "--ipa"] });
          ready = true;
          if (statusEl()) statusEl().textContent = "发音引擎：eSpeak NG (IPA)";
          return;
        }
      } catch (e) {
        console.warn("eSpeak 加载失败:", url, e);
      }
    }
    ready = false;
    if (statusEl()) statusEl().textContent = "发音引擎：浏览器 TTS（回退）";
  }

  function speak(ipa, fallback = "") {
    if (ready && espeak) {
      try {
        espeak.synthesize(`[[${ipa}]]`, { voice });
        return;
      } catch (e) {
        console.warn("eSpeak 合成失败", e);
      }
    }
    if ("speechSynthesis" in window) {
      const text = fallback || ipa;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice === "en" ? "en-US" : voice;
      u.rate = 0.9;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }
  }

  return { init, speak };
})();