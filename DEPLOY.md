# デプロイ手順

このアプリケーションを本番環境にデプロイする手順です。

## デプロイ構成

- **フロントエンド**: Vercel
- **バックエンド**: Railway または Render

## バックエンドのデプロイ（Railway）

### 1. Railwayアカウントの作成

1. https://railway.app にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. 「Deploy from GitHub repo」を選択
5. `meeting-minutes-generator` リポジトリを選択
6. 「Root Directory」を `backend` に設定

### 2. 環境変数の設定

Railwayのダッシュボードで以下の環境変数を設定：

```
OPENAI_API_KEY=your_openai_api_key_here
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
PORT=8000
```

### 3. デプロイ

Railwayが自動的にデプロイを開始します。デプロイが完了したら、URLをコピーしてください（例: `https://your-app.railway.app`）

## フロントエンドのデプロイ（Vercel）

### 1. Vercelアカウントの作成

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン
3. 「Add New Project」をクリック
4. `meeting-minutes-generator` リポジトリを選択
5. 「Root Directory」を `frontend` に設定

### 2. 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定：

```
VITE_API_URL=https://your-backend-url.railway.app
```

### 3. ビルド設定

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. デプロイ

Vercelが自動的にデプロイを開始します。

## フロントエンドのコード修正

バックエンドのURLを環境変数から取得するように修正：

```typescript
// frontend/src/App.tsx または API呼び出し部分
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';
```

## デプロイ後の確認

1. フロントエンドのURLにアクセス
2. バックエンドAPIが正常に動作するか確認
3. CORSエラーが発生していないか確認

## トラブルシューティング

### CORSエラーが発生する場合

バックエンドの `ALLOWED_ORIGINS` 環境変数に、フロントエンドのURLを追加してください。

### API接続エラーが発生する場合

1. バックエンドのURLが正しく設定されているか確認
2. 環境変数 `VITE_API_URL` が正しく設定されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

