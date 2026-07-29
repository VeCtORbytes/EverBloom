# EVERBLOOM — Master Architecture & Implementation Specification

**Project codename:** Everbloom
**Type:** Single-player, single-session, browser-native interactive narrative (2.5D WebGL)
**Target session:** 26–34 minutes first playthrough, 8–12 minutes on return visits
**Audience:** One person. That constraint is the design advantage — exploit it everywhere.
**Status:** Master spec. All implementation phases must conform to this document or amend it explicitly.

---

## 0. Executive summary of what I changed, and why

You asked me not to follow you blindly. Here is what I cut, merged, and replaced. Read this section first — the rest of the document assumes these decisions.

### 0.1 Thirteen mechanics became four worlds and five global systems

Your brief listed 13 discrete mechanics. At production quality each needs 12–25 hours of build plus tuning. That is a 250+ hour project with 13 shallow set-pieces, and shallowness is what breaks the "premium indie game" feeling. Worse, several of your mechanics are the *same mechanic* wearing different costumes.

| Your idea | Fate | Reason |
|---|---|---|
| Enchanted Garden | **Kept as hub** | Correct spine. Becomes the only "menu" in the product. |
| Hogwarts World | **Demoted to onboarding** (Petal I) | A magic school is a *tutorial fiction*, not a world. Using it as the teaching layer makes onboarding invisible. |
| Wand mechanics | **Promoted to the core verb** | See 0.2. This is now the whole game. |
| Potion Laboratory | **Merged** into Petal II | |
| Escape Room | **Merged** into Petal II | Both are "deduce a combination from clues." One world, two acts. |
| Spider traversal | **Merged** into Petal III | |
| Marauder Map | **Merged** into Petal III | The map is now *diegetic fog that traversal burns away*. Deletes an entire UI screen and makes the "two sets of footprints meet" beat something you earn by moving, not something you watch. Strictly better. |
| Spider Sense | **Dissolved** into global Discovery layer | It was never a world. It's a hidden-object rule that should apply everywhere. |
| Pensieve | **Kept as Petal IV** | This is the emotional payload. It deserves its own room. |
| Bouquet Builder | **Folded into Petal IV** | Placing a memory blooms a flower. The arrangement *is* the bouquet. Same act, one implementation, no extra screen. |
| Companion Creature | **Global system** | Also your accessibility escape hatch and hint engine. |
| Birthday Quest / candles | **Became the progression currency** | Don't run two collectible economies. Memories *are* the candles. |
| Constellation | **Kept, moved to the finale** | It was redundant with the bouquet as a mid-game beat. At the emotional maximum, using the same input verb, it lands. |
| Post-credit scene | **Kept** | Cheap, high delight, and it's your yearly-update hook. |

Result: **Prologue → Garden hub → 4 petals → Ascent → Everbloom → Credits → Post-credit.** Nine beats, four of which are substantial worlds. Every remaining mechanic is either a world or a rule that applies to all worlds.

### 0.2 One verb: the Thread

The single most important change. Every interaction in Everbloom is **drawing a line of light with the pointer.**

- Draw a glyph → cast a sigil
- Draw from your hand to an anchor → tether and swing
- Draw a mote into the water → place a memory
- Draw between two stars → build the constellation
- Draw across a seal → open it

One input model. Ten seconds to learn, zero to relearn. Identical on mouse, trackpad, and touch. It gives you visual coherence for free (the same trail shader appears in every world, so the worlds feel like one place), and it turns the finale into a **skill callback** — the last gesture of the game is the first gesture of the game, performed on the sky.

This is the "single new idea" the whole product is built on. Protect it. Any proposed mechanic that isn't "draw a line" needs to justify itself against the coherence it costs.

### 0.3 Original lexicon — the IP problem is real

"Hogwarts," "Marauder's Map," "Pensieve," "Lumos/Alohomora/Accio/Patronus," and "Spider-Sense" are protected marks and, in ensemble, unmistakable. Even for a private gift, building on them means you can never show this in a portfolio — which matters to you specifically. Original replacements below are stronger anyway, because they're yours.

| Was | Now | Note |
|---|---|---|
| Wand / spells | **Thread / Sigils** | |
| Lumos | **Kindle** | reveal, light, warm things |
| Alohomora | **Unbind** | open, unlock, release |
| Accio | **Beckon** | pull, gather, retrieve |
| Patronus | **Echo** | manifest a memory as a living shape |
| Hogwarts | **The Lantern School** | |
| Sorting Hat | **The Lantern Choosing** | See 2.2 — this is a real improvement, not a rename |
| Marauder's Map | **The Unfogging** | |
| Pensieve | **The Stillwater** | |
| Spider-Sense | **The Discovery layer** | |
| Companion | **Pip** (placeholder) | Rename after an inside joke. Do this. |
| The tree | **The Everbloom** | |

### 0.4 Next.js is the wrong tool here

Your candidate stack listed Next.js 16. Reject it. There is no SEO surface (the site is private), no server data, no auth, no routes — and Next's router actively tempts you into page-thinking, which is the one thing your core principle forbids. SSR/RSC also buys you nothing against a WebGL canvas that can't render on the server, while adding hydration complexity to the most performance-sensitive part of the app.

**Use Vite + React 19 + TypeScript + React Three Fiber.** Faster HMR (which matters enormously when tuning feel), smaller bundle, no framework ceremony, trivial static private deploy. Full justification and the rest of the dependency cuts in §5.

### 0.5 Skip full 3D. Build 2.5D.

The hidden project-killer isn't code, it's assets. Five fully-modelled, textured, lit 3D worlds is a studio art pipeline, and a solo dev without one ends up with grey boxes and Poly Haven props that look nothing like each other. That's how a project like this dies looking cheap.

**Build layered 2.5D:** orthographic-leaning camera, painted/procedurally-generated parallax planes, shader-driven atmosphere, and heavy particle work. Monument Valley and Ori get most of their beauty from *light, depth-of-field, silhouette, and particles* — all of which are cheap in a shader and expensive in a modelling package. Everbloom's one true 3D object is the tree in the finale, and it should be procedurally generated (§7.6), which is both easier and more magical than modelling it.

### 0.6 Glassmorphism is cut

You listed it under art direction. It's the single most "SaaS dashboard" visual language available, and your core principle is *never feel like a website*. Use **parchment, ink, light, and fog** instead (§7). This is your one hard art-direction veto.

### 0.7 Honest scope note

Full spec as written is roughly **190–250 hours** for one person new to R3F. You are final-year, interning, and building JobFlow AI. So §14 defines three tiers with real cut lines: **phases 0–13, 21, 22, 25, 27** (~70–90h) already produce a complete, moving, 14-minute gift that stands on its own. Everything after is upside. Build to that line first, and treat the Skybridge — the most technically expensive world — as optional scope that the Ascent is explicitly designed to survive without.

---

## 1. Experience Vision

### 1.1 The pitch

A seed arrives in the dark with no instructions. You touch it, and light follows your finger. What grows from it is a flower with four petals, and each petal is a place that remembers something about a friendship. When you've visited all four, the flower doesn't close — it climbs, and becomes a tree, and everything you gathered hangs in its branches as light. Then the lights rise into the sky and you draw the last shape yourself.

### 1.2 Emotional arc

| Beat | Minutes | Intended feeling | Design lever |
|---|---|---|---|
| Prologue | 0–3 | *Curiosity, then agency* | No UI, no text, no instructions. Only the trail responding to the pointer. Player discovers they have power. |
| Bloom | 3–5 | *Awe* | First full cinematic. Camera pulls back for the first time. Music enters. |
| Petal I — Lantern School | 5–11 | *Delight, belonging* | Warm, golden, comedic. Teaches all four sigils without a tutorial popup. |
| Petal II — Steeping Room | 11–18 | *Laughter* | Inside jokes as physical objects. Highest gag density. |
| Petal III — Skybridge | 18–25 | *Exhilaration → ache* | Fastest movement in the game, then the footprints converge and it goes quiet. |
| Petal IV — Stillwater | 25–30 | *Stillness, being known* | Deliberately low-agency. The Pixar breath. The letter lives here. |
| Ascent | 30–33 | *Mastery, momentum* | All four sigils in sequence. Every world flashes past re-lit. |
| Everbloom | 33–36 | *Overwhelm, warmth* | Constellation, candles, message. |
| Credits + stinger | 36–38 | *Laughter as a release valve* | Never end on tears alone. Always give them the exhale. |

**Rule of pacing:** never two consecutive worlds with the same interaction *rhythm*. The order is deliberate — learn (Lantern) → think (Steeping) → move (Skybridge) → feel (Stillwater). Swapping Skybridge and Stillwater destroys the arc; the quiet room must follow the loudest one.

### 1.3 Discovery loops

Three nested loops, so the experience rewards curiosity at three scales:

1. **Micro (seconds):** every scene has 6–15 objects that react to being threaded — a bell rings, a cat stretches, a book flutters. No reward, no counter. Pure texture. This is what makes a world feel alive and it's the cheapest thing in the document.
2. **Mid (per world):** 3 hidden memories per world, off the critical path. Findable via Pip's attention and via ambient audio cues. 12 total.
3. **Macro (whole run):** the number of memories collected **visibly changes the finale** — the density of the tree's canopy, the number of stars available in the constellation, and one extra line in the closing letter at 12/12. Exploration must alter the ending, or it isn't exploration.

### 1.4 Replayability

This is a gift, not a game with a retention target. So replay value is *not* new challenge — it's **recognition**:

- Save state persists. Returning shows the garden as they left it, with the tree already grown.
- **Free-roam mode** unlocks after completion: revisit any world with no objectives, purely to wander and re-read memories. This is what they'll actually come back to.
- The post-credit stinger changes on visits 2, 3, and 5 (three variants, ~20 lines of code, disproportionate delight).
- `contentVersion` in the save file lets a future year's content pack announce itself: "something new has grown."

### 1.5 The five magic moments

Everything else in this document is scaffolding for these. If any one of them isn't landing in playtest, stop and fix it before adding anything.

1. **First light.** Pointer moves in total darkness; a trail follows. No text. Player realises *they* are the light source.
2. **The bloom.** Camera pulls back from the sprout to reveal a garden that was never visible before, as the music resolves.
3. **The convergence.** In the Skybridge, the second set of footprints has been running ahead of you for five minutes. You catch up. They're waiting. They've been waiting the whole time.
4. **The ascent reveal.** The petals fold and you realise the flower was never the destination — you're going *up*, through every world again, and you already know how to do all of this.
5. **The last gesture.** Drawing the constellation. Same motion as minute one, on the sky, with everything they collected as the stars.

---

## 2. World Architecture

Shared contract for every world (enforced by the `World` module interface, §5.6):

- **Entry:** camera dives *into* a petal. No fade-to-black anywhere in the product. Ever.
- **Exit:** the world's key light collapses into a mote which flies back to the garden and becomes a petal-glow.
- **Failure:** no world can be failed, and nothing can be lost. Wrongness is always *funny or informative*, never punitive. There is no health, no timer that can expire against you, no death.
- **Hint escalation:** 45s idle → Pip looks at the answer. 90s → Pip walks to it. 150s → Pip solves it and looks apologetic. Never a text hint box.
- **Duration guard:** each world has a soft target; if the player exceeds 1.6× target, hint escalation accelerates and optional content stops spawning.
- **Payload:** each world ends by yielding exactly **one primary memory** (the emotional beat) and hides **three secondary memories**.

### 2.1 The Garden (hub)

| | |
|---|---|
| **Purpose** | The only navigational surface in the product. Progress made visible as growth. |
| **Verb** | Look, thread, choose. |
| **Time** | 2 min first visit, ~20s per return |
| **Visual** | Night → dawn → day → dusk → starfield, advancing one step per completed petal. The hub literally tells time by progress; no progress bar needed. |
| **Layout** | Single flower centre-frame. Camera on a slow orbit spline, never player-controlled. Four petals at cardinal points, closed and grey until unlocked. |
| **Unlock rule** | Petal I is the only one open at first (it teaches). After it, II–IV open simultaneously — player chooses order. Free choice after a guided opener is the best of both. |
| **Audio** | One music bed (`garden_bed`) that gains an instrument layer per completed petal. By the fourth return it's a full arrangement. Players feel this without noticing it. |
| **Secrets** | A watering can that, threaded three times, grows a mushroom that Pip will sit on. A buried thing that only surfaces at dusk. |
| **Transitions** | `Kindle` a petal → petal opens → camera dollies into the aperture → the aperture's colour fills frame → new world resolves out of that colour. Roughly 1.8s, covering the async chunk load. |

### 2.2 Petal I — The Lantern School

Spring. Gold-green. Theme: **beginnings**. 5–6 min. Soft target 5:30.

| | |
|---|---|
| **Purpose** | Teach all four sigils, the Thread, and Pip — inside fiction, with zero tutorial UI. |
| **Gameplay** | Letter → Choosing → three 60-second "classes," each teaching one sigil. Kindle is already known from the Prologue. |
| **Opening** | A paper moth flies in with a folded letter. To open it, the player traces their friend's name on the seal. First gesture recognition, guaranteed success (any closed-ish scribble passes). |
| **The Lantern Choosing** | Four lanterns drift in — amber, rose, jade, violet. Catch one with the thread. It becomes Pip's colour, the trail colour, and the UI accent **for the rest of the run**. <br>*Why this beats a Sorting Hat:* no classification means no "wrong house," no ranking, no personality verdict imposed on the recipient. It's pure agency, it costs one theme variable, and the payoff — realising 20 minutes later that the whole world is tinted by their own choice — is significant. |
| **Class 1 — Unbind** | A cupboard bound in ribbon. Draw the sigil, the ribbon unwinds. Inside: something absurd and personal. |
| **Class 2 — Beckon** | A shelf too high. Beckon a book down. It complains. |
| **Class 3 — Echo** | A dusty portrait. Echo makes it move and speak one line. This is the sigil that later reveals memories, so it must first be used on something charming, not something heavy. |
| **Teachers** | No human NPCs — a chalk drawing, a kettle, and an ink bird. Living objects are far cheaper to author and read as more magical than a modelled character. |
| **Failure** | Sigil recognition threshold is generous (§4.2). Three misses → the ghost path of the correct sigil fades in behind the cursor and you trace it. |
| **Secrets** | (1) A window that, Unbound, lets a bird in that follows you for the rest of the world. (2) A desk carving of two initials. (3) A locked cupboard that *cannot* open yet — reads as a bug, resolves in the Ascent. Plant it. |
| **Primary memory** | The earliest artefact of the friendship — first photo, first message screenshot. Delivered by the moth as a second letter at the end. |
| **Audio** | Celeste, plucked strings, distant indoor rain, chalk, wood, small bells. |

