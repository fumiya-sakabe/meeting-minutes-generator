# デプロイ手順

このアプリケーションを本番環境にデプロイする手順です。デフォルトの自動生成URLを使用します（カスタムドメイン設定不要）。

## デプロイ構成

- **フロントエンド**: Vercel（自動生成URL: `https://xxx.vercel.app`）
- **バックエンド**: Railway（自動生成URL: `https://xxx.railway.app`）

## ステップ1: バックエンドのデプロイ（Railway）

### 1. Railwayアカウントの作成

1. https://railway.app にアクセス
2. GitHubアカウントでログイン
3. 「New Project」をクリック
4. 「Deploy from GitHub repo」を選択
5. `meeting-minutes-generator` リポジトリを選択
6. **重要**: 「Root Directory」を `backend` に設定

### 2. 環境変数の設定

Railwayのダッシュボードで、Settings → Variables から以下の環境変数を追加：

```
OPENAI_API_KEY=your_openai_api_key_here
```

**注意**: この時点では `ALLOWED_ORIGINS` は設定しません（フロントエンドのURLが確定してから設定します）

### 3. デプロイの確認

- Railwayが自動的にデプロイを開始します
- デプロイが完了したら、Settings → Domains で表示されるURLをコピー
- URLは `https://xxx.up.railway.app` のような形式です
- このURLをメモしておいてください（例: `https://meeting-minutes-backend.up.railway.app`）

## ステップ2: フロントエンドのデプロイ（Vercel）

### 1. Vercelアカウントの作成

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン
3. 「Add New Project」をクリック
4. `meeting-minutes-generator` リポジトリを選択
5. **重要**: 「Root Directory」を `frontend` に設定

### 2. 環境変数の設定

Vercelのダッシュボードで、Settings → Environment Variables から以下を追加：

```
VITE_API_URL=https://your-backend-url.railway.app
```

（`your-backend-url.railway.app` をステップ1でコピーしたRailwayのURLに置き換えてください）

### 3. ビルド設定

- **Framework Preset**: Vite（自動検出されるはず）
- **Build Command**: `npm run build`（自動設定）
- **Output Directory**: `dist`（自動設定）

### 4. デプロイ

- 「Deploy」をクリック
- デプロイが完了したら、表示されるURLをコピー
- URLは `https://xxx.vercel.app` のような形式です（例: `https://meeting-minutes-generator.vercel.app`）

## ステップ3: バックエンドのCORS設定を更新

フロントエンドのURLが確定したら、Railwayに戻って環境変数を追加：

1. Railwayのダッシュボード → Settings → Variables
2. 新しい環境変数を追加：
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```
   （`your-frontend-url.vercel.app` をステップ2で取得したVercelのURLに置き換えてください）

3. Railwayが自動的に再デプロイします

## デプロイ後の確認

1. フロントエンドのURL（Vercel）にアクセス
2. テキスト入力欄にサンプルテキストを入力
3. 「議事録を生成」ボタンをクリック
4. 正常に動作することを確認

## トラブルシューティング

### CORSエラーが発生する場合

- Railwayの `ALLOWED_ORIGINS` 環境変数に、フロントエンドのURL（`https://` から始まる完全なURL）が正しく設定されているか確認
- 環境変数を変更した後、Railwayが再デプロイするまで数分かかる場合があります

### API接続エラーが発生する場合

- Vercelの `VITE_API_URL` 環境変数に、バックエンドのURL（`https://` から始まる完全なURL）が正しく設定されているか確認
- 環境変数を変更した後、Vercelで再デプロイが必要な場合があります（Settings → Deployments → 最新のデプロイの「Redeploy」をクリック）

### 502 Bad Gatewayエラー

- Railwayのバックエンドが正常に起動しているか確認
- Railwayのログ（Deployments → 最新のデプロイ → View Logs）を確認

## デフォルトURLについて

- **Railway**: `https://xxx.up.railway.app` 形式のURLが自動生成されます
- **Vercel**: `https://xxx.vercel.app` 形式のURLが自動生成されます
- カスタムドメインの設定は不要です。これらのデフォルトURLでそのまま使用できます
