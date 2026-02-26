import React, { useState } from "react";
import { createGroup, joinGroup } from "../api/client.js";

export default function Groups() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [joinId, setJoinId] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      const g = await createGroup({ name, description });
      setOk(`Group created: #${g.id} ${g.name}`);
      setName("");
      setDescription("");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onJoin(e) {
    e.preventDefault();
    setErr("");
    setOk("");
    try {
      await joinGroup(Number(joinId));
      setOk(`Joined group #${joinId}`);
      setJoinId("");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h2>Groups</h2>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>Create group</h3>
          <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
            <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              placeholder="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button>Create</button>
          </form>
        </section>

        <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <h3>Join group</h3>
          <form onSubmit={onJoin} style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="group_id"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />
            <button>Join</button>
          </form>
        </section>
      </div>

      {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}
      {ok && <div style={{ marginTop: 12, color: "green" }}>{ok}</div>}

      <p style={{ marginTop: 20, color: "#666" }}>
        Nota: el backend aún no expone <code>GET /groups</code> ni mensajes. Cuando tu compañero los agregue,
        conectamos lista + chat en 5 minutos.
      </p>
    </div>
  );
}