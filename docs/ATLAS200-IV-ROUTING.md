# Liberty City route planning

The route planner saves an ordered list of source IDs and an optional finish on this device. Community landmarks, GTA IV Flying Rats, TLAD seagulls and TBOGT seagulls each have a separate list. Category filtering and hiding found items affect search results. They preserve the player's itinerary.

Add stops from map or search details. Select a start and an optional finish, then choose **Order nearest next**. Each step picks the closest remaining stop by horizontal game coordinates and reserves the finish for last. Bridges, street connectivity and driving time are outside this calculation. Route numbers on the map and copied stops follow the displayed order.

## Browser coverage

The production workflow exercises desktop and phone viewports in Chromium and Microsoft Edge. The Liberty City checks cover source category counts, both episode entry links, selected location reload, nearest-next ordering, reserved finish, route reload and scope isolation.

Safari and iOS Safari remain unverified. Real-device review should exercise touch selection and scrolling with the planner expanded, route survival after Safari is closed and reopened, and the Copy stops action on HTTPS. A phone viewport in the desktop browser runners does not exercise WebKit or the iOS clipboard.

The matching-places list now pages through the full filtered result set in batches of 80. A route can grow by up to five nearby matches per click. Each new stop is chosen from currently matching, unused positions, beginning at the last stop before the reserved finish. Existing stops keep their order. Hiding found collectibles also excludes them from nearby suggestions.

For real iPhone Safari review, scroll to the next results page, extend a route with a reserved finish, and reopen the page. Also review the expanded vehicle comparison and boat showroom at narrow widths, and return from a job to the started-checklists filter using Safari Back.
