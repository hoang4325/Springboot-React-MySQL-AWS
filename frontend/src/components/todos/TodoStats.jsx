import React from 'react';
import { ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatCard from '../common/StatCard';

export const TodoStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Tổng công việc"
        count={stats.total}
        icon={ListTodo}
        colorClass="text-sky-600"
        bgClass="bg-sky-50"
        subtitle="Toàn bộ nhiệm vụ trong hệ thống"
      />
      <StatCard
        title="Đã hoàn thành"
        count={stats.completed}
        icon={CheckCircle2}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
        subtitle={
          stats.total > 0
            ? `${Math.round((stats.completed / stats.total) * 100)}% tiến độ hoàn thành`
            : 'Chưa có công việc'
        }
      />
      <StatCard
        title="Đang thực hiện"
        count={stats.pending}
        icon={Clock}
        colorClass="text-amber-600"
        bgClass="bg-amber-50"
        subtitle="Cần tập trung giải quyết"
      />
      <StatCard
        title="Độ ưu tiên cao"
        count={stats.highPriority}
        icon={AlertTriangle}
        colorClass="text-rose-600"
        bgClass="bg-rose-50"
        subtitle="Công việc khẩn cấp"
      />
    </div>
  );
};

export default TodoStats;
