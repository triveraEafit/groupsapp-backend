import React, { useMemo, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";

export default function Chat() {
  // Placeholder chats
  const chats = useMemo(
    () => [
      { id: 1, name: "Study Group", last: "We’ll meet at 7pm", unread: 2 },
      { id: 2, name: "Project Team", last: "Backend endpoints ready", unread: 0 },
      { id: 3, name: "Friends", last: "Send the doc pls", unread: 1 },
    ],
    []
  );

  const [activeId, setActiveId] = useState(chats[0].id);
  const [message, setMessage] = useState("");

  const active = chats.find((c) => c.id === activeId);

  function onSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    // Placeholder: later call POST /messages or WS send
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">Chat</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          UI ready for realtime messages. We’ll connect it when the backend adds WebSockets / messaging endpoints.
        </p>
      </div>

      {/* WhatsApp Web-like layout */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Conversations</div>
            <span className="text-xs text-[rgb(var(--muted))]">placeholder</span>
          </div>

          <div className="mt-3">
            <Input
              placeholder="Search (coming soon)"
              value={""}
              onChange={() => {}}
              disabled
            />
          </div>

          <div className="mt-3 space-y-2">
            {chats.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={[
                    "w-full text-left rounded-2xl border px-3 py-3 transition",
                    "border-[rgb(var(--border))]",
                    isActive ? "bg-[rgb(var(--panel2))]" : "hover:bg-[rgb(var(--panel2))]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--primary2))] opacity-90" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-[rgb(var(--text))]">
                          {c.name}
                        </div>
                        {c.unread > 0 ? (
                          <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-[rgb(var(--primary))] text-white">
                            {c.unread}
                          </span>
                        ) : null}
                      </div>
                      <div className="truncate text-xs text-[rgb(var(--muted))]">
                        {c.last}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Conversation */}
        <Card className="p-0 overflow-hidden flex flex-col min-h-[520px]">
          {/* Header */}
          <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--primary2))] opacity-90" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[rgb(var(--text))] truncate">
                {active?.name || "Conversation"}
              </div>
              <div className="text-xs text-[rgb(var(--muted))]">
                Realtime pending (WebSocket)
              </div>
            </div>
            <div className="flex-1" />
            <Button variant="secondary" disabled>
              Info
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 space-y-3 overflow-auto">
            <div className="max-w-[70%] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel2))] px-3 py-2">
              <div className="text-xs text-[rgb(var(--muted))]">System</div>
              <div className="text-sm text-[rgb(var(--text))]">
                This is a placeholder chat UI. Messages will appear here once the backend is ready.
              </div>
            </div>

            <div className="ml-auto max-w-[70%] rounded-2xl px-3 py-2 text-white bg-gradient-to-b from-[rgb(var(--primary))] to-[rgb(var(--primary2))] shadow-sm">
              <div className="text-sm">
                Nice — looks like WhatsApp Web 😄
              </div>
            </div>

            <div className="max-w-[70%] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel2))] px-3 py-2">
              <div className="text-sm text-[rgb(var(--text))]">
                Next: connect WebSocket and stream messages in real time.
              </div>
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={onSend}
            className="border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 flex items-center gap-2"
          >
            <div className="flex-1">
              <Input
                placeholder="Type a message… (placeholder)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button disabled={!message.trim()}>Send</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}