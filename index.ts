import { registerRootComponent } from 'expo';

import App from './App';

// Entry point. While "Loading from ... index.ts" is shown, the bundle (this file + App + everything)
// is still downloading; no React code runs yet. As soon as the bundle has loaded, this runs and
// App → AppNavigator → IntroScreen. So the first screen our app renders is always IntroScreen
// (opening + loading). The native splash (purple) is shown during bundle load in built apps.
registerRootComponent(App);
