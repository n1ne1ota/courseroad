import type { CollisionDetection, KeyboardCoordinateGetter } from '@dnd-kit/core';

import { closestCorners } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/** Module drags must not target their nested lessons. */
export const curriculumCollision: CollisionDetection = args =>
    closestCorners({
        ...args,
        droppableContainers:
            args.active.data.current?.type === 'Module'
                ? args.droppableContainers.filter(container => container.data.current?.type === 'Module')
                : args.droppableContainers
    });

export const curriculumKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
    if (args.context.active?.data.current?.type !== 'Module') return sortableKeyboardCoordinates(event, args);
    const moduleIds = new Set(
        args.context.droppableContainers
            .getEnabled()
            .filter(container => container.data.current?.type === 'Module')
            .map(container => container.id)
    );
    return sortableKeyboardCoordinates(event, {
        ...args,
        context: {
            ...args.context,
            droppableRects: new Map([...args.context.droppableRects].filter(([id]) => moduleIds.has(id)))
        }
    });
};
