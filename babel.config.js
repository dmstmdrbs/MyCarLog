module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './src',
            '@shared': './src/shared',
            '@features': './src/features',
            '@pages': './src/pages',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@styles': './src/styles',
            'tailwind.config': './tailwind.config.js',
            'global.css': './global.css',
          },
        },
      ],
    ],
  };
};
