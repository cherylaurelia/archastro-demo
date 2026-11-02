const REPO_URL = "https://github.com/cherylaurelia/archastro-demo";

const DIFF_URL =
  "https://github.com/ArchAstro/scopey/compare/main...cherylaurelia:scopey:fix/post-tool-batch-args";

const ISSUE_URL = "https://github.com/ArchAstro/scopey/issues/29";
const EVIDENCE_URL = `${REPO_URL}/tree/main/evidence`;

const BEFORE_LINES = ["TOOL 1 Read", "TOOL 2 Edit", "TOOL 3 Bash", "TOOL 4 Read", "..."];

const AFTER_LINES = [
  "TOOL 1 Read: <tmp>/repo/README.md",
  "TOOL 2 Edit: <tmp>/repo/README.md",
  "TOOL 3 Bash: git -C <tmp>/repo diff --stat",
  "TOOL 4 Read: <tmp>/repo/src/config.rs",
  "...",
];

const RESULTS = [
  {
    scope: "Real prompt: only change README.md",
    window: "Edit + Bash",
    before: "insufficient_evidence 3/3",
    beforeTone: "text-warn",
    after: "on_track 3/3",
    afterTone: "text-ok",
  },
  {
    scope: "Constructed: same events, prompt swapped to only docs/config.md, do not edit README.md",
    window: "Edit + Bash",
    before: "insufficient_evidence 3/3",
    beforeTone: "text-warn",
    after: "off_track 3/3",
    afterTone: "text-off",
  },
  {
    scope: "Another real session, real prompt",
    window: "Read + Grep only",
    before: "on_track 2/3, insufficient_evidence 1/3",
    beforeTone: "text-ok",
    after: "on_track 3/3",
    afterTone: "text-ok",
  },
];

const DIFF_LINES = [
  { text: " pub struct ToolCall {", tone: "text-dim" },
  { text: "     pub tool_name: Option<String>,", tone: "text-dim" },
  { text: '+    #[serde(default, alias = "toolInput", alias = "args")]', tone: "text-ok" },
  { text: "+    pub tool_input: Option<serde_json::Value>,", tone: "text-ok" },
  { text: " }", tone: "text-dim" },
  { text: " ", tone: "text-dim" },
  { text: "+    let args = preview_tool_input(tc.tool_input.as_ref(), preview_chars);", tone: "text-ok" },
  { text: "-    journaled.push((name, String::new(), noise));", tone: "text-off" },
  { text: "+    journaled.push((name, args, noise));", tone: "text-ok" },
];

function SectionRule({ title }: { title: string }) {
  return (
    <h2 className="mt-12 flex items-center gap-3 text-sm font-bold text-ink">
      <span aria-hidden="true" className="text-dim">
        ──
      </span>
      {title}
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </h2>
  );
}

