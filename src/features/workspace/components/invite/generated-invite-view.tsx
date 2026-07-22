"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { en } from "@/locales/en";

interface GeneratedInviteViewProps {
  inviteLink: string;
  onClose: () => void;
}

export function GeneratedInviteView({ inviteLink, onClose }: GeneratedInviteViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success(en.workspace.invite.generatedView.toastCopied);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 py-2 flex flex-col items-center text-center">
      {/* Visual premium indicator */}
      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
        <Check className="size-5" />
      </div>

      <div className="space-y-1.5 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {en.workspace.invite.generatedView.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
          {en.workspace.invite.generatedView.description}
        </p>
      </div>

      <div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-center">
        <Input
          value={inviteLink}
          readOnly
          className="w-full sm:flex-1 text-xs h-9 rounded-xl bg-muted/30 focus-visible:ring-0 text-center sm:text-left"
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="w-full sm:w-auto shrink-0 h-9 text-xs rounded-xl px-3 flex items-center justify-center gap-1.5 cursor-pointer border-border/80"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500" />
              {en.workspace.invite.generatedView.copiedButton}
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-muted-foreground" />
              {en.workspace.invite.generatedView.copyButton}
            </>
          )}
        </Button>
      </div>

      <div className="w-full pt-4 border-t border-border/80 flex justify-center">
        <Button
          type="button"
          size="sm"
          onClick={onClose}
          className="w-full sm:w-28 h-9 text-xs font-semibold rounded-xl cursor-pointer"
        >
          {en.workspace.invite.generatedView.doneButton}
        </Button>
      </div>
    </div>
  );
}