### 2.3 Petal II — The Steeping Room

Autumn. Amber-copper. Theme: **laughter**. 6–8 min. Soft target 6:30.

| | |
|---|---|
| **Purpose** | The comedy world. Carry the inside jokes. |
| **Verb** | Combine, then deduce. |
| **Act 1 — Play (2 min)** | A cauldron and a wall of ~12 absurd ingredients drawn from real shared history. Any two ingredients produce *something*: a reaction matrix of 66 pairs, of which ~10 are recipe-relevant and the rest are jokes. **Nothing is ever "invalid."** This is the single most important design rule in this world — it converts experimentation from risk into reward. |
| **Act 2 — Recipes (3 min)** | Three recipe cards written as riddles about the friend. "Two parts of the thing she says when she's lying." Solve by picking ingredients, not by typing. |
| **Act 3 — The Sealed Door (2 min)** | The escape-room beat, and it belongs here rather than in its own world. The exit door has four glyph dials. The combination is hidden in the room: one digit on a shelf label, one in a recipe's margin, one that only appears under `Kindle`, one that Pip is standing on and will move off if you Beckon him. Four different information channels — that's what makes a puzzle feel designed rather than arbitrary. |
| **Failure** | Wrong combination → the door burps. Dials keep their positions. Never resets progress. |
| **Reaction matrix authoring** | Data-driven (`recipes.ts`): `{a, b, result, vfx, sfx, line, isRecipeStep}`. A fallback generator covers unauthored pairs with one of 6 generic comic reactions, so the matrix is never a completeness obligation. |
| **Secrets** | (1) Drink your own potion (thread it to your cursor) → 15 seconds of inverted colours + a Pip reaction. (2) A ledger of previous "students" with joke names. (3) A rat that steals an ingredient and must be Beckoned. |
| **Primary memory** | A bottled video or voice clip of them laughing. Uncorked, it plays as steam-projection above the cauldron. |
| **Audio** | Bassoon and marimba, bubbling, cork pops, a comic timpani sting on every failed mix. |

### 2.4 Petal III — The Skybridge

Dusk. Indigo-violet. Theme: **showing up**. 5–7 min. Soft target 6:00. **Highest technical risk in the project — see §14 cut line.**

| | |
|---|---|
| **Purpose** | The kinetic peak. Also carries the single best emotional beat. |
| **Verb** | Tether and swing. |
| **World shape** | Rooftops of a warm-lit city floating in deep fog. No ground. Anchor points glow faintly on eaves, chimneys, lampposts, wires. |
| **Core loop** | Draw a thread from the player to an anchor → thread snaps taut → pendulum → release at apex → arc. Anchors within a 60° forward cone auto-snap generously; skill expression is in *release timing*, not aim. This is the correct place to be forgiving, because aiming is where players fail and timing is where they feel good. |
| **The Unfogging** | Fog is the map. Every rooftop you pass permanently burns fog in a radius. There is no map screen, no minimap, no reveal UI. The world *is* the progress display. |
| **The convergence** | A second set of glowing footprints is always visible one or two rooftops ahead, moving away from you at exactly your average speed. It never lets you catch it — until the central rooftop, where the prints stop, turn, and wait. Both trails meet. The music drops to a single instrument. That's the whole beat; do not add dialogue to it. |
| **Failure** | Cannot fall to death. Drop below the floor plane → you settle onto a cloud, and a thread lifts you back to the last rooftop in 2s. Flow preserved, no reload, no penalty. |
| **Secrets** | (1)(2) Two off-path rooftops reachable only via a long chained swing. (3) A weathervane that must be Beckoned mid-air. |
| **Primary memory** | The "you showed up for me" artefact. Sits on the central rooftop where the footprints meet. |
| **Audio** | Wind that pitches with velocity, taut-rope creak, a rising cloth whoosh on release, and a single sustained cello that fades in as you near the centre. Velocity → audio mapping is what makes traversal feel good; budget real time for it. |
| **Physics** | Verlet rope, 12–16 segments, 4 constraint iterations, fixed 60Hz substep decoupled from render. Hand-rolled (~120 lines) rather than Matter.js — see §5.4. |

### 2.5 Petal IV — The Stillwater

Winter. Silver-blue. Theme: **being known**. 4–6 min. Soft target 5:00.

| | |
|---|---|
| **Purpose** | The emotional core. This world carries the actual message. Build it early (§14, Phase 12) — if only one world ships, it must be this one. |
| **Verb** | Listen, and place. |
| **World shape** | A dark circular chamber. A still black basin. Snow that falls upward. Memory motes drift like slow fireflies. Almost nothing else. Restraint is the art direction here. |
| **Core loop** | Thread a mote into the water → the surface becomes a window → the memory plays, ripple-distorted, with sound. When it finishes, a flower blooms on the surface where you placed it. |
| **The Bouquet, absorbed** | Each flower's species and colour is authored per memory, mapped to a trait ("stubborn," "the one who always texts first"). The player's *placement* is stored. In the finale, that exact arrangement reappears as the tree's first ring of blossoms. The Bouquet Builder's payoff survives; its screen does not. |
| **Structure** | 5 motes are ambient/light. The 6th is the letter — it's larger, dimmer, and slower, and it can only be placed once the other five are in the water. Sequencing by weight, not by lock. |
| **The letter** | Rendered as ink writing itself onto the water in the display face, at a readable pace, with a single held note underneath. Skippable but not fast-forwardable — pacing is the gift. |
| **Failure** | None. No timers, no fail state, no wrong placement. |
| **Secrets** | (1) Thread the falling snow into a shape. (2) A memory that only appears if you sit completely still for 20 seconds — reward stillness once in the game. (3) A reflection in the water that isn't yours. |
| **Audio** | Near-silence. One piano, room tone, water. The mix should feel like the volume dropped even though it didn't. |

### 2.6 The Ascent (climax)

3–4 min. No new mechanics — everything is callback. This is why it's cheap to build and lands hard.

- The four petals fold inward. The stem begins to climb, fast.
- The camera follows the player *upward* along a growing vine. Traversal is the Skybridge system reused, retargeted to vertical.
- Passing fragments: as you rise, re-lit shards of all four worlds drift past — reused assets, recontextualised. This is the single highest emotional-return-per-hour beat in the document.
- Four gates, one per sigil, in acquisition order. Generous windows, zero fail state, but the *rhythm* creates pressure. Mastery, felt.
- Each memory collected becomes a light that flies past you and up.
- The vine breaks the cloud layer. Cut the music. Two seconds of silence. Then the canopy opens.

**If Skybridge is cut, the Ascent still works** — reskin it as a slow, awed rise on a spline with the four sigil gates. Design this dependency out early.

### 2.7 The Everbloom (finale)

3–4 min. One continuous unbroken shot. No cuts, no UI, no interruptions.

1. **Bloom.** The tree opens. Canopy density is a direct function of memories collected. The first ring of blossoms is the Stillwater arrangement, exactly as they placed it.
2. **Rise.** Camera lifts above the canopy. The lights detach and float up into a black sky as stars.
3. **The constellation.** The player draws between stars. The threading verb, one last time, at maximum stakes. Snapping is aggressive — this cannot be failed or made ugly. Wrong connections simply don't take.
4. **The symbol.** *Do not use a heart.* Use something only the two of them would recognise — joined initials, a shape from a shared joke, the outline of a place. This choice is content, not code; specify it before Phase 19.
5. **The candles.** The constellation's stars descend as candle flames on the tree. A single downward sweep of the thread — a breath — and they go out together.
6. **The message.** Last words in darkness, in the display face, unhurried.

### 2.8 Credits & post-credit

- Credits: drifting petals carrying names — you, and them. Skippable after 2 seconds. Ambient music continues; do not stop the audio.
- **Post-credit stinger:** the garden, empty, dawn. A new sprout. Pip drags in something absurdly oversized, looks at camera, and one line lands. Cut to black on the joke.
- Variants on visits 2, 3, and 5. Then free-roam unlocks in the garden.

---

## 3. Story Architecture

Everbloom has almost no dialogue and no exposition. The story is carried by **place, sequence, and one artefact per world.** Written text appears in exactly four places: the letter (Petal I), the recipe riddles (Petal II), the Stillwater letter, and the final message. Every other beat is visual.

| Act | Beat | Function | Delivery |
|---|---|---|---|
| I | Darkness, then light follows the pointer | Establish agency before establishing anything else | Pure interaction, no text |
| I | The seed | Establish object of care | One gesture: plant it |
| I | The bloom | Inciting reveal; promise of scale | Cinematic, 12s |
| II | Lantern School | Establish rules and tone (warm, funny, safe) | Play |
| II | Steeping Room | Establish *this specific friendship*'s texture | Jokes as objects |
| III | Skybridge | Establish stakes: someone has been ahead of you the whole time | Traversal + footprints |
| III | Convergence | Turn: the adventure was never solitary | Silence |
| III | Stillwater | Interiority; the actual thesis | The letter |
| IV | The petals fold | False ending → real ending | Camera reversal |
| IV | The Ascent | Mastery; the past re-lit | Callback |
| V | The Everbloom | Payoff: everything gathered, made permanent | Constellation |
| V | The candles | Occasion: this is a birthday | One gesture |
| V | The message | Direct address, no metaphor | Text on black |
| VI | Post-credit | Release | Gag |

**The mystery:** three planted unresolvables — the locked cupboard (Petal I), the reflection that isn't yours (Stillwater), and the footprints (Skybridge) — all resolve in the Ascent as *the same answer*: the friend was walking this with you. Three questions, one answer, is the cheapest way to make a short story feel constructed.

---

## 4. Gameplay Systems

Nine systems. Each is engine-layer, world-agnostic, and independently testable. Worlds are *content on top of these*; a world that needs a bespoke system is a world that needs redesigning.

### 4.1 Thread system (`engine/thread`)

The foundation. Everything else consumes it.

- Pointer path capture at render rate, resampled to fixed 8px spacing, ring buffer capped at 256 points.
- Emits `threadStart`, `threadMove`, `threadEnd`, `threadHold` on the event bus.
- Owns the trail render: an additive tapered ribbon mesh with a soft-glow fragment shader, colour driven by the Lantern Choosing.
- **Modes:** `free` (ambient wandering), `gesture` (recognition armed), `drag` (a mote is attached), `tether` (physics attached), `link` (connecting two nodes, for constellations).
- Touch: identical code path. Pointer Events only — never mouse events.
- Keyboard fallback: `Tab` cycles interactables, `Enter` performs the contextually-correct thread action. Non-negotiable (§6.5).

### 4.2 Sigil system (`engine/sigils`)

- **Recognizer: $1 Unistroke with the Protractor extension.** ~200 lines, no dependencies, no ML, resolution- and rotation-tolerant, and trainable from a single example per glyph. Do not reach for a gesture library or a neural net; this problem was solved in 2007.
- Templates authored as normalized point arrays in `content/sigils.ts`. Four glyphs, deliberately distinct in stroke topology (a spiral, an angular Z, a hook, a closed loop) so confusion is structurally impossible.
- Score threshold **0.75**, tuned down aggressively in playtest. Over-accepting is a good bug; under-accepting is a project-ending one.
- Per-attempt failure counter → ghost-path assist at 3.
- Sigils are gated by acquisition (`progress.sigils`), so casting Echo in Petal I before class 3 simply produces sparkles.

### 4.3 Interaction system (`engine/interaction`)

- Every interactable registers `{id, bounds, requiredSigil?, onThread, onSigil, hoverHint, cursorState}`.
- Broad-phase hit test against a spatial hash (not raycasting every object every frame).
- **Hover feedback is mandatory and universal:** the trail brightens and the object exhales a little. This is the whole discoverability model — with no UI, hover response is the *only* affordance. Budget polish time here specifically.

### 4.4 Progression system (`engine/progression`)

- A DAG of `ProgressNode`s, not a linear index. Nodes: `petal.unlocked`, `sigil.acquired`, `memory.collected`, `world.completed`, `secret.found`.
- Worlds declare prerequisites declaratively; the graph resolves what's open. Adding a fifth petal in 2027 is a data edit.
- Emits `progressChanged`; the Garden, the tree, and the audio layer bed all subscribe. No world knows about any other world.

### 4.5 Memory system (`engine/memory`)

- `MemoryNode` (§10) is the atomic content unit: image, video, audio, or letter.
- Media is lazy: only the manifest loads up front. Full media loads on world entry, decrypted if the media pack is protected (§12).
- Presentation is per-world (steam projection, water window, star) but the data and playback controller are shared.
- Collected memories are permanent and re-viewable from the tree in free-roam.

### 4.6 Companion (`engine/companion`) — Pip

- Finite state machine: `follow → idle → curious → point → assist → react → perch`. Not a behaviour tree; that's over-engineering for seven states.
- Movement: spring-damped lag behind the player with perlin bob, plus a lookahead bias so he feels *eager* rather than tethered. This one detail is most of his personality.
- Hint escalation owner (§2 shared contract).
- **Pip is the accessibility layer wearing a costume.** Any player who cannot or does not want to complete a challenge is served by Pip, so no skip button is ever needed and nobody feels condescended to.

### 4.7 Dialogue system (`engine/dialogue`)

Deliberately minimal — **no branching, no choices, no trees.** Dialogue trees are among the most expensive systems in games and would buy nothing here.

- A `DialogueLine` queue: `{speaker, text, duration, audioCue?, portraitState?}`.
- Typewriter reveal, always skippable, always captioned, never blocking gameplay unless the beat is cinematic.

### 4.8 Save & settings (`engine/save`)

- `localStorage`, single slot, key `everbloom.save.v1`, zod-validated on read, silent migration path, corrupt-save fallback to fresh start (never an error screen).
- Autosave on: world enter, world complete, memory collect, secret find, sigil acquire.
- Settings persist separately (`everbloom.settings.v1`) so a save reset never resets accessibility choices. Small thing, real difference.

### 4.9 Audio system (`engine/audio`)

- Howler.js. Buses: `music`, `ambience`, `sfx`, `voice`. Master and per-bus gain.
- **Layered stems, not tracks.** One harmonic bed for the whole product plus per-world layers, crossfaded on transition. Music never stops between the Prologue and the credits — which is a large part of why the product won't feel like a website.
- Ducking: ambience and sfx drop 6dB during memory playback and dialogue.
- Cue registry so worlds reference `sfx.thread.snap`, never file paths.
- **Autoplay:** browsers block audio before a gesture. The Prologue's first thread *is* the unlock gesture. The constraint is designed into the story rather than papered over with a "click to enable sound" button.

### 4.10 Supporting systems (brief)

