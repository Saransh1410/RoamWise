import React from 'react';
import { Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#E8E2D9] bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF0EB] border border-[#E8D4C8] flex items-center justify-center text-[#C85A32]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#1C1917]">
              ROAMWISE AI
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#78716C] block -mt-1 font-semibold">
              Volume I &bull; Autumn 2026 Edition
            </span>
          </div>
        </div>

        <p className="text-xs text-[#78716C] text-center md:text-left max-w-md">
          Crafted with care for discerning wanderers. Structured with FastAPI & Supabase PostgreSQL, designed with an editorial journal aesthetic.
        </p>

        <div className="flex items-center space-x-4 text-xs text-[#57534E]">
          <span className="editorial-stamp">Editorial Travel</span>
          <span>&copy; {new Date().getFullYear()} Roamwise</span>
        </div>
      </div>
    </footer>
  );
};
