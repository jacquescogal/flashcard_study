import { cn } from "@/lib/utils";

export function AppShell({ sidebar, header, sectionNav, children, hasSidebar }) {
  return (
    <div
      className={cn(
        "min-h-svh bg-background text-foreground",
        hasSidebar && "lg:grid lg:grid-cols-[19rem_minmax(0,1fr)]"
      )}
    >
      {hasSidebar ? (
        <aside className="border-r border-[var(--rule)] bg-card lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto">
          {sidebar}
        </aside>
      ) : null}
      <div className="min-w-0">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-7 px-5 py-7 sm:px-7 lg:px-9">
          {header}
          <div className={cn("grid gap-7", sectionNav && "xl:grid-cols-[minmax(0,1fr)_13rem]")}>
            {sectionNav ? <div className="xl:hidden">{sectionNav}</div> : null}
            <main className="min-w-0">{children}</main>
            {sectionNav ? <div className="hidden xl:block">{sectionNav}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
