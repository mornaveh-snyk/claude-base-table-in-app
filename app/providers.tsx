'use client';

import { ReactNode } from 'react';
import { SavedViewsProvider } from '@/lib/saved-views-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SavedViewsProvider>
      {children}
    </SavedViewsProvider>
  );
}
