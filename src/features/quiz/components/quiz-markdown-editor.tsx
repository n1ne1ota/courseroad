'use client';

import '@courseroad/kurume-ui/editor/components/extensions/blockquote/blockquote-extension.css';
import '@courseroad/kurume-ui/editor/components/extensions/code-block/code-block-extension.css';
import '@courseroad/kurume-ui/editor/components/extensions/heading/heading-extension.css';
import '@courseroad/kurume-ui/editor/components/extensions/horizontal-rule/horizontal-rule-extension.css';
import '@courseroad/kurume-ui/editor/components/extensions/list/list-extension.css';
import '@courseroad/kurume-ui/editor/components/extensions/paragraph/paragraph-extension.css';
import '@courseroad/kurume-ui/editor/styles/markdown-editor.css';

import { useEffect } from 'react';

import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { MarkdownEditorToolbar } from '@courseroad/kurume-ui/editor';
import { CodeBlockShikiWithNodeView } from '@courseroad/kurume-ui/editor/components/extensions/code-block/code-block-shiki-extension';
import { HorizontalRule } from '@courseroad/kurume-ui/editor/components/extensions/horizontal-rule/horizontal-rule-extension';
import { cn } from '@courseroad/kurume-ui/utils/cn';

export interface QuizMarkdownEditorProps {
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
}

export function QuizMarkdownEditor({ onChange, placeholder, value }: QuizMarkdownEditorProps) {
  const editor = useEditor({
    content: value || '',
    editorProps: {
      attributes: {
        'aria-label': placeholder || 'Editor',
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        class: 'markdown-editor'
      }
    },
    extensions: [
      StarterKit.configure({
        code: {
          HTMLAttributes: { spellcheck: 'false' }
        },
        codeBlock: false,
        horizontalRule: false,
        link: {
          enableClickSelection: true,
          openOnClick: false
        }
      }),
      HorizontalRule,
      CodeBlockShikiWithNodeView,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    shouldRerenderOnTransaction: false
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      const id = setTimeout(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(value);
        }
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [editor, value]);

  return (
    <div
      className={cn(
        'markdown-editor flex w-full min-w-0 flex-col overflow-hidden rounded-md',
        'border border-input bg-transparent dark:bg-input/30',
        'shadow-xs transition-[color,box-shadow] outline-none',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50'
      )}
    >
      <EditorContext.Provider value={{ editor }}>
        <MarkdownEditorToolbar className='markdown-editor-toolbar rounded-t-md border-b border-input bg-muted/50 dark:bg-input/30' />
        <EditorContent
          className='markdown-editor-content px-3 py-2 text-base md:text-sm'
          editor={editor}
          role='presentation'
        />
      </EditorContext.Provider>
    </div>
  );
}
