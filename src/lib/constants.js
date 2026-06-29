export const STATUSES = {
  planned: { label: 'Planned', color: 'slate' },
  in_progress: { label: 'In Progress', color: 'brand' },
  blocked: { label: 'Blocked', color: 'rose' },
  completed: { label: 'Completed', color: 'emerald' },
}

export const STATUS_ORDER = ['planned', 'in_progress', 'blocked', 'completed']

export const ROLES = {
  admin: { label: 'Admin', description: 'Manage everything' },
  manager: { label: 'Manager', description: 'Manage department items' },
  employee: { label: 'Employee', description: 'View and update assigned items' },
}

export function formatStatus(status) {
  return STATUSES[status]?.label ?? status
}

export function statusColor(status) {
  const colors = {
    planned: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300',
    in_progress: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  }
  return colors[status] ?? colors.planned
}

export function columnAccent(status) {
  const colors = {
    planned: 'border-t-slate-300 bg-white/50 dark:border-t-slate-600 dark:bg-slate-900/40',
    in_progress: 'border-t-indigo-400 bg-indigo-50/40 dark:border-t-indigo-500 dark:bg-indigo-950/30',
    blocked: 'border-t-rose-400 bg-rose-50/40 dark:border-t-rose-500 dark:bg-rose-950/30',
    completed: 'border-t-emerald-400 bg-emerald-50/40 dark:border-t-emerald-500 dark:bg-emerald-950/30',
  }
  return colors[status] ?? colors.planned
}

export function columnDot(status) {
  const colors = {
    planned: 'bg-slate-400',
    in_progress: 'bg-indigo-500',
    blocked: 'bg-rose-500',
    completed: 'bg-emerald-500',
  }
  return colors[status] ?? colors.planned
}

export const columnHeaderColor = columnAccent
