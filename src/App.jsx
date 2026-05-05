import React, { useState, useEffect, useRef, useCallback } from 'react';

const { useState, useEffect, useRef, useCallback, useMemo } = React;

const meetings = [
  {
    id: 1,
    title: "Q3 Product Roadmap Review",
    date: "2024-07-15",
    time: "10:00 AM",
    duration: "52 min",
    attendees: ["Sarah K.", "Mike R.", "Priya N.", "Tom L."],
    status: "processed",
    summary: "Reviewed Q3 milestones, aligned on shipping priorities, and discussed resource allocation for the new analytics module. Team agreed to deprioritize the export feature until Q4.",
    actions: [
      { id: 101, text: "Create detailed spec for analytics module", owner: "Priya N.", due: "2024-07-22", priority: "high", done: false },
      { id: 102, text: "Schedule design review for dashboard v2", owner: "Sarah K.", due: "2024-07-19", priority: "medium", done: false },
      { id: 103, text: "Send updated roadmap to stakeholders", owner: "Tom L.", due: "2024-07-17", priority: "high", done: true },
      { id: 104, text: "Audit existing export code for Q4 planning", owner: "Mike R.", due: "2024-07-29", priority: "low", done: false },
    ],
    tags: ["product", "roadmap", "q3"],
  },
  {
    id: 2,
    title: "Sales Pipeline Sync",
    date: "2024-07-14",
    time: "2:30 PM",
    duration: "38 min",
    attendees: ["James W.", "Lena C.", "Ravi M."],
    status: "processed",
    summary: "Walked through top 10 deals in CRM. Two enterprise deals are stalled pending legal review. Decided to bring in CSM earlier in the enterprise sales cycle going forward.",
    actions: [
      { id: 201, text: "Follow up with Acme Corp legal team", owner: "James W.", due: "2024-07-16", priority: "high", done: true },
      { id: 202, text: "Draft CSM involvement playbook", owner: "Lena C.", due: "2024-07-23", priority: "medium", done: false },
      { id: 203, text: "Update CRM stage definitions", owner: "Ravi M.", due: "2024-07-20", priority: "low", done: false },
    ],
    tags: ["sales", "pipeline", "enterprise"],
  },
  {
    id: 3,
    title: "Engineering Standup — Sprint 24",
    date: "2024-07-15",
    time: "9:00 AM",
    duration: "18 min",
    attendees: ["Mike R.", "Priya N.", "Dev O.", "Yuki T."],
    status: "processed",
    summary: "Sprint 24 is on track. Auth service refactor landed. Two tickets blocked on infra provisioning. Discussed memory leak in worker queue — hotfix shipping today.",
    actions: [
      { id: 301, text: "Ship hotfix for worker queue memory leak", owner: "Dev O.", due: "2024-07-15", priority: "high", done: true },
      { id: 302, text: "Unblock infra tickets — provision staging env", owner: "Yuki T.", due: "2024-07-16", priority: "high", done: false },
      { id: 303, text: "Write post-mortem for auth service delay", owner: "Mike R.", due: "2024-07-18", priority: "medium", done: false },
    ],
    tags: ["engineering", "sprint", "standup"],
  },
  {
    id: 4,
    title: "Investor Update Prep",
    date: "2024-07-12",
    time: "4:00 PM",
    duration: "45 min",
    attendees: ["Sarah K.", "Tom L.", "James W."],
    status: "processed",
    summary: "Prepared talking points for Series A update call. Metrics look strong — MRR up 22% MoM. Need to tighten the churn slide narrative and add a competitive landscape page.",
    actions: [
      { id: 401, text: "Revise churn slide with cohort breakdown", owner: "Tom L.", due: "2024-07-14", priority: "high", done: true },
      { id: 402, text: "Add competitive landscape to deck", owner: "Sarah K.", due: "2024-07-13", priority: "high", done: true },
      { id: 403, text: "Rehearse pitch with full team", owner: "James W.", due: "2024-07-15", priority: "medium", done: true },
    ],
    tags: ["investors", "fundraising", "prep"],
  },
  {
    id: 5,
    title: "Customer Onboarding Review",
    date: "2024-07-11",
    time: "11:00 AM",
    duration: "29 min",
    attendees: ["Lena C.", "Priya N.", "Ravi M."],
    status: "processed",
    summary: "Reviewed NPS scores from last 30 onboarded accounts. Average time-to-value is 11 days, target is 7. Main friction point is API key setup. Agreed to build a guided setup wizard.",
    actions: [
      { id: 501, text: "Design guided API setup wizard flow", owner: "Priya N.", due: "2024-07-18", priority: "high", done: false },
      { id: 502, text: "Interview 5 churned customers for friction insights", owner: "Lena C.", due: "2024-07-20", priority: "medium", done: false },
      { id: 503, text: "Update onboarding docs with new flow", owner: "Ravi M.", due: "2024-07-25", priority: "low", done: false },
    ],
    tags: ["customer", "onboarding", "nps"],
  },
  {
    id: 6,
    title: "Marketing Campaign Kickoff",
    date: "2024-07-10",
    time: "3:00 PM",
    duration: "41 min",
    attendees: ["Sarah K.", "Lena C.", "Tom L."],
    status: "processed",
    summary: "Kicked off Q3 content campaign. Focus on founder-led growth and product-led acquisition. Agreed on 3 hero content pieces and a LinkedIn sequence targeting Head of Product personas.",
    actions: [
      { id: 601, text: "Write hero blog post: AI meets async work", owner: "Lena C.", due: "2024-07-21", priority: "high", done: false },
      { id: 602, text: "Build LinkedIn sequence — 6 posts", owner: "Tom L.", due: "2024-07-24", priority: "medium", done: false },
      { id: 603, text: "Coordinate product screenshots for content", owner: "Sarah K.", due: "2024-07-17", priority: "low", done: false },
    ],
    tags: ["marketing", "content", "growth"],
  },
];

