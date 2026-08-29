import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PageHeader({
  // Accepted for call-site compatibility. Not rendered: the breadcrumb trail
  // already says where you are, and the heading carries its own weight.
  eyebrow,
  title,
  description,
  pageType,
  tone = "default",
  breadcrumbs = [],
  actions
}) {
  const current = breadcrumbs.find((item) => item.current);
  const headerClassName = ["study-page-header", tone ? `page-header-tone-${tone}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <div className="page-header-frame">
        <div className="page-header-content">
          <nav className="page-header-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3" /> : null}
                {item.onClick ? (
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-[0.8125rem]" onClick={item.onClick}>
                    {item.label}
                  </Button>
                ) : (
                  <span className={item.current ? "font-medium text-foreground" : ""}>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="page-header-title-block">
            <div className="page-header-meta-row">
              {pageType ? <span className="page-header-type-badge">{pageType}</span> : null}
              {current?.badge ? <Badge variant="secondary">{current.badge}</Badge> : null}
            </div>
            <h1 className="page-header-title">{title}</h1>
          </div>
          {description ? <p className="page-header-description">{description}</p> : null}
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
    </header>
  );
}
