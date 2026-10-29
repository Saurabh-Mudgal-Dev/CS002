const base =
  "inline-flex items-center rounded-full border font-medium transition-colors";

const sizes = {
  sm: "px-2 py-0.5 text-[10px] tracking-wide",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-xs font-semibold",
};

const variants = {
  default: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400",
  primary: "border-blue-200/80 bg-blue-50/90 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  accent: "border-blue-200/80 bg-blue-50/90 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
  info: "border-sky-200/80 bg-sky-50/90 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300",
  success: "border-emerald-200/80 bg-emerald-50/90 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "border-amber-200/80 bg-amber-50/90 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "border-rose-200/80 bg-rose-50/90 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
  neutral: "border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};

export default function Badge({
  children,
  className = "",
  variant = "default",
  size = "md"
}) {
  const sizeClass = sizes[size] || sizes.md;
  const variantClass = variants[variant] || variants.default;

  return (
    <span className={`${base} ${sizeClass} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
