# Atlas 31.2 — Non-destructive Forge guest-data recovery

**Draft staging only.**

If a saved GTA V/Online or GTA VI Forge record contains invalid JSON or an incompatible schema, the configurator now shows a branded on-page recovery panel. It never rewrites, auto-deletes or attempts to normalize the unreadable original on page opening. The visitor can explicitly download a JSON wrapper containing the **exact saved raw string**, the relevant world and key, and a warning that it is an emergency backup rather than a standard Forge preset import.

Only *after* the download action has been initiated does a separate Reset control enable. Reset requires a visible confirmation, checks that the original bytes have not changed since inspection and checks again after confirmation before it creates a minimal blank Forge record for the current world. Another tab's new data is never silently erased; the user must re-evaluate the newer data. Both Forge world keys are independent; Garage locations, model ownership, notes, and all other guest storage remain untouched. Failed export or localStorage writes never report a successful save.

Includes 44px controls, phone-safe layout and real accessibility statuses. Does not claim restored lost data, cloud backups or actual Rockstar ownership.

Focused tests: source syntax and exact-byte controls; built-site Chromium on 390px and 1440px for V and VI, raw backup byte verification, declined reset, newer-tab race, successful confirmed same-world reset, other-world and Garage ownership preservation. Manual iPhone Safari, full release Chromium+Edge+ZIP, artwork/media rights and owner approval remain pending.