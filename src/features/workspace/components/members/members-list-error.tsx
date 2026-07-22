interface MembersListErrorProps {
  message?: string;
}

export function MembersListError({
  message = "Failed to load workspace members",
}: MembersListErrorProps) {
  return (
    <div className="text-center py-12 bg-card border border-border/80 rounded-2xl p-6 shadow-xs max-w-sm mx-auto">
      <p className="text-xs font-semibold text-destructive">
        Error Loading Members
      </p>
      <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
        {message}
      </p>
    </div>
  );
}
