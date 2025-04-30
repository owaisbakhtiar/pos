const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver options for problematic modules
config.resolver.extraNodeModules = {
  '@react-native-picker/picker': require.resolve('@react-native-picker/picker'),
};

// Resolver aliases for specific modules
config.resolver.alias = {
  "./PickerIOS": "./Picker",
};

module.exports = config; 