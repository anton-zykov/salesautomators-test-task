import 'https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js';

(async function() {
  const sdk = await new AppExtensionsSDK().initialize();
})();