
// site_search.js
// 右カラム用の簡易サイト内検索

(function () {
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          const next = text[i + 1];
          if (next === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          row.push(current);
          current = "";
        } else if (c === "\n" || c === "\r") {
          if (current.length > 0 || row.length > 0) {
            row.push(current);
            rows.push(row);
            row = [];
            current = "";
          }
        } else {
          current += c;
        }
      }
    }
    if (current.length > 0 || row.length > 0) {
      row.push(current);
      rows.push(row);
    }
    return rows;
  }

  function makeHeaderIndex(header) {
    const index = {};
    header.forEach((name, i) => {
      index[name] = i;
    });
    return index;
  }

  function getCol(cols, headerIndex, name) {
    const idx = headerIndex[name];
    if (idx == null || idx < 0 || idx >= cols.length) return "";
    return (cols[idx] || "").trim();
  }

  function trimText(text, maxLen) {
    if (!text) return "";
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen) + "…";
  }

  function buildEntries() {
    const tasks = [];

    const entries = [];

    function loadCSV(url, handler) {
      tasks.push(
        fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error("CSV load failed: " + url);
            return res.text();
          })
          .then((text) => {
            const rows = parseCSV(text);
            if (!rows || rows.length <= 1) return;
            handler(rows);
          })
          .catch((err) => {
            console.error(err);
          })
      );
    }

    // DQ1 アイテム
    loadCSV("data/dq1_items.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const kind = getCol(cols, h, "種別");
        const effect = getCol(cols, h, "効果");
        const note = getCol(cols, h, "備考");
        const sub = [kind, effect, note].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ1",
          category: "アイテム",
          name,
          sub: trimText(sub, 80),
          url: "dq1_db.html#items",
        });
      }
    });

    // DQ1 呪文・特技
    loadCSV("data/dq1_spells.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const kind = getCol(cols, h, "種別");
        const effect = getCol(cols, h, "効果");
        const sub = [kind, effect].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ1",
          category: "呪文・特技",
          name,
          sub: trimText(sub, 80),
          url: "dq1_db.html#spells",
        });
      }
    });

    // DQ1 モンスター
    loadCSV("data/dq1_monsters.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const area = getCol(cols, h, "出現エリア");
        const drop = getCol(cols, h, "ドロップ");
        const sub = [area, drop].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ1",
          category: "モンスター",
          name,
          sub: trimText(sub, 80),
          url: "dq1_db.html#monsters",
        });
      }
    });

    // DQ2 アイテム
    loadCSV("data/dq2_items.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const kind = getCol(cols, h, "種別");
        const effect = getCol(cols, h, "効果");
        const note = getCol(cols, h, "備考");
        const sub = [kind, effect, note].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ2",
          category: "アイテム",
          name,
          sub: trimText(sub, 80),
          url: "dq2_db.html#items",
        });
      }
    });

    // DQ2 呪文・特技
    loadCSV("data/dq2_spells.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const kind = getCol(cols, h, "種別");
        const effect = getCol(cols, h, "効果");
        const sub = [kind, effect].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ2",
          category: "呪文・特技",
          name,
          sub: trimText(sub, 80),
          url: "dq2_db.html#spells",
        });
      }
    });

    // DQ2 モンスター
    loadCSV("data/dq2_monsters.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const name = getCol(cols, h, "名前");
        if (!name) continue;
        const area = getCol(cols, h, "出現エリア");
        const drop = getCol(cols, h, "備考(ドロップ)");
        const sub = [area, drop].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ2",
          category: "モンスター",
          name,
          sub: trimText(sub, 80),
          url: "dq2_db.html#monsters",
        });
      }
    });

    // DQ1 ボス
    loadCSV("dq1_boss_multiunit.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      const idxBoss = h["ボス戦名"];
      const idxPlace = h["出現場所"];
      const idxHP = h["HP"];
      if (idxBoss == null) return;

      const map = new Map();
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const bossName = (cols[idxBoss] || "").trim();
        if (!bossName) continue;
        let info = map.get(bossName);
        if (!info) {
          info = {
            name: bossName,
            place: idxPlace != null ? (cols[idxPlace] || "").trim() : "",
            hp: idxHP != null ? (cols[idxHP] || "").trim() : "",
          };
          map.set(bossName, info);
        }
      }
      for (const info of map.values()) {
        const parts = [];
        if (info.place) parts.push(info.place);
        if (info.hp) parts.push("HP " + info.hp);
        entries.push({
          game: "DQ1",
          category: "ボス",
          name: info.name,
          sub: trimText(parts.join(" / "), 80),
          url: "dq1_boss_detail.html?boss=" + encodeURIComponent(info.name),
        });
      }
    });

    // DQ2 ボス
    loadCSV("dq2_boss_multiunit.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      const idxBoss = h["ボス戦名"];
      const idxPlace = h["出現場所"];
      const idxHP = h["HP"];
      if (idxBoss == null) return;

      const map = new Map();
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const bossName = (cols[idxBoss] || "").trim();
        if (!bossName) continue;
        let info = map.get(bossName);
        if (!info) {
          info = {
            name: bossName,
            place: idxPlace != null ? (cols[idxPlace] || "").trim() : "",
            hp: idxHP != null ? (cols[idxHP] || "").trim() : "",
          };
          map.set(bossName, info);
        }
      }
      for (const info of map.values()) {
        const parts = [];
        if (info.place) parts.push(info.place);
        if (info.hp) parts.push("HP " + info.hp);
        entries.push({
          game: "DQ2",
          category: "ボス",
          name: info.name,
          sub: trimText(parts.join(" / "), 80),
          url: "dq2_boss_detail.html?boss=" + encodeURIComponent(info.name),
        });
      }
    });

    // DQ1 メダル（場所）
    loadCSV("dq1_medal.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const place = getCol(cols, h, "場所");
        if (!place) continue;
        const detail = getCol(cols, h, "詳細場所");
        const name = place;
        const sub = detail;
        entries.push({
          game: "DQ1",
          category: "メダル（場所）",
          name,
          sub: trimText(sub, 80),
          url: "dq1_medal.html",
        });
      }
    });

    // DQ1 メダル（景品）
    loadCSV("dq1_prize.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const prize = getCol(cols, h, "景品");
        if (!prize) continue;
        const count = getCol(cols, h, "枚数");
        const kind = getCol(cols, h, "種別");
        const sub = [count, kind].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ1",
          category: "メダル（景品）",
          name: prize,
          sub: trimText(sub, 80),
          url: "dq1_medal.html",
        });
      }
    });

    // DQ2 メダル（場所）
    loadCSV("dq2_medal.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const place = getCol(cols, h, "場所");
        if (!place) continue;
        const detail = getCol(cols, h, "詳細場所");
        const name = place;
        const sub = detail;
        entries.push({
          game: "DQ2",
          category: "メダル（場所）",
          name,
          sub: trimText(sub, 80),
          url: "dq2_medal.html",
        });
      }
    });

    // DQ2 メダル（景品）
    loadCSV("dq2_prize.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const prize = getCol(cols, h, "景品");
        if (!prize) continue;
        const count = getCol(cols, h, "枚数");
        const effect = getCol(cols, h, "効果");
        const sub = [count, effect].filter(Boolean).join(" / ");
        entries.push({
          game: "DQ2",
          category: "メダル（景品）",
          name: prize,
          sub: trimText(sub, 80),
          url: "dq2_medal.html",
        });
      }
    });

    // DQ1 キラキラ（番号 + 入手物）
    loadCSV("dq1_kirakira.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const num = getCol(cols, h, "番号");
        const item = getCol(cols, h, "入手物");
        if (!num && !item) continue;
        const name = item || ("No." + num);
        const sub = num ? "No." + num : "";
        entries.push({
          game: "DQ1",
          category: "キラキラ",
          name,
          sub: trimText(sub, 80),
          url: "dq1_kirakira.html",
        });
      }
    });

    // DQ2 キラキラ（青）
    loadCSV("dq2_kirakira_blue.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const num = getCol(cols, h, "番号");
        const item = getCol(cols, h, "入手物");
        if (!num && !item) continue;
        const name = item || ("No." + num);
        const sub = num ? "No." + num + " / 青" : "青";
        entries.push({
          game: "DQ2",
          category: "キラキラ",
          name,
          sub: trimText(sub, 80),
          url: "dq2_kirakira.html",
        });
      }
    });

    // DQ2 キラキラ（赤）
    loadCSV("dq2_kirakira_red.csv", (rows) => {
      const header = rows[0];
      const h = makeHeaderIndex(header);
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const num = getCol(cols, h, "番号");
        const item = getCol(cols, h, "入手物");
        if (!num && !item) continue;
        const name = item || ("No." + num);
        const sub = num ? "No." + num + " / 赤" : "赤";
        entries.push({
          game: "DQ2",
          category: "キラキラ",
          name,
          sub: trimText(sub, 80),
          url: "dq2_kirakira.html",
        });
      }
    });

    return Promise.all(tasks).then(() => entries);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector(".site-search-tool");
    if (!root) return;

    const input = root.querySelector("[data-role='site-search-input']");
    const resultsBox = root.querySelector("[data-role='site-search-results']");
    if (!input || !resultsBox) return;

    let allEntries = [];
    let indexReady = false;
    let indexBuilding = false;

    function renderResults(query) {
      const q = query.trim();
      resultsBox.innerHTML = "";
      if (!q) {
        return;
      }
      if (!indexReady) {
        const div = document.createElement("div");
        div.className = "search-loading";
        div.textContent = "検索準備中…";
        resultsBox.appendChild(div);
        return;
      }

      const hits = [];
      for (const e of allEntries) {
        if (!e.name) continue;
        if (e.name.indexOf(q) !== -1 || (e.sub && e.sub.indexOf(q) !== -1)) {
          hits.push(e);
        }
      }

      if (!hits.length) {
        const div = document.createElement("div");
        div.className = "search-empty";
        div.textContent = "見つかりませんでした。";
        resultsBox.appendChild(div);
        return;
      }

      const limited = hits.slice(0, 40);
      limited.forEach((e) => {
        const item = document.createElement("div");
        item.className = "search-result-item";

        const link = document.createElement("a");
        link.href = e.url;
        link.textContent = e.game + " / " + e.category + " / " + e.name;
        item.appendChild(link);

        if (e.sub) {
          const meta = document.createElement("div");
          meta.className = "search-result-meta";
          meta.textContent = e.sub;
          item.appendChild(meta);
        }

        resultsBox.appendChild(item);
      });
    }

    function ensureIndex() {
      if (indexReady || indexBuilding) return;
      indexBuilding = true;
      buildEntries().then((entries) => {
        allEntries = entries;
        indexReady = true;
        indexBuilding = false;
        if (input.value.trim()) {
          renderResults(input.value);
        }
      });
    }

    input.addEventListener("focus", () => {
      ensureIndex();
    });

    input.addEventListener("input", () => {
      ensureIndex();
      renderResults(input.value);
    });
  });
})();
