// types/global.d.ts or a `.d.ts` file included in your library
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    /** Enables Growly workflow triggers */
    'data-growly'?: string;
  }
}
