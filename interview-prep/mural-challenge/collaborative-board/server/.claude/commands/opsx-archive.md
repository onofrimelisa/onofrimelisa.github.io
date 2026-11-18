---
name: opsx-archive
description: Archive a completed change.
---

Archive a completed change.

**Input**: Optionally specify a change name (e.g., `/project:opsx-archive add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Ask the user to select.

2. **Check artifact and task completion**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   If incomplete artifacts or tasks: display warning, prompt for confirmation.

3. **Assess delta spec sync state**

   If delta specs exist, compare with main specs and offer to sync first.

4. **Perform the archive**

   ```bash
   mkdir -p "<planningHome.changesDir>/archive"
   mv "<changeRoot>" "<planningHome.changesDir>/archive/YYYY-MM-DD-<name>"
   ```

5. **Display summary**

   Show: change name, archive location, sync status.

**Guardrails**
- Always prompt for change selection if not provided
- Don't block archive on warnings - just inform and confirm
- Show clear summary of what happened
