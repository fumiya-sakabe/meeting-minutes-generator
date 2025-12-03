from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import openai
import aiofiles
import json
import base64
import tempfile

load_dotenv()

app = FastAPI(title="会議議事録生成API", version="1.0.0")

# CORS設定
# 環境変数から許可するオリジンを取得（デプロイ時用）
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI API設定
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class TextInput(BaseModel):
    text: str


class MeetingRequest(BaseModel):
    audio_transcript: Optional[str] = None
    image_analysis: Optional[str] = None
    text_input: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "会議議事録生成API"}


@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """音声ファイルを文字起こし"""
    try:
        # 一時ファイルに保存
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Whisper APIで文字起こし
        with open(temp_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="ja"
            )
        
        # 一時ファイル削除
        os.unlink(temp_path)
        
        return {"transcript": transcript.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """画像を解析してテキストを抽出"""
    try:
        # ファイル内容を読み込み
        content = await file.read()
        
        # 画像をbase64エンコード
        base64_image = base64.b64encode(content).decode('utf-8')
        
        # ファイル拡張子からMIMEタイプを判定
        mime_type = "image/jpeg"
        if file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext == '.png':
                mime_type = "image/png"
            elif ext == '.gif':
                mime_type = "image/gif"
            elif ext == '.webp':
                mime_type = "image/webp"
        
        # GPT-4Vで画像解析
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "この画像に含まれるテキスト、図表、グラフの内容を詳しく説明してください。会議資料の場合は、重要なポイントを箇条書きでまとめてください。"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        analysis = response.choices[0].message.content
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-minutes")
async def generate_minutes(request: MeetingRequest):
    """議事録を生成"""
    try:
        # 入力データを統合
        inputs = []
        if request.audio_transcript:
            inputs.append(f"【音声文字起こし】\n{request.audio_transcript}")
        if request.image_analysis:
            inputs.append(f"【画像解析結果】\n{request.image_analysis}")
        if request.text_input:
            inputs.append(f"【テキスト入力】\n{request.text_input}")
        
        if not inputs:
            raise HTTPException(status_code=400, detail="入力データがありません")
        
        combined_input = "\n\n".join(inputs)
        
        # GPT-4で議事録生成
        prompt = f"""以下の会議情報から、構造化された議事録を生成してください。

{combined_input}

以下の形式で議事録を作成してください：

## 会議概要
- 日時: [推定日時]
- 参加者: [音声やテキストから推定される参加者]
- 議題: [主要な議題]

## 議論内容
[主要な議論ポイントを箇条書きで]

## 決定事項
[決定した事項を明確に]

## アクションアイテム
[タスク、担当者、期限を含むアクションアイテムを表形式で]

## 次回予定
[次回会議の予定があれば]

## 要約
[会議の要点を3-5行で要約]
"""
        
        # GPT-4またはgpt-4-turbo-previewを使用
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "あなたは優秀な議事録作成アシスタントです。会議の内容を正確に整理し、構造化された議事録を作成します。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
        except Exception as e:
            # gpt-4-turbo-previewが使えない場合はgpt-3.5-turboを試す
            if "gpt-4" in str(e).lower() or "model" in str(e).lower():
                print(f"GPT-4使用不可、gpt-3.5-turboにフォールバック: {e}")
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "あなたは優秀な議事録作成アシスタントです。会議の内容を正確に整理し、構造化された議事録を作成します。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=2000
                )
            else:
                raise
        
        minutes = response.choices[0].message.content
        
        # アクションアイテムを抽出
        action_items = extract_action_items(minutes)
        
        # 要約を生成
        summary = generate_summary(combined_input)
        
        # 感情分析
        sentiment = analyze_sentiment(combined_input)
        
        return {
            "minutes": minutes,
            "action_items": action_items,
            "summary": summary,
            "sentiment": sentiment
        }
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n\n{traceback.format_exc()}"
        print(f"議事録生成エラー: {error_detail}")
        raise HTTPException(status_code=500, detail=f"議事録生成に失敗しました: {str(e)}")


def extract_action_items(minutes: str) -> List[dict]:
    """アクションアイテムを抽出"""
    try:
        prompt = f"""以下の議事録からアクションアイテムを抽出し、JSON形式で返してください。

{minutes}

以下のJSON形式で返してください（action_itemsというキーで配列を返す）：
{{
  "action_items": [
    {{
      "task": "タスク内容",
      "assignee": "担当者",
      "deadline": "期限",
      "priority": "high/medium/low"
    }}
  ]
}}
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "あなたはJSON形式でデータを返すアシスタントです。必ずaction_itemsというキーで配列を返してください。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            if "gpt-4" in str(e).lower() or "model" in str(e).lower():
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "あなたはJSON形式でデータを返すアシスタントです。必ずaction_itemsというキーで配列を返してください。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
            else:
                raise
        
        result = json.loads(response.choices[0].message.content)
        return result.get("action_items", [])
    except Exception as e:
        print(f"アクションアイテム抽出エラー: {e}")
        return []


def generate_summary(text: str) -> str:
    """要約を生成"""
    try:
        prompt = f"""以下の会議内容を3-5行で要約してください：

{text}
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "あなたは要約の専門家です。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
        except Exception as e:
            if "gpt-4" in str(e).lower() or "model" in str(e).lower():
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "あなたは要約の専門家です。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=200
                )
            else:
                raise
        return response.choices[0].message.content
    except:
        return "要約の生成に失敗しました"


def analyze_sentiment(text: str) -> dict:
    """感情分析"""
    try:
        prompt = f"""以下の会議内容の感情を分析してください。ポジティブ、ネガティブ、中立的の度合いを0-100のスコアで評価してください。
合計が100になるようにしてください。

{text}

以下のJSON形式で返してください：
{{
  "positive": 数値,
  "negative": 数値,
  "neutral": 数値
}}
"""
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "あなたは感情分析の専門家です。positive、negative、neutralの3つのキーを持つJSON形式で返してください。各値は0-100の整数で、合計が100になるようにしてください。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
            )
        except Exception as e:
            if "gpt-4" in str(e).lower() or "model" in str(e).lower():
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "あなたは感情分析の専門家です。positive、negative、neutralの3つのキーを持つJSON形式で返してください。各値は0-100の整数で、合計が100になるようにしてください。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
            else:
                raise
        
        result = json.loads(response.choices[0].message.content)
        # デフォルト値の確保
        return {
            "positive": result.get("positive", 50),
            "negative": result.get("negative", 50),
            "neutral": result.get("neutral", 50)
        }
    except Exception as e:
        print(f"感情分析エラー: {e}")
        return {"positive": 50, "negative": 50, "neutral": 50}




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

