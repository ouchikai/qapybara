import { useState, useRef, useEffect, ClipboardEvent } from 'react';
import { X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImagesChange: (images: string[]) => void;
  placeholder?: string;
  rows?: number;
}

interface EmbeddedImage {
  id: string;
  url: string;
  file: File;
}

export function RichTextEditor({
  value,
  onChange,
  onImagesChange,
  placeholder = 'Enter description...',
  rows = 6,
}: RichTextEditorProps) {
  const [images, setImages] = useState<EmbeddedImage[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value to editor content
  useEffect(() => {
    if (!editorRef.current || document.activeElement === editorRef.current) return;

    const editor = editorRef.current;
    const currentText = editor.innerText;

    // Only update if the text content differs
    if (currentText !== value) {
      editor.innerHTML = '';
      renderContentInEditor(value);
    }
  }, [value, images]);

  const handlePaste = async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        // Create blob URL for preview
        const imageUrl = URL.createObjectURL(file);
        const imageId = `img-${Date.now()}-${i}`;

        // Add image to state
        const newImage: EmbeddedImage = {
          id: imageId,
          url: imageUrl,
          file,
        };

        setImages((prev) => {
          const updated = [...prev, newImage];
          onImagesChange(updated.map(img => img.file.name));
          return updated;
        });

        // Insert image at cursor position
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();

          // Create image element
          const imageContainer = document.createElement('div');
          imageContainer.className = 'relative inline-block my-2 group max-w-full';
          imageContainer.contentEditable = 'false';
          imageContainer.setAttribute('data-image-id', imageId);

          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Pasted image';
          img.className = 'max-w-full h-auto max-h-64 rounded border border-border';

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity';
          removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
          removeBtn.onclick = () => handleRemoveImage(imageId);

          imageContainer.appendChild(img);
          imageContainer.appendChild(removeBtn);

          // Insert line break before and after
          const beforeBr = document.createElement('br');
          const afterBr = document.createElement('br');

          range.insertNode(afterBr);
          range.insertNode(imageContainer);
          range.insertNode(beforeBr);

          // Move cursor after image
          range.setStartAfter(afterBr);
          range.setEndAfter(afterBr);
          selection.removeAllRanges();
          selection.addRange(range);

          // Update value
          updateValueFromEditor();
        }
      }
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== imageId);
      onImagesChange(updated.map(img => img.file.name));
      return updated;
    });

    // Remove image element from editor
    if (editorRef.current) {
      const imageEl = editorRef.current.querySelector(`[data-image-id="${imageId}"]`);
      if (imageEl) {
        imageEl.remove();
        updateValueFromEditor();
      }
    }
  };

  const updateValueFromEditor = () => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    let text = '';

    editor.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeName === 'BR') {
        text += '\n';
      } else if (node.nodeName === 'DIV') {
        const imageId = (node as HTMLElement).getAttribute('data-image-id');
        if (imageId) {
          text += `![image](${imageId})`;
        } else {
          text += (node as HTMLElement).innerText;
        }
        text += '\n';
      }
    });

    onChange(text.trim());
  };

  const renderContentInEditor = (content: string) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const parts = content.split(/(!\\[image\\]\\([^)]+\\))/);

    parts.forEach((part) => {
      const imageMatch = part.match(/!\[image\]\(([^)]+)\)/);

      if (imageMatch) {
        const imageId = imageMatch[1];
        const image = images.find((img) => img.id === imageId);

        if (image) {
          const imageContainer = document.createElement('div');
          imageContainer.className = 'relative inline-block my-2 group max-w-full';
          imageContainer.contentEditable = 'false';
          imageContainer.setAttribute('data-image-id', imageId);

          const img = document.createElement('img');
          img.src = image.url;
          img.alt = 'Pasted image';
          img.className = 'max-w-full h-auto max-h-64 rounded border border-border';

          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity';
          removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
          removeBtn.onclick = () => handleRemoveImage(imageId);

          imageContainer.appendChild(img);
          imageContainer.appendChild(removeBtn);
          editor.appendChild(imageContainer);
          editor.appendChild(document.createElement('br'));
        }
      } else if (part.trim()) {
        const textNode = document.createTextNode(part);
        editor.appendChild(textNode);
      }
    });
  };

  const handleInput = () => {
    updateValueFromEditor();
  };

  const showPlaceholder = !value && !isFocused;

  return (
    <div className="relative">
      {showPlaceholder && (
        <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-3 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm min-h-[150px] max-h-[400px] overflow-y-auto"
        style={{
          minHeight: `${rows * 1.5}rem`,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      />
      <div className="text-xs text-muted-foreground mt-2">
        Tip: Paste images (Ctrl+V / Cmd+V) directly into the editor
      </div>
    </div>
  );
}
