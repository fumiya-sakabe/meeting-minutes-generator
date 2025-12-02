import { useState } from 'react'
import { Mic, Image, FileText, Loader2, Download, Sparkles } from 'lucide-react'
import axios from 'axios'

// APIのベースURLを環境変数から取得（デプロイ時用）
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

interface ActionItem {
  task: string
  assignee: string
  deadline: string
  priority: string
}

interface MeetingResult {
  minutes: string
  action_items: ActionItem[]
  summary: string
  sentiment: {
    positive: number
    negative: number
    neutral: number
  }
}

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [transcript, setTranscript] = useState('')
  const [imageAnalysis, setImageAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MeetingResult | null>(null)

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAudioFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setTranscript(response.data.transcript)
    } catch (error) {
      console.error('音声文字起こしエラー:', error)
      alert('音声文字起こしに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE_URL}/api/analyze-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setImageAnalysis(response.data.analysis)
    } catch (error) {
      console.error('画像解析エラー:', error)
      alert('画像解析に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const generateMinutes = async () => {
    if (!transcript && !imageAnalysis && !textInput) {
      alert('少なくとも1つの入力が必要です')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-minutes`, {
        audio_transcript: transcript,
        image_analysis: imageAnalysis,
        text_input: textInput,
      })

      setResult(response.data)
    } catch (error: any) {
      console.error('議事録生成エラー:', error)
      const errorMessage = error?.response?.data?.detail || error?.message || '不明なエラーが発生しました'
      alert(`議事録生成に失敗しました\n\nエラー詳細: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadMinutes = () => {
    if (!result) return

    const content = `# 会議議事録\n\n${result.minutes}\n\n## 要約\n\n${result.summary}\n\n## アクションアイテム\n\n${result.action_items.map((item, i) => `${i + 1}. ${item.task} (担当: ${item.assignee}, 期限: ${item.deadline}, 優先度: ${item.priority})`).join('\n')}`
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meeting-minutes.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            AI会議議事録生成ツール
          </h1>
          <p className="text-gray-600">音声・画像・テキストから自動で議事録を生成</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 入力セクション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">入力データ</h2>

            {/* 音声アップロード */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mic className="w-4 h-4 inline mr-2" />
                音声ファイル
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {transcript && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  <strong>文字起こし:</strong> {transcript.substring(0, 100)}...
                </div>
              )}
            </div>

            {/* 画像アップロード */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Image className="w-4 h-4 inline mr-2" />
                画像ファイル
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {imageAnalysis && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                  <strong>解析結果:</strong> {imageAnalysis.substring(0, 100)}...
                </div>
              )}
            </div>

            {/* テキスト入力 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                テキスト入力
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="会議のメモやテキストを入力してください..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={6}
              />
            </div>

            <button
              onClick={generateMinutes}
              disabled={loading || (!transcript && !imageAnalysis && !textInput)}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  議事録を生成
                </>
              )}
            </button>
          </div>

          {/* 結果表示セクション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">生成結果</h2>
              {result && (
                <button
                  onClick={downloadMinutes}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  ダウンロード
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-6">
                {/* 要約 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">📋 要約</h3>
                  <div className="p-4 bg-blue-50 rounded-lg text-gray-700">
                    {result.summary}
                  </div>
                </div>

                {/* 感情分析 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">😊 感情分析</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ポジティブ</span>
                        <span>{result.sentiment.positive}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${result.sentiment.positive}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ネガティブ</span>
                        <span>{result.sentiment.negative}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${result.sentiment.negative}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>中立的</span>
                        <span>{result.sentiment.neutral}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-500 h-2 rounded-full"
                          style={{ width: `${result.sentiment.neutral}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* アクションアイテム */}
                {result.action_items.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">✅ アクションアイテム</h3>
                    <div className="space-y-2">
                      {result.action_items.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
                        >
                          <div className="font-medium">{item.task}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            担当: {item.assignee} | 期限: {item.deadline} | 優先度: {item.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 議事録全文 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">📝 議事録全文</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {result.minutes}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                入力データを追加して「議事録を生成」ボタンをクリックしてください
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

