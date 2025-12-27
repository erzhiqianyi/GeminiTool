import React, {useState, useEffect, useRef} from 'react';
import {
    Play, Pause, Download, Volume2, Loader2, ListMusic,
    Trash2, Clock, FastForward, Sparkles, Languages, RotateCcw,
    Mic, Square, MessageSquare, CheckCircle2, AlertCircle, FileText,
    Terminal, XCircle, ChevronDown, ChevronUp, Gauge, FolderArchive,
    ChevronRight, Globe, History, TrendingUp, Award, Calendar, Settings2
} from 'lucide-react';

const API_KEY = "";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";
const LLM_MODEL = "gemini-2.5-flash-preview-09-2025";

// 多言語対応の定義
const translations = {
    Japanese: {
        appTitle: "日本語朗読トレーニング",
        appSubTitle: "AIによる発音矯正と履歴管理",
        voice: "音声モデル",
        uiLang: "表示言語",
        feedbackLang: "解説言語",
        speed: "再生速度",
        loadScript: "スクリプト読込",
        processScript: "解析してリスト生成",
        clearScript: "クリア",
        trainingList: "トレーニングリスト",
        exportAll: "全履歴エクスポート",
        noRecords: "履歴がありません。練習を始めましょう！",
        analyzing: "AIが分析中...",
        analysisResult: "分析結果",
        practiceRecords: "練習履歴",
        latestRecording: "最新の録音",
        pastAttempts: "過去の試行",
        line: "行",
        seconds: "秒",
        resetConfirm: "全ての音声をリセットしますか？",
        evaluating: "評価中...",
        ratingLabel: "評級",
        prevRating: "前回",
        sourceCode: "ソースコード"
    },
    Chinese: {
        appTitle: "日语朗读纠错训练",
        appSubTitle: "AI 发音分析与历史记录管理",
        voice: "语音角色",
        uiLang: "界面语言",
        feedbackLang: "讲解语言",
        speed: "播放语速",
        loadScript: "加载脚本",
        processScript: "解析并生成列表",
        clearScript: "清空",
        trainingList: "练习列表",
        exportAll: "导出全部记录",
        noRecords: "暂无记录。开始练习吧！",
        analyzing: "AI 正在分析...",
        analysisResult: "分析结果",
        practiceRecords: "练习记录",
        latestRecording: "最新录音",
        pastAttempts: "历史记录",
        line: "行",
        seconds: "秒",
        resetConfirm: "确定要重置所有音频吗？",
        evaluating: "评估中...",
        ratingLabel: "评级",
        prevRating: "上次",
        sourceCode: "源代码"
    },
    English: {
        appTitle: "Japanese Speaking Coach",
        appSubTitle: "AI Pronunciation Analysis & History",
        voice: "Voice",
        uiLang: "UI Language",
        feedbackLang: "Feedback Lang",
        speed: "Playback Speed",
        loadScript: "Load Script",
        processScript: "Process & Generate List",
        clearScript: "Clear",
        trainingList: "Training List",
        exportAll: "Export All History",
        noRecords: "No records yet. Start practicing!",
        analyzing: "AI analyzing...",
        analysisResult: "Analysis Result",
        practiceRecords: "Practice Records",
        latestRecording: "Latest Recording",
        pastAttempts: "Past Attempts",
        line: "Line",
        seconds: "sec",
        resetConfirm: "Reset all audio data?",
        evaluating: "Evaluating...",
        ratingLabel: "Rating",
        prevRating: "Prev",
        sourceCode: "Source Code"
    }
};