const allActions = meetings.flatMap(m => m.actions.map(a => ({ ...a, meetingTitle: m.title, meetingId: m.id })));

const priorityColors = { high: "#FC5C5C", medium: "#FFC55C", low: "#00E5A0" };
const priorityBg = { high: "rgba(252,92,92,0.12)", medium: "rgba(255,197,92,0.12)", low: "rgba(0,229,160,0.12)" };

function Avatar({ name, size = 28 }) {
  const initials = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#7C5CFC", "#00E5A0", "#FC5C5C", "#FFC55C", "#5CC8FC", "#FC5CA0"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: colors[idx], display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.38, fontWeight: 700,
      fontFamily: '"DM Sans",sans-serif', color: "#fff", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Tag({ label }) {
  return (
    <span style={{
      fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.5)",
      background: "rgba(255,255,255,0.06)", borderRadius: 999, padding: "3px 9px",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      #{label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span style={{
      fontFamily: '"DM Mono",monospace', fontSize: 10, fontWeight: 700,
      color: priorityColors[priority], background: priorityBg[priority],
      borderRadius: 999, padding: "2px 8px", textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {priority}
    </span>
  );
}

function MeetingCard({ meeting, selected, onClick }) {
  const [hovered, setHovered] = useState(false);
  const totalActions = meeting.actions.length;
  const doneActions = meeting.actions.filter(a => a.done).length;
  const progress = totalActions > 0 ? (doneActions / totalActions) : 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "#2A2440" : hovered ? "#252525" : "#1E1E1E",
        border: selected ? "1px solid #7C5CFC" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, padding: "16px 18px", cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 14, color: "#fff", lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
          {meeting.title}
        </div>
        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {meeting.duration}
        </span>
      </div>
      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
        {meeting.date} · {meeting.time}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {meeting.tags.map(t => <Tag key={t} label={t} />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: progress === 1 ? "#00E5A0" : "#7C5CFC", borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
          {doneActions}/{totalActions} done
        </span>
      </div>
    </div>
  );
}

function ActionRow({ action, onToggle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px",
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        borderRadius: 10, transition: "background 0.12s ease",
        border: "1px solid rgba(255,255,255,0.04)",
        marginBottom: 4,
      }}
    >
      <div
        onClick={() => onToggle(action.id)}
        style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: "pointer", marginTop: 1,
          background: action.done ? "#7C5CFC" : "transparent",
          border: action.done ? "2px solid #7C5CFC" : "2px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s ease",
        }}
      >
        {action.done && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: '"DM Sans",sans-serif', fontSize: 14, color: action.done ? "rgba(255,255,255,0.35)" : "#fff",
          textDecoration: action.done ? "line-through" : "none", marginBottom: 4, lineHeight: 1.4,
        }}>
          {action.text}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Avatar name={action.owner} size={18} />
            <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{action.owner}</span>
          </div>
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Due {action.due}</span>
          <PriorityBadge priority={action.priority} />
        </div>
      </div>
    </div>
  );
}

