# SHOO KING II

宇宙を進むシューティングゲームのWebアプリ版です。

## Webアプリ化

- `manifest.webmanifest` を追加して、ホーム画面追加/スタンドアロン起動に対応
- `sw.js` を追加して、起動に必要なファイルをキャッシュ
- `icons/icon.svg` を追加して、アプリ用アイコンを設定
- `docs/` 配信でも動くように、GitHub Pages用のmanifest/service worker/iconも追加

## 開き方

ローカル確認:

```sh
python3 -m http.server 4173
```

そのあと `http://127.0.0.1:4173/` を開きます。
