import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({ eyebrow, title, subtitle, actions }: PageHeaderProps) => (
  <header className="mb-6 flex flex-col gap-4 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
    <div className="space-y-2">
      {eyebrow && (
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl font-black uppercase text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
