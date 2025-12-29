import React, {useState, useRef, useEffect} from 'react';

const apiKey = ""; // 运行时由环境提供

// --- 内联 SVG 图标 ---
const IconPlay = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
</svg>;
const IconSquare = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
</svg>;
const IconMic = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
</svg>;
const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2 h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
</svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                               className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
</svg>;
const IconSpeaker = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <circle cx="12" cy="14" r="4"></circle>
    <line x1="12" y1="6" x2="12.01" y2="6"></line>
</svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
</svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>;
const IconMessage = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
</svg>;
const IconAudio = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
</svg>;
const IconBox = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path
        d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    <path d="m3.3 7 8.7 5 8.7-5"></path>
    <path d="M12 22V12"></path>
</svg>;
const IconLayers = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
</svg>;

const VOICE_OPTIONS = [
    {id: 'Puck', name: 'Puck (专业/通用)'},
    {id: 'Charon', name: 'Charon (深沉/叙事)'},
    {id: 'Kore', name: 'Kore (清脆/明快)'},
    {id: 'Fenrir', name: 'Fenrir (浑厚/有力)'},
    {id: 'Aoede', name: 'Aoede (柔和/女性)'}
];

// --- 工具函数 ---
const formatSrtTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
};

const pcmToWav = (pcmData, sampleRate = 24000) => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 32 + pcmData.length, true);
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
    view.setUint32(40, pcmData.length, true);
    const pcmView = new Uint8Array(pcmData);
    for (let i = 0; i < pcmData.length; i++) view.setUint8(44 + i, pcmView[i]);
    return new Blob([buffer], {type: 'audio/wav'});
};

const audioBufferToWavBlob = (buffer) => {
    const numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        bufferArr = new ArrayBuffer(length),
        view = new DataView(bufferArr),
        channels = [],
        sampleRate = buffer.sampleRate;
    let pos = 0;
    const setUint16 = (data) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };
    const setUint32 = (data) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);
    for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
    let offset = 0;
    while (pos < length) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
        offset++;
    }
    return new Blob([bufferArr], {type: "audio/wav"});
};

const sliceAudioBuffer = async (blob, startTime, endTime) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const fullBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const startSec = Math.max(0, parseFloat(startTime) || 0);
    const endSec = Math.min(fullBuffer.duration, parseFloat(endTime) || fullBuffer.duration);
    const startOffset = Math.floor(startSec * fullBuffer.sampleRate);
    const endOffset = Math.floor(endSec * fullBuffer.sampleRate);
    const frameCount = endOffset - startOffset;
    if (frameCount <= 0) return null;
    const segmentBuffer = audioCtx.createBuffer(fullBuffer.numberOfChannels, frameCount, fullBuffer.sampleRate);
    for (let i = 0; i < fullBuffer.numberOfChannels; i++) {
        segmentBuffer.getChannelData(i).set(fullBuffer.getChannelData(i).subarray(startOffset, endOffset));
    }
    return segmentBuffer;
};

// 拼接音频片段，并支持在片段之间插入指定时长的静音
const concatAudioBuffersWithSilence = async (blobsOrUrls, silenceDuration = 0) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffers = [];
    for (const item of blobsOrUrls) {
        try {
            const arrayBuf = typeof item === 'string'
                ? await (await fetch(item)).arrayBuffer()
                : await item.arrayBuffer();
            const decoded = await audioCtx.decodeAudioData(arrayBuf);
            buffers.push(decoded);
        } catch (e) {
            console.warn("Skip audio segment:", e);
        }
    }
    if (buffers.length === 0) return null;

    const sampleRate = buffers[0].sampleRate;
    const numOfChannels = buffers[0].numberOfChannels;
    const silenceLength = Math.floor(silenceDuration * sampleRate);

    // 总长度 = 句子长度之和 + (静音间隔 * (数量 - 1))
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0) + (silenceLength * (buffers.length - 1));
    const result = audioCtx.createBuffer(numOfChannels, totalLength, sampleRate);

    let offset = 0;
    for (let j = 0; j < buffers.length; j++) {
        const b = buffers[j];
        for (let i = 0; i < numOfChannels; i++) {
            result.getChannelData(i).set(b.getChannelData(i), offset);
        }
        offset += b.length;
        if (j < buffers.length - 1) {
            offset += silenceLength; // 插入静音
        }
    }
    return result;
};

