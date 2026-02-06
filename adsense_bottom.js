/* bottom固定の手動広告（全ページ共通）
 * - 旧Auto広告の「勝手に途中に出る」を止めて、ページ最下部にだけ出すための仕組み。
 * - Ads library はここで1回だけ読み込みます（client付きURLは使わない）。
 */
(function () {
  function isValidSlot(slot) {
    if (!slot) return false;
    if (slot === "REPLACE_WITH_YOUR_SLOT_ID") return false;
    // slot は通常数字。念のため 6桁以上を許可（短い/空は弾く）
    return /^[0-9]{6,}$/.test(String(slot));
  }

  var client = window.ADSENSE_CLIENT;
  var slot = window.ADSENSE_BOTTOM_SLOT;

  if (!client || !isValidSlot(slot)) {
    // 未設定なら何もしない（自動広告も使わない前提）
    return;
  }

  function whenReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function ensureAdsLib(cb) {
    // adsbygoogle が既に使えるならOK
    if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
      cb();
      return;
    }

    var existing = document.querySelector('script[data-role="adsense-lib"]');
    if (existing) {
      // 既に読み込み完了してるかもなので、次Tickで実行
      if (existing.dataset.loaded === "1") {
        cb();
        return;
      }
      existing.addEventListener(
        "load",
        function () {
          existing.dataset.loaded = "1";
          cb();
        },
        { once: true }
      );
      return;
    }

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    s.crossOrigin = "anonymous";
    s.dataset.role = "adsense-lib";
    s.addEventListener(
      "load",
      function () {
        s.dataset.loaded = "1";
        cb();
      },
      { once: true }
    );

    (document.head || document.documentElement).appendChild(s);
  }

  function injectStyle() {
    if (document.getElementById("adsense-bottom-style")) return;
    var st = document.createElement("style");
    st.id = "adsense-bottom-style";
    st.textContent = [
      ".ad-bottom-wrap{max-width:1200px;margin:24px auto;padding:0 16px;}",
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  }

  function injectAd() {
    // 二重挿入防止
    if (document.getElementById("adsense-bottom-wrap")) return;

    injectStyle();

    var wrap = document.createElement("div");
    wrap.className = "ad-bottom-wrap";
    wrap.id = "adsense-bottom-wrap";

    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", client);
    ins.setAttribute("data-ad-slot", String(slot));
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");

    wrap.appendChild(ins);

    // bodyの一番最後（＝最下部）へ
    document.body.appendChild(wrap);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 失敗してもサイト機能は壊さない
    }
  }

  whenReady(function () {
    ensureAdsLib(injectAd);
  });
})();
