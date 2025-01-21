import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './ClinicalNotes.module.css';
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }
    return (_jsxs("div", { className: styles.menuBar, children: [_jsx("button", { onClick: () => editor.chain().focus().toggleBold().run(), className: editor.isActive('bold') ? styles.isActive : '', type: "button", children: "bold" }), _jsx("button", { onClick: () => editor.chain().focus().toggleItalic().run(), className: editor.isActive('italic') ? styles.isActive : '', type: "button", children: "italic" }), _jsx("button", { onClick: () => editor.chain().focus().toggleBulletList().run(), className: editor.isActive('bulletList') ? styles.isActive : '', type: "button", children: "bullet list" }), _jsx("button", { onClick: () => editor.chain().focus().toggleOrderedList().run(), className: editor.isActive('orderedList') ? styles.isActive : '', type: "button", children: "ordered list" }), _jsx("button", { onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), className: editor.isActive('heading', { level: 3 }) ? styles.isActive : '', type: "button", children: "h3" })] }));
};
export const ClinicalNotes = () => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Add your clinical observations here...',
            }),
        ],
        content: `
      <h3>Clinical Observations</h3>
      <p>Use this space to document important observations, assessments, and notes about the patient.</p>
    `,
        editorProps: {
            attributes: {
                class: styles.editor,
            },
        },
    });
    return (_jsxs("div", { className: styles.notesContainer, children: [_jsx(MenuBar, { editor: editor }), _jsx(EditorContent, { editor: editor, className: styles.editorContent })] }));
};
