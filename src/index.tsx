import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';

import './i18n';
import './index.css';
import App from './App';
import { store } from './redux/store';
import registerServiceWorker from './registerServiceWorker';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element with id "root".');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>,
);

registerServiceWorker();
