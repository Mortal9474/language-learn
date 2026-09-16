window.TTS = (() => {
  async function setup(config) {
    await window.ESPEAK.init(config.espeakVoice || "en");
  }

  function speakItem(item) {
    const ipa = item.ipa
      || (item.phonetic ? item.phonetic.replace(/[/\[\]]/g, "") : "")
      || item.word || item.text || item.name || "";
    const fallback = item.word || item.text || item.name || ipa;
    window.ESPEAK.speak(ipa, fallback);
  }

  return { setup, speakItem };
})();