import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  ignores: ['generated/**'],
  rules: {
    // Match Prettier, which always self-closes void elements like <input />.
    'vue/html-self-closing': ['warn', { html: { void: 'always' } }],
  },
});
