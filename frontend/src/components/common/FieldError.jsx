export function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="font-mono text-[0.6875rem] font-medium tracking-[0.04em] text-destructive">
      {message}
    </p>
  );
}
