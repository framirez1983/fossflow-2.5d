import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { DialogTypeEnum } from 'src/types/ui';
import { useTranslation } from 'src/stores/localeStore';
// Display version for the What's New dialog
const APP_DISPLAY_VERSION = '1.0.0';

const WHATS_NEW_KEY = 'fossflow-whats-new-shown';

export const WhatsNewDialog = () => {
  const { t } = useTranslation('whatsNew');
  const dialog = useUiStateStore((state) => state.dialog);
  const setDialog = useUiStateStore((state) => state.actions.setDialog);

  const isOpen = dialog === DialogTypeEnum.WHATS_NEW;
  // Checked by default: this is a once-per-version announcement, so closing
  // it records the version unless the user explicitly opts out.
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WHATS_NEW_KEY, APP_DISPLAY_VERSION);
    }
    setDialog(null);
  };

  // First run for this version: announce the release once, automatically.
  // Only fires when nothing else is on screen so it cannot stack with another
  // central dialog. Opening it from Help > What's New always works, whether
  // or not it has already been announced.
  useEffect(() => {
    if (dialog !== null) return;
    if (localStorage.getItem(WHATS_NEW_KEY) === APP_DISPLAY_VERSION) return;
    setDialog(DialogTypeEnum.WHATS_NEW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {t('title').replace('{version}', APP_DISPLAY_VERSION)}
          </Typography>
          <Button
            onClick={handleClose}
            sx={{
              minWidth: 'auto',
              p: 1,
              bgcolor: 'transparent',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'transparent' },
              '&:focus': { bgcolor: 'transparent' },
              '&:active': { bgcolor: 'transparent' }
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent style={{ overflowY: 'auto', maxHeight: '70vh' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('intro')}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            {t('highlights')}
          </Typography>

          <Box sx={{ mb: 2, ml: 2 }}>
            {(
              [
                'rotatableViews',
                'multiView',
                'fossflowFormat',
                'serverStorage',
                'iconLibrary',
                'exportFidelity',
                'labelOpacity',
                'uiLayout'
              ] as const
            ).map((key, index) => (
              <Box key={key} sx={{ mb: 1.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Typography variant="h6" component="span" sx={{ minWidth: 30, color: 'primary.main', fontWeight: 700 }}>
                  {index + 1}.
                </Typography>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t(`${key}Title` as const)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t(`${key}Desc` as const)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>{t('noteTitle')}</strong> {t('noteDesc')}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              fontStyle: 'italic',
              fontWeight: 600,
              textAlign: 'right'
            }}
          >
            {t('signature')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              color="primary"
            />
          }
          label={t('dontShowAgain')}
        />
        <Button onClick={handleClose} variant="contained">
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};