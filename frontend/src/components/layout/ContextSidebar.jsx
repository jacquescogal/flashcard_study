import { BookOpen, CornerDownRight, Layers, Plus, Repeat2, Search, Undo2 } from "lucide-react";

import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function ContextSidebar({
  subjectTitle,
  moduleTitle,
  onEditSubject,
  onEditModule,
  scope,
  onScopeChange,
  noteGroupSearch,
  topicSearch,
  conceptSearch,
  onNoteGroupSearchChange,
  onTopicSearchChange,
  onConceptSearchChange,
  noteGroups,
  topics,
  concepts,
  selectedNoteGroupId,
  selectedTopicId,
  selectedConceptId,
  canCreateNoteGroup = true,
  showCreateNoteGroup = canCreateNoteGroup,
  onSelectNoteGroup,
  onSelectTopic,
  onSelectConcept,
  onCreateNoteGroup,
  error
}) {
  const isConceptScope = scope === "topics" || scope === "concepts";
  const visibleItems = isConceptScope ? concepts || topics || [] : noteGroups || [];
  const searchValue = isConceptScope ? conceptSearch ?? topicSearch : noteGroupSearch;
  const onSearchChange = isConceptScope
    ? onConceptSearchChange || onTopicSearchChange
    : onNoteGroupSearchChange;
  const activeConceptId = selectedConceptId || selectedTopicId;
  const selectConcept = onSelectConcept || onSelectTopic;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col divide-y divide-[var(--hair)] border-b-[1.5px] border-[var(--rule)]">
        <div className="flex items-center gap-3 px-4 py-3">
          <BookOpen className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subject</p>
            <p className="truncate text-[0.8125rem] font-semibold tracking-[-0.008em]">{subjectTitle || "Subject"}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEditSubject}
            aria-label="Switch subject"
          >
            <Repeat2 className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Layers className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Module</p>
            <p className="truncate text-[0.8125rem] font-semibold tracking-[-0.008em]">{moduleTitle || "Module"}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onEditModule}
            aria-label="Switch module"
          >
            <Repeat2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pt-4">
        <div className="space-y-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Browse
            </p>
            {showCreateNoteGroup ? (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={onCreateNoteGroup}
                aria-label="Create note group"
                disabled={!canCreateNoteGroup}
              >
                <Plus className="size-4" />
              </Button>
            ) : null}
          </div>
          <Tabs value={isConceptScope ? "concepts" : scope} onValueChange={onScopeChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="note-groups">Note Groups</TabsTrigger>
              <TabsTrigger value="concepts">Concepts</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={isConceptScope ? "Search concepts" : "Search note groups"}
              className="sidebar-search-input"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-[var(--rule)]">
          {visibleItems.length ? (
            visibleItems.map((item) => {
              const isTopicChild = isConceptScope && item.directoryDepth > 0;
              const isTopicUp = isConceptScope && item.directoryRole === "up";
              const isSelected =
                isConceptScope
                  ? !isTopicUp && activeConceptId === item.value
                  : selectedNoteGroupId === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  data-selected={isSelected ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 border-b border-[var(--hair)] bg-card px-4 py-2.5 text-left text-[0.8125rem] transition-colors duration-[90ms] last:border-b-0 hover:bg-[var(--wash)]",
                    isSelected && "bg-[var(--accent)] text-white hover:bg-[var(--accent)]"
                  )}
                  onClick={() => (isConceptScope ? selectConcept?.(item) : onSelectNoteGroup?.(item))}
                >
                  <span className={cn("flex min-w-0 items-start gap-2", isTopicChild && "pl-4")}>
                    {isTopicChild ? (
                      <CornerDownRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : null}
                    {isTopicUp ? (
                      <Undo2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : null}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold tracking-[-0.008em]">{item.label}</span>
                      {item.description ? (
                        <span className={cn("mt-0.5 block truncate font-mono text-[0.625rem] uppercase tracking-[0.1em]", isSelected ? "text-white/70" : "text-muted-foreground")}>{item.description}</span>
                      ) : null}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    {item.badge ? <span className={cn("font-mono text-[0.75rem] font-semibold tabular-nums", isSelected ? "text-white" : "text-[var(--ink)]")}>{item.badge}</span> : null}
                    {item.statusLabel ? <Badge variant={isSelected ? "secondary" : "outline"}>{item.statusLabel}</Badge> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="px-4 py-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              {searchValue.trim()
                ? isConceptScope
                  ? "No concepts match."
                  : "No note groups match."
                : isConceptScope
                  ? "No concepts yet."
                  : "No note groups yet."}
            </p>
          )}
        </div>
      </div>
      <ErrorAlert title="Sidebar action failed" message={error} />
    </div>
  );
}