- **Camera** (`engine/camera`): single rig. Spline dollies, look-at targets, spring smoothing, shake, DOF focus target. Never player-controlled. Protecting framing is protecting the art direction.
- **Particles** (`engine/particles`): one GPU-instanced pooled system, config-driven emitters. Global cap 2000 live particles, scaled by quality tier. Do not write a second particle system.
- **Timeline / beats** (`engine/beats`): cinematic sequencer — an array of `{at, action}` on a clock, with `skip()` that fast-forwards state rather than jumping. All cutscenes are data.
- **Physics** (`engine/rope`): verlet rope + point-mass pendulum only. Nothing else in the product needs physics.
- **Transitions** (`engine/transition`): the diegetic dive. Owns async chunk loading, so loading is always hidden inside a story beat and there is never a loading screen after the first.

---

## 5. Technical Architecture

### 5.1 Stack decisions, with the cuts

| Library | Verdict | Reasoning |
|---|---|---|
| **Vite 6 + React 19 + TypeScript** | **Keep** | Sub-100ms HMR is the single biggest productivity factor when tuning feel. Strict TS pays for itself in a data-driven content model. |
| ~~Next.js 16~~ | **CUT** | No SEO, no server data, no routes, no auth. SSR cannot render a canvas. Its router encourages page-thinking, which violates the core principle. Replaced by a scene state machine. |
| **React Three Fiber + Drei** | **Keep** | R3F's reconciler lets you express scenes declaratively while keeping per-frame work in `useFrame` refs. Drei for `<Shader>`, `<Instances>`, `<EffectComposer>` helpers — import narrowly, it's large. |
| **Three.js** | **Keep** | Underlies R3F. |
| **Zustand** | **Keep** | The right size. Critically, `store.subscribe` gives transient updates that never re-render React — mandatory for 60fps. Use selector-scoped hooks everywhere. |
| **Howler** | **Keep** | Sprite support, bus-friendly, handles mobile unlock quirks you don't want to write. |
| **GSAP** | **Keep, scoped** | Only for cinematic timelines (Bloom, Ascent, Everbloom). Superior sequencing and a real `timeScale` for skip. Never for per-frame scene animation. |
| **zod** | **Add** | Validates content packs and save files at the boundary. With 12 memories and 66 recipe pairs authored by hand, schema validation at load is what saves you at 2am. |
| ~~Framer Motion~~ | **CUT** | Its value is DOM layout animation. Your DOM surface is a settings panel and captions. CSS transitions cover it. Don't ship a 40KB animation runtime for a canvas app. |
| ~~Lenis~~ | **CUT** | There is no scrolling in this product. This is the point. |
| ~~Matter.js~~ | **CUT** | 2D rigid-body engine for a 2.5D scene needing exactly one rope. 120 lines of verlet gives better feel and total tuning control. Every hour spent fighting an engine's units is an hour not spent on swing feel. |
| ~~React Spring~~ | **CUT** | Redundant with GSAP + hand-rolled spring damping in `useFrame`. Pick one animation philosophy. |
| ~~React Query~~ | **CUT** | Zero server state. |
| ~~Spline~~ | **CUT** | Editor lock-in, heavy runtime, and 2.5D doesn't need it. |
| ~~Theatre.js~~ | **Dev-only, optional** | Genuinely nice for authoring camera moves, but it's a second animation system and a tree-shaking hazard. Only adopt if hand-authoring GSAP camera splines becomes the bottleneck. Never ship the studio bundle. |
| ~~Motion One~~ | **CUT** | Redundant. |
| ~~Tailwind~~ | **Reduce to CSS Modules** | You have almost no DOM. Utility classes on 5 components isn't worth the toolchain or the temptation toward a "web" look. Two CSS Modules files, custom properties for the theme accent. |
| ~~WebGPU~~ | **CUT** | Coverage risk on the one machine that matters, for zero benefit at this scale. WebGL2 is correct. |
| **Vitest + Playwright** | **Add** | Vitest for recognizer, rope, progression graph, save migration. Playwright for one smoke test that boots and reaches the garden. Don't test visuals. |

### 5.2 Layer separation

Four layers, one-directional dependencies. Enforce with ESLint `import/no-restricted-paths` — a lint rule is worth more than a convention.

```
┌─────────────────────────────────────────────┐
│ CONTENT   memories, recipes, sigils,        │  data only, zero logic
│           dialogue, world configs           │
├─────────────────────────────────────────────┤
│ WORLDS    scene modules: garden, school,    │  composes gameplay + content
│           steeping, skybridge, stillwater,  │
│           ascent, everbloom                 │
├─────────────────────────────────────────────┤
│ GAMEPLAY  progression, memory, companion,   │  rules; knows engine, not worlds
│           discovery, dialogue, quests       │
├─────────────────────────────────────────────┤
│ ENGINE    thread, sigils, interaction,      │  reusable; knows nothing above
│           camera, particles, audio, rope,   │
│           beats, transition, save, loader   │
└─────────────────────────────────────────────┘
```

Rules: engine imports nothing above it. Gameplay imports engine only. Worlds import gameplay, engine, content. Content imports types only. **No world ever imports another world.**

### 5.3 Folder structure

```
everbloom/
├─ public/
│  ├─ audio/{music,ambience,sfx}/
│  ├─ textures/{garden,school,steeping,skybridge,stillwater,shared}/
│  ├─ fonts/
│  └─ media/                    # private memories — gitignored, see §12
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                   # canvas, overlay, boot
│  ├─ engine/
│  │  ├─ thread/{ThreadController.ts,ThreadTrail.tsx,useThread.ts,thread.store.ts}
│  │  ├─ sigils/{recognizer.ts,templates.ts,SigilController.ts,SigilGhost.tsx}
│  │  ├─ interaction/{InteractionRegistry.ts,spatialHash.ts,useInteractable.ts}
│  │  ├─ camera/{CameraRig.tsx,splines.ts,camera.store.ts}
│  │  ├─ particles/{ParticleSystem.tsx,emitters.ts,pool.ts}
│  │  ├─ audio/{AudioEngine.ts,cues.ts,buses.ts,useAudio.ts}
│  │  ├─ rope/{verlet.ts,pendulum.ts,RopeMesh.tsx}
│  │  ├─ beats/{Timeline.ts,useBeat.ts}
│  │  ├─ transition/{TransitionController.ts,PetalDive.tsx}
│  │  ├─ loader/{AssetLoader.ts,manifest.ts,decrypt.ts}
│  │  ├─ save/{save.ts,schema.ts,migrations.ts}
│  │  └─ core/{eventBus.ts,clock.ts,sceneMachine.ts,quality.ts,rng.ts}
│  ├─ gameplay/
│  │  ├─ progression/{graph.ts,progression.store.ts,nodes.ts}
│  │  ├─ memory/{MemoryController.ts,MemoryPlayer.tsx,memory.store.ts}
│  │  ├─ companion/{PipController.ts,PipView.tsx,hints.ts}
│  │  ├─ discovery/{DiscoveryRegistry.ts,discovery.store.ts}
│  │  └─ dialogue/{DialogueQueue.ts,Captions.tsx}
│  ├─ worlds/
│  │  ├─ _shared/{WorldShell.tsx,useWorldLifecycle.ts,types.ts}
│  │  ├─ prologue/  garden/  school/  steeping/
│  │  ├─ skybridge/ stillwater/ ascent/ everbloom/ credits/
│  ├─ content/
│  │  ├─ memories.ts  sigils.ts  recipes.ts  dialogue.ts
│  │  ├─ worlds.config.ts  audio.manifest.ts  theme.ts
│  │  └─ schema/*.zod.ts
│  ├─ ui/                        # the entire DOM surface
│  │  ├─ Overlay.tsx  Captions.tsx  Settings.tsx  BootGate.tsx  Vignette.tsx
│  ├─ shaders/{trail,water,fog,bloomTint,inkReveal,canopy}/*.{vert,frag}
│  └─ types/
├─ tools/{buildManifest.ts,encryptMedia.ts,validateContent.ts}
└─ tests/{unit,e2e}
```

### 5.4 Key patterns

- **Scene state machine over routing.** `sceneMachine.ts` is an explicit FSM: `boot → prologue → garden → world:{id} → ascent → everbloom → credits → freeroam`. Transitions are async and awaitable so `TransitionController` can hold the dive animation until the chunk resolves. No URL changes, no history, no back button. There are no pages, so there is no router.
- **Controller + View split.** Every system is a plain-TS controller (testable, frame-driven) plus a thin R3F view component. React is a scene-graph description language here, not the runtime.
- **Registry pattern** for interactables, sigils, cues, discoveries, worlds. Everything self-registers on mount; nothing is centrally listed. This is what makes adding a world a local change.
- **Event bus** (tiny typed emitter, ~30 lines) for cross-system fire-and-forget. Zustand for state that renders; the bus for things that happen. Keeping these separate prevents the store from becoming a message queue.
- **Content is data, always.** No memory, joke, riddle, or line of dialogue in a component. If content lives in TSX, the 2027 update is a refactor instead of an edit.

### 5.5 Rendering strategy

- One `<Canvas>` mounted for the entire session. Never unmounted. This is what kills the "page reload" feeling at the technical level.
- `dpr={[1, 1.75]}` clamped, `powerPreference: 'high-performance'`, `antialias: false` (FXAA in the composer is cheaper and looks fine over painterly art).
- Post chain: Bloom → subtle chromatic aberration → vignette → film grain → LUT grade. One half-res render target for bloom. Per-world LUT is how four worlds read as distinct places for near-zero cost — this is the highest-leverage art decision in the document.
- Depth via layered planes on parallax rails, not modelled geometry. Fake DOF by pre-blurring background layers in the texture; a real DOF pass is not worth the frame time.
- `frameloop="always"` in worlds, `"demand"` in the settings overlay and the letter beats.

### 5.6 The World module contract

```ts
interface WorldModule {
  id: WorldId
  prerequisites: ProgressNodeId[]
  assets: AssetManifestRef        // preload set for this chunk
  audio: { bed: CueId; layers: CueId[] }
  grade: LUTRef
  softTargetSeconds: number
  Scene: React.ComponentType      // mounted inside <Canvas>
  onEnter(ctx: WorldContext): void | Promise<void>
  onExit(ctx: WorldContext): void
  hints: HintLadder
}
```

Every world is lazy-imported through this interface. A new world is one file plus a content entry — no changes to the engine, the garden, or the machine.

---

## 6. UX Architecture

### 6.1 Navigation: there isn't any

No menu, no nav bar, no breadcrumbs, no back button, no URL. The Garden is the only branch point and it's diegetic. The only persistent DOM is a small settings glyph in a corner that fades out after 8 idle seconds.

### 6.2 Onboarding: three gestures, no words

Darkness. Pointer moves; light follows (discovery 1: *I have a thread*). A seed pulses; thread it (discovery 2: *the thread touches things*). A sigil shape ghosts on screen; trace it (discovery 3: *shapes do things*). Total: 90 seconds, zero words, zero UI. Everything else is taught in Petal I inside the fiction. **If you ever find yourself writing a tutorial popup, the interaction design has failed — fix the interaction.**

### 6.3 Cursor

The cursor is the whole interface, so it does the work a UI would:

| Context | Cursor state |
|---|---|
| Idle | Small mote, gentle bob, slow trail decay |
| Over interactable | Brightens, tightens, faint ring |
| Requires an unowned sigil | Ring stutters and dims — "not yet," without text |
| Gesture armed | Trail thickens and holds longer |
| Dragging a memory | Mote captured inside the cursor |
| Tethered | Trail becomes taut rope with a real anchor |
| Cinematic | Fades to nothing — never let the cursor sit over a cutscene |

Hide the native cursor everywhere except the settings overlay.

### 6.4 Discovery

Three ambient channels, no UI: things that shine differently, sounds that get louder as you approach, and where Pip looks. Pip's gaze is the primary channel — a companion who looks at things is a hint system nobody experiences as a hint system.

### 6.5 Accessibility

Non-negotiable, and mostly cheap if built in Phase 8 rather than retrofitted:

- **Reduced motion:** respect `prefers-reduced-motion`. Halve camera speed, cut shake, damp parallax, cross-dissolve instead of dive. Nothing becomes unreachable.
- **Keyboard path:** `Tab` cycles interactables in a stable order, `Enter` acts, `Space` skips dialogue, `Esc` opens settings.
- **Sigils without gestures:** a setting replaces gesture drawing with "hold to cast," for tremor, trackpad difficulty, or touch imprecision.
- **Captions always on by default**, for all dialogue, voice, and meaningful sfx.
- **No timing-critical failure anywhere in the product.** Already a design rule; it's also the strongest accessibility guarantee available.
- **Colour:** the four lantern accents are distinguishable by luminance as well as hue. No information carried by colour alone.
- **Pip solves everything** eventually (§4.6). Nobody is ever stuck.
- **Photosensitivity:** no strobe above 3Hz, bloom intensity capped, one setting to reduce flashing.

---

## 7. Art Direction

### 7.1 The thesis

**Ink and lantern-light.** Everything is either drawn (parchment, ink, chalk, watercolour bleed) or lit (motes, bloom, fog, glass). No chrome, no glass panels, no gradients-as-decoration, no drop shadows on rectangles. The world looks handmade and the magic looks like light. Where you need contrast, use *paper vs glow*, never *dark UI vs bright accent*.

### 7.2 Palette

A locked base with a per-world grade on top. Written as CSS custom properties and a per-world LUT.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#141018` | Near-black with a violet bias — reads warmer than pure black |
| `--paper` | `#E8DCC4` | Aged parchment; all text surfaces |
| `--dust` | `#9A8F7C` | Mid-tone, fog, secondary strokes |
| `--glow` | `#FFD79A` | The universal light of magic; never used as a UI fill |
| `--deep` | `#231A3A` | Shadow and depth |
| `--accent` | *from Lantern Choosing* | `#F0A24B` amber / `#E4718F` rose / `#6FBE9A` jade / `#8B7BD8` violet |

Per-world grade: School → gold-green, warm and high-key. Steeping → copper-amber, dense, low ceiling. Skybridge → indigo with warm window pinpricks. Stillwater → silver-blue, desaturated to ~35%. Ascent → all four in sequence. Everbloom → `--glow` on `--ink`, nothing else.

**A note on defaults:** cream-plus-serif-plus-terracotta is the current house style of machine-generated design. Everbloom avoids it by never showing a page — the palette lives in light and fog inside a canvas, `--paper` appears only inside diegetic objects (letters, cards, labels), and the accent is *chosen by the player*, not by me.

### 7.3 Typography

- **Display:** a warm high-contrast text serif with real personality — **EB Garamond** or **Cormorant Garamond** for the letter, the final message, and world titles. Set generously: 1.55 line-height, +0.01em tracking, never bold, never uppercase.
- **Utility:** **Inter** at 13–14px for settings and captions only. It should be invisible; utility type carrying personality is noise.
- **Diegetic hand:** a single script or chalk face (**Caveat**) strictly for objects inside the world — the recipe cards, the desk carving, Pip's speech. Never for UI.
- Three faces, three jobs, zero overlap. Self-host all of them; no font CDN on a private deploy.

