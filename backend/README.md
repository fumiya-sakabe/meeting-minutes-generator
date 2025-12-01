# バックエンドセットアップ

## 環境変数の設定

`.env`ファイルをプロジェクトルートに作成し、以下の内容を追加してください：

```
OPENAI_API_KEY=your_openai_api_key_here
```

## インストール

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## サーバー起動

```bash
uvicorn main:app --reload --port 8000
```

APIドキュメントは `http://localhost:8000/docs` で確認できます。

