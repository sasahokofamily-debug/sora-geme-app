(() => {
  let deferredInstallPrompt = null;

  function moveFamilyMessageButtonIntoSettings() {
    const settingsPanel = document.querySelector('#settings .panel');
    if (!settingsPanel) return;
    const buttons = [...document.querySelectorAll('button[onclick="openFamilyMessageSettings()"]')];
    let familyButton = buttons.find(button => button.closest('#home')) || buttons[0];
    if (!familyButton) {
      familyButton = document.createElement('button');
      familyButton.setAttribute('onclick', 'openFamilyMessageSettings()');
      familyButton.textContent = '父の日・母の日メッセージ設定';
    }
    familyButton.remove();
    const dangerBox = settingsPanel.querySelector('.dangerBox');
    const sectionTitle = document.createElement('h2');
    sectionTitle.id = 'familyMessageSettingsTitle';
    sectionTitle.textContent = '記念日メッセージ設定';
    settingsPanel.querySelector('#familyMessageSettingsTitle')?.remove();
    if (dangerBox) {
      settingsPanel.insertBefore(sectionTitle, dangerBox);
      settingsPanel.insertBefore(familyButton, dangerBox);
    } else {
      settingsPanel.append(sectionTitle, familyButton);
    }
  }

  function isGameTopPage() {
    const path = location.pathname.replace(/\/+$/, '');
    return path === '' || path.endsWith('/index.html') || !path.split('/').pop().includes('.');
  }

  function addStartupPortal() {
    if (!isGameTopPage() || document.getElementById('shookingStartupPortal')) return;
    if (new URLSearchParams(location.search).get('play') === '1') return;

    const overlay = document.createElement('div');
    overlay.id = 'shookingStartupPortal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'SHOO KING II トップページ');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483646;overflow:auto;background:#0d1117;color:#f0f6fc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
    overlay.innerHTML = `
      <style>
        #shookingStartupPortal *{box-sizing:border-box}
        #shookingStartupPortal a{text-decoration:none;color:inherit}
        .skp-head{height:64px;border-bottom:1px solid #30363d;background:#010409;display:flex;align-items:center;padding:0 22px;gap:13px;position:sticky;top:0;z-index:2}
        .skp-logo{width:34px;height:34px;border:1px solid #58a6ff;border-radius:50%;display:grid;place-items:center;color:#58a6ff;font-weight:900}
        .skp-repo{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .skp-repo span{color:#8b949e;font-weight:500}
        .skp-main{width:min(1100px,calc(100% - 28px));margin:34px auto 60px;display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:24px}
        .skp-card{border:1px solid #30363d;border-radius:8px;background:#0d1117;overflow:hidden}
        .skp-title{padding:26px;border-bottom:1px solid #30363d;background:linear-gradient(145deg,#161b22,#0d1117)}
        .skp-title h1{margin:0 0 10px;font-size:clamp(34px,7vw,70px);letter-spacing:.03em;color:#f0f6fc}
        .skp-title p{margin:0;color:#8b949e;line-height:1.7}
        .skp-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
        .skp-badge{padding:4px 9px;border-radius:999px;border:1px solid #388bfd66;background:#0d419d33;color:#79c0ff;font-size:12px;font-weight:700}
        .skp-readme{padding:26px;line-height:1.8}
        .skp-readme h2{margin:0 0 12px;padding-bottom:9px;border-bottom:1px solid #21262d;font-size:24px}
        .skp-readme ul{padding-left:1.25em}
        .skp-side{display:flex;flex-direction:column;gap:14px}
        .skp-sidebox{border:1px solid #30363d;border-radius:8px;padding:18px;background:#0d1117}
        .skp-sidebox h3{margin:0 0 12px;font-size:16px}
        .skp-sidebox p{margin:0;color:#8b949e;font-size:14px;line-height:1.65}
        .skp-btn{width:100%;display:flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border-radius:7px;border:1px solid #2ea043;background:#238636;color:#fff;font-weight:800;cursor:pointer;margin-top:10px}
        .skp-btn.secondary{border-color:#30363d;background:#21262d;color:#f0f6fc}
        .skp-btn.blue{border-color:#1f6feb;background:#1f6feb}
        .skp-foot{text-align:center;color:#6e7681;font-size:12px;margin-top:24px}
        @media(max-width:760px){.skp-main{grid-template-columns:1fr}.skp-head{padding:0 14px}.skp-title,.skp-readme{padding:20px}}
      </style>
      <div class="skp-head">
        <div class="skp-logo">S2</div>
        <div class="skp-repo"><span>sasahokofamily-debug /</span> shoo-king-ii</div>
      </div>
      <div class="skp-main">
        <div class="skp-card">
          <div class="skp-title">
            <h1>SHOO KING II</h1>
            <p>宇宙を進み、敵を撃破し、機体・武器・格納庫を強化するブラウザシューティングゲーム。</p>
            <div class="skp-badges"><span class="skp-badge">Web Game</span><span class="skp-badge">PWA</span><span class="skp-badge">Free Play</span><span class="skp-badge">2026</span></div>
          </div>
          <div class="skp-readme">
            <h2>README</h2>
            <p>SHOO KING IIは、ブラウザですぐに遊べる宇宙シューティングゲームです。</p>
            <ul>
              <li>多数の通常・高難度ステージ</li>
              <li>武器、機体、スキン、格納庫の強化</li>
              <li>撃破数に応じた解放要素</li>
              <li>Webアプリとしてホーム画面へ追加可能</li>
              <li>コード埋め込み式HTMLの作成に対応</li>
            </ul>
          </div>
        </div>
        <aside class="skp-side">
          <div class="skp-sidebox">
            <h3>Play</h3>
            <p>ゲーム本体を起動します。</p>
            <button class="skp-btn" id="skpPlayButton" type="button">▶ ゲームを始める</button>
          </div>
          <div class="skp-sidebox">
            <h3>About</h3>
            <p>ゲーム内容、利用条件、著作権表示を確認できます。</p>
            <a class="skp-btn blue" href="./details.html">詳細ページ</a>
            <a class="skp-btn secondary" href="./download-builder.html">コード埋め込み式ダウンロード</a>
            <a class="skp-btn secondary" href="./permission-maker.html">権限発行ページ</a>
          </div>
          <div class="skp-sidebox">
            <h3>License</h3>
            <p>© 2026 SHOO KING II Project.<br>All rights reserved.</p>
          </div>
        </aside>
      </div>
      <div class="skp-foot">SHOO KING II PROJECT PAGE</div>`;

    document.body.appendChild(overlay);
    document.documentElement.style.overflow = 'hidden';
    document.getElementById('skpPlayButton')?.addEventListener('click', () => {
      overlay.remove();
      document.documentElement.style.overflow = '';
      history.replaceState(null, '', location.pathname + '?play=1');
    });
  }

  function findLoginStatusElement() {
    const home = document.getElementById('home') || document.body;
    const candidates = [...home.querySelectorAll('div,p,span,small')];
    return candidates.find(el => {
      const text = (el.textContent || '').trim();
      return text === '未ログイン' || text.startsWith('未ログイン');
    }) || null;
  }

  function isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function showInstallGuide() {
    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const message = isiOS
      ? 'Safariの共有ボタンを押し、「ホーム画面に追加」を選んでください。'
      : 'ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選んでください。';
    if (typeof window.showToast === 'function') window.showToast(message);
    else alert(message);
  }

  async function installWebApp() {
    if (isStandalone()) {
      if (typeof window.showToast === 'function') window.showToast('すでにウェブアプリとして追加されています。');
      else alert('すでにウェブアプリとして追加されています。');
      return;
    }
    if (!deferredInstallPrompt) {
      showInstallGuide();
      return;
    }
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; }
    finally {
      deferredInstallPrompt = null;
      updateInstallButton();
    }
  }

  function updateInstallButton() {
    const button = document.getElementById('webAppInstallButton');
    if (!button) return;
    if (isStandalone()) {
      button.textContent = '✓ ウェブアプリ追加済み';
      button.disabled = true;
      button.style.opacity = '.72';
    } else {
      button.textContent = '＋ ウェブアプリとして追加';
      button.disabled = false;
      button.style.opacity = '1';
    }
  }

  function addWebAppInstallButton() {
    if (document.getElementById('webAppInstallButton')) {
      updateInstallButton();
      return;
    }
    const loginStatus = findLoginStatusElement();
    if (!loginStatus || !loginStatus.parentNode) return;
    const button = document.createElement('button');
    button.id = 'webAppInstallButton';
    button.type = 'button';
    button.textContent = '＋ ウェブアプリとして追加';
    button.style.cssText = 'width:100%;margin:0 0 10px;padding:13px 16px;border:1px solid #38bdf8;border-radius:14px;background:linear-gradient(90deg,#0369a1,#2563eb);color:#fff;font-weight:900;box-shadow:0 0 18px rgba(56,189,248,.28);cursor:pointer;';
    button.addEventListener('click', installWebApp);
    const anchor = loginStatus.closest('.onlineCard,.loginCard,.accountCard,.card') || loginStatus;
    anchor.parentNode.insertBefore(button, anchor);
    updateInstallButton();
  }

  function addDetailsFooterLink() {
    if (location.pathname.endsWith('/details.html') || location.pathname.endsWith('details.html')) return;
    if (document.getElementById('shookingDetailsFooter')) return;
    const footer = document.createElement('div');
    footer.id = 'shookingDetailsFooter';
    footer.style.cssText = 'margin:28px auto 14px;padding:18px 12px;text-align:center;color:#94a3b8;font-size:12px;';
    footer.innerHTML = '<a href="./details.html" style="display:inline-block;padding:10px 14px;border:1px solid #334155;border-radius:10px;color:#cbd5e1;text-decoration:none;background:#07111f;font-weight:800;">ゲーム詳細・利用条件・著作権表示</a><div style="margin-top:10px">© 2026 SHOO KING II Project. All rights reserved.</div>';
    document.body.appendChild(footer);
  }

  function addEmbeddedDownloadToDetails() {
    if (!(location.pathname.endsWith('/details.html') || location.pathname.endsWith('details.html'))) return;
    if (document.getElementById('embeddedDownloadSection')) return;
    const main = document.querySelector('main.wrap') || document.querySelector('main');
    if (!main) return;
    const section = document.createElement('section');
    section.id = 'embeddedDownloadSection';
    section.innerHTML = '<h2>コード埋め込み式ダウンロード</h2><p>ゲーム本体と同一サイト内のJavaScript・CSSを、1つのHTMLファイルへまとめて保存できます。</p><p>これを実行すると、すぐにアクセスできるようになります。</p><p class="note">保存版では、ログインや外部通信など一部機能が制限される場合があります。</p><div class="actions"><a class="button gold" href="./download-builder.html">コード埋め込み式HTMLを作成</a></div>';
    const contact = document.getElementById('contact');
    if (contact) main.insertBefore(section, contact);
    else main.appendChild(section);
    const navWrap = document.querySelector('nav .wrap');
    if (navWrap && !navWrap.querySelector('a[href="#embeddedDownloadSection"]')) {
      const link = document.createElement('a');
      link.href = '#embeddedDownloadSection';
      link.textContent = 'ダウンロード';
      navWrap.appendChild(link);
    }
  }

  function installPatches() {
    addStartupPortal();
    moveFamilyMessageButtonIntoSettings();
    addWebAppInstallButton();
    addDetailsFooterLink();
    addEmbeddedDownloadToDetails();
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      addWebAppInstallButton();
      addDetailsFooterLink();
      addEmbeddedDownloadToDetails();
      if ((document.getElementById('webAppInstallButton') || tries > 30) && tries > 5) clearInterval(timer);
    }, 300);
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    addWebAppInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    updateInstallButton();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installPatches, { once: true });
  else installPatches();
})();