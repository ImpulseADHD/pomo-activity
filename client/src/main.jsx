//client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

