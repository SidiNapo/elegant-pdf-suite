import { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon,
  Image as ImageIcon, Heading2, Heading3, Heading4, Pilcrow, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/imageUtils';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={`p-2 rounded-lg transition-colors disabled:opacity-40 ${
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const isUploadingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] }, // no H1 in the body
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. loading an existing post) into the editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL du lien', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !editor || isUploadingRef.current) return;

      const alt = window.prompt(
        'Texte alternatif de l\'image (obligatoire pour le SEO et l\'accessibilité)'
      );
      if (!alt || !alt.trim()) {
        toast.error('Le texte alternatif est obligatoire');
        return;
      }

      isUploadingRef.current = true;
      const toastId = toast.loading('Téléchargement de l\'image...');
      try {
        const compressed = await compressImage(file, 1200, 0.7);
        const filePath = `posts/${Date.now()}.jpg`;
        const { error } = await supabase.storage
          .from('blog-images')
          .upload(filePath, compressed, { contentType: 'image/jpeg' });
        if (error) throw error;

        const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);

        // Determine natural dimensions for width/height attributes
        const dims = await new Promise<{ w: number; h: number }>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve({ w: 1200, h: 630 });
          img.src = data.publicUrl;
        });

        editor
          .chain()
          .focus()
          .setImage({
            src: data.publicUrl,
            alt: alt.trim(),
            // @ts-expect-error tiptap image supports arbitrary HTML attributes
            width: dims.w,
            height: dims.h,
            loading: 'lazy',
            decoding: 'async',
          })
          .run();
        toast.success('Image insérée', { id: toastId });
      } catch (err) {
        toast.error('Erreur lors du téléchargement', { id: toastId });
      } finally {
        isUploadingRef.current = false;
      }
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2 bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
          title="Paragraphe"
        >
          <Pilcrow className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Titre H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Titre H3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          active={editor.isActive('heading', { level: 4 })}
          title="Titre H4"
        >
          <Heading4 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Lien">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <label
          className="p-2 rounded-lg transition-colors hover:bg-muted text-foreground cursor-pointer"
          title="Insérer une image"
        >
          <input type="file" accept="image/*" onChange={insertImage} className="hidden" />
          {isUploadingRef.current ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </label>
      </div>

      {/* Editor surface (prose styles so headings look like headings) */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-foreground
          prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
          prose-p:text-foreground/85
          prose-a:text-primary prose-a:underline
          prose-strong:text-foreground
          prose-ul:list-disc prose-ol:list-decimal prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:italic
          prose-img:rounded-xl"
      />
    </div>
  );
};

export default RichTextEditor;