function StatsBar({ actions }) {
  const total = actions.length;
  const done = actions.filter(a => a.done).length;
  const high = actions.filter(a => a.priority === "high" && !a.done).length;
  const overdue = actions.filter(a => !a.done && new Date(a.due) < new Date("2024-07-16")).length;

  const stats = [
    { label: "Total Actions", value: total, color: "#fff" },
    { label: "Completed", value: done, color: "#00E5A0" },
    { label: "High Priority Open", value: high, color: "#FC5C5C" },
    { label: "Overdue", value: overdue, color: "#FFC55C" },
  ];

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          flex: 1, background: "#1E1E1E", borderRadius: 12, padding: "16px 20px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>
            {s.value}
          </div>
          <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ meetings, selectedId, onSelect, view, setView }) {
  const navItems = [
    { id: "meetings", label: "Meetings", icon: "🎙️" },
    { id: "actions", label: "All Actions", icon: "✅" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <div style={{
      width: 280, minWidth: 280, background: "#1a1a1a", borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      <div style={{ padding: "24px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "#7C5CFC",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 15, color: "#fff" }}>ActionMeet</div>
            <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 10, color: "rgba(255,255,255,0.35)" }}>AI Meeting Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => {
            const active = view === item.id;
            return (
              <NavItem key={item.id} item={item} active={active} onClick={() => setView(item.id)} />
            );
          })}
        </div>
      </div>
      {view === "meetings" && (
        <>
          <div style={{ padding: "4px 20px 12px", fontFamily: '"DM Mono",monospace', fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>
            Recent Meetings
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {meetings.map(m => (
              <MeetingCard key={m.id} meeting={m} selected={selectedId === m.id} onClick={() => onSelect(m.id)} />
            ))}
          </div>
        </>
      )}
      {view !== "meetings" && <div style={{ flex: 1 }} />}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name="Sarah K." size={32} />
          <div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, color: "#fff", fontWeight: 600 }}>Sarah K.</div>
            <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Admin · Acme Corp</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
        borderRadius: 8, cursor: "pointer",
        background: active ? "rgba(124,92,252,0.15)" : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.12s ease",
      }}
    >
      <span style={{ fontSize: 15 }}>{item.icon}</span>
      <span style={{
        fontFamily: '"DM Sans",sans-serif', fontSize: 14, fontWeight: active ? 600 : 400,
        color: active ? "#7C5CFC" : "rgba(255,255,255,0.7)",
      }}>
        {item.label}
      </span>
    </div>
  );
}

