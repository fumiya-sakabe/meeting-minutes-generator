# Renderでのデプロイ手順

このアプリケーションをRenderでデプロイする手順です。Renderは完全無料プランがあります。

## デプロイ構成

- **バックエンド**: Render Web Service（Python）
- **フロントエンド**: Render Static Site（Vite）

## ステップ1: バックエンドのデプロイ（Render）

### 1. Renderアカウントの作成

1. https://render.com にアクセス
2. 「Get Started for Free」をクリック
3. GitHubアカウントでログイン

### 2. バックエンドサービスの作成

1. ダッシュボードで「New +」をクリック
2. 「Web Service」を選択
3. 「Connect account」でGitHubアカウントを連携（まだの場合）
4. `meeting-minutes-generator` リポジトリを選択
5. 「Connect」をクリック

### 3. バックエンドの設定

以下の設定を行います：

- **Name**: `meeting-minutes-backend`（任意の名前）
- **Region**: `Singapore`（日本に近い）または `Oregon`（US West）
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 4. 環境変数の設定

「Environment Variables」セクションで以下を追加：

```
OPENAI_API_KEY=your_openai_api_key_here
```

**注意**: `ALLOWED_ORIGINS` は後で設定します（フロントエンドのURLが確定してから）

### 5. プランの選択

- **Free** を選択（無料プラン）

### 6. デプロイ

- 「Create Web Service」をクリック
- デプロイが開始されます（数分かかります）
- デプロイが完了したら、URLをコピー
- URLは `https://meeting-minutes-backend.onrender.com` のような形式です
- このURLをメモしておいてください

## ステップ2: フロントエンドのデプロイ（Render）

### 1. フロントエンドサービスの作成

1. ダッシュボードで「New +」をクリック
2. 「Static Site」を選択
3. `meeting-minutes-generator` リポジトリを選択
4. 「Connect」をクリック

### 2. フロントエンドの設定

以下の設定を行います：

- **Name**: `meeting-minutes-frontend`（任意の名前）
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### 3. 環境変数の設定

「Environment Variables」セクションで以下を追加：

```
VITE_API_URL=https://your-backend-url.onrender.com
```

（`your-backend-url.onrender.com` をステップ1で取得したバックエンドのURLに置き換えてください）

### 4. プランの選択

- **Free** を選択（無料プラン）

### 5. デプロイ

- 「Create Static Site」をクリック
- デプロイが開始されます
- デプロイが完了したら、URLをコピー
- URLは `https://meeting-minutes-frontend.onrender.com` のような形式です

## ステップ3: バックエンドのCORS設定を更新

フロントエンドのURLが確定したら、バックエンドの環境変数を更新：

1. Renderのダッシュボード → バックエンドサービス → 「Environment」
2. 「Environment Variables」セクションで以下を追加：
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ```
   （`your-frontend-url.onrender.com` をステップ2で取得したフロントエンドのURLに置き換えてください）

3. 「Save Changes」をクリック
4. Renderが自動的に再デプロイします

## デプロイ後の確認

1. フロントエンドのURLにアクセス
2. テキスト入力欄にサンプルテキストを入力
3. 「議事録を生成」ボタンをクリック
4. 正常に動作することを確認

## 注意事項

### Renderの無料プランの制限

- **スリープ機能**: 15分間アクセスがないとスリープします
- **初回起動**: スリープからの復帰に30秒〜1分かかることがあります
- **月間制限**: 750時間/月の無料時間

### スリープ対策

- 定期的にアクセスする（15分以内）
- または、Uptime Robotなどの無料監視サービスを使用して定期的にpingを送る

## トラブルシューティング

### CORSエラーが発生する場合

- バックエンドの `ALLOWED_ORIGINS` 環境変数に、フロントエンドのURL（`https://` から始まる完全なURL）が正しく設定されているか確認
- 環境変数を変更した後、再デプロイが完了するまで数分かかる場合があります

### API接続エラーが発生する場合

- フロントエンドの `VITE_API_URL` 環境変数に、バックエンドのURL（`https://` から始まる完全なURL）が正しく設定されているか確認
- 環境変数を変更した後、再デプロイが必要です

### 502 Bad Gatewayエラー

- バックエンドがスリープしている可能性があります（15分非アクセス後）
- 30秒〜1分待ってから再度アクセスしてください
- ログ（「Logs」タブ）を確認してください

