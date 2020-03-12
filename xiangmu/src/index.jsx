import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import configureStore from './store/configureStore';
import Root from './containers/Root';
import './index.less';
//中文
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';


const store = configureStore();


render(
  <LocaleProvider locale={zhCN}>
    <AppContainer>
      <Root
        store={store}
      />
    </AppContainer>
  </LocaleProvider>,
  document.getElementById('root')
);
if (false && module.hot) {
  module.hot.accept('./containers/Root', () => {
    const RootContainer = require('./containers/Root');
    render(
      <LocaleProvider locale={zhCN}>
        <AppContainer>
          <RootContainer
            store={store}
          />
        </AppContainer>
      </LocaleProvider>,
      document.getElementById('root')
    );
  });
}
