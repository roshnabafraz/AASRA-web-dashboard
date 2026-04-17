import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Reports from './pages/Reports';
import Donations from './pages/Donations';
import Volunteers from './pages/Volunteers';
import Victims from './pages/Victims';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="donations" element={<Donations />} />
            <Route path="volunteers" element={<Volunteers />} />
            <Route path="victims" element={<Victims />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
