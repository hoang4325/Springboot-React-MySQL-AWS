import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-rose-600 mb-6 shadow-inner">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h2>
      <p className="text-lg font-semibold text-slate-700 mt-2">Trang không tồn tại</p>
      <p className="text-sm text-slate-500 mt-1 max-w-md">
        Đường dẫn bạn yêu cầu không tìm thấy trên hệ thống Todo Master.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Về trang chủ</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
