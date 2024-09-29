import { type DependencyList, useCallback, useRef } from 'react';

export const usePreservedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps?: DependencyList
) => {
  const ref = useRef<T>();
  ref.current = callback;

  return useCallback(
    (...args: Parameters<T>): ReturnType<T> => ref?.current?.(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps || []
  );
};