### 7.4 Lighting & atmosphere

Two-light rule per scene: one warm key that motivates the composition, one cool fill for depth. Everything else is emissive. Volumetric shafts faked with additive quad planes and animated noise — a real volumetric pass is never worth it here. Every scene has visible airborne particulate (dust, pollen, snow, ember, ash); it's the cheapest possible "expensive" look and it unifies the four worlds.

### 7.5 Shaders (the real art budget)

Seven shaders carry the entire visual identity. Write these well and the art is done.

1. **Trail** — tapered additive ribbon, soft falloff, slight hue-shift along length. Appears in every scene; polish it first and most.
2. **Water** — Stillwater's surface: ripple normals, refracted memory texture, ink-diffusion mask.
3. **Fog / Unfogging** — Skybridge: fbm noise fog with a persistent reveal mask painted into an offscreen R8 texture.
4. **Ink reveal** — the letter and the final message writing themselves via an SDF-ish threshold sweep.
5. **Canopy** — the tree's blossoms, GPU-instanced, with density driven by a progress uniform.
6. **Bloom tint** — per-world bloom colour bias in the post chain.
7. **Paper** — subtle fibre grain and edge darkening on all diegetic paper. Small; sells everything.

### 7.6 The tree is procedural

Generate the Everbloom with a seeded L-system / space-colonisation algorithm producing an instanced-cylinder trunk and instanced-quad blossoms, animated growing along branch parameter. Modelling this would take days and look worse. Growth as an animatable parameter is the entire finale, so the tree must be procedural for narrative reasons, not just budget ones.

### 7.7 Environmental storytelling

No lore text, no readable diaries. Instead: two chairs, one worn more than the other. A tally scratched on a shelf. Two coats on one hook. A recurring silhouette in the background of all four worlds, and only at the convergence do you see who it is. Details the recipient will find, not details a general audience would.

---

## 8. Animation Bible

Timing conventions used throughout: **entrance** `0.6s ease-out-quart`; **exit** `0.35s ease-in-cubic`; **cinematic** GSAP timelines with `timeScale` for skip; **loops** `useFrame` with a shared clock; **springs** stiffness 120 / damping 14 as the default character feel.

**Global / cursor**
1. Trail spawn + decay (`0.4s` tail life, velocity-scaled width)
2. Cursor idle bob (2.4s sine, ±3px)
3. Hover pulse (`0.25s` scale 1.0→1.15→1.06)
4. Denied stutter (3 × 60ms jitter + desaturate)
5. Sigil draw glow (progressive brightening as stroke length grows)
6. Sigil success (glyph flashes, holds 200ms, dissolves upward into motes)
7. Sigil fail (glyph sags and drips downward — funny, not punishing)
8. Ghost path assist (0.8s fade-in, 2s dashed march)

**Flower & tree**
9. Seed pulse (1.6s breathing loop, brightening on pointer proximity)
10. Planting (seed sinks 0.5s, soil ripples outward)
11. Sprout (2.2s ease-out-back, leaves unfurling on a 0.15s stagger)
12. Bloom (5s master timeline: stem → bud → four petals staggered 0.4s → light burst → camera pull-back)
13. Petal open / close (1.1s, with a 3° overshoot)
14. Petal glow-in on completion (memory mote arrives, absorbs, petal saturates)
15. Petals fold for Ascent (1.4s, ease-in — the reversal must feel like an inhale)
16. Vine climb (procedural growth along spline, 18s, camera-locked)
17. Canopy bloom (7s, blossoms popping on a noise-ordered stagger, not uniformly)
18. Blossom idle sway (per-instance phase offset in the vertex shader)
19. Candle ignition (staggered 40ms, one per memory)
20. Candle extinguish (sweep-following, 90ms each, smoke curl)

**Worlds**
21. Moth flight (perlin-wander + arrival ease, wing flap at 9Hz)
22. Letter unfold (three creases, 0.9s, paper shader crease highlight)
23. Lantern drift (4 lanterns on independent bobbing splines)
24. Lantern capture (sucked to cursor, 0.4s, colour floods the frame for 200ms)
25. Ribbon unwind (Unbind: spiral unwrap, 1.2s)
26. Beckon pull (object arcs to cursor with overshoot and a small comic wobble)
27. Echo manifest (silhouette rises from the object in additive particles, 1.6s)
28. Ingredient drag (spring-follow with rotational lag)
29. Cauldron reaction (colour shift, 3-tier bubble burst, steam plume — 6 authored variants)
30. Potion comic failure (6 variants: burp, freeze, sprout, shrink, invert, sneeze)
31. Dial rotate (0.2s snap with a mechanical settle)
32. Door unseal (glyphs light in sequence, 0.6s, then a slow 1.8s swing)
33. Tether snap (rope materialises in 90ms — instant is essential to the feel)
34. Swing (verlet, continuous)
35. Release arc (rope dissolves into motes, body rotation eases to velocity vector)
36. Fog burn (radial mask paint, 0.8s soft edge)
37. Footprint appear (glow-in with a 0.3s stagger per print)
38. Convergence (both trails brighten, meet, and merge into one — 3s, music-locked)
39. Fall recovery (settle onto cloud 0.6s, thread lift 2s)
40. Mote drift (slow perlin, brighter on proximity)
41. Mote placement (arcs into water, 0.7s, splash rings)
42. Water window open (ripple expands, memory fades in inside the ripple, 1.4s)
43. Flower bloom on water (1.0s ease-out-back, petals staggered)
44. Ink writing (letter reveal at reading pace, ~14 chars/sec)
45. Upward snow (continuous, drifting)
46. Star lift (lights detach, 2.5s ease-in-out, staggered by distance)
47. Constellation link (line draws point-to-point at 0.35s each, brightening on completion)
48. Symbol completion (all lines flare, hold 1s, sky brightens)

**Pip**
49. Follow (spring-damped lag with lookahead bias)
50. Idle (blink, stretch, look around — random every 4–9s)
51. Curious (tilts toward the nearest unsolved interactable)
52. Point (hops twice, then sustains a look at the answer)
53. Assist (flies to the object and performs the solution)
54. React (per-world: recoils at potions, wobbles mid-swing, goes silent in the Stillwater)
55. Perch (settles on a nearby surface during cinematics — keeps him on screen without upstaging)
56. Evolution (three visual tiers at 4 / 8 / 12 memories: brighter core, second wing pair, a small trailing comet)

