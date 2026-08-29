export const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 })
};

const buttonBase =
  "relative inline-flex items-center justify-center gap-2 border font-bold uppercase tracking-[0.04em] transition-[background-color,border-color,color] duration-[90ms] ease-[cubic-bezier(0.16,1,0.3,1)] outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:border-[var(--hair-2)] disabled:bg-[var(--wash)] disabled:text-[var(--ink-disabled)]";

export const appShellClasses = {
  panel: "border border-[var(--rule)] bg-card p-5 text-card-foreground",
  primaryButton: `${buttonBase} h-8 border-[var(--accent)] bg-primary px-3 text-[0.75rem] text-primary-foreground hover:border-[var(--ink)] hover:bg-[var(--ink)]`,
  outlineButton: `${buttonBase} h-8 border-[var(--rule)] bg-card px-3 text-[0.75rem] hover:bg-[var(--signal)]`,
  smallOutlineButton: `${buttonBase} h-7 border-[var(--rule)] bg-card px-2.5 text-[0.6875rem] hover:bg-[var(--signal)]`,
  destructiveOutlineButton: `${buttonBase} h-8 border-[var(--danger)] bg-card px-3 text-[0.75rem] text-destructive hover:bg-[var(--danger)] hover:text-white`,
  smallDestructiveOutlineButton: `${buttonBase} h-7 border-[var(--danger)] bg-card px-2.5 text-[0.6875rem] text-destructive hover:bg-[var(--danger)] hover:text-white`,
  // Negative margin collapses adjacent borders into a single shared rule.
  buttonRow: "flex flex-wrap [&>*+*]:-ml-px",
  badge:
    "inline-flex items-center border border-[var(--hair-2)] bg-card px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.14em] tabular-nums text-[var(--ink-3)]",
  mutedText: "text-[0.8125rem] leading-relaxed text-[var(--ink-2)]",
  smallMutedText: "text-[0.75rem] text-muted-foreground",
  errorText: "text-[0.8125rem] font-semibold text-destructive"
};

export const generationWorkflowTitle = (workflow) =>
  workflow?.draft_title ||
  workflow?.note_group?.title ||
  (workflow?.job?.id ? `Generation ${workflow.job.id.slice(0, 8)}` : "Generating");

export const generationWorkflowStageLabel = (workflow) => {
  const stage = workflow?.current_stage || workflow?.job?.current_stage || workflow?.job?.status || "";
  const labels = {
    queued: "Queued",
    title: "Title",
    cleaned_text: "Cleaned Text",
    study_cards: "Study Cards",
    embeddings: "Embeddings",
    formatted_text: "Formatted Text",
    question_cards: "Question Cards",
    mind_map_topics: "Mind Map and Concepts",
    topic_knowledge_nodes: "Concept Knowledge Nodes",
    promoting: "Publishing"
  };
  return labels[stage] || String(stage || "Generating").replace(/_/g, " ");
};

export const generationWorkflowStatusLabel = (workflow) => {
  const status = workflow?.job?.status || "";
  const labels = {
    queued: "Queued",
    running: "Running",
    failed: "Failed",
    cancelled: "Cancelled",
    connected: "Connected",
    connecting: "Connecting",
    error: "Connection issue",
    idle: "Idle"
  };
  return labels[status] || String(status || "Generating").replace(/_/g, " ");
};
