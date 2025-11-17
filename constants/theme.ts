/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#007AFF'; // Un azul vibrante, como en la imagen
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F0F2F5', // Un fondo gris muy claro
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: tintColorLight,
    card: '#FFFFFF', // Las tarjetas serán blancas
    border: '#D1D1D6', // Para los underlines de los inputs
    muted: '#AAAAAA', // Texto silenciado
    activeGreen: '#34C759', // Verde para el toggle
    link: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212', // Un fondo oscuro profundo, como en la imagen
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: tintColorLight, // El azul resalta bien en fondos oscuros
    card: '#1C1C1E', // Un gris oscuro para las tarjetas
    border: '#3A3A3C', // Para los underlines de los inputs
    muted: '#8E8E93', // Texto silenciado
    activeGreen: '#32D74B',
    link: tintColorLight,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
