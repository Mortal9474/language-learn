const fs = require('fs');
const path = require('path');

const INPUT_FILES = [
  { file: '初中.JSONL', level: '初中' },
  { file: '高中.JSONL', level: '高中' },
  { file: '四级.JSONL', level: 'CET4' },
  { file: '六级.JSONL', level: 'CET6' }
];

const OUTPUT_FILE = 'words.js';
// 【改】每个词最多保留几条搭配
const MAX_EXAMPLES_PER_WORD = 6;

function readJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(Boolean);
}

function ipaToEspeak(ipa) {
  if (!ipa) return '';
  let s = ipa.replace(/^[\/\[]+|[\/\]]+$/g, '').trim();
  const map = {
    'θ':'T','ʃ':'S','ʒ':'Z','ŋ':'N','æ':'&','ʌ':'V','ə':'@','ɜ':'3',
    'ɔ':'O','ɪ':'I','ʊ':'U','ɛ':'E','iː':'i','uː':'u','ɑː':'A','ɔː':'O',
    'ɜː':'3','eɪ':'eI','aɪ':'aI','ɔɪ':'OI','aʊ':'aU','əʊ':'oU','oʊ':'oU',
    'ɪə':'I@','eə':'E@','ʊə':'U@','ˈ':'','ˌ':'','.':'','ː':':'
  };
  const sorted = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of sorted) s = s.split(k).join(map[k]);
  return s.replace(/[\/\[\]\(\)]/g, '').trim();
}

function adaptWord(raw, level) {
  const word = (raw.word || '').trim();
  if (!word) return null;

  const translations = Array.isArray(raw.translations) ? raw.translations : [];
  if (!translations.length) return null;

  let mainMeaning = '', mainPos = '';
  for (const t of translations) {
    const txt = (t.translation || '').trim();
    if (!txt || txt.includes('人名')) continue;
    if (!mainMeaning) { mainMeaning = txt; mainPos = (t.type || '').trim(); }
  }
  if (!mainMeaning) {
    mainMeaning = translations[0].translation || '';
    mainPos = translations[0].type || '';
  }

  const us = raw.us || '', uk = raw.uk || '';
  const phoneticRaw = us || uk;
  const phonetic = phoneticRaw ? `/${phoneticRaw.replace(/[\/\[\]]/g, '')}/` : '';
  const ipa = ipaToEspeak(phoneticRaw) || word;

  // 【改】用 phrases 字段作为"搭配"，替代 sentences
  const examples = [];
  if (Array.isArray(raw.phrases)) {
    raw.phrases.slice(0, MAX_EXAMPLES_PER_WORD).forEach(p => {
      if (p.phrase && p.translation) {
        examples.push({ con: p.phrase, zh: p.translation, ipa: '' });
      }
    });
  }

  const posMap = {
    n:'n.', v:'v.', adj:'adj.', adv:'adv.', prep:'prep.',
    conj:'conj.', pron:'pron.', num:'num.', art:'art.', int:'int.'
  };
  const pos = posMap[mainPos] || mainPos;

  return {
    id: `${level.toLowerCase()}_${word.replace(/\s+/g, '_').toLowerCase()}`,
    word, display: word, phonetic, ipa, meaning: mainMeaning, pos,
    level, examples
  };
}

function main() {
  const allWords = [];
  const seen = new Set();

  for (const { file, level } of INPUT_FILES) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) { console.warn(`⚠ 跳过: ${file}`); continue; }
    let items;
    try { items = readJSONL(filePath); }
    catch (e) { console.error(`✗ 读取失败: ${file} — ${e.message}`); continue; }

    let count = 0;
    for (const item of items) {
      const w = adaptWord(item, level);
      if (!w) continue;
      const key = w.word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      allWords.push(w);
      count++;
    }
    console.log(`✓ ${file} (${level}): ${count} 词`);
  }

  const levelOrder = ['初中', '高中', 'CET4', 'CET6'];
  allWords.sort((a, b) => {
    const la = levelOrder.indexOf(a.level), lb = levelOrder.indexOf(b.level);
    if (la !== lb) return la - lb;
    return a.word.localeCompare(b.word);
  });

  const output = 'window.WORDS = ' + JSON.stringify(allWords, null, 2) + ';\n';
  fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), output, 'utf8');

  const withExamples = allWords.filter(w => w.examples.length > 0).length;
  const totalExamples = allWords.reduce((n, w) => n + w.examples.length, 0);
  console.log(`\n✅ 完成！共 ${allWords.length} 词，其中有搭配 ${withExamples} 词，搭配总数 ${totalExamples} 条`);
  console.log(`📄 输出: ${OUTPUT_FILE}`);
}

main();