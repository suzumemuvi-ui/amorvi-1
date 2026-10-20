/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

(globalThis).__API_BASE_URL__ = 'https://amorvi.fly.dev';
(globalThis).__APP_ENV__ = 'production';

AppRegistry.registerComponent(appName, () => App);
