# dsh-continue-button

DSH Web UI plugin: adds a **Continue** (play) button next to the send icon
in the composer. A click sends the literal message `continue` to the current
session through the official conversation pipeline (the same
`conversation.send` the composer's default sink uses) — the draft is never
touched.

## Visibility

- **Hidden while the session is running** — in that state the Stop button is
  on duty (the same `running` signal the InputBar uses).
- **Hidden for a blank (new) session** — nothing to continue yet.
- In the hero / new-chat state the composer slot is not rendered at all.

## Install

```sh
dsh plugin --profile web add link:/home/shkulev/deepseekharness/dsh-continue-button
# or with an absolute path:
dsh plugin --profile web add /home/shkulev/deepseekharness/dsh-continue-button
```

Then refresh the web UI (or restart `dsh web`).

The button appears in the composer's right tool row, just before the
send/stop cluster, with a native-looking play icon and a localized tooltip
(en / ru).

## Uninstall

```sh
dsh plugin --profile web remove dsh-continue-button
```

## Implementation notes

- Client-only plugin (`dsh.client`, platform `web`); the host half is a
  no-op `apply()`.
- Slot: `conversation.input.right` (list, session-scoped) — the slot
  physically closest to the Send icon.
- Send path: `ctx.sessions.scope(sessionId)` → `actx.get("conversation")` →
  `conversation.send("continue")` (scoped-session prompt, mode `queue`,
  verbatim single text block; identical to typing `continue` + Enter while
  the session is idle).
- Show/hide: `useSession(s => s.running)` and `useSession(s => s.blank)`
  from the session snapshot.
- Styles are self-contained (one idempotent `<style>` node using the app's
  `--dsw-*` CSS variables, so light/dark themes follow automatically).

## License

MIT
