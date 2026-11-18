---
name: opsx-update
description: Revise a change's existing planning artifacts and keep them coherent. Never edit code.
---

Revise a change's existing planning artifacts and keep them coherent. Never edit code.

**Input**: Optionally specify a change name (e.g., `/project:opsx-update add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Ask the user to select.

2. **Get the change's artifacts**
   ```bash
   openspec status --change "<name>" --json
   ```

3. **Understand the request**
   - If the user asked for a specific revision, that is the starting edit.
   - If they only said "update", treat it as a coherence review.

4. **Read and reconcile**
   - Read the artifact(s) the request touches and the change's other existing artifacts.
   - Apply the requested edit. Then check every other existing artifact for consistency.
   - Revise only files that already exist. Do NOT create new artifacts.

5. **Confirm and apply, one artifact at a time**
   - Show each proposed revision and why. Write only after the user confirms.

6. **Point to the next step (guidance only - NEVER act on it)**

**Guardrails**
- Planning artifacts only - NEVER edit implementation code.
- Confirm every edit with the user before writing.
- If the request changes the change's intent rather than refining it, recommend starting fresh.
