process.env.NITRO_PORT = process.env.NITRO_PORT || process.env.PORT || '9999';
process.env.NITRO_HOST = process.env.NITRO_HOST || '127.0.0.1';

globalThis._importMeta_ = {
  url: import.meta.url,
  env: process.env,
};

await import('./.output/server/index.mjs');
