'use client';

import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { ThemeDefinition } from '@/lib/types';

interface ThemePickerProps {
  themes: ThemeDefinition[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string) => void;
  showPreview?: boolean;
  dense?: boolean;
  dark?: boolean;
}

export function ThemePicker({
  themes,
  selectedThemeId,
  onSelectTheme,
  showPreview = false,
  dense = false,
  dark = false,
}: ThemePickerProps) {
  const selectedTheme = themes.find((theme) => theme.id === selectedThemeId) ?? themes[0] ?? null;
  const selectedPalette = selectedTheme?.designSpecs.colorPalette ?? [];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: dense ? '1fr' : { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {themes.map((theme) => {
          const selected = theme.id === selectedThemeId;
          return (
            <Card
              key={theme.id}
              elevation={selected ? 7 : 0}
              sx={{
                bgcolor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.92)',
                border: '1px solid',
                borderColor: selected ? theme.designSpecs.colorPalette[0] ?? 'primary.main' : dark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.12)',
                color: dark ? '#fff' : '#0f172a',
                overflow: 'hidden',
              }}
            >
              <CardActionArea
                component="button"
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                aria-pressed={selected}
                sx={{ height: '100%', alignItems: 'stretch' }}
              >
                <CardContent sx={{ display: 'grid', gap: 1.25, p: dense ? 2 : 2.5 }}>
                  <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      {theme.name}
                    </Typography>
                    {selected ? <Chip label="Selected" size="small" color="primary" /> : null}
                  </Box>
                  <Typography variant="body2" sx={{ color: dark ? 'rgba(255,255,255,0.74)' : 'text.secondary' }}>
                    {theme.focus}
                  </Typography>
                  <ColorSwatches colors={theme.designSpecs.colorPalette} />
                  <Typography variant="caption" sx={{ color: dark ? 'rgba(255,255,255,0.62)' : 'text.secondary' }}>
                    {theme.designSpecs.lighting}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {showPreview && selectedTheme ? (
        <Box
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)',
            bgcolor: selectedPalette[2] ?? selectedPalette[0] ?? '#F8FAFC',
            color: readableTextColor(selectedPalette[2] ?? selectedPalette[0] ?? '#F8FAFC'),
            p: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: '0.18em' }}>
            Preview
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {selectedTheme.name}
          </Typography>
          <Typography variant="body2">
            {selectedTheme.designSpecs.texture} with {selectedTheme.designSpecs.lighting.toLowerCase()}.
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}

function ColorSwatches({ colors }: { colors: string[] }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.75 }}>
      {colors.map((color) => (
        <Box
          key={color}
          aria-label={color}
          sx={{
            bgcolor: color,
            border: '1px solid rgba(15,23,42,0.18)',
            borderRadius: '50%',
            height: 24,
            width: 24,
          }}
        />
      ))}
    </Box>
  );
}

function readableTextColor(hex: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#0f172a';
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? '#0f172a' : '#ffffff';
}
