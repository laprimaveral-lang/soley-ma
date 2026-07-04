import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CustomerAuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </CustomerAuthProvider>
  </React.StrictMode>
);
