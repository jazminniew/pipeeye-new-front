import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'   
// Mantine
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // ¡importá los estilos!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
