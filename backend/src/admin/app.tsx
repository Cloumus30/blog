import type { StrapiApp } from '@strapi/strapi/admin';
import { registerBlock } from '@qkix/strapi-plugin-better-blocks/strapi-admin';
import { Editor, Transforms } from 'slate';
import React, { useState, useEffect, useRef, useMemo } from 'react';

// Modular Highlight.js - Aman dari Vite chunk race condition & zero global side-effect
import hljs from 'highlight.js/lib/core';
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

// Registrasi bahasa secara aman (idempotent)
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

// Penyimpanan global instance Slate Editor dari Better Blocks (persisten antar-HMR)
const activeEditors = new Set<Editor>();

function getActiveEditors(): Set<Editor> {
  if (typeof window !== 'undefined') {
    const win = window as unknown as { __betterBlocksEditors?: Set<Editor> };
    if (!win.__betterBlocksEditors) {
      win.__betterBlocksEditors = activeEditors;
    } else {
      for (const ed of activeEditors) {
        win.__betterBlocksEditors.add(ed);
      }
      for (const ed of win.__betterBlocksEditors) {
        activeEditors.add(ed);
      }
    }
    return win.__betterBlocksEditors;
  }
  return activeEditors;
}

interface VsCodeBlockElementProps {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  element: {
    type: string;
    id?: string;
    code?: string;
    language?: string;
    filename?: string;
    [key: string]: unknown;
  };
}

const LANGUAGE_OPTIONS = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'JSON', value: 'json' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'PHP', value: 'php' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
];

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

// CSS Token Styles untuk tema VS Code Dark+
const VSCODE_TOKEN_STYLES = `
  .vscode-editor-layer {
    color: #d4d4d4 !important;
  }
  .vscode-editor-layer .hljs-comment,
  .vscode-editor-layer .hljs-quote {
    color: #6a9955 !important;
    font-style: italic;
  }
  .vscode-editor-layer .hljs-keyword,
  .vscode-editor-layer .hljs-selector-tag,
  .vscode-editor-layer .hljs-subst {
    color: #569cd6 !important;
  }
  .vscode-editor-layer .hljs-literal,
  .vscode-editor-layer .hljs-boolean {
    color: #569cd6 !important;
  }
  .vscode-editor-layer .hljs-number {
    color: #b5cea8 !important;
  }
  .vscode-editor-layer .hljs-string,
  .vscode-editor-layer .hljs-doctag,
  .vscode-editor-layer .hljs-regexp {
    color: #ce9178 !important;
  }
  .vscode-editor-layer .hljs-title,
  .vscode-editor-layer .hljs-section,
  .vscode-editor-layer .hljs-title.function_,
  .vscode-editor-layer .hljs-function {
    color: #dcdcaa !important;
  }
  .vscode-editor-layer .hljs-type,
  .vscode-editor-layer .hljs-class .hljs-title,
  .vscode-editor-layer .hljs-built_in {
    color: #4ec9b0 !important;
  }
  .vscode-editor-layer .hljs-tag,
  .vscode-editor-layer .hljs-name {
    color: #569cd6 !important;
  }
  .vscode-editor-layer .hljs-attr,
  .vscode-editor-layer .hljs-attribute,
  .vscode-editor-layer .hljs-variable,
  .vscode-editor-layer .hljs-template-variable {
    color: #9cdcfe !important;
  }
  .vscode-editor-layer .hljs-symbol,
  .vscode-editor-layer .hljs-bullet,
  .vscode-editor-layer .hljs-link {
    color: #d7ba7d !important;
  }
  .vscode-editor-layer .hljs-meta {
    color: #9cdcfe !important;
  }
  .vscode-textarea-input::selection {
    background-color: rgba(38, 79, 120, 0.75) !important;
  }
`;

