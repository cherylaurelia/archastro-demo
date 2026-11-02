# Scopey: tool arguments for the judge on Claude Code

Unofficial demo by Cheryl Aurelia, not affiliated with ArchAstro.

## The problem

On Claude Code, Scopey's judge gets tool names without arguments, reported in [ArchAstro/scopey#29](https://github.com/ArchAstro/scopey/issues/29) with 0 of 500 events carrying `args_preview`. `PostToolBatch` is the only tool hook `scopey setup` installs for Claude Code ([setup.rs](https://github.com/ArchAstro/scopey/blob/fa32eaa/src/hooks/setup.rs#L238-L243)), and the batch branch journals an empty preview ([handlers.rs](https://github.com/ArchAstro/scopey/blob/fa32eaa/src/hooks/handlers.rs#L612-L617)).

## What this page shows

The journal the judge reads before and after the fix, and verdicts from two real Claude Code sessions replayed through both builds with default config. The fix is the [branch on the fork](https://github.com/ArchAstro/scopey/compare/main...cherylaurelia:scopey:fix/post-tool-batch-args).

## Evidence

`evidence/` has the captured hook events (session ids, paths and edit text removed), the prompt, raw verdicts and the scripts. `test-batches-judge.jsonl` is an earlier run on hand-written batches, not on a real session.

## Run it

```
npm install
npm run build
npm run start
```
