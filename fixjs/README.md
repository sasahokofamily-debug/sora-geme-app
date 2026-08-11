# fixjs

SHOO KING II の修復・互換・安全対策用 JavaScript をまとめるフォルダです。

現在の主な内容:
- `auth-session-fix.js` — ログイン/ログアウト状態の修復
- `firebase-error-patch.js` — Firebaseエラー表示の補助
- `firebase-login-fallback.js` — Firebaseログイン予備経路
- `firebase-login-rescue.js` — Firebaseログイン救済経路
- `google-login-fix.js` — Googleログイン安定化
- `key-event-guard.js` — 異常キーボードイベント対策
- `password-reset-fix.js` — パスワード再設定修復
- `hangar-fix.js` — 格納庫データ/表示修復
- `online-team-fix.js` — オンラインチーム同期補助
- `gacha-current-filter.js` — 現行ガチャ表示の整合
- `home-menu-restore.js` — ホームメニュー表示修復
- `loading-overlay-fix.js` — 読み込みオーバーレイのフェイルセーフ
- `runtime-light-fix.js` — 重いローディング表示の抑制
- `tutorial-controls-fix.js` — チュートリアル操作修復
- `tutorial-polish-fix.js` — チュートリアル表示修復

新しい修正専用ファイルは、ルート直下ではなくこのフォルダへ追加します。