const splitTextIntoChunks = (text, maxLength = 300) => {
    const sentences = text.match(/[^。！？.!?]+[。！？.!?]?/g) || [text];
    const chunks = [];
    let currentChunk = "";
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength) {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
};

async function geminiFetch(endpoint, payload, isJson = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            ...payload,
            ...(isJson ? {generationConfig: {...payload.generationConfig, responseMimeType: "application/json"}} : {})
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API 请求失败");
    return data;
}

export default function App() {
    const [fullScript, setFullScript] = useState("皆さん、こんにちは！本日はYouTubeでの発信を加速させるAIツールについてお話しします。\n\nまず第一に、スクリプト作成におけるAIの活用法について解説します。これを使うことで、企画の質が剧的に上がります。\n\n最後に、実際の音声編集を自動化するテクニックをご紹介します。これで動画制作の効率を最大化しましょう！");
    const [chapters, setChapters] = useState([]);
    const [activeIdx, setActiveIdx] = useState(null);
    const [isSplitting, setIsSplitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isExportingAudio, setIsExportingAudio] = useState(false);
    const [splitFeedback, setSplitFeedback] = useState("");

    const [voiceSettings, setVoiceSettings] = useState({voiceId: 'Puck', speed: 1.0});
    const [sentenceTTSMap, setSentenceTTSMap] = useState({});
    const [userSliceMap, setUserSliceMap] = useState({});
    const [loadingMap, setLoadingMap] = useState({});

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const clearCache = () => {
        setSentenceTTSMap({});
        setUserSliceMap({});
        setLoadingMap({});
        setActiveIdx(null);
    };

    const handleSplit = async (feedback = "") => {
        if (isSplitting) return;
        setIsSplitting(true);
        setErrorMessage("");
        try {
            const prompt = `あなたはプロのYouTubeディレクターです。日本語スクリプトを論理構成に基づき「分類」してください。
      ${feedback ? `【ユーザーフィードバック】: ${feedback}。このフィードバックを最優先してください。` : ""}
      【重要ルール】元の文章を一文字も変えず、sentences配列に各文を正確に抽出してください。
      JSON形式: {"chapters": [{"title": "章タイトル", "content": "全文", "sentences": ["文1", "文2", "..."]}]}`;

            const data = await geminiFetch("gemini-2.5-flash-preview-09-2025", {
                contents: [{role: "user", parts: [{text: prompt}, {text: fullScript}]}],
            }, true);

            const json = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text);

            // 核心修复点：计算全局编号
            let globalCounter = 1;
            const processedChapters = json.chapters.map(c => {
                const sentencesWithGlobalIdx = c.sentences.map(s => ({
                    text: s,
                    globalIdx: globalCounter++
                }));
                return {...c, sentenceItems: sentencesWithGlobalIdx, ttsUrl: null, takes: [], bestTakeId: null};
            });

            setChapters(processedChapters);
            setActiveIdx(0);
            setSplitFeedback("");
        } catch (e) {
            setErrorMessage("分析失败: " + e.message);
        } finally {
            setIsSplitting(false);
        }
    };

    const handleTTS = async (text, key) => {
        setLoadingMap(prev => ({...prev, [key]: true}));
        try {
            const textChunks = splitTextIntoChunks(text, 300);
            const pcmBlobs = [];
            for (const chunk of textChunks) {
                const result = await geminiFetch("gemini-2.5-flash-preview-tts", {
                    contents: [{parts: [{text: `Professional narrator, clear pronunciation: ${chunk}`}]}],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: voiceSettings.voiceId}}}
                    }
                });
                const b64 = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData).inlineData.data;
                const bin = new Uint8Array(atob(b64).split('').map(c => c.charCodeAt(0)));
                pcmBlobs.push(pcmToWav(bin, 24000));
            }

            // 修复点：在生成全章参考音的分片之间增加 0.5s 停顿
            const mergedBuffer = await concatAudioBuffersWithSilence(pcmBlobs, 0.5);
            if (!mergedBuffer) throw new Error("Audio merge failed");
            const url = URL.createObjectURL(audioBufferToWavBlob(mergedBuffer));

            if (key === 'chapter') {
                const updated = [...chapters];
                updated[activeIdx].ttsUrl = url;
                setChapters(updated);
            } else {
                setSentenceTTSMap(prev => ({...prev, [key]: url}));
            }
        } catch (e) {
            setErrorMessage("语音生成失败: " + e.message);
        } finally {
            setLoadingMap(prev => ({...prev, [key]: false}));
        }
    };

    const performChapterAnalysis = async (cIdx, takeId, blob) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const b64 = reader.result.split(',')[1];
                const sentencesOnly = chapters[cIdx].sentenceItems.map(item => item.text);

                const data = await geminiFetch("gemini-2.5-flash-preview-09-2025", {
                    contents: [{
                        parts: [
                            {text: `この録音を分析し、一文ずつ評価してください。JSON形式: {"sentence_analysis": [{"index": 0, "score": 80, "transcription": "内容", "start_time": 0.0, "end_time": 2.5, "feedback": "アドバイス"}]}. 原文リスト: ${JSON.stringify(sentencesOnly)}`},
                            {inlineData: {mimeType: "audio/wav", data: b64}}
                        ]
                    }],
                }, true);

                const res = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
                for (const item of res.sentence_analysis || []) {
                    try {
                        const buffer = await sliceAudioBuffer(blob, item.start_time, item.end_time);
                        if (buffer) {
                            const sliceUrl = URL.createObjectURL(audioBufferToWavBlob(buffer));
                            setUserSliceMap(prev => ({...prev, [`${takeId}-${item.index}`]: sliceUrl}));
                        }
                    } catch (err) {
                        console.error("音频切片失败:", err);
                    }
                }
                setChapters(prev => {
                    const final = [...prev];
                    const takeIdx = final[cIdx].takes.findIndex(t => t.id === takeId);
                    if (takeIdx !== -1) {
                        final[cIdx].takes[takeIdx].analysis = res;
                        final[cIdx].takes[takeIdx].isAnalyzing = false;
                    }
                    return final;
                });
            };
        } catch (e) {
            console.error("分析失败:", e);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = e => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, {type: 'audio/wav'});
                const takeId = Date.now();
                setChapters(prev => {
                    const final = [...prev];
                    final[activeIdx].takes.unshift({
                        id: takeId,
                        url: URL.createObjectURL(blob),
                        analysis: null,
                        isAnalyzing: true
                    });
                    final[activeIdx].bestTakeId = takeId;
                    return final;
                });
                performChapterAnalysis(activeIdx, takeId, blob);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (e) {
            setErrorMessage("麦克风权限受阻");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleGenerateTakeSRT = (chapterIdx) => {
        const chapter = chapters[chapterIdx];
        const take = chapter.takes.find(t => t.id === chapter.bestTakeId);
        if (!take || !take.analysis) {
            setErrorMessage("请先完成分析");
            return null;
        }
        let srt = "";
        take.analysis.sentence_analysis.forEach((item, i) => {
            srt += `${i + 1}\n${formatSrtTime(item.start_time)} --> ${formatSrtTime(item.end_time)}\n${item.transcription}\n\n`;
        });
        return srt;
    };

    const downloadFile = (content, filename) => {
        const blob = new Blob([content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleExportFullSRT = () => {
        let fullSrt = "";
        let globalIndex = 1;
        let timeOffset = 0;
        chapters.forEach((c) => {
            const bestTake = c.takes.find(t => t.id === c.bestTakeId);
            if (bestTake && bestTake.analysis) {
                bestTake.analysis.sentence_analysis.forEach((item) => {
                    fullSrt += `${globalIndex}\n${formatSrtTime(item.start_time + timeOffset)} --> ${formatSrtTime(item.end_time + timeOffset)}\n${item.transcription}\n\n`;
                    globalIndex++;
                });
                const lastItem = bestTake.analysis.sentence_analysis[bestTake.analysis.sentence_analysis.length - 1];
                timeOffset += (lastItem?.end_time || 0) + 1.0;
            }
        });
        return fullSrt || null;
    };

    const handleExportMergedAudio = async (type) => {
        setIsExportingAudio(true);
        const urls = [];
        try {
            chapters.forEach((chapter, cIdx) => {
                const bestTakeId = chapter.bestTakeId;
                chapter.sentenceItems.forEach((_, sIdx) => {
                    const url = type === 'standard' ? sentenceTTSMap[`sent-${cIdx}-${sIdx}`] : userSliceMap[`${bestTakeId}-${sIdx}`];
                    if (url) urls.push(url);
                });
            });
            if (urls.length === 0) throw new Error("录音片段不全");
            // 修复点：合并最终音频时，在每句话之间增加 1.0s 停顿
            const buffer = await concatAudioBuffersWithSilence(urls, 1.0);
            return buffer ? audioBufferToWavBlob(buffer) : null;
        } catch (e) {
            setErrorMessage("导出合并音频失败");
            return null;
        } finally {
            setIsExportingAudio(false);
        }
    };

    const handleDownloadEverything = async () => {
        setIsExportingAudio(true);
        try {
            const fullSrt = handleExportFullSRT();
            if (fullSrt) downloadFile(fullSrt, `Project_Subtitles_${Date.now()}.srt`);
            const standardBlob = await handleExportMergedAudio('standard');
            if (standardBlob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(standardBlob);
                a.download = `Full_Standard_Audio_${Date.now()}.wav`;
                a.click();
            }
            const userBlob = await handleExportMergedAudio('user');
            if (userBlob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(userBlob);
                a.download = `Full_User_Voiceover_${Date.now()}.wav`;
                a.click();
            }
        } catch (e) {
            setErrorMessage("下载出错");
        } finally {
            setIsExportingAudio(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <header
                    className="flex flex-col md:flex-row md:items-center justify-between bg-white px-6 py-5 rounded-[2rem] shadow-sm border border-slate-200 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-100"><IconPlay/></div>
                        <h1 className="text-xl font-black uppercase tracking-tighter text-slate-800">YouGuide <span
                            className="text-red-600">Pro</span></h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2">
                            <div className="bg-white p-1.5 rounded-xl shadow-sm"><IconSettings/></div>
                            <select value={voiceSettings.voiceId}
                                    onChange={(e) => setVoiceSettings(v => ({...v, voiceId: e.target.value}))}
                                    className="bg-transparent text-xs font-bold outline-none cursor-pointer">
                                {VOICE_OPTIONS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <span
                                className="text-[10px] font-black text-slate-400 uppercase tracking-tighter tracking-widest">SPEED {voiceSettings.speed}x</span>
                            <input type="range" min="0.5" max="2.0" step="0.5" value={voiceSettings.speed}
                                   onChange={(e) => setVoiceSettings(v => ({...v, speed: parseFloat(e.target.value)}))}
                                   className="w-20 accent-red-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                    </div>
                </header>

                {chapters.length === 0 ? (
                    <div
                        className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 mt-20 text-center animate-in fade-in duration-500">
                        <div className="flex items-center justify-center gap-2 mb-4 font-bold text-slate-700">
                            <IconFileText/> <span>输入视频脚本</span></div>
                        <textarea value={fullScript} onChange={(e) => setFullScript(e.target.value)}
                                  className="w-full h-64 p-6 bg-slate-50 border-none rounded-3xl outline-none mb-6 leading-relaxed text-sm"
                                  placeholder="在此粘贴脚本内容..."/>
                        <button
                            onClick={() => handleSplit()}
                            disabled={isSplitting}
                            className={`w-full text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${isSplitting ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-slate-900 hover:bg-black'}`}
                        >
                            {isSplitting ? <IconRefresh/> : <IconSearch/>}
                            {isSplitting ? "正在全局分析脚本..." : "分析脚本并开始制作"}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-40">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">章节目录</h2>
                                    <button onClick={() => {
                                        if (!isSplitting) {
                                            setChapters([]);
                                            clearCache();
                                        }
                                    }} disabled={isSplitting}
                                            className="text-[10px] text-red-600 font-bold hover:underline disabled:opacity-30">修改脚本
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {chapters.map((c, i) => (
                                        <div key={i} onClick={() => setActiveIdx(i)}
                                             className={`p-4 rounded-2xl cursor-pointer border ${activeIdx === i ? "bg-red-50 border-red-200 ring-1 ring-red-100" : "bg-white border-slate-100 shadow-sm"}`}>
                                            <h3 className={`text-xs font-bold truncate ${activeIdx === i ? 'text-red-600' : 'text-slate-600'}`}>{i + 1}. {c.title}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center gap-2"><IconMessage/><h2
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分段调整反馈</h2>
                                </div>
                                <textarea value={splitFeedback} onChange={(e) => setSplitFeedback(e.target.value)}
                                          className="w-full h-24 p-3 bg-slate-50 rounded-xl text-xs outline-none border border-transparent focus:border-red-100 resize-none leading-relaxed"
                                          placeholder="输入反馈如：缩短第二章..."/>
                                <button
                                    onClick={() => handleSplit(splitFeedback)}
                                    disabled={isSplitting || !splitFeedback.trim()}
                                    className={`w-full text-white py-2 rounded-xl text-[10px] font-bold transition-all ${isSplitting ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-slate-800 hover:bg-black'}`}
                                >
                                    {isSplitting ? <IconRefresh/> : "重新分析章节"}
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-9 space-y-8">
                            {activeIdx !== null && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                        <div
                                            className="flex flex-col md:flex-row justify-between gap-6 mb-8 text-center md:text-left">
                                            <div><p
                                                className="text-[10px] font-black text-red-600 uppercase mb-1 tracking-widest">Editing
                                                Chapter</p><h2
                                                className="text-2xl font-black text-slate-800 leading-tight">{chapters[activeIdx].title}</h2>
                                            </div>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleTTS(chapters[activeIdx].content, 'chapter')}
                                                    disabled={loadingMap['chapter']}
                                                    className="h-12 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-xs flex items-center gap-2">
                                                    {loadingMap['chapter'] ? <IconRefresh/> : <IconSpeaker/>} 全章标准音
                                                </button>
                                                <button onClick={isRecording ? stopRecording : startRecording}
                                                        className={`h-12 px-8 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${isRecording ? "bg-red-600 text-white animate-pulse" : "bg-slate-900 text-white hover:bg-black"}`}>
                                                    {isRecording ? <IconSquare/> :
                                                        <IconMic/>} {isRecording ? "结束录音" : "开始录制全章"}
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="space-y-1 text-center sm:text-left">
                                                <p className="text-[9px] font-black text-slate-400 uppercase ml-1">AI 参考
                                                    (含 0.5s 停顿)</p>
                                                {chapters[activeIdx].ttsUrl ?
                                                    <audio src={chapters[activeIdx].ttsUrl} controls
                                                           className="w-full h-8 opacity-70"/> : <div
                                                        className="text-[9px] text-slate-300 italic p-2 border rounded-xl border-dashed text-center">待生成</div>}
                                            </div>
                                            <div className="space-y-1 text-center sm:text-left">
                                                <p className="text-[9px] font-black text-red-400 uppercase ml-1">你的全章录音</p>
                                                {chapters[activeIdx].takes[0] ?
                                                    <audio key={chapters[activeIdx].takes[0].id}
                                                           src={chapters[activeIdx].takes[0].url} controls
                                                           className="w-full h-8 opacity-70"/> : <div
                                                        className="text-[9px] text-slate-300 italic p-2 border rounded-xl border-dashed text-center">待录制</div>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div
                                            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-2">
                                            <div
                                                className="flex items-center gap-4 overflow-x-auto custom-scrollbar w-full sm:w-auto">
                                                {chapters[activeIdx].takes.map((t, i) => (
                                                    <button key={t.id} onClick={() => {
                                                        const f = [...chapters];
                                                        f[activeIdx].bestTakeId = t.id;
                                                        setChapters(f);
                                                    }}
                                                            className={`px-4 py-2 rounded-full border text-[10px] font-black transition-all ${chapters[activeIdx].bestTakeId === t.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
                                                        TAKE {chapters[activeIdx].takes.length - i} {t.isAnalyzing &&
                                                        <IconRefresh/>}
                                                    </button>
                                                ))}
                                            </div>
                                            <button onClick={() => {
                                                const srt = handleGenerateTakeSRT(activeIdx);
                                                if (srt) downloadFile(srt, `Subtitle_CH${activeIdx + 1}.srt`)
                                            }}
                                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all shadow-sm">导出本章
                                                SRT
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            {chapters[activeIdx].sentenceItems.map((item, sIdx) => {
                                                const sent = item.text;
                                                const globalIdx = item.globalIdx;
                                                const selectedTake = chapters[activeIdx].takes.find(t => t.id === chapters[activeIdx].bestTakeId);
                                                const sentAnalysis = selectedTake?.analysis?.sentence_analysis?.find(a => a.index === sIdx);
                                                const ttsKey = `sent-${activeIdx}-${sIdx}`;
                                                const userSliceKey = selectedTake ? `${selectedTake.id}-${sIdx}` : null;

                                                return (
                                                    <div key={sIdx}
                                                         className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                                        <div className="flex flex-col gap-6">
                                                            <div className="flex gap-6 items-start">
                                                                <span
                                                                    className="text-[10px] font-black text-slate-300 mt-2 bg-slate-50 px-2 py-1 rounded border border-slate-100">LINE {String(globalIdx).padStart(3, '0')}</span>
                                                                <div className="flex-1 space-y-4">
                                                                    <div
                                                                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                                        <p className="text-lg font-black text-slate-800 leading-relaxed font-mono">{sent}</p>
                                                                        <button onClick={() => handleTTS(sent, ttsKey)}
                                                                                disabled={loadingMap[ttsKey]}
                                                                                className="shrink-0 text-[10px] font-black bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2">
                                                                            {loadingMap[ttsKey] ? <IconRefresh/> :
                                                                                <IconSpeaker/>} 听标准音
                                                                        </button>
                                                                    </div>
                                                                    <div
                                                                        className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {sentenceTTSMap[ttsKey] && <div
                                                                            className="flex items-center gap-3 bg-red-50/50 p-2 rounded-2xl border border-red-100 shadow-inner">
                                                                            <audio src={sentenceTTSMap[ttsKey]} controls
                                                                                   className="flex-1 h-8 opacity-60 scale-90"/>
                                                                        </div>}
                                                                        {selectedTake && userSliceMap[userSliceKey] &&
                                                                            <div
                                                                                className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
                                                                                <div
                                                                                    className="bg-slate-800 p-1 rounded-lg text-white shadow-inner">
                                                                                    <IconUser/></div>
                                                                                <audio src={userSliceMap[userSliceKey]}
                                                                                       controls
                                                                                       className="flex-1 h-8 opacity-90 scale-90 invert grayscale"/>
                                                                            </div>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {selectedTake && (
                                                                <div
                                                                    className={`p-6 rounded-2xl border transition-all ${selectedTake.isAnalyzing ? 'bg-slate-50 border-slate-200 animate-pulse' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                                                                    {selectedTake.isAnalyzing ?
                                                                        <p className="text-[10px] font-black text-slate-400 italic">正在处理切分与分析...</p> : sentAnalysis ? (
                                                                                <div className="space-y-4">
                                                                                    <div
                                                                                        className="flex items-center justify-between">
                                                                                        <div className="space-y-1"><p
                                                                                            className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">识别文本</p>
                                                                                            <p className="text-xs font-bold text-slate-600 italic leading-relaxed">{sentAnalysis.transcription || "---"}</p>
                                                                                        </div>
                                                                                        <div
                                                                                            className="flex flex-col items-end font-black">
                                                                                            <span
                                                                                                className="text-[9px] text-slate-400 uppercase">得分</span><span
                                                                                            className={`text-2xl ${sentAnalysis.score >= 80 ? 'text-green-500' : 'text-amber-500'}`}>{sentAnalysis.score}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div
                                                                                        className="pt-4 border-t border-slate-200/50">
                                                                                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">分析点评：{sentAnalysis.feedback}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ) :
                                                                            <p className="text-[10px] text-slate-400 italic text-center py-2">未能识别该句内容</p>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div
                                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-xl p-3 px-6 rounded-[3rem] shadow-2xl border border-slate-200 max-w-[95vw] overflow-x-auto custom-scrollbar">
                                        <button onClick={() => {
                                            const srt = handleExportFullSRT();
                                            if (srt) downloadFile(srt, `YouTube_Final_SRT.srt`)
                                        }}
                                                className="whitespace-nowrap bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-3 rounded-full font-bold text-xs flex items-center gap-2">
                                            <IconDownload/> 导出全片字幕
                                        </button>
                                        <button onClick={handleDownloadEverything} disabled={isExportingAudio}
                                                className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-black text-xs flex items-center gap-2 shadow-lg shadow-red-200">
                                            {isExportingAudio ? <IconRefresh/> : <IconBox/>} 一键导出发布包 (含 1s 句间停顿)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style
                dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }`}}/>
        </div>
    );
}