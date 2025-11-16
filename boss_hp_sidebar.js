
// boss_hp_sidebar.js
// DQ1 / DQ2 ボスCSVからHPを読み込み、トップページ右側で残りHPを計算するツール

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

  function buildBossesFromRows(rows, gameLabel) {
    if (!rows || rows.length <= 1) return [];

    const header = rows[0];
    const idxBoss = header.indexOf("ボス戦名");
    const idxUnit = header.indexOf("個体名");
    const idxCount = header.indexOf("体数");
    const idxHP = header.indexOf("HP");

    if (idxBoss === -1 || idxHP === -1) return [];

    const map = Object.create(null);
    const order = [];

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols || !cols.length) continue;

      const bossName = (cols[idxBoss] || "").trim();
      if (!bossName) continue;

      const unitName = idxUnit >= 0 ? (cols[idxUnit] || "").trim() : "";
      const countText = idxCount >= 0 ? (cols[idxCount] || "").trim() : "";
      const hpText = (cols[idxHP] || "").trim();

      let bucket = map[bossName];
      if (!bucket) {
        bucket = { name: bossName, rows: [] };
        map[bossName] = bucket;
        order.push(bossName);
      }

      bucket.rows.push({
        unitName,
        countText,
        hpText
      });
    }

    const bosses = [];

    order.forEach((bossName) => {
      const bucket = map[bossName];
      if (!bucket || !bucket.rows.length) return;

      const units = bucket.rows;

      let mainUnit = units.find((u) => u.unitName && u.unitName === bossName);
      if (!mainUnit) {
        mainUnit = units[0];
      }

      let hpNum = 0;
      if (mainUnit && mainUnit.hpText) {
        const m = mainUnit.hpText.replace(/[^0-9]/g, "");
        if (m) {
          const n = parseInt(m, 10);
          if (!isNaN(n)) hpNum = n;
        }
      }

      const helpers = [];
      units.forEach((u) => {
        if (u === mainUnit) return;
        const name = u.unitName || bossName;
        const count = u.countText ? parseInt(u.countText, 10) : null;
        const m = u.hpText ? u.hpText.replace(/[^0-9]/g, "") : "";
        const hpn = m ? parseInt(m, 10) : null;

        helpers.push({
          name,
          count: isNaN(count) ? null : count,
          hp: isNaN(hpn) ? null : hpn
        });
      });

      if (hpNum <= 0) return;

      bosses.push({
        game: gameLabel,
        name: bossName,
        mainHp: hpNum,
        helpers
      });
    });

    return bosses;
  }

  function setupSidebarTool(root) {
    const dq1Csv = root.getAttribute("data-dq1-csv");
    const dq2Csv = root.getAttribute("data-dq2-csv");
    if (!dq1Csv && !dq2Csv) return;

    const gameSelect = root.querySelector("[data-role='game-select']");
    const bossSelect = root.querySelector("[data-role='boss-select']");
    const maxHpSpan = root.querySelector("[data-role='max-hp']");
    const currentHpSpan = root.querySelector("[data-role='current-hp']");
    const percentSpan = root.querySelector("[data-role='percent']");
    const damageInput = root.querySelector("[data-role='damage-input']");
    const applyBtn = root.querySelector("[data-role='apply']");
    const clearBtn = root.querySelector("[data-role='clear']");
    const alertBox = root.querySelector("[data-role='alert']");
    const helpersBox = root.querySelector("[data-role='helpers']");
    const helpersList = root.querySelector("[data-role='helpers-list']");

    if (!gameSelect || !bossSelect || !maxHpSpan || !currentHpSpan || !percentSpan ||
        !damageInput || !applyBtn || !clearBtn) {
      return;
    }

    const bossesByGame = {
      DQ1: [],
      DQ2: []
    };

    let currentBoss = null;
    let currentHp = 0;
    let maxHp = 0;
    let halfAlertShown = false;

    function formatHp(n) {
      if (isNaN(n)) n = 0;
      return String(n);
    }

    function updateDisplay() {
      if (!currentBoss) {
        maxHpSpan.textContent = "-";
        currentHpSpan.textContent = "-";
        percentSpan.textContent = "-";
        if (alertBox) alertBox.textContent = "";
        if (helpersBox) helpersBox.style.display = "none";
        return;
      }

      maxHpSpan.textContent = formatHp(maxHp);
      currentHpSpan.textContent = formatHp(currentHp);

      if (maxHp > 0) {
        let pct = Math.round((currentHp / maxHp) * 100);
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;
        percentSpan.textContent = pct + "%";
      } else {
        percentSpan.textContent = "-";
      }
    }

    function renderHelpers() {
      if (!helpersBox || !helpersList) return;
      helpersList.innerHTML = "";
      if (!currentBoss || !currentBoss.helpers || !currentBoss.helpers.length) {
        helpersBox.style.display = "none";
        return;
      }
      helpersBox.style.display = "block";
      currentBoss.helpers.forEach((h) => {
        const li = document.createElement("li");
        let text = h.name;
        if (h.count != null && !isNaN(h.count)) {
          text += " / " + h.count + "体";
        }
        if (h.hp != null && !isNaN(h.hp)) {
          text += " / HP " + h.hp;
        }
        li.textContent = text;
        helpersList.appendChild(li);
      });
    }

    function resetBossSelection() {
      currentBoss = null;
      currentHp = 0;
      maxHp = 0;
      halfAlertShown = false;
      if (alertBox) alertBox.textContent = "";
      damageInput.value = "";
      bossSelect.value = "";
      updateDisplay();
      renderHelpers();
    }

    function onGameChange() {
      const game = gameSelect.value;
      resetBossSelection();

      bossSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "-- ボスを選択 --";
      bossSelect.appendChild(placeholder);

      if (!game || !bossesByGame[game] || !bossesByGame[game].length) {
        bossSelect.disabled = true;
        return;
      }

      bossesByGame[game].forEach((b, index) => {
        const opt = document.createElement("option");
        opt.value = String(index);
        opt.textContent = b.name;
        bossSelect.appendChild(opt);
      });

      bossSelect.disabled = false;
    }

    function onBossChange() {
      const game = gameSelect.value;
      if (!game || !bossesByGame[game] || !bossesByGame[game].length) {
        resetBossSelection();
        return;
      }
      const idx = parseInt(bossSelect.value, 10);
      if (isNaN(idx) || idx < 0 || idx >= bossesByGame[game].length) {
        resetBossSelection();
        return;
      }
      const b = bossesByGame[game][idx];
      currentBoss = b;
      maxHp = Number(b.mainHp) || 0;
      currentHp = maxHp;
      halfAlertShown = false;
      if (alertBox) alertBox.textContent = "";
      damageInput.value = "";
      renderHelpers();
      updateDisplay();
    }

    gameSelect.addEventListener("change", onGameChange);
    bossSelect.addEventListener("change", onBossChange);

    applyBtn.addEventListener("click", () => {
      if (!currentBoss || !(maxHp > 0)) return;
      const dmg = Number(damageInput.value);
      if (!(dmg > 0)) return;

      const prevHp = currentHp;
      currentHp = Math.max(0, currentHp - dmg);
      updateDisplay();

      if (!halfAlertShown && maxHp > 0 && prevHp > maxHp / 2 && currentHp <= maxHp / 2) {
        if (alertBox) {
          alertBox.textContent = "HPが半分を下回りました。行動変化に注意。";
        }
        halfAlertShown = true;
      }
    });

    clearBtn.addEventListener("click", () => {
      if (!currentBoss) return;
      currentHp = maxHp;
      halfAlertShown = false;
      if (alertBox) alertBox.textContent = "";
      damageInput.value = "";
      updateDisplay();
    });

    // CSV 読み込み
    const promises = [];

    if (dq1Csv) {
      promises.push(
        fetch(dq1Csv)
          .then((res) => res.ok ? res.text() : Promise.reject(new Error("DQ1 CSV load failed")))
          .then((text) => {
            const rows = parseCSV(text);
            bossesByGame.DQ1 = buildBossesFromRows(rows, "DQ1");
          })
          .catch((err) => {
            console.error(err);
            bossesByGame.DQ1 = [];
          })
      );
    }

    if (dq2Csv) {
      promises.push(
        fetch(dq2Csv)
          .then((res) => res.ok ? res.text() : Promise.reject(new Error("DQ2 CSV load failed")))
          .then((text) => {
            const rows = parseCSV(text);
            bossesByGame.DQ2 = buildBossesFromRows(rows, "DQ2");
          })
          .catch((err) => {
            console.error(err);
            bossesByGame.DQ2 = [];
          })
      );
    }

    Promise.all(promises).then(() => {
      // 初期状態ではゲーム未選択
      resetBossSelection();
      bossSelect.disabled = true;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const tool = document.querySelector(".boss-hp-tool");
    if (tool) {
      setupSidebarTool(tool);
    }
  });
})();
