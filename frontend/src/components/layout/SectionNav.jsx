export function SectionNav({ items }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="sticky top-7 flex flex-col gap-3 border-t-[1.5px] border-[var(--rule)] pt-3">
      <div>
        <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          On this page
        </p>
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="border-b border-[var(--hair)] py-2 text-[0.8125rem] font-semibold text-[var(--ink-2)] no-underline transition-colors duration-[90ms] last:border-b-0 hover:text-[var(--accent)]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
