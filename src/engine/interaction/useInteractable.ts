import { useEffect, useState } from 'react';
import { InteractableItem, globalInteractionRegistry } from './InteractionRegistry';

export function useInteractable(item: InteractableItem) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const id = item.id;
  const tabIndex = item.tabIndex;
  const [posX, posY, posZ] = item.position;
  const onHoverStart = item.onHoverStart;
  const onHoverEnd = item.onHoverEnd;

  useEffect(() => {
    const wrappedItem: InteractableItem = {
      ...item,
      onHoverStart: () => {
        setIsHovered(true);
        onHoverStart?.();
      },
      onHoverEnd: () => {
        setIsHovered(false);
        onHoverEnd?.();
      },
    };

    globalInteractionRegistry.register(wrappedItem);

    return () => {
      globalInteractionRegistry.unregister(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, posX, posY, posZ, tabIndex]);

  return {
    isHovered,
    activate: () => globalInteractionRegistry.activate(item.id),
  };
}
