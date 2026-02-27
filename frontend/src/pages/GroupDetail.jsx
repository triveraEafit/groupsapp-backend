import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

export default function GroupDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">
            Group #{id}
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            This view will be connected when backend adds{" "}
            <code className="rounded bg-[rgb(var(--panel2))] px-1">
              GET /groups/{id}
            </code>
            .
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/groups">
            <Button variant="secondary">Back</Button>
          </Link>
          <Link to="/chat">
            <Button>Open chat</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">About</div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Placeholder: group name, description, members count, owner, etc.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Card className="p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Members</div>
              <div className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">—</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-[rgb(var(--muted))]">Created</div>
              <div className="mt-1 text-lg font-semibold text-[rgb(var(--text))]">—</div>
            </Card>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Actions</div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            When messaging exists, you can pin, mute, or manage members here.
          </p>
          <div className="mt-4 grid gap-2">
            <Button variant="secondary" disabled>
              Add member
            </Button>
            <Button variant="secondary" disabled>
              Leave group
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-semibold text-[rgb(var(--text))]">Messages</div>
        <p className="mt-2 text-sm text-[rgb(var(--muted))]">
          Placeholder: message list will be rendered here (REST) or streamed (WebSockets).
        </p>
      </Card>
    </div>
  );
}