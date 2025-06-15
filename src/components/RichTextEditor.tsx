"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Strikethrough
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter the URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter the image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-white rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={addLink}
        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-100 text-[#800000]' : 'text-gray-600'}`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Add Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100 text-gray-600"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#800000] underline',
        },
      }),
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
} 