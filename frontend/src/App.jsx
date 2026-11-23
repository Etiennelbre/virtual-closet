// The whole app: login screen, then a header, the current screen and a tab bar.
// No router: we simply remember which tab is open in "tab".
import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import ClosetScreen from './screens/ClosetScreen.jsx';
import AddScreen from './screens/AddScreen.jsx';
import OutfitScreen from './screens/OutfitScreen.jsx';
import FeedScreen from './screens/FeedScreen.jsx';
import PremiumScreen from './screens/PremiumScreen.jsx';
import AboutScreen from './screens/AboutScreen.jsx';

const TABS = [
  { id: 'closet', label: 'Closet', icon: '👚' },
  { id: 'add', label: 'Add', icon: '📷' },
  { id: 'outfit', label: 'Outfit', icon: '☀️' },
  { id: 'feed', label: 'Feed', icon: '👥' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
];

export default function App() {
  const [tab, setTab] = useState('closet');

  return (
    // Amplify's ready-made screen: sign up (with email code), sign in.
    // Our app is only shown once the user is logged in.
    <Authenticator loginMechanisms={['email']}>
      {({ signOut, user }) => (
        <div className="app">
          <header className="header">
            <h1>Virtual Closet</h1>
            <button className="link" onClick={() => setTab('premium')}>Premium</button>
            <button className="link" onClick={signOut}>Sign out</button>
          </header>

          <main className="screen">
            {tab === 'closet' && <ClosetScreen />}
            {tab === 'add' && <AddScreen onSaved={() => setTab('closet')} />}
            {tab === 'outfit' && <OutfitScreen />}
            {tab === 'feed' && <FeedScreen />}
            {tab === 'premium' && <PremiumScreen />}
            {tab === 'about' && <AboutScreen email={user?.signInDetails?.loginId} />}
          </main>

          <nav className="tabbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? 'tab active' : 'tab'}
                onClick={() => setTab(t.id)}
              >
                <span className="tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </Authenticator>
  );
}
