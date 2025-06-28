import { Provider as ReduxProvider } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { CurrentAppProvider } from '@openedx/frontend-base';

import { appId } from './constants';
import {
  registerIcons,
} from './common-components';
import configureStore from './data/configureStore';

import './sass/_style.scss';

registerIcons();

const Main = () => (
  <CurrentAppProvider appId={appId}>
    <ReduxProvider store={configureStore()}>
      <Outlet />
    </ReduxProvider>
  </CurrentAppProvider>
);

export default Main;
