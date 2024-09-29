import { useRef } from 'react';

export const useIsFirstRender = () => {
  const renderRef = useRef(true);

  if (renderRef.current) {
    renderRef.current = false;
    return true;
  }

  return false;
};
