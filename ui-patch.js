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
    try {
      await deferredInstallPrompt.userChoice;
    } finally {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installPatches, { once: true });
  } else {
    installPatches();
  }
})();