import { Outlet } from 'react-router-dom';
import { CurrentAppProvider } from '@openedx/frontend-base';

import { appId } from './constants';
import {
  registerIcons,
} from './common-components';

import './style.scss';

registerIcons();

const Main = () => (
  <CurrentAppProvider appId={appId}>
    <Outlet />
  </CurrentAppProvider>
);

export default Main;
