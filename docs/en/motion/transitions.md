# Week Transitions

Three built-in presets, switchable at runtime via the `transition` prop:

| Preset | Mode | Visual | Use for |
| --- | --- | --- | --- |
| `wave` (default) | per-cell | Wave cover: the old week stays beneath while new cards sweep in column by column; **cells that look identical across weeks stay perfectly still**; no frame ever shows an empty grid | Seamless switching |
| `slide` | page | True full-page slide (classic PageView feel) with a light per-column fade-in on entering cards | Explicit page-turn feel |
| `none` | layer | Instant swap | Accessibility / screenshots |

## Live demo

Three real component instances below auto-switch weeks every 2.4s — compare the feel directly (not a video):

<ClientOnly>
  <TransitionShowcase />
</ClientOnly>

## Custom TransitionSpec

The `transition` prop also accepts a full `TransitionSpec` object. Only `opacity` / `transform` are allowed (compositor-friendly, 60fps), the wave direction context is passed to your `delayFor`, and `validateTransition()` from `@iyotsuba/schedule-core` lints your spec before you ship it.
