'use client';

import { useState, useMemo } from 'react';
import { Check, Copy, FileCode, Terminal } from 'lucide-react';
import hljs from 'highlight.js/lib/core';

// Language grammars
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml'; // HTML, XML
import css from 'highlight.js/lib/languages/css';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import php from 'highlight.js/lib/languages/php';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';

// Registrasi bahasa (idempotent)
if (!hljs.getLanguage('javascript')) {
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('sql', sql);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('html', xml);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('cpp', cpp);
  hljs.registerLanguage('php', php);
  hljs.registerLanguage('yaml', yaml);
  hljs.registerLanguage('markdown', markdown);
}

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  py: 'python',
  html: 'html',
  xml: 'html',
  css: 'css',
  json: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  sql: 'sql',
  go: 'go',
  rust: 'rust',
  rs: 'rust',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  php: 'php',
  yaml: 'yaml',
  yml: 'yaml',
  markdown: 'markdown',
  md: 'markdown',
};

// VS Code Dark+ Theme Tokens
const VSCODE_TOKEN_STYLES = `
  .vscode-code-highlight {
    color: #d4d4d4;
  }
  .vscode-code-highlight .hljs-comment,
  .vscode-code-highlight .hljs-quote {
    color: #6a9955;
    font-style: italic;
  }
  .vscode-code-highlight .hljs-keyword,
  .vscode-code-highlight .hljs-selector-tag,
  .vscode-code-highlight .hljs-subst {
    color: #569cd6;
  }
  .vscode-code-highlight .hljs-literal,
  .vscode-code-highlight .hljs-boolean {
    color: #569cd6;
  }
  .vscode-code-highlight .hljs-number {
    color: #b5cea8;
  }
  .vscode-code-highlight .hljs-string,
  .vscode-code-highlight .hljs-doctag,
  .vscode-code-highlight .hljs-regexp {
    color: #ce9178;
  }
  .vscode-code-highlight .hljs-title,
  .vscode-code-highlight .hljs-section,
  .vscode-code-highlight .hljs-title.function_,
  .vscode-code-highlight .hljs-function {
    color: #dcdcaa;
  }
  .vscode-code-highlight .hljs-type,
  .vscode-code-highlight .hljs-class .hljs-title,
  .vscode-code-highlight .hljs-built_in {
    color: #4ec9b0;
  }
  .vscode-code-highlight .hljs-tag,
  .vscode-code-highlight .hljs-name {
    color: #569cd6;
  }
  .vscode-code-highlight .hljs-attr,
  .vscode-code-highlight .hljs-attribute,
  .vscode-code-highlight .hljs-variable,
  .vscode-code-highlight .hljs-template-variable {
    color: #9cdcfe;
  }
  .vscode-code-highlight .hljs-symbol,
  .vscode-code-highlight .hljs-bullet,
  .vscode-code-highlight .hljs-link {
    color: #d7ba7d;
  }
  .vscode-code-highlight .hljs-meta {
    color: #9cdcfe;
  }
`;

export default function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const lines = (code || '').split('\n');

  // Highlight syntax sesuai bahasa yang dipilih
  const highlightedHtml = useMemo(() => {
    if (!code) return '';
    const normLang = (language || 'typescript').toLowerCase();
    const langKey = LANGUAGE_MAP[normLang] || normLang;

    if (hljs.getLanguage(langKey)) {
      try {
        return hljs.highlight(code, { language: langKey, ignoreIllegals: true }).value;
      } catch (err) {
        console.warn('Highlight.js fallback to plain text', err);
      }
    }

    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [code, language]);

  return (
    <div className="my-7 rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] shadow-2xl font-mono text-sm">
      <style>{VSCODE_TOKEN_STYLES}</style>

      {/* VS Code Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333333] text-slate-400 select-none">
        {/* Left: Window Controls & Active File Tab */}
        <div className="flex items-center gap-3">
          {/* Mac Window Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
          </div>

          {/* Active File Tab (if filename provided) */}
          {filename ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border-t-2 border-t-blue-500 border-x border-[#333333] rounded-t-md text-xs text-[#9cdcfe] font-medium tracking-tight">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>{filename}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium ml-1">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span className="uppercase text-[11px] tracking-wider text-slate-300">
                {language}
              </span>
            </div>
          )}
        </div>

        {/* Right: Language Badge & Copy Button */}
        <div className="flex items-center gap-2">
          {filename && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-[#2d2d2d] border border-[#3c3c3c]">
              {language}
            </span>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#2d2d2d] hover:bg-[#383838] text-slate-200 transition-colors border border-[#3c3c3c]"
            title="Salin kode"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area with Line Numbers & Syntax Highlighting */}
      <div className="flex p-4 overflow-x-auto text-slate-100 leading-relaxed text-[13.5px] bg-[#1e1e1e]">
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className="select-none text-slate-600 text-right pr-4 mr-4 border-r border-[#2d2d2d] flex flex-col font-mono text-xs leading-relaxed"
          >
            {lines.map((_, i) => (
              <span key={i} className="min-w-[1.5rem]">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        <pre className="flex-1 overflow-x-auto m-0 p-0 bg-transparent vscode-code-highlight">
          <code
            className="font-mono text-[13.5px] leading-relaxed text-[#d4d4d4]"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