function MeetingDetail({ meeting, actionStates, onToggle }) {
  const [activeTab, setActiveTab] = useState("actions");
  const tabs = ["actions", "summary", "attendees"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minWidth: 0 }}>
      <div style={{ padding: "28px 32px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 6 }}>
              {meeting.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {meeting.date} · {meeting.time}
              </span>
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {meeting.duration}
              </span>
              <span style={{
                fontFamily: '"DM Mono",monospace', fontSize: 11, color: "#00E5A0",
                background: "rgba(0,229,160,0.12)", borderRadius: 999, padding: "2px 9px",
              }}>
                ✓ Processed
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <ActionButton label="Export" />
            <ActionButton label="Share" primary />
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
          {tabs.map(tab => (
            <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 32px" }}>
        {activeTab === "actions" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 16, color: "#fff" }}>
                Action Items
              </div>
              <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {meeting.actions.filter(a => actionStates[a.id] ?? a.done).length}/{meeting.actions.length} completed
              </span>
            </div>
            {meeting.actions.map(action => (
              <ActionRow
                key={action.id}
                action={{ ...action, done: actionStates[action.id] ?? action.done }}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
        {activeTab === "summary" && (
          <div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 16, color: "#fff", marginBottom: 16 }}>
              AI Summary
            </div>
            <div style={{
              background: "#1E1E1E", borderRadius: 12, padding: "20px 24px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7C5CFC" }} />
                <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "#7C5CFC" }}>Generated by AI</span>
              </div>
              <p style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, margin: 0 }}>
                {meeting.summary}
              </p>
            </div>
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>Tags</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {meeting.tags.map(t => <Tag key={t} label={t} />)}
              </div>
            </div>
          </div>
        )}
        {activeTab === "attendees" && (
          <div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 16, color: "#fff", marginBottom: 16 }}>
              Attendees ({meeting.attendees.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {meeting.attendees.map(name => {
                const actionsOwned = meeting.actions.filter(a => a.owner === name);
                return (
                  <div key={name} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                    background: "#1E1E1E", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <Avatar name={name} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</div>
                      <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {actionsOwned.length} action{actionsOwned.length !== 1 ? "s" : ""} assigned
                      </div>
                    </div>
                    {actionsOwned.length > 0 && (
                      <div style={{ display: "flex", gap: 4 }}>
                        {actionsOwned.map(a => (
                          <PriorityBadge key={a.id} priority={a.priority} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 16px", cursor: "pointer",
        fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? "#fff" : hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
        borderBottom: active ? "2px solid #7C5CFC" : "2px solid transparent",
        textTransform: "capitalize", transition: "all 0.12s ease",
      }}
    >
      {label}
    </div>
  );
}

function ActionButton({ label, primary, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: primary ? (hovered ? "#6B4EE8" : "#7C5CFC") : (hovered ? "#2a2a2a" : "#1a1a1a"),
        color: "#fff", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 16px", cursor: "pointer", fontFamily: '"DM Sans",sans-serif',
        fontWeight: 600, fontSize: 13, transition: "background 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

function AllActionsView({ actionStates, onToggle }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filters = ["all", "open", "done", "high", "overdue"];

  const enriched = allActions.map(a => ({ ...a, done: actionStates[a.id] ?? a.done }));

  const filtered = enriched.filter(a => {
    const matchSearch = search === "" || a.text.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "open") return !a.done;
    if (filter === "done") return a.done;
    if (filter === "high") return a.priority === "high" && !a.done;
    if (filter === "overdue") return !a.done && new Date(a.due) < new Date("2024-07-16");
    return true;
  });

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(a => {
      if (!g[a.meetingTitle]) g[a.meetingTitle] = [];
      g[a.meetingTitle].push(a);
    });
    return g;
  }, [filtered]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minWidth: 0 }}>
      <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 4 }}>
          All Actions
        </div>
        <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
          Every action item across all meetings — tracked in one place.
        </div>
        <StatsBar actions={enriched} />
        <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
          <div style={{
            flex: 1, background: "#1E1E1E", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 10, padding: "0 14px",
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actions or owners..."
              style={{
                background: "transparent", border: "none", outline: "none", color: "#fff",
                fontFamily: '"DM Sans",sans-serif', fontSize: 14, flex: 1, padding: "10px 0",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {filters.map(f => (
              <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 32px" }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 16, color: "rgba(255,255,255,0.5)" }}>No actions match your filter</div>
          </div>
        ) : (
          Object.entries(grouped).map(([title, actions]) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {title}
              </div>
              {actions.map(a => <ActionRow key={a.id} action={a} onToggle={onToggle} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "7px 14px", borderRadius: 999, cursor: "pointer",
        fontFamily: '"DM Mono",monospace', fontSize: 11, textTransform: "capitalize",
        background: active ? "#7C5CFC" : hovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        border: active ? "1px solid #7C5CFC" : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.12s ease",
      }}
    >
      {label}
    </div>
  );
}

function AnalyticsView() {
  const totalMeetings = meetings.length;
  const totalMinutes = meetings.reduce((s, m) => s + parseInt(m.duration), 0);
  const totalActions = allActions.length;
  const completedActions = allActions.filter(a => a.done).length;
  const completionRate = Math.round((completedActions / totalActions) * 100);

  const ownerMap = {};
  allActions.forEach(a => {
    if (!ownerMap[a.owner]) ownerMap[a.owner] = { total: 0, done: 0 };
    ownerMap[a.owner].total++;
    if (a.done) ownerMap[a.owner].done++;
  });
  const topOwners = Object.entries(ownerMap).sort((a, b) => b[1].total - a[1].total).slice(0, 6);

  const meetingActivity = meetings.map(m => ({
    name: m.title.split(" ").slice(0, 3).join(" "),
    actions: m.actions.length,
    done: m.actions.filter(a => a.done).length,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minWidth: 0 }}>
      <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: 22, color: "#fff", marginBottom: 4 }}>Analytics</div>
        <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 14, color: "rgba(255,255,255,0.45)" }}>Meeting intelligence and action completion insights.</div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Meetings Recorded", value: totalMeetings, sub: "Last 7 days", color: "#7C5CFC" },
            { label: "Minutes Processed", value: totalMinutes, sub: "AI transcribed", color: "#00E5A0" },
            { label: "Completion Rate", value: `${completionRate}%`, sub: `${completedActions}/${totalActions} actions`, color: "#FFC55C" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: "#1E1E1E", borderRadius: 12, padding: "22px 24px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#1E1E1E", borderRadius: 12, padding: "22px 24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 15, color: "#fff", marginBottom: 18 }}>Actions by Meeting</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {meetingActivity.map(m => {
              const pct = m.actions > 0 ? (m.done / m.actions) : 0;
              return (
                <div key={m.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{m.name}…</span>
                    <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{m.done}/{m.actions}</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct * 100}%`, height: "100%",
                      background: pct === 1 ? "#00E5A0" : "#7C5CFC",
                      borderRadius: 999, transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: "#1E1E1E", borderRadius: 12, padding: "22px 24px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: '"DM Sans",sans-serif', fontWeight: 600, fontSize: 15, color: "#fff", marginBottom: 18 }}>Top Action Owners</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topOwners.map(([name, stats]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={name} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: '"DM Sans",sans-serif', fontSize: 13, fontWeight: 600, color: "#fff" }}>{name}</span>
                    <span style={{ fontFamily: '"DM Mono",monospace', fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                      {stats.done}/{stats.total} done
                    </span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%`,
                      height: "100%", background: "#00E5A0", borderRadius: 999,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selectedMeetingId, setSelectedMeetingId] = useState(1);
  const [view, setView] = useState("meetings");
  const [actionStates, setActionStates] = useState({});

  const handleToggle = useCallback((actionId) => {
    setActionStates(prev => {
      const current = prev[actionId] ?? allActions.find(a => a.id === actionId)?.done ?? false;
      return { ...prev, [actionId]: !current };
    });
  }, []);

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#111111", fontFamily: '"DM Sans",sans-serif' }}>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar
          meetings={meetings}
          selectedId={selectedMeetingId}
          onSelect={id => { setSelectedMeetingId(id); setView("meetings"); }}
          view={view}
          setView={setView}
        />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#161616" }}>
          {view === "meetings" && selectedMeeting && (
            <MeetingDetail meeting={selectedMeeting} actionStates={actionStates} onToggle={handleToggle} />
          )}
          {view === "actions" && (
            <AllActionsView actionStates={actionStates} onToggle={handleToggle} />
          )}
          {view === "analytics" && (
            <AnalyticsView />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
