import { AlertTriangle, CheckCircle2, Clock3, Loader2, RotateCcw, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STAGE_LABELS = {
  queued: "Queued",
  title: "Title",
  cleaned_text: "Cleaned Text",
  study_cards: "Study Cards",
  embeddings: "Embeddings",
  formatted_text: "Formatted Text",
  question_cards: "Question Cards",
  mind_map_topics: "Mind Map and Concepts",
  topic_knowledge_nodes: "Concept Knowledge Nodes",
  promoting: "Publishing",
  complete: "Complete"
};

const STATUS_LABELS = {
  pending: "Pending",
  running: "Running",
  succeeded: "Done",
  failed: "Failed",
  cancelled: "Cancelled",
  queued: "Queued",
  connected: "Connected",
  connecting: "Connecting",
  error: "Connection issue",
  idle: "Idle"
};

const formatStageLabel = (stage) =>
  STAGE_LABELS[stage] || String(stage || "").replace(/_/g, " ");

const formatStatusLabel = (status) =>
  STATUS_LABELS[status] || String(status || "pending").replace(/_/g, " ");

const formatElapsed = (start, now) => {
  if (!start) {
    return "";
  }
  const startMs = new Date(start).getTime();
  if (!Number.isFinite(startMs)) {
    return "";
  }
  const seconds = Math.max(0, Math.floor((now - startMs) / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }
  return `${minutes}m ${remainingSeconds.toString().padStart(2, "0")}s`;
};

const statusVariant = (status) => {
  if (status === "failed" || status === "cancelled") {
    return "destructive";
  }
  if (status === "running" || status === "queued") {
    return "secondary";
  }
  return "outline";
};

const StageIcon = ({ status }) => {
  if (status === "running") {
    return <Loader2 className="size-4 shrink-0 animate-spin text-primary" />;
  }
  if (status === "succeeded") {
    return <CheckCircle2 className="size-4 shrink-0 text-[var(--ok)]" />;
  }
  if (status === "failed") {
    return <AlertTriangle className="size-4 shrink-0 text-destructive" />;
  }
  if (status === "cancelled") {
    return <XCircle className="size-4 shrink-0 text-muted-foreground" />;
  }
  return <Clock3 className="size-4 shrink-0 text-[var(--ink-4)]" />;
};

export function NoteGroupGenerationWorkflow({
  workflow,
  connection = "idle",
  error = "",
  actionId = "",
  canManage = false,
  onRetry,
  onCancel,
  onDelete
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const job = workflow?.job || {};
  const stages = Array.isArray(workflow?.stages) ? workflow.stages : [];
  const logs = Array.isArray(workflow?.logs) ? workflow.logs : [];
  const activeStage =
    stages.find((stage) => stage.status === "running") ||
    stages.find((stage) => stage.stage === workflow?.current_stage) ||
    null;
  const title =
    workflow?.draft_title ||
    workflow?.note_group?.title ||
    (job.id ? `Generation ${job.id.slice(0, 8)}` : "Note Group generation");
  const isWorking = job.status === "queued" || job.status === "running";
  const canRetry = canManage && Boolean(job.id) && job.status === "failed";
  const canCancel = canManage && Boolean(job.id) && isWorking;
  const canDelete = canManage && Boolean(job.id) && job.status !== "completed";
  const activeElapsed = activeStage?.status === "running" ? formatElapsed(activeStage.started_at, now) : "";

  const overallProgress = useMemo(() => {
    if (!stages.length) {
      return 0;
    }
    const succeeded = stages.filter((stage) => stage.status === "succeeded").length;
    const running = stages.some((stage) => stage.status === "running") ? 0.5 : 0;
    return Math.min(100, Math.round(((succeeded + running) / stages.length) * 100));
  }, [stages]);

  return (
    <section id="note-group-generation-workflow" className="space-y-4">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <span className="overview-kicker">Note Group generation</span>
              <CardTitle className="text-[1.5rem]">{title}</CardTitle>
              <CardDescription>
                {activeStage
                  ? `${formatStageLabel(activeStage.stage)} ${formatStatusLabel(activeStage.status).toLowerCase()}`
                  : "Preparing generation workflow"}
                {activeElapsed ? ` · ${activeElapsed}` : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge variant={statusVariant(job.status)}>{formatStatusLabel(job.status)}</Badge>
              {connection !== "idle" ? <Badge variant="outline">{formatStatusLabel(connection)}</Badge> : null}
            </div>
          </div>
          <div className="h-1.5 border-b border-[var(--hair)]">
            <div
              className="h-full bg-primary transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <ErrorAlert title="Generation workflow disconnected" message={error} /> : null}
          <div className="grid border-t-[1.5px] border-[var(--rule)]">
            {stages.map((stage, stageIndex) => {
              const current = Number(stage.progress_current);
              const total = Number(stage.progress_total);
              const hasProgress = Number.isFinite(current) && Number.isFinite(total) && total > 0;
              const stageProgress = hasProgress ? Math.min(100, Math.round((current / total) * 100)) : null;
              const elapsed = stage.status === "running" ? formatElapsed(stage.started_at, now) : "";
              const canRetryStage = canRetry && stage.status === "failed";
              return (
                <div
                  key={stage.stage}
                  className={cn(
                    "border-b border-[var(--hair)] bg-card px-3 py-2.5",
                    stage.status === "running" && "bg-[var(--accent-q)]"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[0.625rem] tabular-nums tracking-[0.06em] text-muted-foreground">
                        {String(stageIndex + 1).padStart(2, "0")}
                      </span>
                      <StageIcon status={stage.status} />
                      <span
                        className={cn(
                          "min-w-0 truncate text-[0.8125rem] font-bold tracking-[-0.008em]",
                          stage.status === "pending" && "font-normal text-[var(--ink-3)]"
                        )}
                      >
                        {formatStageLabel(stage.stage)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "ml-auto font-mono text-[0.625rem] uppercase tracking-[0.14em] tabular-nums text-muted-foreground",
                        stage.status === "running" && "text-[var(--accent)]",
                        stage.status === "failed" && "text-destructive"
                      )}
                    >
                      {formatStatusLabel(stage.status)}
                      {elapsed ? ` · ${elapsed}` : ""}
                      {stage.error ? ` · ${stage.error}` : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasProgress ? (
                        <Badge variant="outline">
                          {current}/{total}
                        </Badge>
                      ) : null}
                      {canRetryStage ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onRetry?.(job.id)}
                          disabled={actionId === job.id}
                        >
                          <RotateCcw className="size-4" />
                          {actionId === job.id ? "Retrying" : "Retry"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {stageProgress !== null ? (
                    <div className="mt-2 h-1 bg-[var(--hair)]">
                      <div
                        className="h-full bg-primary transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ width: `${stageProgress}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {logs.length ? (
            <div className="border border-[var(--hair-2)] bg-[var(--wash)] p-3">
              <h3 className="mb-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Generation log</h3>
              <div className="space-y-2">
                {logs.slice(-8).map((log) => (
                  <div key={log.id} className="text-[0.8125rem]">
                    <span className="text-muted-foreground">{formatStageLabel(log.stage)}: </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {canCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onCancel?.(job.id)}
                disabled={actionId === job.id}
              >
                <XCircle className="size-4" />
                {actionId === job.id ? "Cancelling" : "Cancel"}
              </Button>
            ) : null}
            {canRetry ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onRetry?.(job.id)}
                disabled={actionId === job.id}
              >
                <RotateCcw className="size-4" />
                {actionId === job.id ? "Retrying" : "Retry failed stage"}
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete?.(job.id, job.note_group_id || workflow?.note_group?.id)}
                disabled={actionId === job.id}
              >
                <Trash2 className="size-4" />
                {actionId === job.id ? "Deleting" : "Delete generation"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
