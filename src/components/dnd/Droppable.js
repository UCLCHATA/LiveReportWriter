import { jsx as _jsx } from "react/jsx-runtime";
import { useDroppable } from '@dnd-kit/core';
export function Droppable({ id, children }) {
    const { setNodeRef } = useDroppable({
        id,
    });
    return (_jsx("div", { ref: setNodeRef, children: children }));
}
