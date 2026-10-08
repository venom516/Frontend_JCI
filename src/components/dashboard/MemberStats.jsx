import { useMemo } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { useI18n } from "../../contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieIcon, Users } from "lucide-react";

const normalizeKey = (v) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

/**
 * Transforme une agrégation Mongo [{ _id, count }] en tranches de camembert.
 * Les valeurs inconnues ou vides sont regroupées sous "non renseigné".
 * La normalisation (casse / accents / espaces) est faite ici car le champ
 * "sexe" n'existait pas dans la base avant.
 */
export function buildRepartition(raw, buckets, videLabel, videFill) {
  const map = Object.fromEntries(buckets.map((b) => [b.key, { ...b, value: 0 }]));
  let reste = 0;
  (raw || []).forEach((row) => {
    const k = normalizeKey(row._id);
    const found = buckets.find((b) => k.startsWith(b.key));
    if (found) map[found.key].value += row.count;
    else reste += row.count;
  });
  const slices = buckets.map((b) => ({ ...map[b.key], name: b.label })).filter((s) => s.value > 0);
  if (reste > 0) slices.push({ name: videLabel, value: reste, fill: videFill });
  return slices;
}

const DonutCard = ({ icon, title, data, total, totalLabel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">—</p>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-52 w-full sm:w-1/2 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2} dataKey="value">
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-2">
              {data.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-semibold text-muted-foreground flex-shrink-0">
                    {entry.value} ({total ? Math.round((entry.value / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1 border-t">
                {total} {totalLabel}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Deux cercles : Hommes / Femmes et Étudiants / Professionnels.
 * Calculés sur les membres ACTIFS, donc cohérents avec la carte "Membres actifs".
 */
export default function MemberStats({ repartitionSexe, repartitionProfession, totalActifs }) {
  const { t } = useI18n();
  const totalLabel = t("dashboard.membres_actifs");

  const sexData = useMemo(() => buildRepartition(
    repartitionSexe,
    [
      { key: "homme", label: t("dashboard.hommes"), fill: "#3A67B1" },
      { key: "femme", label: t("dashboard.femmes"), fill: "#F43F5E" },
      { key: "autre", label: t("dashboard.autre_sexe"), fill: "#8B5CF6" },
    ],
    t("dashboard.non_renseigne"),
    "#94A3B8"
  ), [repartitionSexe, t]);

  const profData = useMemo(() => buildRepartition(
    repartitionProfession,
    [
      { key: "etudiant", label: t("dashboard.etudiants"), fill: "#06B6D4" },
      { key: "professionnel", label: t("dashboard.professionnels"), fill: "#F59E0B" },
    ],
    t("dashboard.autre_profession"),
    "#94A3B8"
  ), [repartitionProfession, t]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DonutCard
        icon={<Users className="h-5 w-5 text-rose-500" />}
        title={t("dashboard.repartition_hommes_femmes")}
        data={sexData}
        total={totalActifs}
        totalLabel={totalLabel}
      />
      <DonutCard
        icon={<PieIcon className="h-5 w-5 text-cyan-500" />}
        title={t("dashboard.repartition_profession")}
        data={profData}
        total={totalActifs}
        totalLabel={totalLabel}
      />
    </div>
  );
}
