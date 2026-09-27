import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as uiStateStoreModule from 'src/stores/uiStateStore';
import { WhatsNewDialog } from '../WhatsNewDialog';
import { DialogTypeEnum } from 'src/types/ui';

const WHATS_NEW_KEY = 'fossflow-whats-new-shown';
const VERSION = '1.0.0';

let mockDialog: string | null = null;
let mockSetDialog: jest.Mock;

const setupStore = () => {
  mockSetDialog = jest.fn((next: string | null) => {
    mockDialog = next;
  });
  (uiStateStoreModule.useUiStateStore as jest.Mock).mockImplementation(
    (selector: any) =>
      selector({
        dialog: mockDialog,
        actions: { setDialog: mockSetDialog }
      })
  );
};

jest.mock('src/stores/uiStateStore');

const renderDialog = () => render(<WhatsNewDialog />);

describe('WhatsNewDialog first-run behaviour', () => {
  beforeEach(() => {
    localStorage.clear();
    mockDialog = null;
    setupStore();
  });

  it('opens automatically on a fresh profile', () => {
    renderDialog();
    expect(mockSetDialog).toHaveBeenCalledWith(DialogTypeEnum.WHATS_NEW);
  });

  it('does not auto-open again once the version has been announced', () => {
    localStorage.setItem(WHATS_NEW_KEY, VERSION);
    renderDialog();
    expect(mockSetDialog).not.toHaveBeenCalled();
  });

  it('does not auto-open when another dialog is already on screen', () => {
    mockDialog = DialogTypeEnum.HELP;
    renderDialog();
    expect(mockSetDialog).not.toHaveBeenCalled();
  });

  it('records the version on close so a reload does not reopen it', () => {
    localStorage.setItem(WHATS_NEW_KEY, VERSION);
    mockDialog = DialogTypeEnum.WHATS_NEW;
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(localStorage.getItem(WHATS_NEW_KEY)).toBe(VERSION);
  });

  it('leaves the dialog reopenable from the menu when not yet announced', () => {
    renderDialog();
    mockDialog = DialogTypeEnum.WHATS_NEW;
    renderDialog();
    expect(screen.getByText(/\u2014Fernando/)).toBeInTheDocument();
  });

  it('never renders the inherited Lazy Loading announcement', () => {
    renderDialog();
    expect(screen.queryByText(/New Feature: Lazy Loading/i)).toBeNull();
    expect(screen.queryByText('-Stan')).toBeNull();
  });
});