**System**
57. World enter — petal dive (1.8s; camera dolly + aperture colour wipe; masks chunk load)
58. World exit — light collapse (1.2s)
59. Boot (single logo-less fade from black over the first thread, 1.5s)
60. Asset load (the seed's pulse *is* the progress indicator — no spinner exists in this product)
61. Memory collected (mote spirals to a corner and fades — the only HUD feedback in the game)
62. Secret found (a soft chime plus one blossom appearing early on the distant tree silhouette)
63. Settings open (0.25s DOM fade, canvas dims 40%, `frameloop` → demand)
64. Credits (petals drifting upward carrying names, 45s loop)

---

## 9. Audio Design

Audio is roughly 40% of the perceived production value and about 8% of the effort. Do not defer it to the end. (See Phase 22, but seed the mix from Phase 6.)

### 9.1 Music

One harmonic bed (`bed_everbloom`, in D major, ~72bpm, loopable) plus per-world stems that layer over it. Because every world shares harmonic material, transitions crossfade instead of cutting, and the finale can bring in every stem at once as a genuine payoff.

| Stem | World | Instrumentation |
|---|---|---|
| `bed` | all | Felt piano, low strings, room |
| `school` | Petal I | Celeste, pizzicato, small bells |
| `steeping` | Petal II | Bassoon, marimba, brushed kit |
| `skybridge` | Petal III | Cello ostinato, taiko pulse, choir pad |
| `stillwater` | Petal IV | Solo piano only — remove the bed here; the absence is the effect |
| `ascent` | Ascent | Full strings, rising ostinato, timpani |
| `everbloom` | Finale | Every stem, then reduce to piano for the message |

Licensing: buy a royalty-free library or commission a music student. Do not use anything you can't privately deploy.

### 9.2 Ambience beds

Indoor rain and distant corridors (School). Bubbling, fire, dripping (Steeping). High wind, distant city, birds (Skybridge). Room tone and slow water (Stillwater). Crickets, leaves, night birds (Garden, shifting with time of day).

### 9.3 SFX registry (grouped)

- **Thread:** spawn, move (a low continuous filtered hiss modulated by velocity), end, snap, taut creak, release whoosh
- **Sigils:** four distinct casts (Kindle = warm swell; Unbind = a lock releasing; Beckon = a rising suck; Echo = reversed reverb tail), one shared fail sag
- **Interaction:** hover tick, grab, drop, denied thud
- **Steeping:** ingredient plop, six reaction variants, cork pop, dial click, door unseal
- **Skybridge:** footstep-on-tile, cloth flap, fog dissipate, cloud settle
- **Stillwater:** mote hum, water enter, ripple, bloom chime, page-turn for the letter
- **Rewards:** memory collect (a soft major third), secret found (a single high bell), sigil acquired (a chord), world complete (a resolving cadence into the garden bed)
- **Pip:** four small vocalisations — curious, happy, worried, sleepy. Wordless. No language means no tone mismatch.

### 9.4 Voice

The highest-return optional feature in the entire document. If Daksha records **one thing**, record the final message in your own voice, played over the ink reveal in the Everbloom. Nothing else in this project will land as hard as that. Second priority: pull real voice-note clips from your chat history into the Stillwater as memories.

Do not attempt full narration. A private, imperfect, real voice beats performed narration in this context.

### 9.5 Mix targets

Music −14 LUFS, ambience −22, sfx peaks −8, voice −16 with a 6dB duck on all other buses. Test on laptop speakers and phone speakers, not headphones — that's where it'll actually be heard.

---

## 10. Data Model

All content is typed and zod-validated at load. Types below are the contract; the schemas mirror them in `content/schema/`.

```ts
type WorldId = 'prologue'|'garden'|'school'|'steeping'|'skybridge'|'stillwater'|'ascent'|'everbloom'|'credits'
type SigilId = 'kindle'|'unbind'|'beckon'|'echo'
type LanternId = 'amber'|'rose'|'jade'|'violet'

interface MemoryNode {
  id: string
  world: WorldId
  kind: 'image'|'video'|'audio'|'letter'
  tier: 'primary'|'secret'
  title: string
  caption?: string                  // shown; keep it short
  body?: string                     // letters only
  src?: string                      // manifest key, not a path
  poster?: string
  durationMs?: number
  flower?: { species: string; hue: string; trait: string }   // Stillwater bouquet
  starWeight: number                // brightness in the finale constellation
  revealedBy?: SigilId
  unlocks?: ProgressNodeId[]
}

interface Sigil {
  id: SigilId
  displayName: string
  template: [number, number][]      // normalized $1 unistroke points
  threshold: number                 // default 0.75
  acquiredAt: ProgressNodeId
  cue: CueId
  vfx: EmitterId
  ghostPath: string                 // SVG path for the assist
}

interface Recipe {
  id: string
  riddle: string
  steps: { ingredients: [string, string]; resultId: string }[]
  rewardMemoryId?: string
  hint: string
}

interface Reaction {                // the 66-pair matrix
  a: string; b: string
  resultId: string
  vfx: EmitterId
  cue: CueId
  line?: string
  isRecipeStep: boolean
}

interface Anchor { id: string; position: [number,number,number]; strength: number; isSecretPath: boolean }

interface Collectible {
  id: string; world: WorldId
  hint: 'pip'|'audio'|'visual'
  memoryId?: string
  bounds: [number,number,number,number]
}

interface ProgressState {
  version: 1
  contentVersion: string            // enables "something new has grown"
  lantern: LanternId | null
  sigils: SigilId[]
  worldsCompleted: WorldId[]
  memories: string[]
  secrets: string[]
  bouquet: { memoryId: string; position: [number,number] }[]   // Stillwater arrangement, replayed in the finale
  constellationLinks: [string,string][]
  currentScene: WorldId
  playthroughs: number              // drives post-credit variants
  totalSeconds: number
  lastPlayedISO: string
}

interface Settings {
  version: 1
  reducedMotion: boolean|'system'
  holdToCast: boolean
  captions: boolean
  reduceFlashing: boolean
  quality: 'auto'|'low'|'medium'|'high'
  volumes: Record<'master'|'music'|'ambience'|'sfx'|'voice', number>
}

interface DialogueLine { id: string; speaker: 'pip'|'object'|'narrator'; text: string; durationMs: number; cue?: CueId }

interface WorldConfig {
  id: WorldId
  prerequisites: ProgressNodeId[]
  softTargetSeconds: number
  grade: string                     // LUT key
  audio: { bed: CueId; layers: CueId[]; ambience: CueId }
  assetBundle: string
  memories: string[]
  collectibles: string[]
  hints: { atSeconds: number; action: 'look'|'move'|'solve' }[]
}

interface Beat { at: number; action: BeatAction }              // cinematic timelines
interface AssetManifest { [key: string]: { url: string; bytes: number; encrypted: boolean; sha?: string } }
```

**Event bus contract** (typed, exhaustive — this list is the integration surface between all systems):
`threadStart | threadMove | threadEnd | sigilCast | sigilFailed | interactableActivated | memoryCollected | secretFound | worldEntered | worldCompleted | sigilAcquired | lanternChosen | hintEscalated | beatFired | transitionStarted | transitionFinished | qualityChanged | saveWritten`

---

## 11. Performance Strategy

### 11.1 Budgets (enforce, don't aspire)

| Metric | Budget |
|---|---|
| Sustained framerate | 60fps on 2020 mid-range laptop iGPU; never below 45 |
| Initial JS (gzip) | ≤ 380KB |
| Time to first interaction | ≤ 2.5s on simulated Fast 3G |
| Per-world async chunk | ≤ 6MB including textures |
| Total download, full playthrough | ≤ 45MB excluding private media |
| Draw calls per frame | ≤ 220 |
| Live particles | ≤ 2000 high / 900 medium / 350 low |
| Texture size | ≤ 2048², KTX2/Basis compressed, power-of-two |
| React re-renders during gameplay | **zero** |
| Main-thread long tasks in gameplay | none > 50ms |

### 11.2 The one rule that matters most

**No React state updates during animation.** All per-frame motion mutates refs inside `useFrame`. Zustand is read via narrow selectors, and any high-frequency value (cursor position, rope points, camera) is read through `store.getState()` or `subscribe`, never through a hook. Getting this wrong is the single most likely cause of a project that "should" hit 60fps and doesn't.

### 11.3 Loading

Three tiers: **boot** (engine, trail shader, prologue assets only — everything needed for first light), **eager** (garden and School, prefetched during the Prologue), **on-demand** (each petal's chunk, prefetched when the player hovers its petal). Because the dive transition takes 1.8s and hover prefetch starts earlier, the player never waits. The seed's pulse is the only loading indicator that exists.

### 11.4 Assets

- KTX2/Basis for every texture (`gltf-transform` in `tools/`). Typically 4–6× smaller than PNG with GPU-native decode.
- Audio: 96kbps mono OGG for sfx, 160kbps stereo for music. Sprite-sheet all short sfx into one file per world.
- Private media: images to WebP q80 max 1600px; video to H.264 720p CRF 24 (compatibility over efficiency — this must play on whatever device they open it on).
- Instance everything repeated: blossoms, particles, rooftop tiles, ingredients.
- Dispose geometries, materials, and textures on world exit. R3F does not do this for you and a 30-minute session will leak until it dies.

### 11.5 Quality tiers

Auto-detect at boot (renderer string + a 2-second frame-time probe) → low / medium / high. Tiers scale DPR cap, particle cap, bloom resolution, shadow use, and parallax layer count. Also runtime-adaptive: sustained sub-45fps for 3 seconds drops one tier once, with no visible notification.

---

## 12. Security & Privacy

The realistic goal is **"not publicly discoverable and not casually scrapeable."** Anything the browser can display can be captured — no client-side scheme changes that, and claiming otherwise would be dishonest.

| Layer | Measure |
|---|---|
| Hosting | Private static deploy: Cloudflare Pages + Cloudflare Access (email-gated, free tier) or Vercel password protection. Never a public URL. |
| Indexing | `noindex, nofollow, noarchive` + `robots.txt` deny-all + no sitemap. |
| Repository | Public repo (good for your portfolio) with **all private media gitignored** and content files containing real names/jokes kept in a private submodule or excluded via a `content.local.ts` pattern. Never commit a memory. |
| Media at rest | `tools/encryptMedia.ts` AES-GCM encrypts the media bundle at build. The key derives via PBKDF2 from a passphrase. **Make the passphrase diegetic** — the answer to an inside joke, asked at the boot gate. It's a real access control *and* the first magic moment. |
| In transit | HTTPS only, HSTS, strict CSP (`default-src 'self'`), no third-party requests at all. Self-host fonts. |
| Scraping friction | Media served as blobs from decrypted `ArrayBuffer`s, so no guessable URLs and nothing in the network tab that maps to a file on disk. Disable right-click on canvas. Explicitly: friction, not protection. |
| Telemetry | None. No analytics, no Sentry, no fonts CDN, no pings. This is a private letter. |
| Filenames | Never `priya_birthday_2019.jpg` — hash all asset filenames in the manifest. Filenames leak more than people expect. |

---

## 13. Future Expansion

### 13.1 Content packs

A pack is a folder: `content/packs/2027/{memories.ts, dialogue.ts, media/, manifest.json}` with a `year` and a `contentVersion`. On boot, if `save.contentVersion < latest`, the garden shows a new sprout and Pip is excited. The recipient re-enters and finds a new petal. **The product becomes a yearly tradition rather than a one-time gift** — this is the highest-value long-term feature in the document, and it's nearly free because everything is data-driven from Phase 7.

### 13.2 Adding a world

By the World module contract (§5.6): one folder in `worlds/`, one `WorldConfig` entry, one registry line, assets in a new bundle. No engine changes, no garden changes, no state-machine changes. Test this claim by making the fifth petal a two-hour stub during Phase 21 — an extensibility claim you haven't exercised isn't an extensibility claim.

### 13.3 The tree as an archive

The Everbloom grows a **ring per year**. Older memories move inward and dim slightly; new ones bloom on the outside. Free-roam lets them climb the tree and open any memory from any year. Over five years this becomes something genuinely rare: a private, navigable, growing archive of a friendship. Design the canopy's data model for this in Phase 19 even though you'll only have one ring — retrofitting rings into a finished finale is painful.

### 13.4 Plugin surface

Three extension points, deliberately few: **sigils** (add a template + handler), **reactions** (add matrix rows), **beats** (add cinematic timelines). Anything requiring a fourth extension point should probably be a new world instead.

---

# PART II — IMPLEMENTATION ROADMAP

28 phases. Every phase ends with the project **running, playable to its current extent, and committable**. No phase leaves broken functionality; no phase depends on a later phase.

Complexity scale: **S** ≈ 2–4h · **M** ≈ 5–10h · **L** ≈ 12–20h · **XL** ≈ 25–40h.

Ordering principle: build the **engine**, then the **emotional core**, then the **expensive worlds**. The highest-risk world (Skybridge) sits late and isolated so it can be cut without touching anything else. The most important world (Stillwater) sits early so it cannot be cut.

---

## Phase 0 — Content Inventory & Creative Lock

**Goal.** Gather and finalise every piece of real content before writing a line of code. This is the true critical path and the phase most likely to be skipped and most likely to kill the project.

**Deliverables**
- 12 memories chosen and exported: 1 primary + 3 secrets per world. Files named neutrally.
- The Stillwater letter, written. The final message, written.
- 12 ingredient jokes + 3 recipe riddles for the Steeping Room.
- The four-glyph door combination and where each digit hides.
- The constellation symbol chosen (not a heart).
- Pip's name. The friend's name spelling for the seal.
- The boot passphrase — one inside-joke question with one unambiguous answer.
- `CONTENT.md` in the repo mapping every asset to a memory ID.

**Folder changes.** `/content-source/` (gitignored) · `CONTENT.md` · `docs/EVERBLOOM_MASTER_SPEC.md`
**Components / Hooks / Services.** None.
**Data models.** Draft `MemoryNode[]` as literal data — it's the acceptance artefact for this phase.
**Assets required.** All private media, raw.
**Animations.** None.

**Acceptance criteria**
- [ ] 12 memory files exist with stable IDs.
- [ ] Both letters written in full — no placeholders, no "TODO write this."
- [ ] Every joke and riddle written down, not "in my head."
- [ ] Total raw media under 400MB before compression.

**Risks.** Overwhelming choice paralysis on memory selection → pick 12 in one 90-minute sitting and don't revisit. Writing the letter last is a classic failure; write it now, edit it in Phase 26.
**Dependencies.** None.
**Complexity.** M (mostly emotional, not technical)
**Branch.** `chore/content-inventory`
**Testing.** Read the letter out loud. If it doesn't move you, rewrite it before building anything.

---

## Phase 1 — Project Foundation

**Goal.** A running Vite + React 19 + TS + R3F app rendering a lit placeholder at a stable 60fps, with lint, format, tests, and CI in place.

**Deliverables.** Vite scaffold, strict `tsconfig`, path aliases, ESLint with `import/no-restricted-paths` enforcing §5.2 layers, Prettier, Vitest, Playwright, GitHub Actions (typecheck + lint + unit), a `<Canvas>` with a rotating placeholder, a dev-only stats HUD.

**Folder changes.** Full skeleton from §5.3 with `index.ts` barrels; empty dirs kept with `.gitkeep`.
**Components.** `App.tsx`, `ui/BootGate.tsx` (stub), `dev/StatsHUD.tsx`
**Hooks.** `useQualityTier` (stub returning `high`)
**Services.** `engine/core/quality.ts` (renderer-string detection)
**Data models.** `types/ids.ts` — `WorldId`, `SigilId`, `LanternId`, `CueId`, `ProgressNodeId`
**Assets.** Self-hosted EB Garamond, Inter, Caveat (woff2, subset).
**Animations.** #59 boot fade.

**Acceptance criteria**
- [ ] `pnpm dev` HMR under 200ms.
- [ ] `pnpm build` produces < 200KB gzip with the placeholder.
- [ ] Stats HUD shows a locked 60fps.
- [ ] Layer-violating import fails lint (verify with a deliberate bad import, then delete it).
- [ ] CI green.

**Risks.** R3F/React 19 peer version friction — pin exact versions and record them in the README.
**Dependencies.** None.
**Complexity.** S
**Branch.** `feature/project-foundation`
**Testing.** Boot in Chrome, Safari, Firefox. Confirm no console warnings. Confirm the lint rule actually fires.

---

## Phase 2 — Engine Core

**Goal.** The spine: clock, typed event bus, scene state machine, and quality tiers. Nothing visible, everything depends on it.

**Deliverables.** `clock.ts` (fixed 60Hz accumulator + render delta), `eventBus.ts` (typed emitter, exhaustive union from §10), `sceneMachine.ts` (async FSM with awaitable transitions and guards), `quality.ts` (boot probe + runtime downgrade), a dev scene-jump panel (invaluable for the next 25 phases — build it now).

**Folder changes.** `engine/core/*`, `dev/SceneJumper.tsx`
**Components.** `dev/SceneJumper.tsx`
**Hooks.** `useScene`, `useEvent<T>`, `useFixedStep`
**Services.** All four core services.
**Data models.** `SceneId`, `SceneTransition`, `EngineEvent` union, `QualityTier`
**Assets.** None. **Animations.** None.

**Acceptance criteria**
- [ ] FSM refuses invalid transitions and logs why.
- [ ] Transitions are awaitable and can be blocked pending an async load.
- [ ] Event bus is fully typed — a bad payload is a compile error.
- [ ] Fixed step holds 60Hz under an artificial 200ms main-thread stall (no spiral of death).
- [ ] Scene jumper can reach every planned scene ID (stubs are fine).

**Risks.** Over-engineering the FSM. Nine states, explicit transition table, no library.
**Dependencies.** Phase 1.
**Complexity.** M
**Branch.** `feature/engine-core`
**Testing.** Unit: FSM guards, invalid transitions, clock accumulator under stall, quality downgrade hysteresis.

---

## Phase 3 — Thread Input & Trail

**Goal.** The core verb, standalone. This phase is the whole product in miniature — if the trail doesn't feel good here, nothing later saves it.

**Deliverables.** Pointer-event capture (mouse + touch + pen, one code path), 8px resampling, 256-point ring buffer, five thread modes, the tapered additive ribbon mesh, the trail shader, velocity-driven width and brightness, tail decay, cursor mote with idle bob.

**Folder changes.** `engine/thread/*`, `shaders/trail/*`
**Components.** `ThreadTrail.tsx`, `CursorMote.tsx`
**Hooks.** `useThread`, `useThreadMode`
**Services.** `ThreadController.ts`, `thread.store.ts` (transient — never triggers a React render)
**Data models.** `ThreadPoint {x,y,t,pressure}`, `ThreadMode`
**Assets.** A soft radial glow texture (512², generated in `tools/`).
**Animations.** #1 trail spawn/decay, #2 cursor bob, #3 hover pulse (wired in Phase 5).

**Acceptance criteria**
- [ ] Trail follows the pointer with no perceptible lag at 60fps.
- [ ] Identical feel on trackpad, mouse, and touch.
- [ ] Zero React re-renders while drawing (verify in React DevTools Profiler).
- [ ] Trail reads beautifully on pure `--ink` background — this is the "first light" moment; polish until it does.
- [ ] Ring buffer never allocates during motion (check the memory timeline for a flat line).

**Risks.** Ribbon geometry seams and pinching at sharp turns. Mitigation: miter-limit the joins and clamp segment angles. Budget real time here; it's the most-seen object in the product.
**Dependencies.** Phases 1–2.
**Complexity.** L
**Branch.** `feature/thread-input`
**Testing.** Unit: resampling, buffer eviction. Manual: 5 minutes of continuous drawing with no GC sawtooth, no frame drops, no allocation growth.

---

## Phase 4 — Sigil System

**Goal.** Data-driven gesture recognition for four glyphs, with generous tolerance and a graceful assist ladder.

**Deliverables.** $1 Unistroke + Protractor recognizer, four templates authored in `content/sigils.ts`, a dev template-authoring page (draw → export point array), gating by `progress.sigils`, ghost-path assist after three failures, success/fail VFX and cues, `holdToCast` accessibility alternative.

**Folder changes.** `engine/sigils/*`, `content/sigils.ts`, `dev/SigilTrainer.tsx`
**Components.** `SigilGhost.tsx`, `SigilFeedback.tsx`, `dev/SigilTrainer.tsx`
**Hooks.** `useSigil`, `useSigilArmed`
**Services.** `recognizer.ts`, `SigilController.ts`
**Data models.** `Sigil` (§10), `SigilAttempt {score, matched, ms}`
**Assets.** Four SVG ghost paths.
**Animations.** #5 draw glow, #6 success dissolve, #7 fail drip, #8 ghost assist.

**Acceptance criteria**
- [ ] ≥ 95% recognition across 20 sloppy attempts per glyph, drawn at varying size, speed, and screen position.
- [ ] Zero cross-confusion between the four glyphs across 80 attempts.
- [ ] Assist triggers on the third failure, every time.
- [ ] `holdToCast` fully substitutes for drawing — every gate in the game is passable without a gesture.
- [ ] Unowned sigils produce the denied stutter, never a text message.

**Risks.** Recognition frustration is the #1 candidate for ruining the gift. Mitigation: hard-cap consecutive failures at 3, and tune the threshold *down* on every playtest, never up.
**Dependencies.** Phase 3.
**Complexity.** M
**Branch.** `feature/sigil-system`
**Testing.** Unit: recognizer against 40 recorded strokes (10 per glyph) committed as fixtures. Manual: attempt each glyph left-handed and on a trackpad.

---

## Phase 5 — Interaction Registry

**Goal.** Any object in any world can declare itself threadable, with universal hover feedback. This is the entire discoverability model.

**Deliverables.** Self-registering interactables, spatial-hash broad phase, hover/active/denied states, per-interactable required sigil, `onThread` / `onSigil` callbacks, keyboard Tab-cycle with a stable order, cursor state machine.

**Folder changes.** `engine/interaction/*`
**Components.** `Interactable.tsx` wrapper, `FocusRing.tsx`
**Hooks.** `useInteractable`, `useHover`, `useKeyboardFocus`
**Services.** `InteractionRegistry.ts`, `spatialHash.ts`
**Data models.** `Interactable {id, bounds, requiredSigil?, cursorState, hint, tabIndex}`
**Assets.** None.
**Animations.** #3 hover pulse, #4 denied stutter, plus all cursor states from §6.3.

**Acceptance criteria**
- [ ] 200 registered interactables cost < 0.4ms per frame for hit testing.
- [ ] Hover feedback fires within one frame.
- [ ] Tab order is stable and deterministic across reloads.
- [ ] Every interactable is reachable and activatable by keyboard alone.
- [ ] Registry cleans up fully on unmount (no leaks between world switches).

**Risks.** Hover feedback that's too subtle makes the game unplayable without a UI. Err loud, then dial back.
**Dependencies.** Phases 3–4.
**Complexity.** M
**Branch.** `feature/interaction-registry`
**Testing.** Unit: spatial hash correctness at boundaries, registry lifecycle. Manual: full keyboard traversal of a test scene with 20 objects.

---

## Phase 6 — Audio Engine

**Goal.** Layered stems, buses, ducking, and a cue registry — with placeholder audio. Getting audio in early changes how everything else feels while you build it.

**Deliverables.** Howler wrapper, four buses with independent gain, stem layering with crossfade, cue registry keyed by ID, sfx sprite-sheet support, ducking, autoplay unlock tied to the first thread gesture, volume persistence.

**Folder changes.** `engine/audio/*`, `content/audio.manifest.ts`, `public/audio/*`
**Components.** `AudioProvider.tsx`
**Hooks.** `useAudio`, `useCue`, `useMusicLayer`
**Services.** `AudioEngine.ts`, `buses.ts`, `cues.ts`
**Data models.** `CueId`, `AudioCue {id, src, bus, sprite?, loop, volume}`, `MusicLayer`
**Assets.** Placeholder bed + one stem + 10 placeholder sfx (free CC0 is fine at this stage).
**Animations.** None.

**Acceptance criteria**
- [ ] No audio plays before a user gesture; no browser autoplay warning in console.
- [ ] Stem crossfade is inaudible as a transition — no click, no gap, no pitch artefact.
- [ ] Ducking engages and releases smoothly.
- [ ] Volume settings survive reload.
- [ ] Muting the master stops all four buses immediately.

**Risks.** iOS Safari audio unlock quirks. Mitigation: unlock inside the first `pointerdown`, and verify on a real iPhone, not a simulator.
**Dependencies.** Phases 2–3.
**Complexity.** M
**Branch.** `feature/audio-engine`
**Testing.** Unit: cue resolution, bus gain math. Manual: real iPhone and real Android. Crossfade 20 times listening for artefacts.

---

## Phase 7 — Content Layer & Asset Loader

**Goal.** All content typed, validated, and loadable in tiers, with the seed-pulse as the only progress indicator.

**Deliverables.** zod schemas for every content type, `validateContent.ts` running in CI, `buildManifest.ts` (hashes filenames, records byte sizes), three-tier loader (boot / eager / on-demand), hover-prefetch, real `MemoryNode[]` data from Phase 0, KTX2 texture pipeline.

**Folder changes.** `content/*`, `content/schema/*`, `engine/loader/*`, `tools/buildManifest.ts`, `tools/validateContent.ts`
**Components.** `Preloader.tsx` (invisible), `SeedPulseProgress.tsx`
**Hooks.** `useAssetBundle`, `usePrefetch`
**Services.** `AssetLoader.ts`, `manifest.ts`
**Data models.** Everything in §10 plus `AssetManifest`, `AssetBundle`, `LoadTier`
**Assets.** Real memories from Phase 0, compressed. All textures converted to KTX2.
**Animations.** #60 seed-pulse-as-progress.

**Acceptance criteria**
- [ ] `pnpm validate:content` fails loudly on a malformed memory (test by breaking one, then fixing it).
- [ ] Manifest byte totals match §11.1 budgets, and CI fails if a bundle exceeds them.
- [ ] Boot tier is under 380KB gzip.
- [ ] Prefetch on petal hover measurably warms the cache (verify in the network panel).
- [ ] Zero spinners exist anywhere in the codebase.

**Risks.** Content churn breaking schemas repeatedly. Mitigation: schemas are permissive on optional fields, strict on IDs and references. Add a referential-integrity check (every `memoryId` referenced actually exists).
**Dependencies.** Phases 0–2.
**Complexity.** L
**Branch.** `feature/content-layer`
**Testing.** Unit: every zod schema, happy and sad paths; referential integrity across all content files. Manual: throttle to Fast 3G and confirm the 2.5s target.

---

## Phase 8 — Save, Settings & Accessibility Scaffolding

**Goal.** Persistence and every accessibility affordance, built in now rather than bolted on later.

**Deliverables.** Versioned save with zod validation and migration path, corrupt-save silent recovery, separate settings storage, autosave triggers, the settings overlay (the entire DOM UI of the product), reduced-motion plumbed as a global multiplier, captions system, `holdToCast` wired, flash reduction, quality override.

**Folder changes.** `engine/save/*`, `ui/Settings.tsx`, `ui/Captions.tsx`, `ui/Overlay.tsx`
**Components.** `Settings.tsx`, `Captions.tsx`, `Overlay.tsx`, `ContinuePrompt.tsx`
**Hooks.** `useSave`, `useSettings`, `useReducedMotion`, `useMotionScale`
**Services.** `save.ts`, `migrations.ts`, `schema.ts`
**Data models.** `ProgressState`, `Settings` (§10)
**Assets.** One settings glyph (inline SVG).
**Animations.** #63 settings open, canvas dim, `frameloop` → demand.

**Acceptance criteria**
- [ ] Reload restores exact scene, memories, secrets, sigils, lantern, and bouquet arrangement.
- [ ] Hand-corrupt localStorage → fresh start with no error screen, no console error shown to the user.
- [ ] `prefers-reduced-motion` measurably changes camera speed and disables shake.
- [ ] Settings survive a save wipe.
- [ ] Overlay is fully keyboard-navigable with visible focus rings.
- [ ] Settings glyph auto-fades after 8 idle seconds and returns on pointer move.

**Risks.** Retrofitting reduced-motion later means touching every animation. That's why it's a global multiplier read by the clock, established here.
**Dependencies.** Phases 2, 6, 7.
**Complexity.** M
**Branch.** `feature/progress-save`
**Testing.** Unit: save round-trip, corrupt payloads, v1→v2 migration with a synthetic future version. Manual: reload at 10 different points in the run.

---

## Phase 9 — Camera Rig & Beat Sequencer

**Goal.** One camera to serve every scene, and cinematic timelines as data.

**Deliverables.** Camera rig with spline dollies, look-at targets, spring smoothing, shake (motion-scaled), DOF focus target; GSAP-backed `Timeline` for beats; `skip()` that fast-forwards state rather than cutting; dev spline visualiser.

**Folder changes.** `engine/camera/*`, `engine/beats/*`, `dev/SplineEditor.tsx`
**Components.** `CameraRig.tsx`, `dev/SplineEditor.tsx`
**Hooks.** `useCamera`, `useBeat`, `useCameraSpline`
**Services.** `Timeline.ts`, `splines.ts`, `camera.store.ts`
**Data models.** `CameraSpline`, `Beat`, `BeatAction`, `LookTarget`
**Assets.** None.
**Animations.** #57/#58 world enter/exit camera moves (used in Phase 12).

**Acceptance criteria**
- [ ] Camera never snaps — all movement is spring-smoothed or spline-driven.
- [ ] A timeline is skippable at any point and lands in exactly the state it would have reached naturally (test by skipping at 10 different offsets and comparing state snapshots).
- [ ] Shake respects reduced motion (zero amplitude when enabled).
- [ ] Timelines are pure data; no camera positions hardcoded in components.

**Risks.** Skip logic that leaves state half-applied is a nasty class of bug. Mitigation: every `BeatAction` must be **idempotent and instantly applicable**. Enforce this in the action type.
**Dependencies.** Phases 2, 8.
**Complexity.** L
**Branch.** `feature/camera-cinematics`
**Testing.** Unit: skip-state equivalence across offsets; spline evaluation at boundaries. Manual: watch a 10s timeline 20 times for jitter.

---

## Phase 10 — The Prologue: First Light

**Goal.** **First shippable slice.** Darkness, a thread, a seed, one sigil. Ninety seconds that already justify the project.

**Deliverables.** Boot gate with the diegetic passphrase, the dark scene, first-light discovery, the pulsing seed, planting, the first Kindle cast, and the audio unlock woven into the first gesture.

**Folder changes.** `worlds/prologue/*`, `ui/BootGate.tsx`
**Components.** `PrologueScene.tsx`, `Seed.tsx`, `Soil.tsx`, `BootGate.tsx`
**Hooks.** `usePrologueBeats`
**Services.** Reuses everything; adds no engine code.
**Data models.** `WorldConfig` for `prologue`
**Assets.** Soil texture, seed glow, ambient night bed, three sfx.
**Animations.** #9 seed pulse, #10 planting, #1–#6 thread and sigil, #59 boot fade.

**Acceptance criteria**
- [ ] A first-time player discovers the thread within 5 seconds, with no instructions. **Test on a real human who has never seen it.**
- [ ] They plant the seed within 30 seconds unprompted.
- [ ] Total: zero words of UI text on screen.
- [ ] Audio unlocks on the first thread without any prompt.
- [ ] The passphrase gate reads as part of the story, not as a login form.
- [ ] Whole prologue completable by keyboard.

**Risks.** A player who doesn't move the mouse. Mitigation: after 8 seconds of no input, a single mote drifts across the screen leaving a faint trail — an implicit demonstration, no text.
**Dependencies.** Phases 1–9.
**Complexity.** M
**Branch.** `feature/prologue`
**Testing.** Playtest with 2 people, silently, taking notes. Do not explain anything. Whatever confuses them is a bug in the design, not in them.

---

## Phase 11 — The Garden Hub & The Bloom

**Goal.** The hub, and the project's first genuinely awe-shaped moment.

**Deliverables.** Garden scene with parallax layers, the flower with four petals, the 5s bloom cinematic, time-of-day progression driven by completion count, petal lock/unlock states, music layer accumulation, two garden secrets, the memory-count HUD mote.

**Folder changes.** `worlds/garden/*`, `shaders/canopy/*` (early version)
**Components.** `GardenScene.tsx`, `Flower.tsx`, `Petal.tsx`, `TimeOfDay.tsx`, `WateringCan.tsx`
**Hooks.** `useGardenState`, `usePetalUnlocks`
**Services.** Consumes `progression`.
**Data models.** `WorldConfig` for `garden`; `PetalState`
**Assets.** 5 parallax layers × 5 times of day (recolour via LUT, not five paintings), flower geometry, pollen particles, garden bed + ambience.
**Animations.** #11 sprout, #12 bloom master timeline, #13 petal open/close, #14 petal glow-in, #61 memory mote.

**Acceptance criteria**
- [ ] The bloom holds attention for its full 5 seconds without feeling slow — verify by watching a playtester's face, not a stopwatch.
- [ ] Camera pull-back reveals more world than the player expected.
- [ ] Time of day advances visibly on each return; the player notices without being told.
- [ ] Music gains a layer per completion, audibly.
- [ ] Locked petals communicate "not yet" purely visually.

**Risks.** The bloom underwhelming. Mitigation: it is 60% audio. Do not judge it before the stem is layered. If it still underwhelms, add camera-pull and light burst before adding geometry.
**Dependencies.** Phase 10.
**Complexity.** L
**Branch.** `feature/garden-hub`
**Testing.** Fresh save → prologue → bloom → garden, five times. Confirm time-of-day and music state after each simulated completion via the dev jumper.

---

## Phase 12 — Transition System

**Goal.** Kill the page-reload feeling permanently. The dive into a petal is the technical heart of the core principle.

**Deliverables.** `TransitionController` coordinating camera dolly + aperture colour wipe + async chunk load + audio crossfade + world mount/unmount, with full GPU resource disposal on exit and a reduced-motion cross-dissolve variant.

**Folder changes.** `engine/transition/*`
**Components.** `PetalDive.tsx`, `ApertureWipe.tsx`
**Hooks.** `useTransition`
**Services.** `TransitionController.ts`
**Data models.** `TransitionSpec {from, to, durationMs, apertureColor, holdForLoad}`
**Assets.** Aperture mask texture.
**Animations.** #57 dive, #58 light collapse.

**Acceptance criteria**
- [ ] No fade-to-black anywhere in the product. Grep for `black` in transitions and confirm zero hits.
- [ ] The transition holds until assets resolve, and stretches gracefully rather than stuttering.
- [ ] Music never gaps across a transition.
- [ ] Memory does not grow across 20 back-to-back world switches (heap snapshot before and after — this is where R3F leaks live).
- [ ] Reduced-motion variant is calm but still continuous, never a hard cut.

**Risks.** Resource leaks on repeated switching. Mitigation: a `disposeBundle()` audit helper that logs undisposed geometries, materials, and textures in dev; treat any log line as a build failure.
**Dependencies.** Phases 7, 9, 11.
**Complexity.** L
**Branch.** `feature/world-transitions`
**Testing.** Automated: 50 scripted switches with heap deltas asserted. Manual: switch on a throttled connection and watch for stutter.

---

## Phase 13 — Memory System & The Stillwater

**Goal.** **The emotional core, and the cut-line milestone.** After this phase the project is already a real gift.

**Deliverables.** Memory controller and player (image / video / audio / letter), the Stillwater world, water shader, drifting motes, thread-to-place, flower blooming per memory with stored arrangement, the ink-reveal letter, the sequenced sixth mote, three secrets, near-silent mix.

**Folder changes.** `gameplay/memory/*`, `worlds/stillwater/*`, `shaders/water/*`, `shaders/inkReveal/*`
**Components.** `StillwaterScene.tsx`, `Basin.tsx`, `MemoryMote.tsx`, `MemoryPlayer.tsx`, `WaterSurface.tsx`, `WaterFlower.tsx`, `InkLetter.tsx`, `UpwardSnow.tsx`
**Hooks.** `useMemory`, `useMoteDrag`, `useBouquet`
**Services.** `MemoryController.ts`, `memory.store.ts`
**Data models.** `MemoryNode`, `ProgressState.bouquet`, `FlowerSpec`
**Assets.** 4 memories + 1 letter + 1 secret set, basin geometry, ripple normal map, snow sprite, solo piano stem, water ambience.
**Animations.** #40 mote drift, #41 placement, #42 water window, #43 water flower, #44 ink writing, #45 upward snow.

**Acceptance criteria**
- [ ] Video plays inline with audio and never opens a native player or fullscreen.
- [ ] Ripple distortion doesn't hurt legibility of faces or text in the memory.
- [ ] The letter reveals at a genuinely readable pace (~14 chars/sec), skippable, not fast-forwardable.
- [ ] Bouquet placement persists and is exactly reproducible in the finale.
- [ ] Sixth mote is unplaceable until the other five are down, communicated without text.
- [ ] The stillness secret triggers on 20 seconds of genuine no-input.
- [ ] Mix is audibly quieter than the garden without any volume change.

**Risks.** Video decode cost on top of a shader-heavy scene. Mitigation: pause all particles and drop DPR while a video plays — nobody is looking at the snow. Test the exact video files, at final compression, on the recipient's likely device class.
**Dependencies.** Phases 7, 8, 12.
**Complexity.** XL
**Branch.** `feature/world-stillwater`
**Testing.** Every memory kind plays, pauses, completes, and can be re-opened. Reload mid-world and confirm arrangement restores. Watch it end to end without touching anything and check whether it moves you.

---

## Phase 14 — Companion: Pip

**Goal.** The character, the hint engine, and the accessibility layer — all one thing.

**Deliverables.** Seven-state FSM, spring-follow with lookahead bias, idle behaviour variety, gaze-at-nearest-unsolved, the three-tier hint ladder, per-world reactions, perch during cinematics, three evolution tiers, four wordless vocalisations.

**Folder changes.** `gameplay/companion/*`
**Components.** `PipView.tsx`, `PipTrail.tsx`, `PipEvolution.tsx`
**Hooks.** `usePip`, `usePipHints`
**Services.** `PipController.ts`, `hints.ts`
**Data models.** `PipState`, `HintLadder`, `PipTier`
**Assets.** Pip sprite sheet or procedural glow + wing quads, 4 vocalisations, wing flap sfx.
**Animations.** #49–#56.

**Acceptance criteria**
- [ ] Pip reads as *eager* rather than *dragged* — the lookahead bias is doing its job.
- [ ] Hint ladder fires at 45 / 90 / 150 seconds of no meaningful progress, and resets correctly on progress.
- [ ] Pip solves every gate in the game if left alone long enough. Verify per world.
- [ ] Pip never occludes a memory, a letter, or the cursor's target.
- [ ] Evolution tiers are noticeable without being announced.

**Risks.** Pip becoming annoying. Mitigation: idle vocalisations at most once per 25 seconds, and silence entirely in the Stillwater and during all cinematics.
**Dependencies.** Phases 5, 13.
**Complexity.** L
**Branch.** `feature/companion`
**Testing.** Sit idle in each world for 3 minutes and confirm the full ladder. Confirm silence in the Stillwater.

---

## Phase 15 — Discovery Layer

**Goal.** Global hidden-collectible rules, and the visible link between exploration and the ending.

**Deliverables.** Self-registering discoveries, three ambient hint channels (visual shimmer / proximity audio / Pip gaze), a discovery store, the reward chime and early-blossom feedback, and progress feeding canopy density and star count.

**Folder changes.** `gameplay/discovery/*`
**Components.** `Discoverable.tsx`, `ProximityAudioCue.tsx`, `DistantTreeSilhouette.tsx`
**Hooks.** `useDiscovery`, `useProximityHint`
**Services.** `DiscoveryRegistry.ts`, `discovery.store.ts`
**Data models.** `Collectible` (§10)
**Assets.** Shimmer sprite, discovery bell, proximity hum.
**Animations.** #62 secret found + early blossom.

**Acceptance criteria**
- [ ] All 12 secrets registered, findable, and persisted.
- [ ] Proximity audio rises smoothly and is genuinely useful for locating a secret with eyes closed.
- [ ] Finding a secret visibly adds a blossom to the distant tree silhouette — the through-line between exploration and ending is legible.
- [ ] No counter UI exists. Progress is only ever shown in the world.

**Risks.** Secrets too well hidden means the ending is quietly poorer. Mitigation: Pip's gaze always eventually points at unfound secrets in the current world; nothing is missable through bad luck.
**Dependencies.** Phases 5, 14.
**Complexity.** M
**Branch.** `feature/discovery-layer`
**Testing.** Find all 12 with hints disabled; then find all 12 relying only on audio. Both must be possible.

---

## Phase 16 — Petal I: The Lantern School

**Goal.** Onboarding as a world. Teach three sigils and the Choosing without a single tutorial popup.

**Deliverables.** Letter delivery by moth, name-tracing seal, the Lantern Choosing with global theming, three 60-second sigil classes with living-object teachers, the unopenable cupboard, three secrets, the primary memory.

**Folder changes.** `worlds/school/*`
**Components.** `SchoolScene.tsx`, `PaperMoth.tsx`, `SealLetter.tsx`, `LanternChoosing.tsx`, `ChalkTeacher.tsx`, `Kettle.tsx`, `InkBird.tsx`, `RibbonCupboard.tsx`, `LockedCupboard.tsx`
**Hooks.** `useSchoolBeats`, `useLantern`
**Services.** Extends `progression` with `sigil.acquired` nodes.
**Data models.** `LanternId` wired to `theme.ts`; `WorldConfig` for `school`
**Assets.** 6 parallax layers, moth sprite, letter paper, 4 lantern glows, 3 teacher assets, school stem, indoor rain ambience, 12 sfx.
**Animations.** #21–#27, plus #6/#7 sigil feedback.

**Acceptance criteria**
- [ ] All three sigils acquired without any instructional text appearing.
- [ ] Lantern choice propagates to trail, Pip, accent, and UI immediately and persistently.
- [ ] A playtester who has never cast a sigil succeeds at all three within the world.
- [ ] The locked cupboard reads as intentional mystery, not as a broken object (watch for a playtester clicking it repeatedly with irritation — that means it's failing).
- [ ] Under 6 minutes for a player who isn't exploring.

**Risks.** Tutorial-shaped tedium. Mitigation: each class is one beat only. If a class needs two steps, cut a step.
**Dependencies.** Phases 4, 12, 14.
**Complexity.** XL
**Branch.** `feature/world-lantern-school`
**Testing.** Fresh-save run with a new playtester, silent observation. Confirm every sigil is usable in the next world.

---

## Phase 17 — Petal II: The Steeping Room

**Goal.** The comedy world: a reaction matrix where nothing is ever invalid, plus the sealed-door deduction.

**Deliverables.** 12 ingredients, 66-pair reaction matrix with a 6-variant generic fallback, three riddle recipes, the four-dial door with four distinct clue channels, three secrets, the bottled-laughter memory, potion-drinking gag.

**Folder changes.** `worlds/steeping/*`, `content/recipes.ts`
**Components.** `SteepingScene.tsx`, `Cauldron.tsx`, `IngredientShelf.tsx`, `Ingredient.tsx`, `RecipeCard.tsx`, `GlyphDial.tsx`, `SealedDoor.tsx`, `Rat.tsx`
**Hooks.** `useCauldron`, `useReactionMatrix`, `useDoorCombination`
**Services.** `ReactionResolver.ts`
**Data models.** `Recipe`, `Reaction`, `Ingredient {id, name, sprite, joke}`
**Assets.** 12 ingredient sprites, cauldron, 6 reaction VFX sets, 3 recipe cards in the Caveat face, dial glyphs, steeping stem, 18 sfx.
**Animations.** #28–#32, plus the 6 comic failure variants.

**Acceptance criteria**
- [ ] Every one of the 66 pairs produces a visible, audible, non-error result.
- [ ] All three riddles solvable from clues present in the room, verified by someone who isn't you.
- [ ] Door combination discoverable through four independent channels; each channel verified in isolation.
- [ ] Wrong combinations never reset dial positions.
- [ ] At least three of the reactions make a playtester laugh out loud.

**Risks.** 66 authored reactions is a content grind. Mitigation: author the 10 recipe-relevant pairs and the 12 funniest; let the 6-variant fallback cover the remaining ~44. Nobody will notice, and the completionist instinct here is a trap.
**Dependencies.** Phases 5, 12, 14.
**Complexity.** XL
**Branch.** `feature/world-steeping-room`
**Testing.** Script all 66 pairs and assert a non-null result for each. Manual: solve the door with each clue channel individually disabled.

---

## Phase 18 — Rope Physics Sandbox

**Goal.** Nail the swing feel in isolation, before any Skybridge art exists. **Do not skip this.** Tuning physics inside a finished level is how traversal games go wrong.

**Deliverables.** A standalone dev route with a verlet rope (12–16 segments, 4 iterations), point-mass pendulum, fixed 60Hz substep decoupled from render, anchor snapping with a 60° cone, release velocity, air control, rope mesh with taper, and a live tuning panel for every constant.

**Folder changes.** `engine/rope/*`, `dev/RopeSandbox.tsx`
**Components.** `RopeMesh.tsx`, `dev/RopeSandbox.tsx`, `dev/TuningPanel.tsx`
**Hooks.** `useRope`, `useTether`
**Services.** `verlet.ts`, `pendulum.ts`, `tether.ts`
**Data models.** `RopeConfig {segments, iterations, stiffness, damping, gravity, airControl, snapConeDeg, snapRangePx}`
**Assets.** Rope texture, placeholder anchors.
**Animations.** #33 snap, #34 swing, #35 release arc.

**Acceptance criteria**
- [ ] Rope is stable — no jitter, no explosion, no drift over 5 minutes of continuous swinging.
- [ ] Behaviour is identical at 30, 60, and 144fps (the substep decoupling works).
- [ ] Anchor snapping succeeds on sloppy aim ≥ 90% of the time.
- [ ] Release arcs feel powerful — playtesters smile without being asked to.
- [ ] Every constant is live-tunable and the final values are committed as `RopeConfig` defaults with a comment explaining each.

**Risks.** This is a *feel* problem, and feel problems have no acceptance test but a human face. Budget a full session for tuning alone. If after that it isn't fun, cut the Skybridge (§14) — a mediocre traversal world is worse than no traversal world.
**Dependencies.** Phase 2.
**Complexity.** L
**Branch.** `feature/rope-physics`
**Testing.** Unit: constraint convergence, energy conservation bounds, framerate independence. Manual: 5 minutes of swinging with a smile as the pass criterion.

---

## Phase 19 — Petal III: The Skybridge

**Goal.** The kinetic peak and the convergence beat. **Highest risk, and deliberately isolated so it can be cut.**

**Deliverables.** Floating rooftop city, anchor placement, fog shader with a persistent reveal mask painted into an offscreen R8 target, the leading footprints, the convergence, fall recovery, velocity-mapped audio, three secrets, the primary memory.

**Folder changes.** `worlds/skybridge/*`, `shaders/fog/*`
**Components.** `SkybridgeScene.tsx`, `Rooftop.tsx`, `Anchor.tsx`, `FogVolume.tsx`, `FootprintTrail.tsx`, `ConvergencePoint.tsx`, `CloudCatch.tsx`, `Weathervane.tsx`
**Hooks.** `useSwing`, `useUnfogging`, `useFootprints`
**Services.** `FogRevealMask.ts`, `AnchorGraph.ts`
**Data models.** `Anchor`, `Rooftop {id, position, memoryId?, isSecret}`, `FogMaskState`
**Assets.** 8 rooftop variants, fog noise textures, footprint sprite, city fog layers, skybridge stem, wind and cloth sfx.
**Animations.** #33–#39.

**Acceptance criteria**
- [ ] Fog reveal persists across save/reload with full fidelity.
- [ ] Footprints stay 1–2 rooftops ahead adaptively, regardless of player speed — verify with a deliberately slow and a deliberately fast run.
- [ ] The convergence lands: music drops, both trails merge, no dialogue.
- [ ] Falling is never punishing and never breaks flow; recovery takes under 3 seconds.
- [ ] 60fps maintained with fog, rope, and particles all active.
- [ ] The world is fully traversable with `holdToCast` and keyboard-only input.

**Risks.** (a) Fog mask memory cost — use a single R8 512² target, not per-rooftop textures. (b) Getting lost in fog — Pip always points toward the centre after 30 idle seconds. (c) Motion sickness — reduced-motion mode fixes the camera roll and narrows FOV changes.
**Dependencies.** Phase 18 (must have passed its feel test), Phases 12, 14, 15.
**Complexity.** XL
**Branch.** `feature/world-skybridge`
**Testing.** Reload mid-traversal and confirm fog state. Full keyboard run. Motion-sickness check with a second person.

---

## Phase 20 — The Ascent

**Goal.** The climax, built almost entirely from callbacks — the cheapest high-impact phase in the roadmap.

**Deliverables.** Petal fold, procedural vine growth along a spline, vertical traversal retargeting the rope system, drifting re-lit fragments from all four worlds, four sigil gates in acquisition order, memory lights streaming upward, the locked cupboard's resolution, cloud break, two seconds of silence, and the Skybridge-free fallback variant.

**Folder changes.** `worlds/ascent/*`
**Components.** `AscentScene.tsx`, `GrowingVine.tsx`, `WorldFragment.tsx`, `SigilGate.tsx`, `MemoryLight.tsx`, `CloudBreak.tsx`
**Hooks.** `useAscentBeats`, `useVineGrowth`
**Services.** `VineGenerator.ts` (space colonisation, seeded)
**Data models.** `AscentBeat[]`, `FragmentSpec {world, asset, atHeight}`
**Assets.** Reused world assets recontextualised, vine geometry (procedural), ascent stem, timpani and string swells.
**Animations.** #15 petal fold, #16 vine climb, #19 candle ignition (begins here).

**Acceptance criteria**
- [ ] Petal fold reads as a reversal — playtesters lean forward.
- [ ] Fragments are recognisable as the worlds just played.
- [ ] All four gates passable with generous windows; zero fail states.
- [ ] Runs correctly whether or not Skybridge was completed (test both save states explicitly).
- [ ] The two seconds of silence before the canopy are exact and not filled by ambience.

**Risks.** Vine generation cost at runtime. Mitigation: generate once on world enter with a fixed seed, cache the geometry, animate only a growth uniform.
**Dependencies.** Phases 16, 17; Phase 19 optional.
**Complexity.** L
**Branch.** `feature/ascent`
**Testing.** Run with 4/12, 8/12, and 12/12 memories and confirm the light count matches. Run with Skybridge skipped.

---

## Phase 21 — The Everbloom

**Goal.** The finale. One continuous shot. The last gesture of the game.

**Deliverables.** Procedural tree with progress-driven canopy density, the Stillwater bouquet reproduced as the first blossom ring, star lift, constellation linking with aggressive snapping, the symbol, candle ignition and the breath extinguish, the final message ink reveal, optional recorded voice, and the year-ring data model for future packs.

**Folder changes.** `worlds/everbloom/*`, `shaders/canopy/*`
**Components.** `EverbloomScene.tsx`, `MemoryTree.tsx`, `Canopy.tsx`, `BlossomRing.tsx`, `StarField.tsx`, `Constellation.tsx`, `CandleFlames.tsx`, `FinalMessage.tsx`
**Hooks.** `useConstellation`, `useCanopyDensity`, `useCandles`
**Services.** `TreeGenerator.ts` (L-system, seeded), `ConstellationSolver.ts`
**Data models.** `ProgressState.constellationLinks`, `TreeRing {year, memoryIds}`, `StarSpec`
**Assets.** Blossom sprites, bark texture, star glow, candle flame sprite, smoke sprite, everbloom stems, final voice recording.
**Animations.** #17 canopy bloom, #18 blossom sway, #19/#20 candles, #46 star lift, #47/#48 constellation, #44 ink reveal.

**Acceptance criteria**
- [ ] Canopy density visibly differs between 4/12 and 12/12 memories.
- [ ] The Stillwater arrangement is reproduced exactly, in the same relative positions.
- [ ] Constellation cannot be drawn incorrectly or made ugly; wrong links simply don't take.
- [ ] Candle extinguish reads as a single breath, not 12 separate events.
- [ ] The final message holds on screen until dismissed — never auto-advances.
- [ ] Zero cuts, zero UI, zero interruption from the canopy opening to the message.
- [ ] Tree data model already supports multiple year rings, with one ring populated.

**Risks.** L-system instability producing an ugly tree. Mitigation: fix the seed, tune once, commit the seed as a constant. Never generate randomly at runtime — the finale must be identical every time.
**Dependencies.** Phase 20 (and Phase 13 for the bouquet data).
**Complexity.** XL
**Branch.** `feature/everbloom-finale`
**Testing.** Run the finale at 4, 8, and 12 memories. Reload mid-constellation and confirm links restore. Watch it five times consecutively for any visual instability.

---

## Phase 22 — Credits, Post-Credit & Free-Roam

**Goal.** The exhale, the gag, and the reason to come back.

**Deliverables.** Drifting-petal credits (skippable after 2s, audio continuous), three post-credit stinger variants keyed to `playthroughs`, free-roam unlock with objective-free revisiting and memory replay from the tree, and the `contentVersion` new-sprout hook.

**Folder changes.** `worlds/credits/*`, `worlds/freeroam/*`
**Components.** `CreditsScene.tsx`, `PetalCredit.tsx`, `PostCredit.tsx`, `FreeRoamGarden.tsx`, `MemoryArchive.tsx`
**Hooks.** `useCredits`, `usePlaythroughVariant`, `useFreeRoam`
**Services.** Extends `save` with `playthroughs` increment.
**Data models.** `PostCreditVariant[]`, `contentVersion` comparison
**Assets.** Petal sprites, one absurd oversized prop for the gag, ambient garden bed.
**Animations.** #64 credits drift, post-credit gag beat.

**Acceptance criteria**
- [ ] Credits skippable but audio never stops.
- [ ] Variant changes on visits 2, 3, and 5 (verify by editing `playthroughs` directly).
- [ ] Free-roam allows revisiting every completed world with no objectives and no Pip hints.
- [ ] Every collected memory is re-openable from the tree.
- [ ] Bumping `contentVersion` produces the new-sprout state.
- [ ] The gag lands. If it doesn't make you laugh on the fifth viewing, rewrite it.

**Risks.** Free-roam exposing unfinished states in worlds designed for one-way progression. Mitigation: free-roam mounts worlds with `objectives: false` and all gates pre-opened.
**Dependencies.** Phase 21.
**Complexity.** M
**Branch.** `feature/credits-postcredit`
**Testing.** Complete the game three times. Verify each variant, and that free-roam has no dead ends.

---

## Phase 23 — Art Pass

**Goal.** Move from "functional" to "beautiful." First phase where you're allowed to make things prettier instead of make things work.

**Deliverables.** All seven shaders finalised, per-world LUT grades, post chain tuned (bloom / CA / vignette / grain), particulate in every scene, two-light discipline audited per scene, faked volumetric shafts, paper shader on all diegetic paper, typography audited against §7.3.

**Folder changes.** `shaders/*` (all), `content/theme.ts`, `public/textures/luts/*`
**Components.** `PostChain.tsx`, `Atmosphere.tsx`, `LightShafts.tsx`
**Hooks.** `useWorldGrade`
**Services.** `GradeManager.ts`
**Data models.** `LUTRef`, `GradeSpec`
**Assets.** 6 LUT textures, noise textures, dust/pollen/snow/ember/ash sprites, paper fibre texture.
**Animations.** Polish pass across all 64 entries — timing, easing, overshoot.

**Acceptance criteria**
- [ ] Each world is identifiable from a single screenshot with no UI.
- [ ] The four worlds read as one product (shared trail, shared particulate, shared type).
- [ ] Zero glassmorphism, zero rounded-rectangle panels, zero drop-shadowed cards anywhere.
- [ ] All text meets 4.5:1 contrast against its actual backdrop, in motion.
- [ ] Bloom does not blow out faces in memory playback.
- [ ] Screenshot every scene and review them as a contact sheet. Anything that looks like a website gets fixed here.

**Risks.** Endless polish. Mitigation: timebox to two sessions, keep a written list, ship the list.
**Dependencies.** Phases 11, 13, 16, 17, 19, 20, 21.
**Complexity.** L
**Branch.** `feature/art-pass`
**Testing.** Contact sheet review. Verify no frame drops from the added post chain on the low quality tier.

---

## Phase 24 — Audio Pass & Mix

**Goal.** Replace all placeholder audio with final, and mix to §9.5.

**Deliverables.** Final bed + 6 stems, all ambience beds, complete sfx registry, Pip's four vocalisations, the recorded final message, velocity-mapped Skybridge wind, mix to targets, per-bus polish.

**Folder changes.** `public/audio/*`, `content/audio.manifest.ts`
**Components.** None new.
**Hooks.** None new.
**Services.** Mix presets in `buses.ts`.
**Data models.** Final `AudioCue[]`.
**Assets.** Everything in §9. This is the phase where you buy or commission music.
**Animations.** Audio-locked timing adjustments to #12, #38, #48.

**Acceptance criteria**
- [ ] Music continuous from the prologue to the credits with no gap, click, or level jump.
- [ ] LUFS targets met per bus.
- [ ] Every interaction has a sound. Silence is only ever deliberate.
- [ ] Ducking correct during all memory playback.
- [ ] Sounds correct on laptop speakers and on a phone speaker — not just headphones.
- [ ] The convergence and the final message are both audio-led, not visually-led.

**Risks.** Music licensing that forbids private deployment. Mitigation: verify the licence before purchase, and keep receipts.
**Dependencies.** Phase 23.
**Complexity.** L
**Branch.** `feature/audio-pass`
**Testing.** Full playthrough on laptop speakers with a level meter. Full playthrough on a phone.

---

## Phase 25 — Performance & Touch

**Goal.** Hit every budget in §11.1, on the actual device the recipient will use.

**Deliverables.** Profiling of all 9 scenes, draw-call reduction via instancing and merging, KTX2 conversion completed, audio sprite consolidation, code-split verification, quality-tier tuning, runtime adaptive downgrade, full touch pass, disposal audit, bundle-size CI gate.

**Folder changes.** `tools/analyzeBundle.ts`, `dev/PerfOverlay.tsx`
**Components.** `PerfOverlay.tsx` (dev only)
**Hooks.** `useAdaptiveQuality`
**Services.** `quality.ts` finalised.
**Data models.** `QualityTier` presets per §11.5.
**Assets.** All textures recompressed; all sfx sprite-sheeted.
**Animations.** Motion-scale verification across all 64 entries under reduced motion.

**Acceptance criteria**
- [ ] 60fps sustained in every scene on the target laptop; never below 45.
- [ ] All §11.1 budgets met, with CI failing on regression.
- [ ] Zero React re-renders during gameplay in the Profiler, in every world.
- [ ] Heap flat across a full 35-minute playthrough (no leak).
- [ ] Fully playable on a phone: threading, sigils, swinging, mote placement all work by touch.
- [ ] Adaptive downgrade triggers correctly and invisibly under artificial load.

**Risks.** Mobile GPU can't handle the post chain. Mitigation: the low tier drops bloom to quarter-res and disables CA and grain. Decide early whether phone is a support target or a courtesy — if the recipient will open this on a phone, it's a requirement, and you must know that before Phase 23.
**Dependencies.** Phase 24.
**Complexity.** L
**Branch.** `feature/perf-pass`
**Testing.** Chrome performance traces per scene. Real iPhone and real mid-range Android. 35-minute heap trace.

---

## Phase 26 — QA, Accessibility Audit & Proxy Playtest

**Goal.** Find everything that breaks before the person who matters sees it.

**Deliverables.** Full accessibility audit against §6.5, a keyboard-only playthrough, a reduced-motion playthrough, save/reload at 20 points, a `holdToCast`-only playthrough, cross-browser matrix, edge-case handling (tab-away mid-cinematic, mid-transition reload, network loss mid-load), a proxy playtest with someone who resembles the recipient, and a final letter edit.

**Folder changes.** `tests/e2e/*`, `docs/QA.md`
**Components.** Fixes only.
**Hooks.** Fixes only.
**Services.** `errorBoundary.ts` — a diegetic failure state (Pip looks confused and offers to restart) rather than a stack trace.
**Data models.** None new.
**Assets.** None new.
**Animations.** Fixes only.

**Acceptance criteria**
- [ ] Complete playthrough using only a keyboard.
- [ ] Complete playthrough with reduced motion, with nothing unreachable.
- [ ] Complete playthrough with `holdToCast` and no gestures at all.
- [ ] Save/reload at 20 different points, always correct.
- [ ] Works in Chrome, Safari, Firefox, and Edge; documented in `docs/QA.md`.
- [ ] Tab away for 5 minutes mid-cinematic and return without breakage.
- [ ] Any crash shows a diegetic recovery, never a white screen.
- [ ] Proxy playtester completes it unassisted in 26–38 minutes.
- [ ] The letter is edited once more, out loud.

**Risks.** Playtesting with someone who knows the inside jokes gives you false confidence about clarity, and playtesting with someone who doesn't gives false negatives about emotion. Use a stranger for *mechanics* and your own judgement for *emotion*.
**Dependencies.** Phase 25.
**Complexity.** L
**Branch.** `feature/qa-accessibility`
**Testing.** All of the above, written up. Fix every P0 and P1 before Phase 27.

---

## Phase 27 — Private Deploy

**Goal.** Ship it, privately, safely, and in a way you can hand over as a link.

**Deliverables.** Cloudflare Pages + Access (or Vercel password), the diegetic passphrase boot gate wired to AES-GCM media decryption, `encryptMedia.ts` in the build, noindex and robots, strict CSP, hashed asset filenames, `.gitignore` audit, a public-safe repo variant for your portfolio, a one-page handover note, and a local offline fallback build on a USB drive as insurance.

**Folder changes.** `tools/encryptMedia.ts`, `.github/workflows/deploy.yml`, `public/robots.txt`, `docs/DEPLOY.md`, `docs/PORTFOLIO.md`
**Components.** `BootGate.tsx` finalised with real key derivation.
**Hooks.** `usePassphrase`
**Services.** `decrypt.ts` (PBKDF2 → AES-GCM, WebCrypto only)
**Data models.** `AssetManifest.encrypted`, `KeyDerivationSpec`
**Assets.** Encrypted media bundle.
**Animations.** Boot gate reveal — the passphrase answer blooms the first light.

**Acceptance criteria**
- [ ] URL is not publicly accessible and does not appear in any search index.
- [ ] Wrong passphrase yields no media and no decryption error text — just the gate, patiently.
- [ ] No memory filename in the network tab maps to a real name, date, or event.
- [ ] Zero third-party network requests during a full playthrough (verify in the network panel with a filter).
- [ ] The public portfolio repo contains no private content, verified by cloning it fresh and running it with placeholder content.
- [ ] Offline USB build runs from `file://` or a local server as a backup on the day.
- [ ] You have opened the real link, on the real device, and completed it end to end before sending it.

**Risks.** Something fails on the day, on their device, on their network. Mitigation: the offline build, and a private test on a device matching theirs at least 48 hours before.
**Dependencies.** Phase 26.
**Complexity.** M
**Branch.** `feature/private-deploy`
**Testing.** Fresh incognito with the real passphrase. Fresh incognito with a wrong one. Their device class, their network.

---

# PART III — SCOPE MANAGEMENT

## 14. The cut line

Full spec: roughly **190–250 hours**. That is not compatible with a final year, an internship, and JobFlow AI unless you have three months. So build in this order and stop wherever you run out of time — **every stopping point below is a complete, sendable gift.**

### Tier 1 — Minimum Lovable Version (~70–90h)

**Phases 0–13, 21, 22, 25, 27.**

Delivers: boot gate → prologue → bloom → garden → **the Stillwater** → the Everbloom → credits → post-credit. Roughly 14 minutes, one world, the full emotional arc, the letter, the tree, the constellation. This version already works, and it works because the Stillwater and the finale carry the meaning. Everything else is texture.

Add Phase 14 (Pip) for +8h if you have it — the companion adds more perceived warmth per hour than any world.

### Tier 2 — Strong Version (~130–160h)

Tier 1 **+ Phases 14, 15, 16, 17, 20, 23, 24**.

Delivers three worlds (School, Steeping, Stillwater), the Ascent, Pip, secrets, and full art and audio passes. Roughly 24 minutes. This is the sweet spot: about 65% of the effort for about 90% of the impact, because it drops the single most expensive world and keeps every emotional beat.

### Tier 3 — Full Spec (~190–250h)

Add **Phases 18, 19, 26**. Skybridge included, full QA.

Only attempt Tier 3 if Phase 18's sandbox is genuinely fun within one session. If it isn't, stop, delete the branch, and put those 40 hours into polishing Tiers 1–2. **A gift with three excellent worlds beats a gift with four, one of which is frustrating** — and the Ascent was designed in Phase 20 to work without Skybridge precisely so this decision stays cheap.

## 15. Non-negotiables at every tier

However much you cut, these survive, because they are what make it not-a-website:

1. One canvas, mounted once, never unmounted.
2. No fade-to-black. No loading spinner. No page transition.
3. Music continuous from first light to credits.
4. Zero tutorial text.
5. No fail state anywhere.
6. The letter, written properly, in your own words.
7. The final gesture is the first gesture.
8. Something makes them laugh at the very end.

## 16. What I'd revisit as it grows

- **Content packs** (§13.1) become the main axis of work after year one. If you add a second year, the loader tiering and the tree-ring data model are the two things most likely to need rework — design both defensively in Phases 7 and 21.
- **The reaction matrix** is the only place authored content scales quadratically. If a second potion world ever appears, replace pair-authoring with tag-based rules (`{tags: ['bitter','loud'] → result}`).
- **The scene machine** stays fine up to ~15 scenes. Past that, move to a nested statechart.
- **Physics** stays hand-rolled unless a world needs stacking or collision, at which point adopt Rapier rather than extending the verlet solver.
- **If you ever want this in a portfolio**, the honest framing is strong: a data-driven WebGL narrative engine with a custom gesture recognizer, an authored cinematic sequencer, tiered asset streaming, and a 60fps budget met on integrated graphics. That reads as engineering, not as a novelty — and it's all true.
