import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider, useStoreState, useActions } from 'unistore-hooks';

import dayjs from '@app/vendor/dayjs';
import { Loader } from '@app/theme';
import { store, actions } from '@app/store';
import { State } from '@app/store/types';
import Onboarding from '@comp/Onboarding/Onboarding';
import Portal from '@comp/Portal/Portal';
import { Logo } from '@app/theme';

import { doSignIn } from '@app/authentication/actions';
import { fetchUser } from '@app/authentication/network';

import './App.css';

const App = () => {
  const [appInit, setAppInit] = React.useState<boolean>(false);

  const { intl, identity }: State = useStoreState(['intl', 'identity']);
  const { setIdentity, updateNotifications } = useActions(actions);

  React.useEffect(() => {
    doSignIn()
      .then(() =>
        fetchUser()
          .then(identity => {
            setIdentity(identity);
            setAppInit(true);
          })
          .catch(() => setAppInit(true))
      )
      .catch(() => setAppInit(true));
  }, []);

  // todo: check for "lang" cookie and load language if not en

  return (
    <IntlProvider locale={intl.locale} messages={intl.messages}>
      <div className="app" lang={intl.locale}>
        <Logo className="app__logo" />
        {appInit ? (
          identity ? (
            <Portal className="app__content app__content--portal" />
          ) : (
            <Onboarding className="app__content app__content--onboarding" />
          )
        ) : (
          <Loader className="app__loader" />
        )}
      </div>
    </IntlProvider>
  );
};

ReactDOM.render(
  <Provider value={store}>
    <App />
  </Provider>,
  document.querySelector('#app')
);
