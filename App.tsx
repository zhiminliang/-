import React, { useState, useRef, useCallback } from 'react';
import { Platform, AnalysisState } from './types';
import { analyzeLog } from './services/geminiService';
import PlatformSelector from './components/PlatformSelector';
import AnalysisDashboard from './components/AnalysisDashboard';
import LogEditor from './components/LogEditor';
import { FileText, Upload, AlertCircle, Loader2, Code, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>(Platform.ANDROID);
  const [logContent, setLogContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setLogContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (!logContent.trim()) return;

    setAnalysis({ isLoading: true, result: null, error: null });
    
    try {
      const result = await analyzeLog(logContent, platform);
      setAnalysis({ isLoading: false, result, error: null });
    } catch (err: any) {
      setAnalysis({
        isLoading: false,
        result: null,
        error: err.message || "发生未知错误",
      });
    }
  };

  const handleReset = useCallback(() => {
    setAnalysis({ isLoading: false, result: null, error: null });
    setLogContent('');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              QA 智能日志分析
            </h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
             由 Gemini 2.5 Flash 驱动
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Interface */}
        {!analysis.result ? (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">秒级定位 Bug</h2>
              <p className="text-slate-400">粘贴崩溃日志或服务端日志，AI 将自动分析根因并提供修复建议。</p>
            </div>

            <PlatformSelector 
              selected={platform} 
              onSelect={setPlatform} 
              disabled={analysis.isLoading} 
            />

            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
              
              {/* Toolbar */}
              <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2 text-slate-400 text-sm pl-2">
                  <Code className="w-4 h-4" />
                  <span>日志内容</span>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"
                  disabled={analysis.isLoading}
                >
                  <Upload className="w-3 h-3" />
                  上传日志文件
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".log,.txt,.json"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Log Editor with Syntax Highlighting */}
              <div className="relative">
                <LogEditor
                  value={logContent}
                  onChange={setLogContent}
                  disabled={analysis.isLoading}
                  placeholder={`在此粘贴 ${platform === Platform.MINI_PROGRAM ? '小程序' : platform} 日志...\n\n示例:\nE/AndroidRuntime(12345): FATAL EXCEPTION: main\nProcess: com.example.app, PID: 12345\njava.lang.NullPointerException...`}
                />
                
                {logContent.length > 0 && (
                  <div className="absolute bottom-4 right-6 text-xs text-slate-500 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 pointer-events-none z-20">
                    {logContent.length} 字符
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-between items-center rounded-b-xl">
                 <button
                  onClick={() => setLogContent('')}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                  disabled={analysis.isLoading || !logContent}
                >
                  清空
                </button>

                <button
                  onClick={handleAnalyze}
                  disabled={!logContent || analysis.isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white shadow-lg transition-all transform active:scale-95 ${
                    !logContent || analysis.isLoading
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
                  }`}
                >
                  {analysis.isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在分析...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      开始分析
                    </>
                  )}
                </button>
              </div>
            </div>

            {analysis.error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold">分析失败</h4>
                  <p className="text-sm opacity-90">{analysis.error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <AnalysisDashboard result={analysis.result} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;
