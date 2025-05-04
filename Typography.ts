import { Platform } from 'react-native';

export default {
  sizes: {
    xs: 12,
    small: 14,
    medium: 16,
    large: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: Platform.select({ web: '400', default: '400' }),
    medium: Platform.select({ web: '500', default: '500' }),
    bold: Platform.select({ web: '700', default: '700' }),
  },
  families: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
};