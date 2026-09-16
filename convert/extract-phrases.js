// extract-phrases.js
// 从 JSONL 词库中提取例句，按等级平均分配，生成 phrases.js

const fs = require('fs');
const path = require('path');

// ========== 配置区 ==========
const INPUT_FILES = [
  { file: '初中.JSONL', level: '初中', weight: 1 },
  { file: '高中.JSONL', level: '高中', weight: 1 },
  { file: '四级.JSONL', level: 'CET4', weight: 1.5 },
  { file: '六级.JSONL', level: 'CET6', weight: 1.5 }
];

const OUTPUT_FILE = 'phrases.js';

// 每个词最多取几条例句
const MAX_SENTENCES_PER_WORD = 2;

// 【总量上限】
const MAX_TOTAL_PHRASES = 3000;

// ========== 工具：IPA → eSpeak ==========
function ipaToEspeak(ipa) {
  if (!ipa) return '';
  let s = ipa.replace(/^[\/\[]+|[\/\]]+$/g, '').trim();
  const map = {
    'θ': 'T', 'ʃ': 'S', 'ʒ': 'Z', 'ŋ': 'N',
    'æ': '&', 'ʌ': 'V', 'ə': '@', 'ɜ': '3',
    'ɔ': 'O', 'ɪ': 'I', 'ʊ': 'U', 'ɛ': 'E',
    'iː': 'i', 'uː': 'u', 'ɑː': 'A', 'ɔː': 'O',
    'ɜː': '3', 'eɪ': 'eI', 'aɪ': 'aI',
    'ɔɪ': 'OI', 'aʊ': 'aU', 'əʊ': 'oU', 'oʊ': 'oU',
    'ɪə': 'I@', 'eə': 'E@', 'ʊə': 'U@',
    'ˈ': '', 'ˌ': '', '.': '', 'ː': ':'
  };
  const sorted = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of sorted) s = s.split(k).join(map[k]);
  return s.replace(/[\/\[\]\(\)]/g, '').trim();
}

// ========== 读取 JSONL ==========
function readJSONL(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      try { return JSON.parse(line); }
      catch (e) { return null; }
    })
    .filter(Boolean);
}

// ========== 从单个文件提取例句（不设上限，返回全部）==========
function extractFromFile(filePath, level) {
  const items = readJSONL(filePath);
  const list = [];

  for (const item of items) {
    const word = item.word || '';
    const sentences = Array.isArray(item.sentences) ? item.sentences : [];
    const us = item.us || item.uk || '';

    for (let idx = 0; idx < Math.min(sentences.length, MAX_SENTENCES_PER_WORD); idx++) {
      const s = sentences[idx];
      const text = (s.sentence || '').trim();
      const zh   = (s.translation || '').trim();
      if (!text) continue;

      list.push({
        id: `${level.toLowerCase()}_p_${word.replace(/\s+/g, '_').toLowerCase()}_${idx + 1}`,
        text: text,
        display: text,
        meaning: zh,
        phonetic: us ? `/${us.replace(/[\/\[\]]/g, '')}/` : '',
        ipa: '',
        scene: word,
        source: word,
        level: level,
        examples: []
      });
    }
  }
  return list;
}

// ========== 主流程 ==========
function main() {
  // ---- 1. 各等级配额 ----
  const totalWeight = INPUT_FILES.reduce((sum, f) => sum + (f.weight || 1), 0);
  INPUT_FILES.forEach(f => {
    f.quota = Math.floor(MAX_TOTAL_PHRASES * (f.weight || 1) / totalWeight);
  });

  console.log('📊 初始配额：');
  INPUT_FILES.forEach(f => {
    console.log(`   ${f.level}: ${f.quota}`);
  });

  // ---- 2. 从每个文件提取全部候选 ----
  const pools = {};   // { level: [phrases...] }
  for (const f of INPUT_FILES) {
    const filePath = path.join(__dirname, f.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠ 跳过不存在的文件: ${f.file}`);
      pools[f.level] = [];
      continue;
    }
    try {
      pools[f.level] = extractFromFile(filePath, f.level);
      console.log(`📥 ${f.file}: 候选 ${pools[f.level].length} 条`);
    } catch (e) {
      console.error(`✗ 读取失败: ${f.file} — ${e.message}`);
      pools[f.level] = [];
    }
  }

  // ---- 3. 按配额取，多余名额回流 ----
  const picked = {};       // { level: [phrases...] }
  let leftover = 0;        // 本轮未用完的配额

  // 第一轮：按配额取
  for (const f of INPUT_FILES) {
    const pool = pools[f.level] || [];
    const take = Math.min(f.quota, pool.length);
    picked[f.level] = pool.slice(0, take);
    const unused = f.quota - take;
    if (unused > 0) {
      leftover += unused;
      console.log(`↩ ${f.level} 剩余 ${unused} 名额回流`);
    } else {
      console.log(`✓ ${f.level} 取满 ${take} 条`);
    }
  }

  // 第二轮：把回流的配额分给还没取满的等级
  if (leftover > 0) {
    console.log(`\n🔁 回流名额 ${leftover}，继续分配...`);
    for (const f of INPUT_FILES) {
      if (leftover <= 0) break;
      const pool = pools[f.level] || [];
      const already = picked[f.level].length;
      const canTake = Math.max(0, pool.length - already);
      if (canTake <= 0) continue;
      const take = Math.min(leftover, canTake);
      picked[f.level] = picked[f.level].concat(pool.slice(already, already + take));
      leftover -= take;
      console.log(`  + ${f.level} 追加 ${take} 条`);
    }
  }

  // ---- 4. 合并、全局去重、截断到上限 ----
  const allPhrases = [];
  const seen = new Set();

  for (const f of INPUT_FILES) {
    for (const p of (picked[f.level] || [])) {
      const key = p.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      allPhrases.push(p);
    }
  }

  // 如果因为去重导致总数不足，或者略超上限，直接截断
  const finalList = allPhrases.slice(0, MAX_TOTAL_PHRASES);

  // ---- 5. 输出 ----
  const output = 'window.PHRASES = ' + JSON.stringify(finalList, null, 2) + ';\n';
  fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), output, 'utf8');

  console.log(`\n📈 最终分配：`);
  const countByLevel = {};
  finalList.forEach(p => {
    countByLevel[p.level] = (countByLevel[p.level] || 0) + 1;
  });
  Object.entries(countByLevel).forEach(([lv, n]) => {
    console.log(`   ${lv}: ${n}`);
  });

  console.log(`\n✅ 完成！共 ${finalList.length} 条例句`);
  console.log(`📄 输出: ${OUTPUT_FILE}`);
  console.log(`\n把 phrases.js 复制到 project/data/en/ 覆盖原文件即可。`);
}

main();