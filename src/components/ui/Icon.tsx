import {
  ArrowLeft, ArrowRight, Banknote, Bell, Building2, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, ChartNoAxesColumn, CircleAlert, CircleCheck, CircleHelp, ClipboardList, Clock, Copy, CreditCard,
  Download, Ellipsis, ExternalLink, Eye, FileSpreadsheet, FileText, Filter, Hash, House, Inbox, Info, Landmark,
  ListChecks, LoaderCircle, LogOut, Mail, MapPin, Menu, MessageSquare, Minus, Navigation, Package, PackageCheck,
  PanelLeftClose, PanelLeftOpen, Pencil, Percent, Phone, Play, Plus, Printer, Receipt, RefreshCw, RotateCcw, Route,
  ScanBarcode, Search, Send, ShieldCheck, ShoppingCart, SlidersHorizontal, Sparkles, Store, Tag, Trash2,
  TrendingDown, TrendingUp, TriangleAlert, Truck, Undo2, Upload, User, Users, Wallet, Wrench, X, Boxes,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Íconos de línea estilo Lucide (grilla 24, trazo 1,5, puntas redondeadas), como pide el kit.
 * Los nombres del kit (design/ui-kit/index.d.ts) se mantienen; se agregan los que necesita la app.
 */
const ICONOS = {
  // Kit
  home: House, message: MessageSquare, 'file-text': FileText, package: Package, truck: Truck, receipt: Receipt,
  users: Users, wallet: Wallet, tag: Tag, boxes: Boxes, cart: ShoppingCart, chart: ChartNoAxesColumn,
  settings: SlidersHorizontal, search: Search, bell: Bell, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'chevron-down': ChevronDown, calendar: Calendar, plus: Plus, check: Check, x: X, 'alert-triangle': TriangleAlert,
  'alert-circle': CircleAlert, info: Info, 'check-circle': CircleCheck, clock: Clock, pencil: Pencil, trash: Trash2,
  send: Send, download: Download, eye: Eye, more: Ellipsis, loader: LoaderCircle, 'panel-left': PanelLeftClose,
  'panel-right': PanelLeftOpen, 'trending-up': TrendingUp, 'trending-down': TrendingDown, minus: Minus, inbox: Inbox,
  // App
  'chevron-up': ChevronUp, 'arrow-left': ArrowLeft, 'arrow-right': ArrowRight, menu: Menu, 'log-out': LogOut,
  reset: RotateCcw, refresh: RefreshCw, 'map-pin': MapPin, phone: Phone, mail: Mail, printer: Printer, user: User,
  route: Route, sparkles: Sparkles, help: CircleHelp, external: ExternalLink, filter: Filter, copy: Copy,
  scan: ScanBarcode, banknote: Banknote, 'credit-card': CreditCard, bank: Landmark, 'list-checks': ListChecks,
  play: Play, upload: Upload, spreadsheet: FileSpreadsheet, building: Building2, percent: Percent, hash: Hash,
  store: Store, navigation: Navigation, 'package-check': PackageCheck, clipboard: ClipboardList, undo: Undo2,
  shield: ShieldCheck, wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONOS;

export interface IconProps {
  name: IconName;
  /** 16 (icono-s), 20 (icono-m) o 24 */
  size?: number;
  strokeWidth?: number;
  /** Si el ícono va solo y comunica algo, describilo acá. Si no, queda oculto para lectores de pantalla. */
  title?: string;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.5, title, className }: IconProps) {
  const Cmp = ICONOS[name] ?? Info;
  return (
    <Cmp
      className={cn('dl-icon', className)}
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={false}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    />
  );
}
