# fixjs

SHOO KING II の修復・互換・安全対策用 JavaScript をまとめるフォルダです。

現在の主な内容:
- `auth-session-fix.js` — ログイン/ログアウト状態の修復
- `firebase-error-patch.js` — Firebaseエラー表示の補助
- `google-login-fix.js` — Googleログイン安定化
- `key-event-guard.js` — 異常キーボードイベント対策
- `gacha-current-filter.js` — 現行ガチャ表示の整合
- `home-menu-restore.js` — ホームメニュー表示修復
- `runtime-light-fix.js` — 重いローディング表示の抑制

新しい修正専用ファイルは、できるだけルート直下ではなくこのフォルダへ追加します。
