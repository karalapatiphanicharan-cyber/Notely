import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Terminal,
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 border-b border-gray-100 pb-4 dark:border-gray-900">
      <div className="flex items-center gap-1 mr-2 border-r border-gray-100 pr-2 dark:border-gray-900">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('bold') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('italic') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('underline') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('strike') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 mr-2 border-r border-gray-100 pr-2 dark:border-gray-900">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('heading', { level: 1 }) && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('heading', { level: 2 }) && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('heading', { level: 3 }) && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 mr-2 border-r border-gray-100 pr-2 dark:border-gray-900">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('bulletList') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('orderedList') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 mr-2 border-r border-gray-100 pr-2 dark:border-gray-900">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('blockquote') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('code') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('codeBlock') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Terminal className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive('link') && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100")}
          onClick={addLink}
          title="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export function RichTextEditor({ content, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-md bg-gray-50 p-4 font-mono text-sm dark:bg-gray-900',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Markdown,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      onChange((editor as unknown as { getMarkdown: () => string }).getMarkdown());
    },
    editable: !disabled,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="h-full prose dark:prose-invert max-w-none prose-slate focus:outline-none"
        />
      </div>
    </div>
  );
}
