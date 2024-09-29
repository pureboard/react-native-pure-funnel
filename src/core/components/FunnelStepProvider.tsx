import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * 각 퍼널의 focus 여부를 전달해주는 provider
 */
const FunnelContext = createContext({ focused: false });

export const useIsFunnelFocused = () => {
  const context = useContext(FunnelContext);
  return context.focused;
};

export const FunnelStepProvider = ({
  children,
  focused,
}: {
  children: ReactNode;
  focused: boolean;
}) => {
  const [funnelFocused, setFunnelFocused] = useState(focused);

  if (funnelFocused !== focused) {
    setFunnelFocused(focused);
  }

  return (
    <FunnelContext.Provider value={{ focused: funnelFocused }}>
      {children}
    </FunnelContext.Provider>
  );
};
