import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import ExploreEvents from './pages/ExploreEvents';
import CulturalCalendar from './pages/CulturalCalendar';
import EventDetails from './pages/EventDetails';
import SubmitEvent from './pages/SubmitEvent';
import CityDiscovery from './pages/CityDiscovery';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs">Checking authorization...</div>;
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-heritage-ivory text-heritage-charcoal">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExploreEvents />} />
              <Route path="/calendar" element={<CulturalCalendar />} />
              <Route path="/events/:idOrSlug" element={<EventDetails />} />
              <Route path="/submit" element={<SubmitEvent />} />
              <Route path="/cities/:citySlug" element={<CityDiscovery />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
