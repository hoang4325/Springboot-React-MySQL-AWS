import React from 'react';
import { CheckSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Todo Master
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-semibold bg-sky-50 text-sky-700 rounded-md border border-sky-100">
                Spring Boot + React + MySQL
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sẵn sàng triển khai Docker & AWS</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
