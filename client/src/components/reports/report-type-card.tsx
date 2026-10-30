import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportTypeCardProps {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  active: boolean;
  onClick: () => void;
}

export function ReportTypeCard({ label, icon: Icon, iconBg, active, onClick }: ReportTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-300",
        active ? "border-blue-500 ring-1 ring-blue-500" : "border-border"
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
