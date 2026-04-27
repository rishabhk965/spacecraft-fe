import { ThemeDefinition } from '@/lib/types';
import { DesignTheme } from './space-design.types';

export function mapThemeDefinitionToDesignTheme(theme: ThemeDefinition): DesignTheme {
  const swatches = theme.designSpecs.colorPalette;
  return {
    key: theme.key,
    name: theme.name,
    description: theme.focus,
    palette: {
      primary: swatches[0] ?? '#0F172A',
      secondary: swatches[1] ?? swatches[0] ?? '#E2E8F0',
      accent: swatches[2] ?? swatches[0] ?? '#14B8A6',
      wall: swatches[2] ?? swatches[1] ?? '#F8FAFC',
      floor: swatches[1] ?? swatches[0] ?? '#94A3B8',
      swatches,
    },
  };
}
