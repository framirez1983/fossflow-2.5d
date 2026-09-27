import React from 'react';
import { render, screen } from '@testing-library/react';
import { LocaleProvider, useTranslation } from '../localeStore';
import { LocaleProps } from 'src/types/isoflowProps';
import enUS from 'src/i18n/en-US';
import esES from 'src/i18n/es-ES';

// Captures the `t` function produced by `useTranslation(namespace)` so the
// hook can be exercised without rendering a consumer component.
const capture = (namespace?: string) => {
  let t: (key: string) => string = () => '';
  const Probe = () => {
    const translation = useTranslation(namespace as never) as {
      t: (key: string) => string;
    };
    t = translation.t;
    return null;
  };
  render(
    <LocaleProvider locale={esES as LocaleProps}>
      <Probe />
    </LocaleProvider>
  );
  return t;
};

describe('localeStore namespace fallback', () => {
  it('does not throw for a namespace the active locale is missing', () => {
    // es-ES has no `whatsNew` namespace at all. Before the fallback this
    // threw "Cannot read properties of undefined (reading 'title')".
    expect(esES.whatsNew).toBeUndefined();
    expect(() => capture('whatsNew')).not.toThrow();
  });

  it('resolves a missing namespace from en-US', () => {
    const t = capture('whatsNew');
    expect(t('title')).toBe(enUS.whatsNew.title);
    expect(t('title')).toBe("What's New in FossFLOW 2.5D v{version}");
  });

  it('resolves the maintainer signature from the en-US fallback', () => {
    const t = capture('whatsNew');
    expect(t('signature')).toBe('—Fernando');
  });

  it('keeps existing translations from the active locale', () => {
    const t = capture('importHintTooltip');
    // Spanish, not the en-US string, and not the fallback.
    expect(t('title')).toBe('Importar diagramas');
    expect(t('title')).not.toBe(enUS.importHintTooltip.title);
  });

  it('returns the key for a missing key inside a known namespace', () => {
    const t = capture('lazyLoadingWelcome');
    expect(t('noSuchKey')).toBe('noSuchKey');
  });

  it('returns the key for a namespace present in neither locale', () => {
    const t = capture('noSuchNamespace');
    expect(t('title')).toBe('title');
  });

  it('still returns the key for a missing dotted path in global mode', () => {
    let t: (key: string) => string = () => '';
    const Probe = () => {
      t = useTranslation().t as unknown as (key: string) => string;
      return null;
    };
    render(
      <LocaleProvider locale={esES as LocaleProps}>
        <Probe />
      </LocaleProvider>
    );
    expect(t('whatsNew.title')).toBe('whatsNew.title');
  });
});
