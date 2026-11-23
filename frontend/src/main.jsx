// Entry point: connect Amplify to our Cognito user pool, then show the app.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './styles.css';
import App from './App.jsx';

// The values come from the .env file (see .env.example). They are not secrets.
// Amplify reads the region from the user pool id ("eu-north-1_..."),
// VITE_REGION is only shown on the About page.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: { email: true },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
