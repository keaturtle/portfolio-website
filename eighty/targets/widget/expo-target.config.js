/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
// CommonJS only — this file runs in the config-plugin context (no ESM/TS).
module.exports = (config) => ({
  type: 'widget',
  name: 'EightyWidget',
  icon: '../../assets/images/icon.png',
  deploymentTarget: '17.0',
  frameworks: ['SwiftUI', 'WidgetKit'],
  colors: {
    // $accent tints widget edit controls; $widgetBackground is referenced by the system.
    $accent: '#7fdcb2',
    $widgetBackground: '#0d1411',
  },
  entitlements: {
    // Share the same App Group the app writes to (mirrors app.json ios.entitlements).
    'com.apple.security.application-groups':
      (config.ios &&
        config.ios.entitlements &&
        config.ios.entitlements['com.apple.security.application-groups']) || [
        'group.com.keatentuttle.eighty',
      ],
  },
});
