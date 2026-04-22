/* Layout.tsx — thin shell wrapper kept for backward compatibility */
/* All header/footer logic has moved into App.tsx */

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
