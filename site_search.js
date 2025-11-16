// site_search.js
// トップページ右側の「サイト内検索」用スクリプト
// キーワードに応じて、関連しそうなページへのリンク一覧を表示します。

const SITE_SEARCH_PAGES = [
  // 基本・全体
  {
    title: "サイトの使い方",
    url: "howto.html",
    keywords: "使い方 サイト構成 探し方 見方 説明"
  },
  {
    title: "プレイ方針・注意点",
    url: "policy.html",
    keywords: "プレイ方針 注意点 ネタバレ 周回 RTA 方針"
  },
  {
    title: "メモ・小ネタ",
    url: "memo.html",
    keywords: "メモ 小ネタ 周回 RTA 備忘録 ちょっとした情報"
  },
  {
    title: "このサイトについて",
    url: "about.html",
    keywords: "このサイトについて 参考サイト 情報源"
  },
  {
    title: "更新履歴",
    url: "history.html",
    keywords: "更新履歴 更新情報 変更履歴"
  },

  // 共通
  {
    title: "世界地図（DQ1・DQ2）",
    url: "worldmap.html",
    keywords: "世界地図 マップ DQ1 DQ2 位置 関係"
  },

  // DQ1
  {
    title: "DQI ストーリー攻略",
    url: "dq1_story.html",
    keywords: "DQ1 ドラクエ1 ストーリー 攻略 進行 章 ボス カンダタ ようじゅつし ドラゴン ゴーレム りゅうおう 竜王"
  },
  {
    title: "DQI ボス攻略一覧",
    url: "dq1_boss_list.html",
    keywords: "DQ1 ドラクエ1 ボス一覧 HP 経験値 ゴールド りゅうおう 竜王 カンダタ ようじゅつし ゴーレム"
  },
  {
    title: "DQI アイテム・呪文・モンスター データベース",
    url: "dq1_db.html",
    keywords: "DQ1 データベース アイテム 装備 どうぐ 呪文 特技 モンスター ステータス"
  },
  {
    title: "DQI キラキラの場所一覧",
    url: "dq1_kirakira.html",
    keywords: "DQ1 キラキラ フィールド 位置 場所 アイテム"
  },
  {
    title: "DQI ひみつの場所一覧",
    url: "dq1_secret_place.html",
    keywords: "DQ1 ひみつの場所 秘密の場所 隠しポイント アイテム"
  },
  {
    title: "DQI 町・ダンジョン内アイテム一覧",
    url: "dq1_room_items.html",
    keywords: "DQ1 町 ダンジョン アイテム 部屋 ツボ タル タンス 地面 ガライ マイラ ラダトーム"
  },
  {
    title: "DQI ちいさなメダルまとめ",
    url: "dq1_medal.html",
    keywords: "DQ1 ちいさなメダル メダル 景品 場所 入手"
  },

  // DQ2
  {
    title: "DQII ボス攻略一覧",
    url: "dq2_boss_list.html",
    keywords: "DQ2 ドラクエ2 ボス一覧 HP 経験値 ゴールド"
  },
  {
    title: "DQII アイテム・呪文・モンスター データベース",
    url: "dq2_db.html",
    keywords: "DQ2 データベース アイテム 装備 どうぐ 呪文 特技 モンスター ステータス"
  },
  {
    title: "DQII キラキラの場所一覧",
    url: "dq2_kirakira.html",
    keywords: "DQ2 キラキラ フィールド 海辺 深海 位置 場所 アイテム"
  },
  {
    title: "DQII ひみつの場所一覧",
    url: "dq2_secret_place.html",
    keywords: "DQ2 ひみつの場所 秘密の場所 隠しポイント アイテム"
  },
  {
    title: "DQII 町・ダンジョン内アイテム一覧",
    url: "dq2_room_items.html",
    keywords: "DQ2 町 ダンジョン アイテム 部屋 ツボ タル タンス 地面 ローレシア サマルトリア ムーンブルク"
  },
  {
    title: "DQII ちいさなメダルまとめ",
    url: "dq2_medal.html",
    keywords: "DQ2 ちいさなメダル メダル 景品 場所 入手"
  }
];

function initSiteSearch() {
  const input = document.getElementById("site-search-input");
  const list = document.getElementById("site-search-results");
  if (!input || !list) {
    return;
  }

  function renderResults() {
    const q = (input.value || "").trim().toLowerCase();
    list.innerHTML = "";

    if (q === "") {
      // 何も入力されていないときは何も表示しない
      return;
    }

    const hits = SITE_SEARCH_PAGES.filter(function (p) {
      const hay = (p.title + " " + (p.keywords || "")).toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 30);

    if (!hits.length) {
      const li = document.createElement("li");
      li.textContent = "該当するページが見つかりませんでした。";
      list.appendChild(li);
      return;
    }

    hits.forEach(function (p) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = p.url;
      a.textContent = p.title;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  input.addEventListener("input", renderResults);
}

document.addEventListener("DOMContentLoaded", initSiteSearch);
