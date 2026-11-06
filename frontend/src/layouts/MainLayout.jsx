import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-sky-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
