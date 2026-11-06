import React from 'react';
import { Layers, Database, Box } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Todo List Fullstack</span>
            <span>&bull;</span>
            <span>Java 21, Spring Boot 3.3, React 18, MySQL 8, Docker</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              REST API
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              Flyway Migration
            </span>
            <span className="flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-indigo-500" />
              Docker Multi-stage
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