const VsCodeEditorElement: React.FC<VsCodeBlockElementProps> = ({
  attributes,
  children,
  element,
}) => {
  // ID unik stabil agar node dapat dilacak dan diupdate secara persisten di Slate AST
  const blockIdRef = useRef<string>(
    element.id || ('vsc_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36))
  );

  const [code, setCode] = useState(element.code ?? '');
  const [language, setLanguage] = useState(element.language ?? 'typescript');
  const [filename, setFilename] = useState(element.filename ?? 'snippet.ts');
  const [copied, setCopied] = useState(false);

  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateNode = (fields: Record<string, unknown>) => {
    const blockId = blockIdRef.current;
    const editors = getActiveEditors();

    let updated = false;
    for (const editor of editors) {
      try {
        for (const [, path] of Editor.nodes(editor, {
          at: [],
          match: (n: any) => n.id === blockId || n === element,
        })) {
          Transforms.setNodes(editor, { id: blockId, ...fields }, { at: path });
          Object.assign(element, { id: blockId, ...fields });
          updated = true;
          break;
        }
      } catch (err) {
        console.warn('[BetterBlocks VSCode] Error updating Slate node:', err);
      }
      if (updated) break;
    }

    if (!updated) {
      Object.assign(element, { id: blockId, ...fields });
    }
  };

  // Pastikan ID tersimpan di element AST pada mount jika belum ada
  useEffect(() => {
    if (!element.id) {
      updateNode({ id: blockIdRef.current });
    }
  }, []);

  // Sinkronisasi state lokal jika props element berubah dari luar
  useEffect(() => {
    if (element.code !== undefined && element.code !== code) {
      setCode(element.code);
    }
  }, [element.code]);

  useEffect(() => {
    if (element.language !== undefined && element.language !== language) {
      setLanguage(element.language);
    }
  }, [element.language]);

  useEffect(() => {
    if (element.filename !== undefined && element.filename !== filename) {
      setFilename(element.filename);
    }
  }, [element.filename]);

  // Real-time Syntax Highlighting dengan Highlight.js
  const highlightedHtml = useMemo(() => {
    if (!code) return '';
    const normLang = (language || 'typescript').toLowerCase();
    const langKey = LANGUAGE_MAP[normLang] || normLang;

    if (hljs.getLanguage(langKey)) {
      try {
        return hljs.highlight(code, { language: langKey, ignoreIllegals: true }).value;
      } catch {
        // fallback jika error
      }
    }

    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }, [code, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const nextValue = value.substring(0, start) + '  ' + value.substring(end);

      target.value = nextValue;
      target.selectionStart = target.selectionEnd = start + 2;
      setCode(nextValue);
      updateNode({ code: nextValue });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = Math.max(3, (code.match(/\n/g) || []).length + 1);

  return (
    <div
      {...attributes}
      style={{
        margin: '24px 0',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#1e1e1e',
        border: '1px solid #333333',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
      }}
    >
      <style>{VSCODE_TOKEN_STYLES}</style>

      {/* VS Code Title Bar */}
      <div
        contentEditable={false}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: '#252526',
          borderBottom: '1px solid #333333',
          userSelect: 'none',
        }}
      >
        {/* Left: Window Dots & Filename Tab */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#ff5f56',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#ffbd2e',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                width: '11px',
                height: '11px',
                borderRadius: '50%',
                background: '#27c93f',
                display: 'inline-block',
              }}
            />
          </div>

          {/* Active file tab */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e1e1e',
              padding: '3px 10px',
              borderRadius: '4px 4px 0 0',
              borderTop: '1px solid #007acc',
              borderLeft: '1px solid #333333',
              borderRight: '1px solid #333333',
              borderBottom: 'none',
            }}
          >
            <span style={{ color: '#007acc', fontSize: '11px', fontWeight: 600 }}>📄</span>
            <input
              type="text"
              value={filename}
              placeholder="filename.ts"
              onChange={(e) => {
                const nextFilename = e.target.value;
                setFilename(nextFilename);
                updateNode({ filename: nextFilename });
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#9cdcfe',
                fontSize: '11px',
                fontWeight: 500,
                outline: 'none',
                width: `${Math.max(10, filename.length + 2)}ch`,
                maxWidth: '240px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Right: Language Selector & Copy Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={language}
            onChange={(e) => {
              const nextLanguage = e.target.value;
              setLanguage(nextLanguage);
              updateNode({ language: nextLanguage });
            }}
            style={{
              backgroundColor: '#1e1e1e',
              color: '#cccccc',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              fontSize: '11px',
              padding: '3px 8px',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopy}
            title="Salin kode"
            style={{
              backgroundColor: '#2d2d2d',
              color: copied ? '#27c93f' : '#858585',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              fontSize: '11px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            {copied ? '✓ Tersalin' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Editor Content Area with Line Numbers & Dual-Layer Real-Time Syntax Highlighting */}
      <div
        contentEditable={false}
        style={{
          display: 'flex',
          padding: '12px 0',
          backgroundColor: '#1e1e1e',
          minHeight: '100px',
        }}
      >
        {/* Line Numbers Gutter */}
        <div
          style={{
            userSelect: 'none',
            paddingRight: '12px',
            paddingLeft: '14px',
            textAlign: 'right',
            color: '#6e7681',
            fontSize: '12.5px',
            lineHeight: '1.65',
            borderRight: '1px solid #2d2d2d',
            fontFamily: 'inherit',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Dual-Layer Code Area */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {/* Layer 1: Highlighting Bawah (HTML Berwarna) */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="vscode-editor-layer"
            style={{
              margin: 0,
              padding: '0 14px',
              fontFamily: 'inherit',
              fontSize: '12.5px',
              lineHeight: '1.65',
              whiteSpace: 'pre',
              overflow: 'hidden',
              wordBreak: 'normal',
              wordWrap: 'normal',
              tabSize: 2,
              color: '#d4d4d4',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
              border: 'none',
              minHeight: `${lineCount * 20.6}px`,
            }}
            dangerouslySetInnerHTML={{
              __html: (highlightedHtml || ' ') + (code.endsWith('\n') ? '\n ' : ''),
            }}
          />

          {/* Layer 2: Textarea Atas (Transparan untuk input keyboard & kursor) */}
          <textarea
            ref={textareaRef}
            value={code}
            placeholder="// Tulis atau tempel kode di sini..."
            onChange={(e) => {
              const nextCode = e.target.value;
              setCode(nextCode);
              updateNode({ code: nextCode });
            }}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            rows={lineCount}
            spellCheck={false}
            className="vscode-textarea-input"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              margin: 0,
              padding: '0 14px',
              backgroundColor: 'transparent',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              caretColor: '#ffffff',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '12.5px',
              lineHeight: '1.65',
              fontFamily: 'inherit',
              whiteSpace: 'pre',
              overflow: 'auto',
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* Slate placeholder required for void elements */}
      <div style={{ display: 'none' }}>{children}</div>
    </div>
  );
};

// SVG Icon untuk Insert Menu & Slash Command
const VsCodeMenuIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export default {
  register() {
    registerBlock({
      type: 'vscode-code',
      content: 'void',
      label: 'VS Code Block',
      icon: VsCodeMenuIcon,
      snippets: ['```vscode'],
      withEditor: (editor) => {
        getActiveEditors().add(editor);
        return editor;
      },
      insert: (editor) => {
        getActiveEditors().add(editor);
        const blockId = 'vsc_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
        Transforms.insertNodes(editor, {
          type: 'vscode-code',
          id: blockId,
          code: '',
          language: 'typescript',
          filename: 'snippet.ts',
          children: [{ type: 'text', text: '' }],
        });
      },
      renderElement: (props) => <VsCodeEditorElement {...props} />,
    });
  },
  bootstrap(app: StrapiApp) {},
};
