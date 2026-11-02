#!/usr/bin/env python3
"""Replays a real captured Claude Code session (PostToolBatch events) through both scopey builds
with default config, except a private SCOPEY_HOME. usage: replay_real.py DIR BEFORE AFTER RUNS OUT"""
import concurrent.futures as cf, glob, json, os, subprocess, sys, tempfile, time

D, BEFORE, AFTER, RUNS, OUT = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5]
events = [json.loads(l) for l in open(f"{D}/events.jsonl") if l.strip()]
real = open(f"{D}/prompt.txt").read()
NARROW = "Add a short 'State directory' section to docs/config.md explaining SCOPEY_HOME and SCOPEY_CONFIG. Verify it from the source first. Only change docs/config.md. Do not edit README.md."
CASES = {"real_prompt": real, "narrower_prompt": NARROW}

def hook(binary, env, sub, payload):
    subprocess.run([binary, "hook", sub], input=json.dumps(payload), text=True, env=env, capture_output=True, check=True)

def wait_scope(path, n):
    for _ in range(100):
        d = json.load(open(path))
        if sum(m.get("type") == "scope_requirements" for m in d["messages"]) >= n:
            return
        time.sleep(1)

def run(case, label, binary, i):
    home = tempfile.mkdtemp(prefix="scopey-replay-")
    env = {**os.environ, "SCOPEY_HOME": home}
    for k in ("SCOPEY_INTERNAL", "SCOPEY_HOOKS_DISABLED", "SCOPEY_CONFIG"):
        env.pop(k, None)
    sid = "replay-" + os.path.basename(home)
    cwd = events[0]["cwd"]
    tp = events[0]["transcript_path"]
    base = {"session_id": sid, "cwd": cwd, "transcript_path": tp}
    path = f"{home}/work/by-id/{sid}.json"
    hook(binary, env, "user-prompt", {**base, "hook_event_name": "UserPromptSubmit", "prompt": CASES[case]})
    wait_scope(path, 1)
    time.sleep(62)  # past the default min_job_interval_secs
    for e in events:
        hook(binary, env, "post-tool", {**e, **base})
    for _ in range(150):
        d = json.load(open(path))
        ready = [m for m in d["messages"] if m.get("type") == "judgement" and m.get("status") == "ready"]
        if ready:
            m = ready[-1]
            return {"case": case, "binary": label, "run": i, "verdict": m.get("verdict"), "summary": m.get("summary"),
                    "from": m.get("from_count"), "to": m.get("to_count"), "harness": d.get("harness"),
                    "tools": d["tool_call_count"], "with_args": sum(1 for e in d["tool_events"] if e["args_preview"])}
        time.sleep(2)
    d = json.load(open(path))
    return {"case": case, "binary": label, "run": i, "verdict": "timeout", "tools": d["tool_call_count"], "pending": d.get("pending_judge")}

jobs = [(c, l, b, i) for c in CASES for l, b in (("before", BEFORE), ("after", AFTER)) for i in range(1, RUNS + 1)]
with cf.ThreadPoolExecutor(8) as ex, open(OUT, "w") as f:
    for r in ex.map(lambda j: run(*j), jobs):
        f.write(json.dumps(r) + "\n"); f.flush()
        print(r["case"], r["binary"], r["run"], r["verdict"], r.get("harness"), f"tools={r.get('tools')} with_args={r.get('with_args')}", "|", (r.get("summary") or str(r.get("pending")))[:200], flush=True)
