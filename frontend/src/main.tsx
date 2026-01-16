import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// REDUX IMPORTS
import { Provider } from 'react-redux';
import { store } from './store/store.ts';

/**
 * Application entry point.
 * 
 * Initializes the React application by rendering the root App component
 * wrapped in React StrictMode for development checks and Redux Provider
 * for state management.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     {/* Wrap App in Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)