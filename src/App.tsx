import React from 'react';
import { Redirect, Route, Switch } from 'wouter';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Wallet from './pages/Wallet';
import Prices from './pages/Prices';
import Exchange from './pages/Exchange';
import News from './pages/News';
import Referral from './pages/Referral';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import AdminPanel from './pages/AdminPanel';
import Markets from './pages/markets';
import { useAuth } from './_core/AuthContext';

function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();

  return (
    <Route path={path}>
      {isAuthenticated ? <Component /> : <Redirect to="/auth" />}
    </Route>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth" component={Auth} />

      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/trade" component={Trade} />
      <ProtectedRoute path="/wallet" component={Wallet} />
      <ProtectedRoute path="/prices" component={Prices} />
      <ProtectedRoute path="/exchange" component={Exchange} />
      <ProtectedRoute path="/news" component={News} />
      <ProtectedRoute path="/referral" component={Referral} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/shop" component={Shop} />
      <ProtectedRoute path="/admin" component={AdminPanel} />
      <ProtectedRoute path="/markets" component={Markets} />

      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
