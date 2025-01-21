import { jsx as _jsx } from "react/jsx-runtime";
import { useDraggable } from '@dnd-kit/core';
export function Draggable({ id, children }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
    return (_jsx("div", { ref: setNodeRef, style: style, ...listeners, ...attributes, children: children }));
}
