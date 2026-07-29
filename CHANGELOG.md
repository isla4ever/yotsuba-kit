# Changelog

## 0.7.2

- Made wave enter and leave opacity curves complementary so weather-enabled cards no longer brighten or flicker during week changes.
- Reused visually stable course-card DOM across weeks and excluded those cards from the leaving layer, preventing duplicate weather artwork and duplicate clear-weather suns.
- Kept weather animation phases continuous when cards are recreated and included time-slot weather in transition stability checks.
- Refined the guide spotlight to follow the focused element's actual visual bounds and corner radii with an even four-pixel focus gap.

## 0.7.1

- Fixed overlap-course week transitions so inactive cards stay beneath active and makeup cards on every animation frame.
- Kept covered inactive cards hidden for the full transition and restored them only after the active card has settled, removing the single-frame flash without changing the accepted timetable presentation.
- Added bidirectional browser frame sampling and Vue regression coverage for odd/even overlap groups.

## 0.7.0

- Added hourly weather snapshots and nearest-course-time matching so courses on the same day can render different weather and temperatures.
- Refined clear, cloudy, overcast, fog, drizzle, rain, heavy rain, storm, and snow visuals with seamless low-cost motion, localized course-card materials, and a single global ambience scene.
- Kept inactive courses desaturated, restored Saturday and Sunday weather materials, and constrained long course names, locations, and low-height cards without changing the accepted schedule layout.
- Moved course-detail weather into the hero, aligned three schedule density levels, and gave every Today weather widget size a distinct information hierarchy.
- Improved guide re-entry, sheet stacking, mask ownership, focus transitions, and unified fade-out timing across built-in overlays.
- Preserved `materials: string[]` compatibility while keeping structured books, materials, tasks, hourly weather, and guide contracts available across the package surface.

## 0.6.0

- Added structured course books, materials, and tasks while preserving legacy string materials.
- Added distinct animated glyphs, scenes, and course-card layers for clear, cloudy, overcast, fog, drizzle, rain, heavy rain, storm, and snow.
- Made real-time weather the default course-card presentation; explicit shimmer, glow, aurora, and breathe effects replace the weather layer while preserving weather glyphs.
- Added configurable empty-value labels and animated overlap-course detail transitions.
- Reworked Today for mobile card dragging, smart reflow, four-corner resizing, custom widget slots, events, and public methods.
- Aligned Vue, Elements, and React props, events, types, and imperative refs.

## 0.5.0

- Added high-level Schedule and Today components, weather contracts, detail layouts, sheet placement, themes, transitions, and consumer bindings.
