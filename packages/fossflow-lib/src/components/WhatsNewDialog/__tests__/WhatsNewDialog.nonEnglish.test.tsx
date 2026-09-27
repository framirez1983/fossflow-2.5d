import React from 'react';
import { render, screen } from '@testing-library/react';
import * as uiStateStoreModule from 'src/stores/uiStateStore';
import { WhatsNewDialog } from '../WhatsNewDialog';
import { LocaleProvider } from 'src/stores/localeStore';
import enUS from 'src/i18n/en-US';
import esES from 'src/i18n/es-ES';
import { DialogTypeEnum } from 'src/types/ui';

jest.mock('src/stores/uiStateStore');

const WHATS_NEW_KEY = 'fossflow-whats-new-shown';

let mockDialog: string | null = null;
let mockSetDialog: jest.Mock;

beforeEach(() => {
  localStorage.clear();
  mockDialog = null;
  mockSetDialog = jest.fn();
  (uiStateStoreModule.useUiStateStore as jest.Mock).mockImplementation(
    (selector: any) =>
      selector({ dialog: mockDialog, actions: { setDialog: mockSetDialog } })
  );
});

const open = (locale: typeof enUS) => {
  mockDialog = DialogTypeEnum.WHATS_NEW;
  return render(
    <LocaleProvider locale={locale}>
      <WhatsNewDialog />
    </LocaleProvider>
  );
};

describe("What's New under a non-English locale", () => {
  it('renders without crashing when the locale lacks the namespace', () => {
    expect(esES.whatsNew).toBeUndefined();
    expect(() => open(esES)).not.toThrow();
  });

  it('falls back to the English content and keeps the signature', () => {
    open(esES);
    expect(
      screen.getByText("What's New in FossFLOW 2.5D v1.0.0")
    ).toBeInTheDocument();
    expect(screen.getByText('\u2014Fernando')).toBeInTheDocument();
  });

  it('auto-opens for a non-English locale on a fresh profile', () => {
    mockDialog = null;
    render(
      <LocaleProvider locale={esES}>
        <WhatsNewDialog />
      </LocaleProvider>
    );
    expect(mockSetDialog).toHaveBeenCalledWith(DialogTypeEnum.WHATS_NEW);
  });

  it('does not re-announce after being closed', () => {
    localStorage.setItem(WHATS_NEW_KEY, '1.0.0');
    mockDialog = null;
    render(
      <LocaleProvider locale={esES}>
        <WhatsNewDialog />
      </LocaleProvider>
    );
    expect(mockSetDialog).not.toHaveBeenCalled();
  });

  it('keeps the English signature identical to en-US', () => {
    expect(enUS.whatsNew.signature).toBe('\u2014Fernando');
  });
});
