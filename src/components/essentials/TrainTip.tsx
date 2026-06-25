import { useTranslations } from "next-intl";
import { Info } from "lucide-react";

export const TrainTip = () => {
  const t = useTranslations("TrainTip");
  
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-accent text-white">
          <Info className="w-5 h-5" />
        </div>
        <h4 className="text-lg font-bold text-accent">{t("title")}</h4>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">{t("local.title")}</h5>
          <p className="text-sm text-foreground/80">{t("local.description")}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">{t("express.title")}</h5>
          <p className="text-sm text-foreground/80">{t("express.description")}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-white/50 border border-white/20">
          <h5 className="font-bold text-primary mb-1">{t("ltdExpress.title")}</h5>
          <p className="text-sm text-foreground/80">{t("ltdExpress.description")}</p>
        </div>
      </div>
      
      <p className="mt-4 text-xs text-muted-foreground italic">
        {t("footer")}
      </p>
    </div>
  );
};
