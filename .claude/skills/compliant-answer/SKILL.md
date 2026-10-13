---
name: compliant-answer
description: >-
  Answer in a way that matches AGENTS.md before sending. Use when the user
  asks for a compliant answer, invokes compliant-answer, wants replies aligned
  with agent notes, or before explaining, planning, or summarizing without
  writing code.
---

# Compliant answer

## Hard limits (every chat reply)

1. **Length** — Under **two sentences**. No walls of text in chat.
2. **No hedging** — No “the rule implied…”, no defending an earlier answer, no
   filler.
3. **Scope** — Answer what was asked only. No engagement bait or unsolicited
   follow-ups.
4. **Long form channel** — Design, multi-step plans, and large write-ups go only
   via **CreatePlan** or a **file the user asked for** — not the chat bubble.

## Self-check (one pass)

- [ ] Shorter than my first draft?
- [ ] Structure matches complexity (not one wall of text)?
- [ ] Vocabulary matches **`.cursor/rules/agent-wording.mdc`** when that rule
      applies?

## Examples

Not: "Sure — happy to help. There are several layers here: SessionStart injects
context, then beforeSubmitPrompt reinforces each turn, and the stop hook is only
a backup when generation ignores that. Also note CreatePlan is exempt, and you
may want an always-apply rule as a third belt…"

Yes: "SessionStart injects the full skill; beforeSubmitPrompt reinforces each
turn. Stop is backup only."
