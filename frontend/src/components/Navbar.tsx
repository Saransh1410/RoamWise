import React from 'react';
import { Compass, BookmarkCheck, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  onNewTrip?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewTrip }) => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Editorial Title */}
        <Link to="/" className="flex items-center space-x-3 group text-decoration-none">
          <div className="w-11 h-11 rounded-full bg-[#FAF0EB] border border-[#E8D4C8] flex items-center justify-center text-[#C85A32] shadow-sm group-hover:bg-[#C85A32] group-hover:text-white transition-all duration-300">
            <Compass className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] group-hover:text-[#C85A32] transition-colors">
              ROAMWISE
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#78716C] font-semibold -mt-1">
              Editorial Travel Journal &bull; AI Edition
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-[#1C1917] text-white'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE9]'
            }`}
          >
            Curate Journey
          </Link>
          <Link
            to="/saved"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/saved'
                ? 'bg-[#1C1917] text-white'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EFE9]'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>My Journeys</span>
          </Link>
        </nav>

        {/* Right Action */}
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            onClick={onNewTrip}
            className="inline-flex items-center space-x-2 bg-[#C85A32] hover:bg-[#A9421C] text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
