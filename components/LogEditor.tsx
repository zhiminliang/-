import React, { useRef, useMemo, useEffect } from 'react';

interface LogEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const LogEditor: React.FC<LogEditorProps> = ({ value, onChange, disabled, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync scrolling between the invisible textarea and the visible pre block
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Ensure scroll is synced when content changes significantly
  useEffect(() => {
    handleScroll();
  }, [value]);

  const highlightedHTML = useMemo(() => {
    if (!value) return '';

    // Escape HTML to prevent XSS
    let html = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // --- Syntax Highlighting Rules ---

    // 1. Log Levels (Bold Colors)
    html = html
      .replace(/\b(FATAL|CRITICAL|ERROR|FAIL|SEVERE)\b/g, '<span class="text-red-500 font-bold">$1</span>')
      .replace(/\b(WARN|WARNING)\b/g, '<span class="text-yellow-500 font-bold">$1</span>')
      .replace(/\b(INFO|DEBUG|TRACE|VERBOSE)\b/g, '<span class="text-blue-400 font-bold">$1</span>');

    // 2. Timestamps (Emerald)
    // Matches patterns like 2023-10-10 12:00:00 or 10-10 12:00:00.123
    html = html.replace(/(\d{4}-\d{2}-\d{2}.\d{2}:\d{2}:\d{2}(?:\.\d+)?)|(\b\d{2}-\d{2}.\d{2}:\d{2}:\d{2}\.\d{3})/g, '<span class="text-emerald-400">$1$2</span>');

    // 3. Stack Trace "at" lines (Indigo for 'at', lighter for method)
    html = html.replace(/(\s+at\s+)([\w$.<>]+)/g, '$1<span class="text-indigo-300">$2</span>');

    // 4. Metadata in square brackets (Slate)
    html = html.replace(/(\[.*?\])/g, '<span class="text-slate-500">$1</span>');

    // 5. Key-Value pairs (Purple key, Cyan value) - e.g. pid=1234
    html = html.replace(/\b([a-zA-Z0-9_]+)(=)([\w.-]+)/g, '<span class="text-purple-400">$1</span>$2<span class="text-cyan-300">$3</span>');

    // 6. Exceptions (Red Underline)
    html = html.replace(/\b([a-zA-Z.]*Exception)\b/g, '<span class="text-red-400 decoration-red-500/30 underline decoration-2">$1</span>');

    // Handle trailing newline for visual consistency
    if (value.endsWith('\n')) {
      html += '<br />';
    }

    return html;
  }, [value]);

  return (
    <div className="relative w-full h-96 bg-slate-950 rounded-b-xl text-sm font-mono group resize-y overflow-hidden border-t-0">
      
      {/* Visual Layer (Syntax Highlighted) */}
      <pre
        ref={preRef}
        className="absolute inset-0 p-4 m-0 overflow-hidden whitespace-pre-wrap break-all pointer-events-none text-slate-300"
        style={{ fontFamily: 'monospace', lineHeight: '1.5rem' }}
        dangerouslySetInnerHTML={{ __html: highlightedHTML }}
      />
      
      {/* Placeholder Layer */}
      {!value && (
        <div 
          className="absolute inset-0 p-4 text-slate-600 pointer-events-none whitespace-pre-wrap" 
          style={{ fontFamily: 'monospace', lineHeight: '1.5rem' }}
        >
          {placeholder}
        </div>
      )}

      {/* Input Layer (Transparent Textarea) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none focus:outline-none selection:bg-blue-500/30"
        style={{ fontFamily: 'monospace', lineHeight: '1.5rem' }}
      />
    </div>
  );
};

export default LogEditor;
