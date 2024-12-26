import React, { useState, useRef, useEffect } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
    defaultText?: string;
    value: string;
    onChange: (value: string) => void;
    onExpand?: () => void;
    className?: string;
    placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    defaultText = '',
    value,
    onChange,
    onExpand,
    className = '',
    placeholder
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bulletPoint = '• ';

    useEffect(() => {
        if (!value && defaultText) {
            onChange(defaultText);
        }
    }, [defaultText, value, onChange]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            
            const textarea = event.currentTarget;
            const cursorPosition = textarea.selectionStart;
            const currentContent = textarea.value;
            
            const beforeCursor = currentContent.substring(0, cursorPosition);
            const afterCursor = currentContent.substring(cursorPosition);
            const currentLine = beforeCursor.split('\n').pop() || '';
            
            if (currentLine.trim() === bulletPoint.trim()) {
                // Remove bullet point from empty line
                const lastNewLine = beforeCursor.lastIndexOf('\n');
                const newContent = currentContent.substring(0, lastNewLine) + afterCursor;
                onChange(newContent);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = lastNewLine === -1 ? 0 : lastNewLine;
                });
            } else {
                // Add new line with bullet point
                const newContent = beforeCursor + '\n' + bulletPoint + afterCursor;
                onChange(newContent);
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = cursorPosition + bulletPoint.length + 1;
                });
            }
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        
        const textarea = event.currentTarget;
        const cursorPosition = textarea.selectionStart;
        const currentContent = textarea.value;
        
        let pastedContent = event.clipboardData.getData('text');
        
        pastedContent = pastedContent.split('\n').map(line => {
            line = line.trim();
            if (line && !line.startsWith(bulletPoint)) {
                return bulletPoint + line;
            }
            return line;
        }).join('\n');
        
        const beforeCursor = currentContent.substring(0, cursorPosition);
        const afterCursor = currentContent.substring(cursorPosition);
        const newContent = beforeCursor + pastedContent + afterCursor;
        
        onChange(newContent);
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPosition + pastedContent.length;
        });
    };

    const handleDoubleClick = () => {
        onExpand?.();
    };

    const startResize = (e: React.MouseEvent) => {
        setIsResizing(true);
        const startY = e.clientY;
        const startHeight = textareaRef.current?.getBoundingClientRect().height || 0;

        const handleMouseMove = (e: MouseEvent) => {
            if (!textareaRef.current) return;
            const delta = e.clientY - startY;
            const newHeight = Math.min(
                Math.max(startHeight + delta, 82),
                window.innerHeight * 0.8
            );
            textareaRef.current.style.height = `${newHeight}px`;
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className={`rich-text-editor ${className}`}>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDoubleClick={handleDoubleClick}
                placeholder={placeholder}
                className="editor-textarea"
            />
            <div 
                className="resize-handle"
                onMouseDown={startResize}
            >
                <i className="material-icons">drag_handle</i>
            </div>
        </div>
    );
}; 