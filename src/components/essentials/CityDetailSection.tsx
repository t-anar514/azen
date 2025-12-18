"use client";

interface CityDetailSectionProps {
  title: string;
  children: React.ReactNode;
}

export const CityDetailSection = ({ title, children }: CityDetailSectionProps) => {
  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-primary mb-4 border-b border-secondary/20 pb-2">
        {title}
      </h2>
      <div className="text-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
};
