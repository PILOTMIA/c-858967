import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({ eyebrow, title, subtitle, actions }: PageHeaderProps) => (
  <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
    <div className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
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
