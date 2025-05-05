import { registerRootComponent } from 'expo';
import App from './App';

// Make sure any unhandled promise rejections show error messages
import { LogBox } from 'react-native-safe-area-context';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Register the app
registerRootComponent(App);
