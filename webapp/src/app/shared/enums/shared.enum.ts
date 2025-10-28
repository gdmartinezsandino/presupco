export const App = {
  LOADER: {
    MODES: {
      DETERMINATE: 'determinate',
      INDETERMINATE: 'indeterminate'
    },
    SIZES: {
      SMALL: 8,
      MEDIUM: 16,
      LARGE: 24,
    },
  }
} as const;

export type AppKeys = keyof typeof App;
export type AppValues = (typeof App)[AppKeys];
