import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup, joinGroup } from "@/shared/api/client";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";

export default function Groups() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinId, setJoinId] = useState("");

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const canCreate = name.trim().length > 0;
  const canJoin = /^\d+$/.test(joinId);

  async function onCreate(e) {
    e.preventDefault();
    if (!canCreate) return;

    setErr("");
    setOk("");
    setLoadingCreate(true);

    try {
      const g = await createGroup({ name, description });

      setOk(`Group created: #${g.id} ${g.name}`);

      setName("");
      setDescription("");

      setTimeout(() => {
        navigate(`/groups/${g.id}`);
      }, 450);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingCreate(false);
    }
  }

  async function onJoin(e) {
    e.preventDefault();
    if (!canJoin) {
      setErr("Group ID must be a number.");
      return;
    }

    setErr("");
    setOk("");
    setLoadingJoin(true);

    try {
      await joinGroup(Number(joinId));

      setOk(`Joined group #${joinId}`);

      const id = joinId;
      setJoinId("");

      setTimeout(() => {
        navigate(`/groups/${id}`);
      }, 450);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoadingJoin(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">Groups</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Create a new group or join an existing one.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Create group</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Start a new group for your team.
          </p>

          <form onSubmit={onCreate} className="mt-4 space-y-3">
            <Input
              label="Name"
              placeholder="e.g. Study Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Description"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button className="w-full" disabled={!canCreate || loadingCreate}>
              {loadingCreate ? "Creating..." : "Create"}
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Join group</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Enter a group ID to join.
          </p>

          <form onSubmit={onJoin} className="mt-4 space-y-3">
            <Input
              label="Group ID"
              placeholder="e.g. 12"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              inputMode="numeric"
            />

            <Button className="w-full" disabled={!canJoin || loadingJoin}>
              {loadingJoin ? "Joining..." : "Join"}
            </Button>
          </form>
        </Card>
      </div>

      {err && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}

      {ok && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {ok}
        </div>
      )}

      <Card className="p-5">
        <h3 className="font-semibold text-[rgb(var(--text))]">Coming soon</h3>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          When the backend exposes{" "}
          <code className="rounded bg-[rgb(var(--panel2))] px-1">
            GET /groups
          </code>{" "}
          and messaging endpoints, we’ll add list + realtime chat here.
        </p>
      </Card>
    </div>
  );
}