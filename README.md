# 🎯 AI会議議事録生成ツール

生成AIを活用したマルチモーダル会議議事録の自動生成アプリケーション。音声、画像、テキストの3つの入力モーダルから、構造化された議事録、アクションアイテム、要約を自動生成します。

## ✨ 主な機能

### 🎤 音声文字起こし
- **Whisper API**を使用した高精度な日本語音声認識
- リアルタイムでの文字起こし処理
- 複数の音声形式に対応（mp3, wav, m4a等）

### 🖼️ 画像解析
- **GPT-4V (Vision)**による画像内テキスト・図表の認識
- 会議資料のスライドやホワイトボードの内容を自動抽出
- グラフやチャートの数値データも解析可能

### 📝 自動議事録生成
- 複数の入力ソース（音声、画像、テキスト）を統合
- 構造化された議事録を自動生成
- 会議概要、議論内容、決定事項を整理

### ✅ アクションアイテム抽出
- タスク、担当者、期限を自動抽出
- 優先度（high/medium/low）の自動判定
- JSON形式で構造化されたデータ出力

### 📊 要約生成
- 会議の要点を3-5行で簡潔に要約
- 重要なポイントを自動抽出

### 😊 感情分析
- 会議の雰囲気をポジティブ/ネガティブ/中立的に分析
- 0-100のスコアで可視化

## 🏗️ 技術スタック

### バックエンド
- **Python 3.12+**
- **FastAPI** - モダンな非同期Webフレームワーク
- **OpenAI API**
  - Whisper (音声認識)
  - GPT-4 Turbo (議事録生成、要約、アクションアイテム抽出)
  - GPT-4V (画像解析)
- **Uvicorn** - ASGIサーバー
- **Python-dotenv** - 環境変数管理

### フロントエンド
- **React 18** - モダンなUIライブラリ
- **TypeScript** - 型安全性の確保
- **Vite** - 高速な開発環境とビルドツール
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク
- **Axios** - HTTPクライアント
- **Lucide React** - モダンなアイコンライブラリ

## 🎯 アーキテクチャ

```
┌─────────────────┐
│   Frontend      │
│  (React + TS)   │
│  Port: 5173     │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│  (FastAPI)      │
│  Port: 8001     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│Whisper│ │GPT-4  │
│  API  │ │  API  │
└───────┘ └───────┘
```

## 🚀 セットアップ

### 前提条件
- Python 3.12以上
- Node.js 18以上
- OpenAI APIキー

### バックエンドのセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/fumiya-sakabe/meeting-minutes-generator.git
cd meeting-minutes-generator

# バックエンドディレクトリに移動
cd backend

# 仮想環境の作成と有効化
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定
echo "OPENAI_API_KEY=your_api_key_here" > .env

# サーバーの起動
uvicorn main:app --reload --port 8001
```

### フロントエンドのセットアップ

```bash
# フロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## 📡 API エンドポイント

### `POST /api/transcribe`
音声ファイルを文字起こし

**リクエスト:**
- Content-Type: `multipart/form-data`
- Body: `file` (音声ファイル)

**レスポンス:**
```json
{
  "transcript": "文字起こしされたテキスト"
}
```

### `POST /api/analyze-image`
画像を解析してテキストを抽出

**リクエスト:**
- Content-Type: `multipart/form-data`
- Body: `file` (画像ファイル)

**レスポンス:**
```json
{
  "analysis": "画像解析結果"
}
```

### `POST /api/generate-minutes`
議事録を生成

**リクエスト:**
```json
{
  "audio_transcript": "音声文字起こしテキスト（オプション）",
  "image_analysis": "画像解析結果（オプション）",
  "text_input": "テキスト入力（オプション）"
}
```

**レスポンス:**
```json
{
  "minutes": "生成された議事録（Markdown形式）",
  "action_items": [
    {
      "task": "タスク内容",
      "assignee": "担当者",
      "deadline": "期限",
      "priority": "high/medium/low"
    }
  ],
  "summary": "要約テキスト",
  "sentiment": {
    "positive": 70,
    "negative": 10,
    "neutral": 20
  }
}
```

## 💡 実装のポイント

### 1. マルチモーダル統合
- 音声、画像、テキストの3つの異なる入力ソースを統合
- 各モーダルを独立したAPIエンドポイントで処理
- 統合されたデータから構造化された議事録を生成

### 2. エラーハンドリング
- GPT-4が使用できない場合、自動的にGPT-3.5-turboにフォールバック
- 詳細なエラーメッセージとトレースバックの記録
- ユーザーフレンドリーなエラー表示

### 3. 非同期処理
- FastAPIの非同期機能を活用
- ファイルアップロードの非同期処理
- 複数のAI API呼び出しを効率的に処理

### 4. 型安全性
- TypeScriptによるフロントエンドの型定義
- Pydanticによるバックエンドのデータバリデーション
- エラーを早期に発見可能

### 5. セキュリティ
- `.env`ファイルによるAPIキーの管理
- `.gitignore`による機密情報の保護
- CORS設定による適切なアクセス制御

## 🎨 UI/UXの特徴

- **モダンなデザイン**: Tailwind CSSによる美しいグラデーションとシャドウ
- **レスポンシブデザイン**: モバイル・タブレット・デスクトップに対応
- **直感的な操作**: ドラッグ&ドロップによるファイルアップロード
- **リアルタイムフィードバック**: ローディング状態の表示
- **結果の可視化**: 感情分析のプログレスバー表示

## 📈 今後の拡張案

- [ ] リアルタイム音声認識（ストリーミング対応）
- [ ] 複数言語対応（英語、中国語等）
- [ ] 会議録画の自動アップロード
- [ ] Googleカレンダー連携
- [ ] Slack/Teamsへの自動投稿
- [ ] ユーザー認証とデータベース連携
- [ ] 議事録の履歴管理
- [ ] チーム共有機能
- [ ] カスタムテンプレート機能

## 🔧 開発環境

- **開発サーバー**: Vite (HMR対応)
- **APIドキュメント**: FastAPI自動生成 (http://localhost:8001/docs)
- **コードフォーマット**: Prettier (推奨)
- **型チェック**: TypeScript strict mode

## 📝 ライセンス

MIT License

## 👤 作成者

**fumiya-sakabe**

- GitHub: [@fumiya-sakabe](https://github.com/fumiya-sakabe)
- ポートフォリオ: [GitHubリポジトリ](https://github.com/fumiya-sakabe/meeting-minutes-generator)

## 🙏 謝辞

このプロジェクトは以下の技術を使用しています：
- [OpenAI API](https://platform.openai.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**ポートフォリオプロジェクト**: 生成AI企業への転職活動用に開発された実用的なアプリケーションです。
