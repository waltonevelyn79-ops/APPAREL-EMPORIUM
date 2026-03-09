'use client';

import { useRef, useCallback } from 'react';
import {
    Bold, Italic, Underline, List, ListOrdered,
    Link2, Heading2, Heading3, Quote, Minus, Undo, Redo
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing here...',
    minHeight = '320px',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    const exec = useCallback((command: string, arg?: string) => {
        document.execCommand(command, false, arg);
        editorRef.current?.focus();
        // Immediately sync the updated content
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    // Insert a horizontal rule
    const insertHR = () => {
        exec('insertHTML', '<hr style="border:none;border-top:2px solid #e5e7eb;margin:24px 0;" />');
    };

    // Insert a blockquote
    const insertQuote = () => {
        exec('formatBlock', 'blockquote');
    };

    // Add hyperlink
    const insertLink = () => {
        const url = window.prompt('Enter URL (including https://)');
        if (url) exec('createLink', url);
    };

    const toolbarBtnBase =
        'p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary transition-colors';

    const ToolbarSeparator = () => (
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />
    );

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-dark-surface focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">

            {/* ── TOOLBAR ──────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">

                {/* Undo / Redo */}
                <button type="button" onClick={() => exec('undo')} className={toolbarBtnBase} title="Undo (Ctrl+Z)">
                    <Undo size={15} />
                </button>
                <button type="button" onClick={() => exec('redo')} className={toolbarBtnBase} title="Redo (Ctrl+Y)">
                    <Redo size={15} />
                </button>

                <ToolbarSeparator />

                {/* Heading */}
                <button type="button" onClick={() => exec('formatBlock', 'h2')} className={toolbarBtnBase} title="Heading 2">
                    <Heading2 size={15} />
                </button>
                <button type="button" onClick={() => exec('formatBlock', 'h3')} className={toolbarBtnBase} title="Heading 3">
                    <Heading3 size={15} />
                </button>
                <button type="button" onClick={() => exec('formatBlock', 'p')} className={`${toolbarBtnBase} text-xs font-bold`} title="Paragraph">
                    P
                </button>

                <ToolbarSeparator />

                {/* Inline styles */}
                <button type="button" onClick={() => exec('bold')} className={toolbarBtnBase} title="Bold (Ctrl+B)">
                    <Bold size={15} />
                </button>
                <button type="button" onClick={() => exec('italic')} className={toolbarBtnBase} title="Italic (Ctrl+I)">
                    <Italic size={15} />
                </button>
                <button type="button" onClick={() => exec('underline')} className={toolbarBtnBase} title="Underline (Ctrl+U)">
                    <Underline size={15} />
                </button>

                <ToolbarSeparator />

                {/* Lists */}
                <button type="button" onClick={() => exec('insertUnorderedList')} className={toolbarBtnBase} title="Bullet List">
                    <List size={15} />
                </button>
                <button type="button" onClick={() => exec('insertOrderedList')} className={toolbarBtnBase} title="Numbered List">
                    <ListOrdered size={15} />
                </button>

                <ToolbarSeparator />

                {/* Block elements */}
                <button type="button" onClick={insertQuote} className={toolbarBtnBase} title="Blockquote">
                    <Quote size={15} />
                </button>
                <button type="button" onClick={insertHR} className={toolbarBtnBase} title="Horizontal Rule">
                    <Minus size={15} />
                </button>
                <button type="button" onClick={insertLink} className={toolbarBtnBase} title="Insert Link">
                    <Link2 size={15} />
                </button>

                <ToolbarSeparator />

                {/* Clear formatting */}
                <button
                    type="button"
                    onClick={() => exec('removeFormat')}
                    className={`${toolbarBtnBase} text-xs font-mono`}
                    title="Clear Formatting"
                >
                    Tₓ
                </button>
            </div>

            {/* ── EDITABLE AREA ────────────────────────────── */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                data-placeholder={placeholder}
                style={{ minHeight }}
                className={[
                    'p-5 outline-none text-gray-800 dark:text-gray-200 text-sm leading-relaxed',
                    'prose prose-sm dark:prose-invert max-w-none',
                    // Placeholder via CSS
                    '[&:empty]:before:content-[attr(data-placeholder)]',
                    '[&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none',
                    // Blockquote styling
                    '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500',
                    // Heading styling
                    '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 dark:[&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3',
                    '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-800 dark:[&_h3]:text-gray-100 [&_h3]:mt-5 [&_h3]:mb-2',
                    // Link styling
                    '[&_a]:text-primary [&_a]:underline',
                    // List styling
                    '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3',
                    '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3',
                ].join(' ')}
            />

            {/* ── WORD COUNT ───────────────────────────────── */}
            <div className="px-4 py-1.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end">
                <span className="text-[10px] text-gray-400 font-mono">
                    {value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length} words
                </span>
            </div>
        </div>
    );
}
