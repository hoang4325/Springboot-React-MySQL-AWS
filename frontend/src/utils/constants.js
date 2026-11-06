export const PRIORITIES = {
  LOW: {
    value: 'LOW',
    label: 'Thấp',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  MEDIUM: {
    value: 'MEDIUM',
    label: 'Trung bình',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  HIGH: {
    value: 'HIGH',
    label: 'Cao',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
};

export const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chưa xong' },
  { value: 'COMPLETED', label: 'Đã xong' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'dueDate', label: 'Hạn chót' },
  { value: 'priority', label: 'Độ ưu tiên' },
  { value: 'title', label: 'Tiêu đề' },
];
