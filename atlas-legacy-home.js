// The old shared homepage can also be served directly from the source tree.
if (location.origin === 'https://team-jura-atlas-preview.pages.dev' &&
    ['/', '/index', '/index.html'].includes(location.pathname)) {
  location.replace('https://gtae-online.pages.dev/' + location.search + location.hash);
}
