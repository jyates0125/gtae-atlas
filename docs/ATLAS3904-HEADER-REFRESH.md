# Atlas 39.0.4 — restore the approved cinematic design

Owner explicitly rejected flat placeholders, plain gradient header substitutions, repeated Loki/Scaly posters and old studio/dashboard UI. This supersedes the 39.0.3 gradient decision. Keep actual maps, newer approved world and mission cover imagery, approved crew identities and existing functionality.

New original 9-scene cinematic art pack generated; each WebP has a recorded SHA-256 in ATLAS3904-HEADER-ART.json. Binary transfer into GitHub requires installation of the nine files; until then the build uses existing real cinematic pictures rather than blank gradients. Production refuses the interim art pack state. No claim of final unique visual acceptance until actual new files are installed, source and browser checks pass, and the owner reviews the exact preview. Existing source art files preserved.

Studio Dashboard now uses approved world cover images (not actual map tiles), individual approved Loki and Scaly portraits, and the actual One Last Ride artwork instead of placeholders. Guides no longer uses old SVG skyline; Elario and Guides masthead now use the original crest, while the approved Elario cinematic hero remains untouched. Dashboard character portrait retries once on transient local transfer failure, then retains honest fallback. Existing user routes/saves and all map layers unchanged.

Known-good full release baseline: 1cb1ea39933665fdd00aae016a368d22d9828bfb; 39.0.3a full release failed Edge home portrait count, not a map failure. New release must remain on hold pending art pack, exact-head QA and owner native Safari review.