export default function App() {
    // デフォルト設定
    const [uiLang, setUiLang] = useState("Japanese");
    const [feedbackLang, setFeedbackLang] = useState("Japanese");
    const [voiceName, setVoiceName] = useState("Kore");
    const [speechRate, setSpeechRate] = useState(1.0);

    const [script, setScript] = useState(`1
00:00:00,000 --> 00:00:03,200
こんにちは、いつきです！

2
00:00:03,700 --> 00:00:06,500
今日のテーマは、ズバリこれ.

3
00:00:07,000 --> 00:00:09,200
「なぜ、中国人の僕が」

4
00:00:09,700 --> 00:00:12,300
「日本語を勉強しているのか」`);

    const [lines, setLines] = useState([]);
    const [isProcessingScript, setIsProcessingScript] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(null);
    const [error, setError] = useState(null);
    const [showScriptEditor, setShowScriptEditor] = useState(false);

    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const logEndRef = useRef(null);

    const [recordingId, setRecordingId] = useState(null);
    const [userRecordings, setUserRecordings] = useState({});
    const [isEvaluating, setIsEvaluating] = useState(null);

    const [practiceHistory, setPracticeHistory] = useState({});
    const [expandedRecords, setExpandedRecords] = useState({});

    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [isMarkedLoaded, setIsMarkedLoaded] = useState(false);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const stopSignal = useRef(false);
    const activeAudio = useRef(null);

    const t = (key) => translations[uiLang][key] || key;

    // 外部ライブラリの読み込み
    useEffect(() => {
        const jszipScript = document.createElement('script');
        jszipScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        jszipScript.async = true;
        document.body.appendChild(jszipScript);

        const markedScript = document.createElement('script');
        markedScript.src = "https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js";
        markedScript.async = true;
        markedScript.onload = () => setIsMarkedLoaded(true);
        document.body.appendChild(markedScript);

        return () => {
            if (document.body.contains(jszipScript)) document.body.removeChild(jszipScript);
            if (document.body.contains(markedScript)) document.body.removeChild(markedScript);
        };
    }, []);

    const renderMarkdown = (text) => {
        if (!text) return null;
        if (isMarkedLoaded && window.marked) {
            try {
                return {__html: window.marked.parse(text)};
            } catch (e) {
                return {__html: text};
            }
        }
        return {__html: String(text).replace(/\n/g, '<br />')};
    };

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, {timestamp, message, type}].slice(-50));
    };

    useEffect(() => {
        if (logEndRef.current) logEndRef.current.scrollIntoView({behavior: 'smooth'});
    }, [logs]);

    const srtTimeToSeconds = (timeStr) => {
        const [hms, ms] = timeStr.trim().replace(',', '.').split('.');
        const [h, m, s] = hms.split(':').map(Number);
        return h * 3600 + m * 60 + s + (Number(ms) || 0) / 1000;
    };

    const handleProcessScript = () => {
        addLog(t('processScript') + "...", 'info');
        setIsProcessingScript(true);
        setShowScriptEditor(false); // 読み込み後は閉じる
        try {
            const blocks = script.trim().split(/\n\s*\n/);
            const parsedLines = blocks.map(block => {
                const parts = block.trim().split('\n');
                if (parts.length < 3) return null;
                const timeMatch = parts[1].match(/(\d{2}:\d{2}:\d{2}.\d{3}) --> (\d{2}:\d{2}:\d{2}.\d{3})/) ||
                    parts[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                if (!timeMatch) return null;
                return {
                    id: parts[0],
                    start: srtTimeToSeconds(timeMatch[1]),
                    end: srtTimeToSeconds(timeMatch[2]),
                    duration: srtTimeToSeconds(timeMatch[2]) - srtTimeToSeconds(timeMatch[1]),
                    text: parts.slice(2).join(' '),
                    audioUrl: null,
                    status: 'idle',
                    rawAudioBlob: null
                };
            }).filter(b => b !== null);
            setLines(parsedLines);
            addLog(`${parsedLines.length} lines processed`, 'success');
        } catch (err) {
            addLog(`Error: ${err.message}`, 'error');
        } finally {
            setIsProcessingScript(false);
        }
    };

    const generateSingleLineAudio = async (index) => {
        const line = lines[index];
        setLines(prev => prev.map((l, i) => i === index ? {...l, status: 'loading'} : l));
        addLog(`Generating audio for #${line.id}...`, 'info');

        try {
            const payload = {
                contents: [{parts: [{text: line.text}]}],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: voiceName}}}
                }
            };
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${API_KEY}`, {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const inlineData = result.candidates[0].content.parts[0].inlineData;
            const wavBlob = pcmToWav(inlineData.data, parseInt(inlineData.mimeType.match(/rate=(\d+)/)?.[1] || "24000"));
            const audioUrl = URL.createObjectURL(wavBlob);

            setLines(prev => prev.map((l, i) => i === index ? {
                ...l,
                audioUrl,
                rawAudioBlob: wavBlob,
                status: 'done'
            } : l));
            const audio = new Audio(audioUrl);
            audio.playbackRate = speechRate;
            audio.play();
        } catch (err) {
            addLog(`Failed to generate: ${err.message}`, 'error');
            setLines(prev => prev.map((l, i) => i === index ? {...l, status: 'error'} : l));
        }
    };

    const pcmToWav = (base64Pcm, sampleRate) => {
        const binaryString = atob(base64Pcm);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        const writeString = (o, s) => {
            for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
        };
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + bytes.length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, bytes.length, true);
        return new Blob([header, bytes], {type: 'audio/wav'});
    };

    const startRecording = async (lineId) => {
        addLog(`Recording line #${lineId}...`, 'info');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, {type: 'audio/webm'});
                const url = URL.createObjectURL(audioBlob);
                setUserRecordings(prev => ({...prev, [lineId]: {url, blob: audioBlob}}));
                evaluatePronunciation(lineId, audioBlob);
            };
            mediaRecorder.current.start();
            setRecordingId(lineId);
        } catch (err) {
            addLog("Microphone access failed", 'error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
            mediaRecorder.current.stop();
            mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
            setRecordingId(null);
        }
    };

    const evaluatePronunciation = async (lineId, blob) => {
        setIsEvaluating(lineId);
        const line = lines.find(l => l.id === lineId);
        const history = practiceHistory[lineId] || [];
        const lastAttempt = history[0];

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64 = reader.result.split(',')[1];
            try {
                const prompt = `
          Target text: "${line.text}".
          Analyze this audio recording for Japanese pronunciation coaching.
          ${lastAttempt ? `Previous rating was "${lastAttempt.rating}". Compare with previous and point out improvements.` : ""}
          
          Requirements:
          1. Use a **Markdown Table** to compare original characters with actual pronunciation sounds.
          2. Provide a rating (S: Perfect, A: Excellent, B: Good, C: Keep Trying).
          3. Final response MUST include the tag "Rating: [S/A/B/C]".
          4. Output everything in ${feedbackLang}.
        `;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LLM_MODEL}:generateContent?key=${API_KEY}`, {
                    method: "POST", headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{text: prompt}, {inlineData: {mimeType: "audio/webm", data: base64}}]
                        }],
                        systemInstruction: {parts: [{text: `You are a professional Japanese speech coach providing feedback in ${feedbackLang}.`}]}
                    })
                });
                const result = await response.json();
                const feedbackText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Error analyzing.";

                const ratingMatch = feedbackText.match(/(?:Rating|评级|評級|評点|評点|评点)：?([SABC])/i);
                const rating = ratingMatch ? ratingMatch[1].toUpperCase() : "B";

                const newEntry = {
                    feedback: feedbackText,
                    rating,
                    timestamp: new Date().toISOString(),
                    audioUrl: URL.createObjectURL(blob),
                    blob: blob
                };

                setPracticeHistory(prev => ({
                    ...prev,
                    [lineId]: [newEntry, ...(prev[lineId] || [])]
                }));

                setExpandedRecords(prev => ({...prev, [`${lineId}-0`]: true}));
                addLog(`Analysis complete for #${lineId}. Rating: ${rating}`, 'success');
            } catch (e) {
                addLog("AI analysis failed", 'error');
            }
            setIsEvaluating(null);
        };
    };

    const handleDownloadAll = async () => {
        if (typeof JSZip === 'undefined' || lines.length === 0) return;
        setIsDownloadingAll(true);
        const zip = new JSZip();
        for (const line of lines) {
            const folder = zip.folder(`Line_${line.id}`);
            if (line.rawAudioBlob) folder.file("Reference_AI.wav", line.rawAudioBlob);
            const history = practiceHistory[line.id] || [];
            history.forEach((attempt, idx) => {
                const attemptFolder = folder.folder(`Attempt_${history.length - idx}`);
                attemptFolder.file("Recording.webm", attempt.blob);
                attemptFolder.file("Feedback.md", `Rating: ${attempt.rating}\n\n${attempt.feedback}`);
            });
        }
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Japanese_Practice_Archive.zip`;
        a.click();
        setIsDownloadingAll(false);
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 'S':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'A':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'B':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'C':
                return 'text-slate-500 bg-slate-50 border-slate-200';
            default:
                return 'text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-900 pb-32">
            <style>{`
        .markdown-feedback table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 0.875rem; }
        .markdown-feedback th, .markdown-feedback td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        .markdown-feedback th { background-color: #f8fafc; font-weight: 700; color: #475569; }
        .markdown-feedback tr:nth-child(even) { background-color: #fdfdfd; }
        .markdown-feedback strong { color: #4f46e5; }
        .practice-card { transition: all 0.2s ease-in-out; }
      `}</style>

            <div className="max-w-6xl mx-auto space-y-4">

                {/* Header Navigation Bar */}
                <header
                    className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 pr-4 border-r border-slate-100">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <TrendingUp size={20}/>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-md font-bold leading-tight">{t('appTitle')}</h1>
                            <p className="text-[10px] text-slate-500">{t('appSubTitle')}</p>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {/* Source Editor Toggle */}
                        <button
                            onClick={() => setShowScriptEditor(!showScriptEditor)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${showScriptEditor ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <FileText size={16}/>
                            {t('loadScript')}
                        </button>

                        {/* Voice Settings */}
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                            <Globe size={14} className="text-slate-400"/>
                            <select value={uiLang} onChange={(e) => setUiLang(e.target.value)}
                                    className="bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer">
                                <option value="Japanese">日本語</option>
                                <option value="Chinese">中文</option>
                                <option value="English">English</option>
                            </select>
                        </div>

                        <div
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                            <MessageSquare size={14} className="text-slate-400"/>
                            <select value={feedbackLang} onChange={(e) => setFeedbackLang(e.target.value)}
                                    className="bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer">
                                <option value="Japanese">解説: 日</option>
                                <option value="Chinese">解説: 中</option>
                                <option value="English">解説: 英</option>
                            </select>
                        </div>

                        <div
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                            <Volume2 size={14} className="text-slate-400"/>
                            <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}
                                    className="bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer">
                                <option value="Kore">Kore (男)</option>
                                <option value="Fenrir">Fenrir (男)</option>
                                <option value="Aoede">Aoede (女)</option>
                                <option value="Zephyr">Zephyr (女)</option>
                            </select>
                        </div>

                        <div
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                            <Gauge size={14} className="text-slate-400"/>
                            <input type="range" min="0.5" max="2.0" step="0.1" value={speechRate}
                                   onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                   className="w-16 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                            <span
                                className="text-[10px] font-mono font-bold text-indigo-600">{speechRate.toFixed(1)}x</span>
                        </div>
                    </div>

                    <button onClick={handleDownloadAll} disabled={isDownloadingAll}
                            className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-black transition-all shadow-md">
                        {isDownloadingAll ? <Loader2 size={18} className="animate-spin"/> : <FolderArchive size={18}/>}
                    </button>
                </header>

                {/* Script Editor (Collapsible) */}
                {showScriptEditor && (
                    <div
                        className="bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-4 bg-indigo-50/50 flex justify-between items-center border-b">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14}/> {t('sourceCode')}
              </span>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setScript("");
                                    setLines([]);
                                }}
                                        className="text-xs text-slate-400 hover:text-red-500 font-bold px-3 py-1">{t('clearScript')}</button>
                                <button onClick={() => setShowScriptEditor(false)}
                                        className="text-slate-400 hover:text-slate-800 p-1"><XCircle size={18}/>
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            className="w-full h-48 p-6 text-sm font-mono border-none focus:ring-0 bg-white resize-none leading-relaxed"
                            placeholder="Paste SRT content here..."
                        />
                        <div className="p-4 bg-white border-t flex justify-end">
                            <button
                                onClick={handleProcessScript}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                            >
                                {t('processScript')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Training Area */}
                <div className="space-y-4">
                    {lines.length > 0 ? (
                        <div className="grid gap-6">
                            {lines.map((line, lineIdx) => {
                                const history = practiceHistory[line.id] || [];
                                return (
                                    <div key={lineIdx}
                                         className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm practice-card">
                                        <div
                                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                          <span
                              className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded-md tracking-tighter">
                            {t('line')} #{line.id}
                          </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {line.duration.toFixed(1)} {t('seconds')}
                          </span>
                                                </div>
                                                <p className="text-xl font-bold text-slate-800 leading-tight tracking-tight">{line.text}</p>
                                            </div>

                                            <div
                                                className="flex items-center gap-3 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shrink-0">
                                                <button
                                                    onClick={() => line.audioUrl ? new Audio(line.audioUrl).play() : generateSingleLineAudio(lineIdx)}
                                                    className={`p-4 rounded-2xl transition-all shadow-md ${line.audioUrl ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                                                    title="Reference AI"
                                                >
                                                    {line.status === 'loading' ?
                                                        <Loader2 className="animate-spin" size={24}/> :
                                                        <Volume2 size={24}/>}
                                                </button>
                                                <div className="h-8 w-px bg-slate-200"></div>
                                                {recordingId === line.id ? (
                                                    <button onClick={stopRecording}
                                                            className="p-4 bg-red-500 text-white rounded-2xl animate-pulse shadow-lg shadow-red-100">
                                                        <Square size={24} fill="currentColor"/></button>
                                                ) : (
                                                    <button onClick={() => startRecording(line.id)}
                                                            className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
                                                            title="Record Your Voice"><Mic size={24}/></button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Practice Records Detail */}
                                        {(history.length > 0 || isEvaluating === line.id) && (
                                            <div className="px-6 pb-6 pt-2 bg-slate-50/30 space-y-4">
                                                <div
                                                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                    <History size={14}/> {t('practiceRecords')} ({history.length})
                                                </div>

                                                {isEvaluating === line.id && (
                                                    <div
                                                        className="bg-white border-2 border-dashed border-indigo-200 p-8 rounded-3xl flex flex-col items-center gap-3 animate-pulse">
                                                        <Loader2 className="animate-spin text-indigo-500" size={24}/>
                                                        <span
                                                            className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{t('analyzing')}</span>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {history.map((record, hIdx) => {
                                                        const isExpanded = expandedRecords[`${line.id}-${hIdx}`];
                                                        return (
                                                            <div key={hIdx}
                                                                 className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                                <div
                                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                                                    onClick={() => setExpandedRecords(p => ({
                                                                        ...p,
                                                                        [`${line.id}-${hIdx}`]: !p[`${line.id}-${hIdx}`]
                                                                    }))}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div
                                                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase shadow-sm ${getRatingColor(record.rating)}`}>
                                                                            <Award
                                                                                size={12}/> {t('ratingLabel')}: {record.rating}
                                                                        </div>
                                                                        <audio src={record.audioUrl} controls
                                                                               className="h-7 w-32 sm:w-48 opacity-80"
                                                                               onClick={(e) => e.stopPropagation()}/>
                                                                        <div
                                                                            className="hidden sm:flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                                                            <Calendar
                                                                                size={12}/> {new Date(record.timestamp).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-slate-300">
                                                                        {isExpanded ? <ChevronUp size={20}/> :
                                                                            <ChevronDown size={20}/>}
                                                                    </div>
                                                                </div>

                                                                {isExpanded && (
                                                                    <div
                                                                        className="p-6 bg-white border-t border-slate-50 overflow-x-auto">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <div
                                                                                className="h-[2px] flex-1 bg-indigo-50"></div>
                                                                            <span
                                                                                className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] px-3">{t('analysisResult')}</span>
                                                                            <div
                                                                                className="h-[2px] flex-1 bg-indigo-50"></div>
                                                                        </div>
                                                                        <div
                                                                            className="text-sm text-slate-700 leading-relaxed markdown-feedback prose prose-sm max-w-none"
                                                                            dangerouslySetInnerHTML={renderMarkdown(record.feedback)}/>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 p-12 text-center shadow-inner">
                            <div className="bg-slate-50 p-8 rounded-full mb-6">
                                <Languages size={80} className="opacity-10"/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 mb-2 uppercase tracking-widest">Master
                                Japanese</h3>
                            <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed mb-8">
                                {t('loadScript')} ボタンをクリックしてSRTスクリプトを読み込み、トレーニングを開始しましょう。
                            </p>
                            <button
                                onClick={() => setShowScriptEditor(true)}
                                className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Terminal (Minimized) */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 transition-all z-50 ${showLogs ? 'h-64' : 'h-10'}`}>
                <div
                    className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-[10px] font-black cursor-pointer uppercase tracking-[0.1em]"
                    onClick={() => setShowLogs(!showLogs)}>
                    <div className="flex items-center gap-2"><Terminal size={14} className="text-indigo-400"/> SYSTEM
                        LOG
                    </div>
                    <div className="flex gap-4">
                        <button onClick={(e) => {
                            e.stopPropagation();
                            setLogs([]);
                        }} className="hover:text-white transition-colors">Clear
                        </button>
                        {showLogs ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}
                    </div>
                </div>
                {showLogs && (
                    <div className="p-4 h-48 overflow-y-auto font-mono text-[10px] space-y-2">
                        {logs.map((log, i) => (
                            <div key={i}
                                 className={`flex gap-4 pb-1 border-b border-slate-800/50 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                <span className="opacity-30 shrink-0">{log.timestamp}</span>
                                <span className="break-all">{log.message}</span>
                            </div>
                        ))}
                        <div ref={logEndRef}/>
                    </div>
                )}
            </div>

            {error && (
                <div
                    className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs z-[100] animate-in fade-in zoom-in">
                    <AlertCircle size={18}/> {error}
                    <button onClick={() => setError(null)}><XCircle size={16}/></button>
                </div>
            )}
        </div>
    );
}