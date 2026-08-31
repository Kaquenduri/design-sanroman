/** @type {import('next').NextConfig} */

// GitHub Pages sirve el sitio bajo /<nombre-del-repo>, así que la exportación
// estática necesita basePath. En desarrollo no aplica nada de esto: `npm run
// dev` sigue corriendo en la raíz como siempre.
const isPages = process.env.GITHUB_PAGES === 'true';
const repo = 'design-sanroman';

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: 'export',
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

module.exports = nextConfig;
