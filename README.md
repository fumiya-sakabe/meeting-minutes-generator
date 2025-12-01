# マルチモーダル会議議事録生成ツール

生成AIを活用した会議議事録の自動生成アプリケーション。音声、画像、テキストから議事録、アクションアイテム、要約を自動生成します。

## 特徴

- 🎤 **音声文字起こし**: Whisper APIを使用した高精度な音声認識
- 🖼️ **画像解析**: GPT-4Vによる画像内のテキスト・図表の認識
- 📝 **自動議事録生成**: 複数の入力ソースから構造化された議事録を生成
- ✅ **アクションアイテム抽出**: 自動でタスクと担当者を抽出
- 📊 **要約生成**: 会議の要点を簡潔にまとめ
- 👥 **参加者認識**: 音声から参加者を識別
- 😊 **感情分析**: 会議の雰囲気を分析

## 技術スタック

### バックエンド
- Python 3.11+
- FastAPI
- OpenAI API (Whisper, GPT-4, GPT-4V)
- Python-dotenv

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios

## セットアップ

### バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

`.env`ファイルを作成:
```
OPENAI_API_KEY=your_api_key_here
```

サーバー起動:
```bash
uvicorn main:app --reload --port 8001
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

## 使用方法

1. 会議の音声ファイル、画像、またはテキストをアップロード
2. AIが自動で処理・解析
3. 議事録、アクションアイテム、要約が生成される
4. 結果を確認・編集・エクスポート

## API エンドポイント

- `POST /api/transcribe` - 音声ファイルの文字起こし
- `POST /api/analyze-image` - 画像の解析
- `POST /api/generate-minutes` - 議事録の生成

## ポートフォリオとしての特徴

このアプリケーションは以下の技術を実装しています：

1. **マルチモーダルAI統合**: 音声、画像、テキストの3つのモーダルを統合
2. **最新のAI技術**: Whisper、GPT-4、GPT-4Vを活用
3. **実用的なアプリケーション**: 実際のビジネスシーンで使える機能
4. **モダンな技術スタック**: FastAPI、React、TypeScriptを使用
5. **UX重視のデザイン**: Tailwind CSSによる美しいUI

## 今後の拡張案

- リアルタイム音声認識
- 複数言語対応
- 会議録画の自動アップロード
- カレンダー連携
- チーム共有機能

## ライセンス

MIT

