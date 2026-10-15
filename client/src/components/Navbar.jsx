import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Calendar, MapPin, PlusCircle, ShieldCheck, User as UserIcon, LogOut, Menu, X, Search, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { lang, setLanguage, t, availableLanguages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-heritage-ivory/95 backdrop-blur-md border-b border-heritage-gold/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-heritage-maroon to-heritage-indigo flex items-center justify-center text-heritage-gold shadow-md group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif-title text-2xl font-bold tracking-tight text-heritage-maroon block leading-none">
                Utsav Darshan
              </span>
              <span className="text-xs tracking-wider uppercase text-heritage-mutedGold font-semibold block mt-1">
                {t('brandSubtitle')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-sm font-medium text-heritage-charcoal hover:text-heritage-maroon transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-heritage-saffron" />
              {t('exploreEvents')}
            </Link>
            <Link to="/calendar" className="text-sm font-medium text-heritage-charcoal hover:text-heritage-maroon transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-heritage-saffron" />
              {t('culturalCalendar')}
            </Link>
            <Link to="/cities/bengaluru" className="text-sm font-medium text-heritage-charcoal hover:text-heritage-maroon transition-colors flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-heritage-saffron" />
              {t('cities')}
            </Link>
            <Link to="/submit" className="text-sm font-medium text-heritage-charcoal hover:text-heritage-maroon transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-heritage-maroon" />
              {t('shareFestival')}
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-heritage-indigo bg-heritage-indigo/10 px-3 py-1.5 rounded-full hover:bg-heritage-indigo/20 transition-colors flex items-center gap-1.5 border border-heritage-indigo/30">
                <ShieldCheck className="w-4 h-4 text-heritage-indigo" />
                {t('adminModeration')}
              </Link>
            )}
          </nav>

          {/* Right Action / Auth & Language Selector */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-heritage-cream px-2 py-1 rounded-full border border-heritage-gold/30 text-xs">
              <Globe className="w-3.5 h-3.5 text-heritage-saffron" />
              <select
                value={lang}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-medium text-heritage-charcoal focus:outline-none cursor-pointer"
              >
                {availableLanguages.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-sm font-medium text-heritage-charcoal hover:text-heritage-maroon bg-heritage-cream px-3 py-1.5 rounded-full border border-heritage-gold/30"
                >
                  <UserIcon className="w-4 h-4 text-heritage-saffron" />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-heritage-charcoal/70 hover:text-heritage-maroon rounded-full hover:bg-heritage-cream transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-heritage-maroon hover:text-heritage-darkMaroon px-3 py-1.5 rounded-md transition-colors"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-heritage-maroon text-heritage-ivory px-4 py-2 rounded-full hover:bg-heritage-darkMaroon shadow-sm transition-all hover:shadow"
                >
                  {t('joinCommunity')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-heritage-charcoal hover:text-heritage-maroon focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-heritage-cream border-b border-heritage-gold/30 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-heritage-charcoal hover:text-heritage-maroon"
          >
            Explore Events
          </Link>
          <Link
            to="/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-heritage-charcoal hover:text-heritage-maroon"
          >
            Cultural Calendar
          </Link>
          <Link
            to="/cities/bengaluru"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-heritage-charcoal hover:text-heritage-maroon"
          >
            City Discoveries
          </Link>
          <Link
            to="/submit"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-heritage-maroon font-semibold"
          >
            + Share Your Festival
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-heritage-indigo font-semibold"
            >
              Admin Moderation Center
            </Link>
          )}

          <div className="pt-4 border-t border-heritage-gold/20 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-base font-medium text-heritage-charcoal flex items-center gap-2"
                >
                  <UserIcon className="w-5 h-5 text-heritage-saffron" />
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-base font-medium text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium border border-heritage-maroon text-heritage-maroon rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium bg-heritage-maroon text-heritage-ivory rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
