/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { Layout } from './components/Layout';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Chat } from './screens/Chat';
import { Tools } from './screens/Tools';
import { Settings } from './screens/Settings';
import { LoadingAdaptation } from './screens/LoadingAdaptation';

function AppContent() {
  const { currentScreen } = useAppContext();

  return (
    <Layout>
      {currentScreen === 'onboarding' && <Onboarding />}
      {currentScreen === 'loading-adaptation' && <LoadingAdaptation />}
      {currentScreen === 'home' && <Home />}
      {currentScreen === 'chat' && <Chat />}
      {currentScreen === 'tools' && <Tools />}
      {currentScreen === 'settings' && <Settings />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

