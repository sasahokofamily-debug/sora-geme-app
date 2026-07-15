(() => {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', moveFamilyMessageButtonIntoSettings, { once: true });
  } else {
    moveFamilyMessageButtonIntoSettings();
  }
})();
