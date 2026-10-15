import * as React from "react";

export type IconName = "home" | "message" | "file-text" | "package" | "truck" | "receipt" | "users" | "wallet" | "tag" | "boxes" | "cart" | "chart" | "settings" | "search" | "bell" | "chevron-left" | "chevron-right" | "chevron-down" | "calendar" | "plus" | "check" | "x" | "alert-triangle" | "alert-circle" | "info" | "check-circle" | "clock" | "pencil" | "trash" | "send" | "download" | "eye" | "more" | "loader" | "panel-left" | "panel-right" | "trending-up" | "trending-down" | "minus" | "inbox";

export interface IconProps { name: IconName; size?: 16 | 20 | 24 | number; strokeWidth?: number; title?: string; className?: string; }

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = acción principal (una por vista) · secondary · tertiary = texto · destructive */
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "s" | "m";
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  /** Solo para documentar estados en previews. */
  demoState?: "hover" | "active";
}

export interface InputProps {
  kind?: "text" | "search" | "select" | "date" | "money";
  label?: string;
  helper?: string;
  /** Mensaje de error: se muestra con ícono y reemplaza al helper. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string | number;
  options?: Array<string | { value: string; label: string }>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  id?: string;
  demoState?: "focus";
}

export interface StatusBadgeProps {
  status: "borrador" | "enviado" | "aceptado" | "rechazado" | "vencido" | "pagado" | "deuda-vencida" | "stock-bajo";
  children?: React.ReactNode;
}

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  /** Variación ya formateada: "10,2 %" */
  delta?: string;
  deltaLabel?: string;
  trend?: "up" | "down" | "flat";
  /** Si la variación es buena. Por defecto, subir es bueno. */
  positive?: boolean;
  icon?: IconName;
}

export interface DataTableColumn<R> { key: string; label: string; align?: "left" | "right"; width?: string | number; render?: (row: R) => React.ReactNode; }
export interface DataTableAction { label: string; icon: IconName; danger?: boolean; onClick?: () => void; }
export interface DataTableProps<R = any> {
  title?: string;
  overline?: string;
  headerAction?: React.ReactNode;
  caption?: string;
  columns: DataTableColumn<R>[];
  rows: R[];
  rowActions?: (row: R) => DataTableAction[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  pagination?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  emptyIcon?: IconName;
  emptyAction?: React.ReactNode;
}

export interface SidebarItem { id: string; label: string; icon: IconName; href?: string; count?: number; }
export interface SidebarProps {
  groups?: Array<{ label: string; items: SidebarItem[] }>;
  active?: string;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  onNavigate?: (id: string) => void;
  /** Logo negativo (sobre ink-black). Por defecto, el archivo del sistema. */
  logoSrc?: string;
  isotipoSrc?: string;
}

export interface TopbarProps {
  title: string;
  overline?: string;
  searchPlaceholder?: string;
  notifications?: number;
  user?: { name: string; role: string; initials: string };
}

export interface ToastProps { tone?: "success" | "warning" | "error" | "info"; title: string; children?: React.ReactNode; action?: React.ReactNode; onClose?: (() => void) | false; }
export interface AlertProps { tone?: "success" | "warning" | "error" | "info"; title?: string; children?: React.ReactNode; action?: React.ReactNode; }

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Dibuja el modal dentro de su contenedor (previews). */
  inline?: boolean;
}

export interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  label?: string;
}

export declare const Button: React.FC<ButtonProps>;
export declare const Input: React.FC<InputProps>;
export declare const StatusBadge: React.FC<StatusBadgeProps>;
export declare const KpiCard: React.FC<KpiCardProps>;
export declare const DataTable: React.FC<DataTableProps>;
export declare const Sidebar: React.FC<SidebarProps>;
export declare const Topbar: React.FC<TopbarProps>;
export declare const Toast: React.FC<ToastProps>;
export declare const Alert: React.FC<AlertProps>;
export declare const ConfirmModal: React.FC<ConfirmModalProps>;
export declare const Tabs: React.FC<TabsProps>;
export declare const Icon: React.FC<IconProps>;
/** 1234567.89 → "1.234.567,89" */
export declare function formatARS(n: number): string;
