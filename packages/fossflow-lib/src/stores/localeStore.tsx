import React, { createContext, useContext, ReactNode } from 'react';
import { LocaleProps } from '../types/isoflowProps';
import enUS from '../i18n/en-US';

const LocaleContext = createContext<LocaleProps>(enUS);

interface LocaleProviderProps {
  locale: LocaleProps;
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ locale, children }) => {
  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleProps => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Generic type helper for nested object access
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Overloaded useTranslation function
export function useTranslation(): {
  t: (key: NestedKeyOf<LocaleProps>) => string;
};

export function useTranslation<K extends keyof LocaleProps>(
  namespace: K
): {
  t: (key: keyof LocaleProps[K]) => string;
  };

export function useTranslation<K extends keyof LocaleProps>(namespace?: K) {
  const locale = useLocale();
  
  if (namespace) {
    // Return scoped translation function for specific namespace.
    // A locale can be missing a namespace that en-US defines (for example
    // `whatsNew`, which only exists in en-US). Resolve the namespace from
    // the active locale first, then fall back to en-US for that namespace
    // alone, so the rest of the locale keeps its own translations. Finally
    // fall back to an empty object so `t` returns the key instead of
    // throwing on a namespace that exists in neither.
    const namespaceData =
      (locale[namespace] as Record<string, unknown> | undefined) ??
      (enUS[namespace] as Record<string, unknown> | undefined) ??
      {};
    const t = (key: keyof LocaleProps[K]): string => {
      const value = namespaceData[key as string];
      return typeof value === 'string' ? value : String(key);
    };
    return { t };
  } else {
    // Return global translation function with dot notation
    const t = (key: NestedKeyOf<LocaleProps>): string => {
      const parts = key.split('.');
      let current: any = locale;
      
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return key; // Return key if path not found
        }
      }
      
      return typeof current === 'string' ? current : key;
    };
    return { t };
  }
}