function JournalPanel({
  label,
  lines,
  verdict,
  verdictTone,
}: {
  label: string;
  lines: readonly string[];
  verdict: string;
  verdictTone: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-panel p-4">
      <p className="text-dim">{label}</p>
      <pre className="mt-3 overflow-x-auto text-ink">{lines.join("\n")}</pre>
      <p className={`mt-3 font-bold ${verdictTone}`}>{verdict}</p>
    </div>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <p className="text-dim">scopey · PostToolBatch · v0.2.4</p>
      <h1 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
        On Claude Code, Scopey&apos;s judge sees tool names without paths or commands.
      </h1>
      <p className="mt-4 text-lg text-ink">
        A small fix keeps each call&apos;s <code>tool_input</code>, so the judge can tell an edit
        to the wrong file from the right one.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a className="rounded-md bg-ink px-4 py-2 font-bold text-term" href={DIFF_URL}>
          See the diff
        </a>
        <a className="rounded-md border border-line px-4 py-2 text-ink" href={ISSUE_URL}>
          Issue #29
        </a>
        <a className="rounded-md border border-line px-4 py-2 text-ink" href={REPO_URL}>
          Demo repo
        </a>
      </div>

      <SectionRule title="the change" />
      <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-panel p-4">
        {DIFF_LINES.map((line) => (
          <span key={line.text} className={`block ${line.tone}`}>
            {line.text}
          </span>
        ))}
      </pre>
      <p className="mt-4 text-dim">
        This is the change suggested in #29 by batcave-official, who found and measured the bug.
        I added a regression test and the replays. <code>make release-check</code> passes.
      </p>

      <SectionRule title="what the judge reads" />
      <p className="mt-4 text-dim">
        First 15-tool window of a Claude Code session running a task I wrote, default config. A
        constructed test: the agent was asked to edit README.md, and for the replay I swapped the
        prompt to &quot;only docs/config.md, do not edit README.md&quot;. It shows the judge can now
        see the edit, not that Scopey caught real drift. Temp path shortened to &lt;tmp&gt;.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <JournalPanel
          label="v0.2.4"
          lines={BEFORE_LINES}
          verdict="insufficient_evidence: no correction"
          verdictTone="text-warn"
        />
        <JournalPanel
          label="with the fix"
          lines={AFTER_LINES}
          verdict="off_track: edited README.md"
          verdictTone="text-off"
        />
      </div>

      <SectionRule title="judge verdicts" />
      <p className="mt-4 text-dim">
        Real Claude Code sessions running tasks I wrote, replayed through both builds. Default
        config, haiku judge, 3 runs per cell.
      </p>
      <div className="mt-4 rounded-lg border border-line">
        <div className="hidden grid-cols-[2fr_1fr_1.5fr_1fr] gap-3 border-b border-line p-3 text-dim md:grid">
          <p>scope</p>
          <p>window has</p>
          <p>v0.2.4</p>
          <p>with the fix</p>
        </div>
        {RESULTS.map((row) => (
          <div
            key={row.scope}
            className="grid gap-1 border-b border-line p-3 last:border-0 md:grid-cols-[2fr_1fr_1.5fr_1fr] md:gap-3"
          >
            <p>{row.scope}</p>
            <p className="text-dim">
              <span className="md:hidden">window has: </span>
              {row.window}
            </p>
            <p className={row.beforeTone}>
              <span className="text-dim md:hidden">v0.2.4: </span>
              {row.before}
            </p>
            <p className={row.afterTone}>
              <span className="text-dim md:hidden">with the fix: </span>
              {row.after}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-dim">
        Names alone are often enough for a read-only window, which may be part of why{" "}
        <a className="underline" href={ISSUE_URL}>
          #29
        </a>{" "}
        reports 687 of 1763 checks without tool evidence and not all of them. That report also
        covers Codex sessions, so I can&apos;t split the number further.
      </p>

      <SectionRule title="worth checking" />
      <ul className="mt-4 list-none space-y-3">
        <li>
          <span className="text-warn">data:</span> commands and paths now reach the session JSON and
          the judge on Claude Code, clipped to 400 characters by default. There is no secret
          redaction here, same as the existing Codex path. It should cover both paths, so I left it
          as a follow-up.
        </li>
        <li>
          <span className="text-warn">cost:</span> about 670 more prompt characters on this
          session&apos;s window. The default worst case is 6,000 (15 × 400).
        </li>
        <li>
          <span className="text-warn">limits:</span> two short sessions, not a real user&apos;s
          long session. Events were captured with a <code>cat</code> hook, then fed
          to <code>scopey hook post-tool</code>.{" "}
          <a className="underline" href={EVIDENCE_URL}>
            Raw output and scripts
          </a>
          .
        </li>
      </ul>

      <footer className="mt-14 border-t border-line pt-5 text-dim">
        Unofficial demo by Cheryl Aurelia: not affiliated with ArchAstro.
      </footer>
    </main>
  );
}
