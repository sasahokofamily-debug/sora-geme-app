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
    if (document.getElementById('shookingDetailsFooter')) return;

    const footer = document.createElement('footer');
    footer.id = 'shookingDetailsFooter';
    footer.style.cssText = 'width:min(760px,calc(100% - 24px));margin:28px auto 18px;padding:18px 14px;text-align:center;border-top:1px solid rgba(125,249,255,.28);color:#94a3b8;font-size:12px;line-height:1.8;position:relative;z-index:5;';

    const link = document.createElement('a');
    link.href = './details.html';
    link.textContent = 'ゲーム詳細・利用条件・著作権表示';
    link.style.cssText = 'display:inline-block;color:#7df9ff;text-decoration:none;font-weight:800;padding:8px 12px;border:1px solid rgba(125,249,255,.38);border-radius:999px;';

    const copyright = document.createElement('div');
    copyright.textContent = '© 2026 SHOO KING II Project. All rights reserved.';
    copyright.style.marginTop = '9px';

    footer.append(link, copyright);
    document.body.appendChild(footer);
  }

  function installPatches() {
    moveFamilyMessageButtonIntoSettings();
    addWebAppInstallButton();
    addDetailsFooterLink();
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      addWebAppInstallButton();
      addDetailsFooterLink();
      if ((document.getElementById('webAppInstallButton') && document.getElementById('shookingDetailsFooter')) || tries > 30) clearInterval(timer);
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