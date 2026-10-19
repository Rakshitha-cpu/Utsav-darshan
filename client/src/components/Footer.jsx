import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Mail, Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-heritage-darkMaroon text-heritage-cream/90 pt-16 pb-12 border-t-4 border-heritage-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-heritage-gold/20">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full bg-heritage-saffron flex items-center justify-center text-heritage-darkMaroon">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif-title text-2xl font-bold text-heritage-ivory">Utsav Darshan</span>
            </div>
            <p className="text-xs text-heritage-cream/80 leading-relaxed">
              India's trusted community platform dedicated to documenting authentic temple festivals, jatras, classical arts, melas, and regional heritage across towns and cities.
            </p>
            <div className="pt-2 text-xs text-heritage-gold flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Verified & Moderated Cultural Listings
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif-title text-base font-semibold text-heritage-gold mb-4 uppercase tracking-wider text-xs">
              Explore Festivals
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore?city=Bengaluru" className="hover:text-heritage-saffron transition-colors">Bengaluru Celebrations</Link></li>
              <li><Link to="/explore?city=Mysuru" className="hover:text-heritage-saffron transition-colors">Mysuru Dasara Heritage</Link></li>
              <li><Link to="/explore?city=Mangaluru" className="hover:text-heritage-saffron transition-colors">Coastal Daivaradhane & Kambala</Link></li>
              <li><Link to="/explore?city=Kolkata" className="hover:text-heritage-saffron transition-colors">Kolkata Durga Puja</Link></li>
              <li><Link to="/explore?city=Chennai" className="hover:text-heritage-saffron transition-colors">Margazhi Classical Season</Link></li>
            </ul>
          </div>

          {/* Platform & Moderation */}
          <div>
            <h4 className="font-serif-title text-base font-semibold text-heritage-gold mb-4 uppercase tracking-wider text-xs">
              Community & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/submit" className="hover:text-heritage-saffron transition-colors">Submit an Event</Link></li>
              <li><Link to="/calendar" className="hover:text-heritage-saffron transition-colors">Cultural Calendar 2026-2027</Link></li>
              <li><a href="https://www.incredibleindia.gov.in/en" target="_blank" rel="noopener noreferrer" className="hover:text-heritage-saffron transition-colors flex items-center gap-1">Incredible India Portal ↗</a></li>
              <li><span className="text-heritage-cream/70">Tourist Helpline: Dial 1363</span></li>
              <li><span className="text-heritage-cream/70">Guidelines for Contributors</span></li>
            </ul>
          </div>

          {/* Academic & Reference Note */}
          <div className="space-y-3">
            <h4 className="font-serif-title text-base font-semibold text-heritage-gold mb-4 uppercase tracking-wider text-xs">
              Official Reference
            </h4>
            <p className="text-xs text-heritage-cream/70 leading-relaxed">
              Curated in alignment with Ministry of Tourism initiatives and Incredible India benchmarks.
            </p>
            <div className="bg-white/5 p-3 rounded-lg border border-heritage-gold/20 text-xs">
              <p className="font-semibold text-heritage-gold">Utsav Darshan Platform</p>
              <p className="text-heritage-cream/60 mt-1">Full-stack React, Node.js, Express & SQLite/MongoDB.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-heritage-cream/60">
          <p>© 2026 Utsav Darshan. Preserving and celebrating Indian cultural heritage with authentic curation.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
