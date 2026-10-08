import { useI18n } from "../../contexts/I18nContext";
import { cn } from "@/lib/utils";

const moduleColors = {
  event: {
    'planifiée': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-cours': 'bg-amber-100 text-amber-800 border-amber-200',
    'terminée': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'reportée': 'bg-orange-100 text-orange-800 border-orange-200',
    'annulée': 'bg-red-100 text-red-800 border-red-200',
  },
  task: {
    'créée': 'bg-blue-100 text-blue-800 border-blue-200',
    'assignée': 'bg-purple-100 text-purple-800 border-purple-200',
    'en-cours': 'bg-amber-100 text-amber-800 border-amber-200',
    'en-révision': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'terminée': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'annulée': 'bg-red-100 text-red-800 border-red-200',
  },
  membre: {
    'non-inscrit': 'bg-slate-100 text-slate-800 border-slate-200',
    'en-attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'actif': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'suspendu': 'bg-orange-100 text-orange-800 border-orange-200',
    'banni': 'bg-red-100 text-red-800 border-red-200',
    'refusé': 'bg-rose-100 text-rose-800 border-rose-200',
  },
  publication: {
    'créée': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'publiée': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'archivée': 'bg-rose-100 text-rose-800 border-rose-200',
    'supprimée': 'bg-red-100 text-red-800 border-red-200',
  },
  news: {
    'brouillon': 'bg-slate-100 text-slate-800 border-slate-200',
    'publiée': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'archivée': 'bg-rose-100 text-rose-800 border-rose-200',
  },
  document: {
    'brouillon': 'bg-slate-100 text-slate-800 border-slate-200',
    'en-attente': 'bg-amber-100 text-amber-800 border-amber-200',
    'approuvé': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'archivé': 'bg-rose-100 text-rose-800 border-rose-200',
    'supprimé': 'bg-red-100 text-red-800 border-red-200',
  },
  entretien: {
    'planifié': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-cours': 'bg-amber-100 text-amber-800 border-amber-200',
    'terminé': 'bg-slate-100 text-slate-800 border-slate-200',
    'accepté': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'rejeté': 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

const defaultColors = 'bg-gray-100 text-gray-800 border-gray-200';

export function StatusBadge({ status, module = 'event', className }) {
  const { translateStatus } = useI18n();
  const colorClass = moduleColors[module]?.[status] || defaultColors;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      colorClass,
      className
    )}>
      {translateStatus(status)}
    </span>
  );
}
