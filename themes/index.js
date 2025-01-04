import { baseTheme } from './base';

export const theme = baseTheme;

// You can add more theme variations here later
export const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
  },
}; 