import React, {useState, useEffect, useMemo} from 'react';
import {
    Volume2, Loader2, Plus, Trash2, BookOpen, Eye, FileArchive,
    Download, Terminal, Zap, RefreshCw, X, Keyboard, CheckCircle2,
    AlertTriangle, Settings2, Languages, Code2, Info, Library,
    FolderPlus, TerminalSquare, Link, Music
} from 'lucide-react';

const App = () => {
    const getDefaultDeckName = () => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const i18n = {
        zh: {
            title: "日语 Anki 深度解析 (V19 多行优化版)",
            placeholder: "输入单词按回车...",
            deckPlaceholder: "单词本名称...",
            settings: "高级配置",
            threshold: "自动下载阈值",
            retryCount: "语音重试次数",
            promptPreview: "AI 深度解析指令预览",
            exportZip: "导出同步包 (集成定制脚本)",
            statusReady: "系统就绪",
            dupWarn: "单词已在库中",
            parsing: "AI 正在结构化解析...",
            synthesizing: "合成单词读音...",
            done: "处理完成",
            empty: "等待录入数据",
            previewTitle: "卡片预览 (背面效果)",
            deckLabel: "当前单词本",
            error: "解析失败",
            forceRegen: "智能检查并补齐内容"
        }
    };

    const t = i18n['zh'];
    const [inputText, setInputText] = useState('');
    const [deckName, setDeckName] = useState(getDefaultDeckName());
    const [allDecks, setAllDecks] = useState({[getDefaultDeckName()]: []});
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewIdx, setPreviewIdx] = useState(null);
    const [latestLog, setLatestLog] = useState(t.statusReady);
    const [isExporting, setIsExporting] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [autoExportThreshold, setAutoExportThreshold] = useState(30);
    const [maxRetryCount, setMaxRetryCount] = useState(2);

    const apiKey = "";
    const TEXT_MODEL = "gemini-2.5-flash-preview-09-2025";
    const TTS_MODEL = "gemini-2.5-flash-preview-tts";

    const currentCards = useMemo(() => allDecks[deckName] || [], [allDecks, deckName]);

    const addLog = (msg) => {
        if (typeof msg === 'string') setLatestLog(msg);
    };

    useEffect(() => {
        if (!window.JSZip) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        }
    }, []);

    const pcmToWavBlob = (pcmBase64, sampleRate = 24000) => {
        try {
            const byteCharacters = atob(pcmBase64);
            const view = new DataView(new ArrayBuffer(byteCharacters.length));
            for (let i = 0; i < byteCharacters.length; i++) view.setUint8(i, byteCharacters.charCodeAt(i));
            const buffer = new ArrayBuffer(44 + view.byteLength);
            const outputView = new DataView(buffer);
            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) outputView.setUint8(offset + i, string.charCodeAt(i));
            };
            writeString(0, 'RIFF');
            outputView.setUint32(4, 36 + view.byteLength, true);
            writeString(8, 'WAVE');
            writeString(12, 'fmt ');
            outputView.setUint32(16, 16, true);
            outputView.setUint16(20, 1, true);
            outputView.setUint16(22, 1, true);
            outputView.setUint32(24, sampleRate, true);
            outputView.setUint32(28, sampleRate * 2, true);
            outputView.setUint16(32, 2, true);
            outputView.setUint16(34, 16, true);
            writeString(36, 'data');
            outputView.setUint32(40, view.byteLength, true);
            for (let i = 0; i < view.byteLength; i++) outputView.setUint8(44 + i, view.getUint8(i));
            return new Blob([buffer], {type: 'audio/wav'});
        } catch (e) {
            return null;
        }
    };

    const sanitizeJsonString = (raw) => {
        if (!raw) return "";
        let str = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const start = str.indexOf('{');
        const end = str.lastIndexOf('}');
        if (start === -1) return "";
        str = str.substring(start, end + 1);
// 强制过滤非法字符（NBSP \u00A0 等）
        str = str.replace(/[\u00A0\u1680\u180e\u2000-\u2009\u200a\u200b\u202f\u205f\u3000\ufeff]/g, " ");
        return str;
    };

    const generateAudio = async (text, maxRetries = 2) => {
        if (!text) return null;
        for (let i = 0; i <= maxRetries; i++) {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{parts: [{text: `以下の日本語を正しく発音してください：${text}`}]}],
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: "Kore"}}}
                        }
                    })
                });
                const data = await res.json();
                const base64 = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
                if (!base64) throw new Error("TTS Fail");
                return {base64, url: URL.createObjectURL(pcmToWavBlob(base64)), filename: `audio_${Date.now()}.wav`};
            } catch (e) {
                if (i === maxRetries) return null;
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    };

    const jsonSchema = {
        type: "OBJECT",
        properties: {
            word: {type: "STRING"}, reading: {type: "STRING"}, romaji: {type: "STRING"},
            etymology: {type: "STRING"}, jp_def: {type: "STRING"}, target_def: {type: "STRING"},
            conjugation: {type: "STRING"}, ex1_jp: {type: "STRING"}, ex1_cn: {type: "STRING"},
            ex2_jp: {type: "STRING"}, ex2_cn: {type: "STRING"}
        },
        required: ["word", "reading", "romaji", "etymology", "jp_def", "target_def", "conjugation", "ex1_jp", "ex1_cn", "ex2_jp", "ex2_cn"]
    };

    const dynamicPrompt = useMemo(() => {
        return `你是一位极其专业的日语老师。请深度解析输入的单词。必须使用 responseSchema 返回合法的 JSON 对象。要求：
1. 字符串内严禁物理换行（使用 \\n 代替）。
2. 严禁使用 NBSP 特殊空格。
3. 特别注意：如果 conjugation (活用类型) 有多个，请务必使用换行符分隔开，使其在显示时分行排列。
语言环境：中文。`;
    }, []);

    const processCard = async (index, targetDeckName, latestDeckData) => {
        const card = latestDeckData[index];
        if (!card) return;
        let updatedCard = {...card, error: null};

        try {
            const needsParsing = !updatedCard.reading || updatedCard.status === 'error';
            if (needsParsing) {
                addLog(t.parsing);
                setAllDecks(prev => ({
                    ...prev,
                    [targetDeckName]: prev[targetDeckName].map((c, i) => i === index ? {...c, status: 'loading'} : c)
                }));
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        contents: [{parts: [{text: `解析单词: ${card.word}`}]}],
                        systemInstruction: {parts: [{text: dynamicPrompt}]},
                        generationConfig: {
                            responseMimeType: "application/json",
                            responseSchema: jsonSchema,
                            temperature: 0.1
                        }
                    })
                });
                const data = await res.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                const parsed = JSON.parse(sanitizeJsonString(rawText || ""));
                updatedCard = {...updatedCard, ...parsed, status: 'parsed'};
                setAllDecks(prev => ({
                    ...prev,
                    [targetDeckName]: prev[targetDeckName].map((c, i) => i === index ? updatedCard : c)
                }));
            }

            setIsProcessing(false);
            setInputText('');

            const needsAudio = !updatedCard.audio;
            if (needsAudio) {
                addLog(t.synthesizing);
                const audio = await generateAudio(updatedCard.reading || updatedCard.word, maxRetryCount);
                updatedCard.audio = audio;
                updatedCard.status = 'done';
                setAllDecks(prev => {
                    const nextDeck = prev[targetDeckName].map((c, i) => i === index ? updatedCard : c);
                    if (nextDeck.filter(c => c.status === 'done').length % autoExportThreshold === 0) handleManualExport(targetDeckName, {
                        ...prev,
                        [targetDeckName]: nextDeck
                    });
                    return {...prev, [targetDeckName]: nextDeck};
                });
                addLog(`${t.done}: ${updatedCard.word}`);
            } else {
                updatedCard.status = 'done';
                setAllDecks(prev => ({
                    ...prev,
                    [targetDeckName]: prev[targetDeckName].map((c, i) => i === index ? updatedCard : c)
                }));
            }
        } catch (err) {
            addLog(`处理失败: ${err.message}`);
            setIsProcessing(false);
            setAllDecks(prev => ({
                ...prev,
                [targetDeckName]: prev[targetDeckName].map((c, i) => i === index ? {
                    ...c,
                    status: 'error',
                    error: err.message
                } : c)
            }));
        }
    };

    const handleAdd = () => {
        const word = inputText.trim();
        const currentName = deckName.trim() || getDefaultDeckName();
        if (!word || isProcessing) return;
        if ((allDecks[currentName] || []).some(c => c.word === word)) {
            addLog(t.dupWarn);
            return;
        }
        setIsProcessing(true);
        const newCard = {word, status: 'loading'};
        const updatedDeck = [...(allDecks[currentName] || []), newCard];
        setAllDecks(prev => ({...prev, [currentName]: updatedDeck}));
        setDeckName(currentName);
        setPreviewIdx(updatedDeck.length - 1);
        processCard(updatedDeck.length - 1, currentName, updatedDeck);
    };

    const handleForceRegen = (idx) => {
        const currentName = deckName.trim();
        const deckData = allDecks[currentName] || [];
        if (isProcessing) return;
        setIsProcessing(true);
        addLog(`智能刷新: ${deckData[idx].word}`);
        processCard(idx, currentName, deckData);
    };

    const handleManualExport = async (targetName, forcedData) => {
        const activeName = typeof targetName === 'string' ? targetName : deckName;
        const dataSource = forcedData || allDecks;
        const cardsToExport = dataSource[activeName] || [];
        if (!window.JSZip || cardsToExport.length === 0) return;
        setIsExporting(true);
        try {
            const zip = new window.JSZip();
            const mediaFolder = zip.folder("media");
            const doneCards = cardsToExport.filter(c => c.status === 'done');
            zip.file("data.json", JSON.stringify({
                deck_name: activeName,
                cards: doneCards.map(c => ({...c, audio_file: c.audio?.filename, audio_base64: undefined}))
            }, null, 2));
            doneCards.forEach(c => {
                if (c.audio?.base64) mediaFolder.file(c.audio.filename, pcmToWavBlob(c.audio.base64));
            });

// 使用您提供的定制 Python 同步脚本 (已同步 V19 逻辑)
            const syncScript = `
import json, os, base64, requests

ANKI_URL = 'http://127.0.0.1:8765'

def invoke(action, **params):
try:
payload = {'action': action, 'version': 6, 'params': params}
r = requests.post(ANKI_URL, json=payload, timeout=10)
response = r.json()
if response.get('error'):
print(f"[API 错误] Action: {action} | Error: {response['error']}")
return response
except Exception as e:
return {'result': None, 'error': str(e)}

def ensure_model_exists(model_name, fields, qfmt, afmt, css):
model_names_res = invoke('modelNames')
existing_models = model_names_res.get('result', [])

if model_name not in existing_models:
print(f"[状态] 正在自动创建新模型: {model_name}...")
create_res = invoke('createModel',
modelName=model_name,
inOrderFields=fields,
cardTemplates=[{
'Name': 'Main Template',
'Front': qfmt,
'Back': afmt
}],
css=css,
isCloze=False)
if create_res.get('error'):
print(f"[失败] 自动创建模型失败。")
return False
print(f"[成功] 模型 '{model_name}' 已创建。")
else:
print(f"[状态] 模型 '{model_name}' 已存在，同步最新模板...")
invoke('updateModelTemplates', model={
'name': model_name,
'templates': {'Main Template': {'Front': qfmt, 'Back': afmt}}
})
invoke('updateModelStyling', model={'name': model_name, 'css': css})
print(f"[成功] 模型模板与样式已更新。")
return True

def sync():
if not os.path.exists('data.json'):
print("[错误] 目录下缺失 data.json 数据文件。")
return
with open('data.json', 'r', encoding='utf-8') as f:
payload = json.load(f)
deck_name = payload.get('deck_name', 'Default')
cards = payload.get('cards', [])
model_name = 'JP_Deep_Parser_V19_Final'

print(f"--- 🚀 启动 Anki 同步: {deck_name} ---")

if invoke('version').get('error'):
print("[失败] 无法连接到 Anki。")
return

fields = ['Front','Reading','Romaji','Etymology','JpDef','TargetDef','Conjugation','Ex1Jp','Ex1Cn','Ex2Jp','Ex2Cn','AudioTag']
qfmt = '<div style="text-align:center; font-size: 60px; font-weight: bold; margin-top: 80px; font-family: serif; color: #1e293b;">{{Front}}</div>'
afmt = '{{FrontSide}}<hr id="answer"><div style="text-align:center;"><div style="color:#4f46e5;font-size:24px;font-weight:bold;">{{Reading}} {{AudioTag}}</div><div style="color:#94a3b8;font-size:14px;margin-bottom:15px;">[{{Romaji}}]</div><div style="font-size:34px;font-weight:900;margin:15px 0;color:#0f172a;">{{TargetDef}}</div><div style="display:inline-block;border:1px solid #e2e8f0;padding:2px 10px;border-radius:8px;color:#64748b;font-size:12px;font-weight:bold;white-space:pre-wrap;">{{Conjugation}}</div></div><div style="background:#f8fafc;padding:20px;border-radius:18px;margin:25px 0;font-size:15px;line-height:1.6;text-align:left;color:#334155;border:1px solid #f1f5f9;"><div style="margin-bottom:8px;"><b>词源:</b> {{Etymology}}</div><div style="border-top:1px dashed #e2e8f0;margin-top:8px;padding-top:8px;"><b>释义:</b> {{JpDef}}</div></div><div style="text-align:left;"><div style="margin-bottom:15px;"><div style="font-size:17px;color:#1e293b;margin-bottom:4px;">1. {{Ex1Jp}}</div><div style="font-size:14px;color:#94a3b8;">{{Ex1Cn}}</div></div><div><div style="font-size:17px;color:#1e293b;margin-bottom:4px;">2. {{Ex2Jp}}</div><div style="font-size:14px;color:#94a3b8;">{{Ex2Cn}}</div></div></div>'
# 增加 CSS 样式以支持换行
css = '.card { font-family: sans-serif; background: #fff; padding: 20px; color: #1e293b; }'

if not ensure_model_exists(model_name, fields, qfmt, afmt, css): return
invoke('createDeck', deck=deck_name)

print(f"[状态] 开始同步 (共 {len(cards)} 条)...")
success, skip = 0, 0
for c in cards:
audio_tag = ""
if c.get('audio_file'):
path = os.path.join('media', c['audio_file'])
if os.path.exists(path):
with open(path, 'rb') as f:
invoke('storeMediaFile', filename=c['audio_file'], data=base64.b64encode(f.read()).decode('utf-8'))
audio_tag = f"[sound:{c['audio_file']}]"
note = {
'deckName': deck_name, 'modelName': model_name,
'fields': {'Front': str(c.get('word','')), 'Reading': str(c.get('reading','')), 'Romaji': str(c.get('romaji','')), 'Etymology': str(c.get('etymology','')), 'JpDef': str(c.get('jp_def','')), 'TargetDef': str(c.get('target_def','')), 'Conjugation': str(c.get('conjugation','')), 'Ex1Jp': str(c.get('ex1_jp','')), 'Ex1Cn': str(c.get('ex1_cn','')), 'Ex2Jp': str(c.get('ex2_jp','')), 'Ex2Cn': str(c.get('ex2_cn','')), 'AudioTag': audio_tag},
'options': {'allowDuplicate': False}, 'tags': ['JP_AutoSync_V19']
}
res = invoke('addNote', note=note)
if res.get('result'): success += 1
else: skip += 1
print(f"✅ V19 同步完成！新增: {success}, 跳过: {skip}")

if __name__ == "__main__": sync()
`;
            zip.file("sync_to_anki.py", syncScript);
            zip.file("Mac_一键同步.command", `#!/bin/bash\ncd -- "$(dirname "$BASH_SOURCE")"\nchmod +x sync_to_anki.py\npython3 -m pip install requests --user --quiet\npython3 sync_to_anki.py\nread -p "流程结束，按回车退出..."`);
            const content = await zip.generateAsync({type: "blob"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${activeName}_Sync_V19.zip`;
            link.click();
            addLog("导出成功！集成定制脚本并支持多行 Category");
        } catch (e) {
            addLog("导出失败");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans text-slate-900 flex flex-col">
            <div
                className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 w-full overflow-hidden pb-12 text-left">

                <div className="lg:col-span-7 flex flex-col space-y-4 h-full">
                    <header
                        className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={22}/></div>
                            <h1 className="text-xl font-black tracking-tight">{t.title}</h1></div>
                        <div className="flex gap-2">
                            <button onClick={() => handleManualExport()}
                                    disabled={currentCards.length === 0 || isExporting}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">{isExporting ?
                                <Loader2 size={14} className="animate-spin"/> :
                                <Link size={14}/>} {t.exportZip}</button>
                            <button onClick={() => setShowSettings(!showSettings)}
                                    className={`p-2.5 rounded-full transition-all ${showSettings ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Settings2 size={18}/></button>
                        </div>
                    </header>

                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-2xl text-slate-400">
                            <Library size={16}/><span
                            className="text-[10px] font-black uppercase tracking-widest">{t.deckLabel}</span></div>
                        <input type="text" value={deckName} onChange={e => setDeckName(e.target.value)}
                               className="flex-1 bg-transparent border-none py-1 text-sm font-black outline-none focus:ring-0"
                               placeholder={t.deckPlaceholder}/>
                        <div
                            className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">{currentCards.length} Cards
                        </div>
                    </div>

                    {showSettings && (
                        <div
                            className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2"><label
                                    className="text-[10px] font-black text-slate-400 uppercase">{t.threshold}</label><input
                                    type="range" min="5" max="100" step="5" value={autoExportThreshold}
                                    onChange={e => setAutoExportThreshold(Number(e.target.value))}
                                    className="w-full accent-indigo-600"/>
                                    <div className="text-xs font-bold text-indigo-600">{autoExportThreshold}</div>
                                </div>
                                <div className="space-y-2"><label
                                    className="text-[10px] font-black text-slate-400 uppercase">{t.retryCount}</label><input
                                    type="number" value={maxRetryCount}
                                    onChange={e => setMaxRetryCount(Number(e.target.value))}
                                    className="w-full bg-slate-50 px-3 py-1.5 rounded-lg text-sm font-bold border-none ring-1 ring-slate-100"/>
                                </div>
                            </div>
                            <div className="pt-4 border-t space-y-3">
                                <label
                                    className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Code2
                                    size={12}/> {t.promptPreview}</label>
                                <div
                                    className="bg-slate-900 rounded-2xl p-4 text-[10px] font-mono text-emerald-400/80 max-h-40 overflow-y-auto whitespace-pre-wrap shadow-inner">{dynamicPrompt}</div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-3 shadow-inner">
                        <div className="relative flex-1 flex items-center">
                            {isProcessing ?
                                <Loader2 className="absolute left-4 animate-spin text-indigo-500" size={20}/> :
                                <Keyboard className="absolute left-4 text-slate-300" size={20}/>}
                            <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                   placeholder={isProcessing ? t.parsing : t.placeholder}
                                   className="w-full bg-transparent pl-12 pr-4 py-2 outline-none font-medium text-lg placeholder:text-slate-300"
                                   disabled={isProcessing} autoFocus/>
                        </div>
                        <button onClick={handleAdd} disabled={isProcessing || !inputText.trim()}
                                className="bg-slate-900 text-white px-8 rounded-2xl hover:bg-indigo-600 font-bold transition-all disabled:opacity-20 flex items-center shadow-lg shadow-slate-200">{isProcessing ?
                            <Loader2 size={20} className="animate-spin"/> : <Plus size={20}/>}</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                        {currentCards.map((c, i) => (
                            <div key={i} onClick={() => setPreviewIdx(i)}
                                 className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${previewIdx === i ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'}`}>
                                <div className="flex items-center gap-5">
                                    <div className="text-xs font-black text-slate-300 w-6 text-center">#{i + 1}</div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="text-xl font-black text-slate-800 tracking-tight">{c.word}</span>
                                            {c.status !== 'done' && c.status !== 'error' &&
                                                <Loader2 size={12} className="animate-spin text-indigo-400"/>}
                                            {c.status === 'done' &&
                                                <CheckCircle2 size={16} className="text-emerald-500"/>}
                                            {c.status === 'error' &&
                                                <AlertTriangle size={16} className="text-red-400"/>}
                                            {c.audio && <Music size={12} className="text-indigo-400 animate-bounce"/>}
                                        </div>
                                        <div
                                            className="text-[11px] text-slate-400 font-bold mt-1 uppercase truncate max-w-[200px]">{c.reading ? `${c.reading} · ${c.target_def || '...'}` : (c.status === 'error' ? t.error : 'AI Processing...')}</div>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90">
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        handleForceRegen(i);
                                    }} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                                            title={t.forceRegen}><RefreshCw size={18}/></button>
                                    <button onClick={(e) => {
                                        e.stopPropagation();
                                        setAllDecks(prev => ({
                                            ...prev,
                                            [deckName]: (prev[deckName] || []).filter((_, idx) => idx !== i)
                                        }));
                                    }}
                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 size={18}/></button>
                                </div>
                            </div>
                        )).reverse()}
                    </div>
                </div>

                <div className="lg:col-span-5 h-full">
                    <div
                        className="bg-white border border-slate-200 rounded-[3.5rem] h-full shadow-2xl overflow-hidden flex flex-col text-left">
                        <div className="bg-slate-800 p-5 flex justify-between items-center shrink-0">
                            <span
                                className="text-slate-500 text-[10px] font-black tracking-[0.3em] uppercase ml-4">{t.previewTitle}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {previewIdx !== null && currentCards[previewIdx] ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div
                                        className="p-14 text-center border-b border-dashed border-slate-100 flex flex-col justify-center bg-[#f8fafc]/50">
                                        <h2 className="text-7xl font-serif font-black text-slate-900 mb-10 tracking-tighter">{currentCards[previewIdx].word}</h2>
                                        <div className="flex justify-center h-[120px] items-center">
                                            {currentCards[previewIdx].audio?.url ? (
                                                <button
                                                    onClick={() => new Audio(currentCards[previewIdx].audio.url).play()}
                                                    className="p-10 bg-indigo-600 text-white rounded-[2.8rem] hover:scale-110 active:scale-90 transition-all shadow-2xl shadow-indigo-200">
                                                    <Volume2 size={44}/></button>
                                            ) : (
                                                <div
                                                    className="p-10 bg-slate-100 text-slate-300 rounded-[2.8rem] animate-pulse flex items-center justify-center">
                                                    {currentCards[previewIdx].status === 'error' ?
                                                        <Volume2 size={44} className="opacity-10"/> :
                                                        <Loader2 size={44} className="animate-spin"/>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-10 space-y-10 bg-white">
                                        {currentCards[previewIdx].reading ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-8">
                                                    <div>
                                                        <p className="text-indigo-600 font-black text-[10px] uppercase mb-1 opacity-50">Reading</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-2xl font-black text-slate-800">{currentCards[previewIdx].reading}</p>
                                                            {currentCards[previewIdx].audio?.url && (
                                                                <button
                                                                    onClick={() => new Audio(currentCards[previewIdx].audio.url).play()}
                                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                                                    <Volume2 size={16}/></button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-mono mt-1">[{currentCards[previewIdx].romaji}]</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-indigo-600 font-black text-[10px] uppercase mb-1 opacity-50">Category</p>
                                                        {/* 优化：多行显示 */}
                                                        <p className="text-sm font-bold text-slate-400 italic leading-snug white-space-pre-line bg-slate-50 p-2 rounded-xl border border-slate-100 inline-block text-right">
                                                            {currentCards[previewIdx].conjugation}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-4xl font-black text-slate-900 tracking-tight mb-6">{currentCards[previewIdx].target_def}</p>
                                                    <div
                                                        className="bg-indigo-50/40 p-6 rounded-[2rem] border border-indigo-100/50 text-[14px] leading-relaxed text-slate-600 shadow-inner">
                                                        <span
                                                            className="font-bold text-indigo-700">词源解析：</span>{currentCards[previewIdx].etymology}
                                                        <div
                                                            className="mt-4 pt-4 border-t border-indigo-100/50 italic opacity-80">
                                                            <b className="text-indigo-900 block mb-1 font-black not-italic">日文释义:</b> {currentCards[previewIdx].jp_def}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-8">
                                                    <p className="text-indigo-600 font-black text-[10px] uppercase mb-3 opacity-50 border-b border-slate-50 pb-2">Examples</p>
                                                    <div className="space-y-8">
                                                        <div className="relative pl-6 border-l-4 border-indigo-100"><p
                                                            className="text-xl font-serif italic text-slate-800 font-bold">“{currentCards[previewIdx].ex1_jp}”</p>
                                                            <p className="text-sm text-slate-400 mt-2">{currentCards[previewIdx].ex1_cn}</p>
                                                        </div>
                                                        <div className="relative pl-6 border-l-4 border-indigo-100"><p
                                                            className="text-xl font-serif italic text-slate-800 font-bold">“{currentCards[previewIdx].ex2_jp}”</p>
                                                            <p className="text-sm text-slate-400 mt-2">{currentCards[previewIdx].ex2_cn}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20">
                                                {currentCards[previewIdx]?.status === 'error' ? (
                                                    <div className="text-center"><AlertTriangle size={48}
                                                                                                className="mx-auto mb-4 text-red-400"/>
                                                        <p className="text-sm font-bold text-red-500">解析损坏</p>
                                                    </div>) : (<> <Loader2 size={56}
                                                                           className="animate-spin mb-6 text-indigo-300"/>
                                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">AI
                                                        Intelligent Thinking...</p> </>)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="h-full flex flex-col items-center justify-center text-slate-200 p-20 text-center opacity-30">
                                    <FolderPlus size={100} className="mb-8 opacity-20"/><p
                                    className="text-sm font-black uppercase text-slate-400">Select word</p></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <footer
                className="fixed bottom-0 left-0 right-0 bg-[#0f172a] text-indigo-300 px-6 py-2.5 text-[11px] font-mono flex items-center justify-between border-t border-slate-800 z-50">
                <div className="flex items-center gap-4 truncate">
                    <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-4"><Terminal size={14}
                                                                                                               className="text-indigo-500"/><span
                        className="font-black uppercase tracking-widest">Anki_Engine_V19</span></div>
                    <span className="truncate opacity-80 font-bold uppercase">{latestLog}</span></div>
            </footer>
        </div>
    );
};

export default App;