import React from 'react';
import { AnalysisResult, Severity } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { AlertTriangle, XCircle, Info, Activity, Terminal, Download, Printer, FileText } from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const SEVERITY_COLORS = {
  [Severity.CRITICAL]: '#EF4444', // Red 500
  [Severity.HIGH]: '#F97316',     // Orange 500
  [Severity.MEDIUM]: '#EAB308',   // Yellow 500
  [Severity.LOW]: '#3B82F6',      // Blue 500
  [Severity.INFO]: '#94A3B8',     // Slate 400
};

const SEVERITY_LABELS = {
  [Severity.CRITICAL]: '严重',
  [Severity.HIGH]: '高',
  [Severity.MEDIUM]: '中',
  [Severity.LOW]: '低',
  [Severity.INFO]: '信息',
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, onReset }) => {
  const chartData = Object.values(Severity).map(severity => ({
    name: SEVERITY_LABELS[severity],
    rawName: severity,
    value: result.issues.filter(i => i.severity === severity).length
  })).filter(d => d.value > 0);

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return <XCircle className="w-5 h-5 text-red-500" />;
      case Severity.HIGH: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case Severity.MEDIUM: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case Severity.LOW: return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleExportMarkdown = () => {
    const date = new Date().toLocaleString('zh-CN');
    let md = `# 日志分析报告\n\n`;
    md += `**生成时间:** ${date}\n`;
    md += `**健康评分:** ${result.overall_health_score}/100\n`;
    if (result.device_info) md += `**设备型号:** ${result.device_info}\n`;
    if (result.os_version) md += `**系统版本:** ${result.os_version}\n`;
    if (result.app_version) md += `**APP版本:** ${result.app_version}\n\n`;
    
    md += `## 摘要\n${result.summary}\n\n`;
    
    md += `## 问题分布\n`;
    chartData.forEach(d => {
      md += `- ${d.name}: ${d.value}\n`;
    });
    md += `\n`;

    md += `## 问题详情 (${result.issues.length})\n\n`;
    result.issues.forEach((issue, index) => {
      md += `### ${index + 1}. [${SEVERITY_LABELS[issue.severity]}] ${issue.title}\n`;
      md += `**严重等级:** ${issue.severity}\n`;
      md += `**描述:** ${issue.description}\n`;
      md += `**可能原因:** ${issue.possible_cause}\n`;
      md += `**修复建议:** ${issue.recommendation}\n`;
      if (issue.log_snippet) {
        md += `**日志片段:**\n\`\`\`\n${issue.log_snippet}\n\`\`\`\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-analysis-report-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:space-y-4">
      {/* Header Summary Card */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl print:bg-white print:border-slate-300 print:text-black print:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 print:text-black">日志分析报告</h2>
            <div className="flex gap-4 text-sm text-slate-400 print:text-slate-600">
              {result.device_info && <span>设备型号: <span className="text-slate-200 print:text-black">{result.device_info}</span></span>}
              {result.os_version && <span>系统版本: <span className="text-slate-200 print:text-black">{result.os_version}</span></span>}
              {result.app_version && <span>APP版本: <span className="text-slate-200 print:text-black">{result.app_version}</span></span>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
            {/* Health Score */}
            <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700 print:bg-slate-100 print:border-slate-300">
              <Activity className={`w-6 h-6 ${result.overall_health_score > 80 ? 'text-green-500' : result.overall_health_score > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider print:text-slate-600">健康评分</p>
                <p className="text-2xl font-bold text-white print:text-black">{result.overall_health_score}/100</p>
              </div>
            </div>

            {/* Action Buttons - Hidden in Print */}
            <div className="flex gap-2 print:hidden mt-2 sm:mt-0">
               <button 
                onClick={handleExportMarkdown}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
                title="导出 Markdown"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={handlePrint}
                className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
                title="打印 / 另存为 PDF"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-slate-300 leading-relaxed print:bg-white print:border-0 print:p-0 print:text-black print:mt-6">
          <h3 className="text-slate-500 font-bold mb-1 text-xs uppercase tracking-wider print:hidden">摘要分析</h3>
          {result.summary}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-6">
        {/* Chart Column - May hide in print to save ink or keep if needed. Keeping it but ensuring contrast. */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg min-h-[300px] flex flex-col print:bg-white print:border-slate-300 print:shadow-none print:break-inside-avoid">
          <h3 className="text-lg font-semibold text-white mb-4 print:text-black">问题分布</h3>
          <div className="flex-1 w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.rawName as Severity]} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Issues Column */}
        <div className="lg:col-span-2 space-y-4 print:mt-6">
          <h3 className="text-lg font-semibold text-white flex items-center justify-between print:text-black">
            <span>检测到的问题 ({result.issues.length})</span>
            <button onClick={onReset} className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors print:hidden">
              分析新日志
            </button>
          </h3>
          
          <div className="space-y-4">
            {result.issues.map((issue, idx) => (
              <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all print:bg-white print:border-slate-300 print:break-inside-avoid print:shadow-none">
                <div className="p-4 border-b border-slate-700/50 flex items-start gap-3 bg-slate-800/50 print:bg-slate-50 print:border-slate-200">
                  <div className="mt-1 flex-shrink-0">
                    {getSeverityIcon(issue.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-200 text-base print:text-black">{issue.title}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide print:border print:border-current ${
                        issue.severity === Severity.CRITICAL ? 'bg-red-500/20 text-red-400 print:text-red-700 print:bg-red-50' :
                        issue.severity === Severity.HIGH ? 'bg-orange-500/20 text-orange-400 print:text-orange-700 print:bg-orange-50' :
                        issue.severity === Severity.MEDIUM ? 'bg-yellow-500/20 text-yellow-400 print:text-yellow-700 print:bg-yellow-50' :
                        'bg-blue-500/20 text-blue-400 print:text-blue-700 print:bg-blue-50'
                      }`}>
                        {SEVERITY_LABELS[issue.severity]}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 print:text-slate-700">{issue.description}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-900/30 space-y-3 print:bg-white">
                   {issue.log_snippet && (
                    <div className="bg-slate-950 rounded border border-slate-800 p-3 font-mono text-xs text-slate-300 overflow-x-auto print:bg-slate-50 print:text-slate-800 print:border-slate-200 print:whitespace-pre-wrap">
                      <div className="flex items-center gap-2 text-slate-500 mb-1 print:text-slate-500">
                        <Terminal className="w-3 h-3" />
                        <span>日志片段 {issue.line_number ? `(行号 ${issue.line_number})` : ''}</span>
                      </div>
                      {issue.log_snippet}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 font-medium block mb-1 print:text-slate-700">可能原因</span>
                      <p className="text-slate-300 print:text-black">{issue.possible_cause}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block mb-1 print:text-slate-700">修复建议</span>
                      <p className="text-green-400/90 print:text-green-700 font-semibold">{issue.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;