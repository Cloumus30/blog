import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface CalloutBoxProps {
  type?: 'info' | 'warning' | 'danger';
  text?: string;
  title?: string;
  children?: React.ReactNode;
}

export default function CalloutBox({ type = 'info', text, title, children }: CalloutBoxProps) {
  const configs = {
    info: {
      icon: Info,
      border: 'border-blue-500/30 dark:border-blue-500/40',
      bg: 'bg-blue-50/70 dark:bg-blue-950/30',
      text: 'text-blue-900 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      defaultTitle: 'Info / Catatan'
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/30 dark:border-amber-500/40',
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      text: 'text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400',
      defaultTitle: 'Peringatan'
    },
    danger: {
      icon: AlertCircle,
      border: 'border-rose-500/30 dark:border-rose-500/40',
      bg: 'bg-rose-50/70 dark:bg-rose-950/30',
      text: 'text-rose-900 dark:text-rose-200',
      iconColor: 'text-rose-600 dark:text-rose-400',
      defaultTitle: 'Perhatian Khusus'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div className={`my-5 p-4 rounded-xl border ${config.border} ${config.bg} flex gap-3.5 items-start`}>
      <IconComponent className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 text-sm leading-relaxed">
        {displayTitle && (
          <strong className={`block font-semibold mb-1 ${config.iconColor}`}>{displayTitle}</strong>
        )}
        <div className={config.text}>
          {children ? children : text}
        </div>
      </div>
    </div>
  );
}
