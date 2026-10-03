/* The gesture library of the expressive actor system (docs/expressive/GESTURES.md §2, CONTRACT.md §3.4).
 *
 * One vocabulary for idle life, conversation and staged scenes: the 32 primitives of the owner's addendum
 * (§11.2) and the idle habits and occupation loops of the paired addendum (§6), each a short sequence of
 * the pose layer's key poses (src/engine/32g_spritepose.js):
 *
 *   entry → readable peak → recovery (or a hold at the peak)
 *
 * A key is [pose | null, ms, extra]: pose a POSES name (null = the person's rest), ms its time, extra
 * { gaze: 'target' | 'away' | 'l' | 'r' | 'u' | 'd' | 'c', dx (art px toward the facing: a half-step),
 * dy (a hop), turn: 1 (face the target), look: 'a' | 'b' (the first or second subject), prop: 1 }.
 * Durations follow §12.3: a short gesture reaches its peak in 250–700 ms, a handover in 600–1,200 ms;
 * none of them is a reading deadline (an early advance settles them, RB.staging.settle()).
 *
 *   still   the key pose held with reduced motion (no in-betweens)
 *   hold    the peak may be held while a line is read (a held emotion breathes; it never loops)
 *   needs   'glasses' | 'free' (a free hand) | 'two' (two free hands) | 'prop' (something to hold)
 *   alt     the gesture used instead when a person cannot do this one (a cane user bends, never kneels)
 *   legible 'full' reads at play scale on the 40×58 figure; 'aided' reads with its context (a target,
 *           a prop, a facing) or its alternative; 'weak' does not carry meaning alone (GESTURES.md §2)
 * RB.gestures.get(id), .list(), .PRIM (the 32 by number), .HABITS, .duration(id), .validate() */
var RB = (globalThis.RB = globalThis.RB || {});

RB.gestures = (function () {
  'use strict';
  const G = {};
  const def = (id, o) => { G[id] = Object.assign({ id, kind: o.n ? 'primitive' : 'habit' }, o); };
  const K = (p, ms, x) => [p, ms, x || null];

  // ---- the 32 primitives (§11.2) ---------------------------------------------------------------------
  // Attention
  def('listen', { n: 1, group: 'Attention', label: 'turn-and-listen', entry: [K('listen', 180, { turn: 1, gaze: 'target' })], peak: K('listen', 320, { gaze: 'target' }), recover: [K(null, 160)], hold: true, still: 'listen', legible: 'full', carry: 'facing' });
  def('nod', { n: 2, group: 'Attention', label: 'small acknowledgement nod', entry: [K('nod1', 110)], peak: K('nod2', 170), recover: [K('nod1', 120), K(null, 80)], still: 'nod1', legible: 'full' });
  def('lookbetween', { n: 3, group: 'Attention', label: 'look-between-two-subjects', entry: [K('listen', 300, { look: 'a' })], peak: K('listen', 340, { look: 'b' }), recover: [K('listen', 260, { look: 'a' }), K(null, 120)], still: 'listen', legible: 'aided' });
  def('observe', { n: 4, group: 'Attention', label: 'lean-in-to-observe', entry: [K('listen', 180, { turn: 1, gaze: 'target' })], peak: K('observe', 360, { gaze: 'd' }), recover: [K('listen', 180), K(null, 120)], hold: true, still: 'observe', legible: 'full' });
  // Thought
  def('chin', { n: 5, group: 'Thought', label: 'hand-to-chin', entry: [K('chin0', 150)], peak: K('chin', 330, { gaze: 'u' }), recover: [K('chin0', 150), K(null, 90)], hold: true, still: 'chin', needs: 'free', legible: 'full' });
  def('aside', { n: 6, group: 'Thought', label: 'glance-aside-and-return', entry: [K('aside', 130, { gaze: 'away' })], peak: K('aside', 360, { gaze: 'away' }), recover: [K(null, 140)], still: 'aside', legible: 'aided' });
  def('glasses', { n: 7, group: 'Thought', label: 'glasses/temple adjustment', entry: [K('chin0', 120)], peak: K('temple', 220), recover: [K('temple2', 150), K('chin0', 110), K(null, 80)], still: 'temple', needs: 'glasses', alt: 'aside', legible: 'full' });
  def('halfraise', { n: 8, group: 'Thought', label: 'pause-with-hand-half-raised', entry: [K('chin0', 160)], peak: K('half', 520), recover: [K(null, 180)], hold: true, still: 'half', needs: 'free', legible: 'full' });
  // Explanation
  def('palm', { n: 9, group: 'Explanation', label: 'open-palm explanation', entry: [K('palm', 160)], peak: K('palmout', 280), recover: [K('palm', 160), K(null, 90)], still: 'palmout', needs: 'free', legible: 'full' });
  def('point', { n: 10, group: 'Explanation', label: 'precise directional point', entry: [K('half', 120, { turn: 1, gaze: 'target' })], peak: K('point', 480, { gaze: 'target' }), recover: [K('half', 130), K(null, 90)], hold: true, still: 'point', needs: 'free', legible: 'full', aim: true });
  def('size', { n: 11, group: 'Explanation', label: 'two-handed size/relationship', entry: [K('size_out', 190)], peak: K('size_in', 280), recover: [K('size_out', 150), K(null, 100)], still: 'size_out', needs: 'two', alt: 'palm', legible: 'full' });
  def('count', { n: 12, group: 'Explanation', label: 'count or sequence on fingers', entry: [K('count1', 220)], peak: K('count2', 230), recover: [K('count3', 260), K(null, 100)], still: 'count3', needs: 'free', legible: 'weak' });
  // Object interaction
  def('present', { n: 13, group: 'Object', label: 'two-handed presentation', entry: [K('hold', 200, { prop: 1 })], peak: K('present', 420, { prop: 1, gaze: 'd' }), recover: [K('hold', 200, { prop: 1 })], hold: true, still: 'present', needs: 'prop', legible: 'full' });
  def('handover', { n: 14, group: 'Object', label: 'one-handed handover/receive', entry: [K('hold', 260, { prop: 1, turn: 1 })], peak: K('reach', 380, { prop: 1, gaze: 'target' }), recover: [K('half', 220), K(null, 160)], still: 'reach', needs: 'free', legible: 'full', handoff: true });
  def('receive', { n: 14, group: 'Object', label: 'one-handed handover/receive (receiving)', entry: [K('half', 240, { turn: 1, gaze: 'target' })], peak: K('reach', 360, { gaze: 'target' }), recover: [K('take', 320, { prop: 1 })], hold: true, still: 'take', needs: 'free', legible: 'full', handoff: true, variant: true });
  def('kneel', { n: 15, group: 'Object', label: 'kneel or bend to inspect', entry: [K('bend', 220, { turn: 1 })], peak: K('kneel', 420, { gaze: 'd' }), recover: [K('bend', 200), K(null, 120)], hold: true, still: 'kneel', alt: 'bend', legible: 'full' });
  def('bend', { n: 15, group: 'Object', label: 'kneel or bend to inspect (bend)', entry: [K('listen', 160, { turn: 1 })], peak: K('bend', 400, { gaze: 'd' }), recover: [K('listen', 160), K(null, 100)], hold: true, still: 'bend', legible: 'full', variant: true });
  def('read', { n: 16, group: 'Object', label: 'read/trace a document or inscription', entry: [K('hold', 220, { prop: 1 })], peak: K('read', 460, { prop: 1, gaze: 'd' }), recover: [K('trace', 400, { prop: 1 }), K('read', 300, { prop: 1 })], hold: true, still: 'read', needs: 'prop', alt: 'observe', legible: 'full' });
  // Uncertainty
  def('shrug', { n: 17, group: 'Uncertainty', label: 'small shrug', entry: [K('palm', 130)], peak: K('shrug', 360), recover: [K('palm', 120), K(null, 90)], still: 'shrug', needs: 'two', alt: 'aside', legible: 'full' });
  def('halfstep', { n: 18, group: 'Uncertainty', label: 'hesitant half-step', entry: [K('step', 190, { dx: 3 })], peak: K('step', 320, { dx: 5 }), recover: [K('listen', 180, { dx: 3 }), K(null, 140, { dx: 0 })], still: 'listen', legible: 'full', carry: 'offset' });
  def('guard', { n: 19, group: 'Uncertainty', label: 'guarded hand near chest', entry: [K('heart', 200)], peak: K('guard', 320), recover: [K('heart', 160), K(null, 100)], hold: true, still: 'guard', needs: 'free', legible: 'full' });
  def('shake', { n: 20, group: 'Uncertainty', label: 'quiet head shake/refusal', entry: [K('shakeL', 130)], peak: K('shakeR', 130), recover: [K('shakeL', 120), K('shakeR', 110), K(null, 90)], still: 'shakeL', legible: 'aided' });
  // Tension
  def('recoil', { n: 21, group: 'Tension', label: 'interrupted/startled recoil', entry: [K('recoil', 90, { dx: -2 })], peak: K('recoil', 300, { dx: -3 }), recover: [K('listen', 200, { dx: -1 }), K(null, 150, { dx: 0 })], still: 'recoil', legible: 'full' });
  def('flinch', { n: 21, group: 'Tension', label: 'interrupted/startled recoil (very small: a startled look up)', entry: [K('listen', 90, { dx: -1, gaze: 'u' })], peak: K('flinch', 260, { dx: -1, gaze: 'u' }), recover: [K('listen', 200, { dx: 0 })], still: 'flinch', legible: 'aided', variant: true });
  def('folded', { n: 22, group: 'Tension', label: 'tense arms-folded stance', entry: [K('half', 160)], peak: K('folded', 320), recover: [K('half', 140), K(null, 90)], hold: true, still: 'folded', needs: 'two', alt: 'guard', legible: 'full' });
  def('forehead', { n: 23, group: 'Tension', label: 'hand-to-forehead frustration', entry: [K('half', 150)], peak: K('forehead', 460), recover: [K('half', 150), K(null, 90)], still: 'forehead', needs: 'free', legible: 'full' });
  def('emphatic', { n: 24, group: 'Tension', label: 'restrained emphatic downward gesture', entry: [K('emph0', 190)], peak: K('emph1', 300), recover: [K('emph0', 120), K(null, 120)], still: 'emph1', needs: 'free', legible: 'full' });
  // Vulnerability
  def('lowered', { n: 25, group: 'Vulnerability', label: 'lowered head/shoulders', entry: [K('nod1', 180)], peak: K('low', 420), recover: [K('nod1', 220), K(null, 160)], hold: true, still: 'low', legible: 'full' });
  def('fidget', { n: 26, group: 'Vulnerability', label: 'self-conscious hand/arm fidget', entry: [K('fidget1', 190)], peak: K('fidget2', 200), recover: [K('fidget1', 190), K(null, 140)], still: 'fidget1', needs: 'two', alt: 'guard', legible: 'aided' });
  def('avert', { n: 27, group: 'Vulnerability', label: 'avert gaze then face someone', entry: [K('avert', 360, { gaze: 'away' })], peak: K('listen', 320, { turn: 1, gaze: 'target' }), recover: [K(null, 160)], hold: true, still: 'listen', legible: 'aided' });
  def('resolve', { n: 27, group: 'Vulnerability', label: 'avert gaze then face someone (a fidget resolving into a lowered but direct posture)', entry: [K('fidget1', 200), K('low', 260)], peak: K('lowface', 320, { turn: 1, gaze: 'target' }), recover: [K(null, 160)], hold: true, still: 'lowface', needs: 'two', alt: 'avert', legible: 'full', variant: true });
  def('bow', { n: 28, group: 'Vulnerability', label: 'careful apologetic bow', entry: [K('bow1', 200)], peak: K('bow2', 420), recover: [K('bow1', 300), K(null, 120)], still: 'bow2', alt: 'duck', legible: 'full' });
  def('duck', { n: 28, group: 'Vulnerability', label: 'careful apologetic bow (a child\'s quick duck of the head)', entry: [K('nod1', 120)], peak: K('duck', 260), recover: [K(null, 140)], still: 'duck', legible: 'full', variant: true });
  // Release
  def('exhale', { n: 29, group: 'Release', label: 'exhale/shoulder release', entry: [K('nod1', 220)], peak: K('exhale', 480), recover: [K(null, 320)], still: 'exhale', legible: 'aided' });
  def('thanks', { n: 30, group: 'Release', label: 'open appreciative acknowledgement', entry: [K('palm', 160)], peak: K('thanks', 340), recover: [K('nod1', 160), K(null, 100)], still: 'thanks', needs: 'two', alt: 'nod', legible: 'full' });
  def('celebrate', { n: 31, group: 'Release', label: 'small contained celebration', entry: [K('fist', 150)], peak: K('pump', 200, { dy: -2 }), recover: [K('pump', 180, { dy: 0 }), K(null, 140)], still: 'pump', needs: 'free', legible: 'full' });
  def('laugh', { n: 32, group: 'Release', label: 'gentle laugh/hand-near-mouth', entry: [K('laugh', 150)], peak: K('laugh2', 180), recover: [K('laugh', 180), K('laugh2', 160), K(null, 120)], still: 'laugh', needs: 'free', legible: 'full' });

  // ---- idle habits (paired addendum §6.1, GESTURES.md §5 core library) -------------------------------
  // a habit's keys play once (or `loop` times) then the person is at rest again; `at` names the station
  // prop it needs nearby (an occupation idle), `prop` the object in hand while it plays
  def('shift', { label: 'weight shift', entry: [K('shiftL', 1400)], peak: K('shiftL', 600), recover: [K(null, 200)], still: null });
  def('shiftR', { label: 'weight shift (other foot)', entry: [K('shiftR', 1400)], peak: K('shiftR', 600), recover: [K(null, 200)] });
  def('lookroad', { label: 'look along the road', entry: [K('listen', 200, { turn: 1, gaze: 'target' })], peak: K(null, 1300, { gaze: 'target' }), recover: [K(null, 200)] });
  def('glance', { label: 'glance at a neighbour', entry: [K(null, 120, { gaze: 'target' })], peak: K(null, 900, { gaze: 'target' }), recover: [K(null, 100)] });
  def('touchhair', { label: 'sleeve or hair touch', entry: [K('half', 150)], peak: K('touchhair', 600), recover: [K('half', 140), K(null, 80)], needs: 'free' });
  def('strap', { label: 'settle the strap', entry: [K('strap', 260)], peak: K('strap', 900, { gaze: 'd' }), recover: [K(null, 160)], needs: 'free' });
  def('stretch', { label: 'stretch', entry: [K('half', 200)], peak: K('stretch', 800), recover: [K('half', 200), K(null, 120)], needs: 'two' });
  def('rubhands', { label: 'rub hands (cold)', entry: [K('rub', 260)], peak: K('fidget1', 260), recover: [K('rub', 260), K('fidget1', 260), K(null, 140)], needs: 'two' });
  def('shadeeyes', { label: 'shade the eyes', entry: [K('half', 160, { turn: 1 })], peak: K('shadeeyes', 1300), recover: [K('half', 140), K(null, 90)], needs: 'free' });
  def('yawn', { label: 'yawn', entry: [K('half', 160)], peak: K('yawn', 900), recover: [K(null, 200)], needs: 'free' });
  def('check', { label: 'check a held object', entry: [K('hold', 220, { prop: 1 })], peak: K('check', 900, { prop: 1 }), recover: [K(null, 160)], needs: 'free' });
  def('tidy', { label: 'tidy a surface', entry: [K('tidy1', 420)], peak: K('tidy2', 420), recover: [K('tidy1', 420), K('tidy2', 420), K(null, 140)], needs: 'two', at: 'surface' });
  def('readidle', { label: 'read', prop: 'book', entry: [K('hold', 240, { prop: 1 })], peak: K('read', 2400, { prop: 1 }), recover: [K('trace', 600, { prop: 1 }), K('read', 900, { prop: 1 }), K(null, 200)], needs: 'two' });
  def('write', { label: 'write', prop: 'brush', entry: [K('write1', 380, { prop: 1 })], peak: K('write2', 380, { prop: 1 }), recover: [K('write1', 380, { prop: 1 }), K('write2', 380, { prop: 1 }), K('write1', 380, { prop: 1 }), K(null, 700, { gaze: 'u' }), K(null, 120)], at: 'desk' });
  def('brow', { label: 'wipe the brow', entry: [K('half', 140)], peak: K('brow', 520), recover: [K(null, 140)], needs: 'free' });
  // occupations (§6.2)
  def('sweep', { label: 'sweeping', prop: 'broom', entry: [K('sweep1', 420, { prop: 1 })], peak: K('sweep2', 420, { prop: 1 }), recover: [K('sweep1', 420, { prop: 1 }), K('sweep2', 420, { prop: 1 }), K('sweep1', 420, { prop: 1 }), K(null, 160)], loop: 1 });
  def('sort', { label: 'sorting', prop: 'tags', entry: [K('sort1', 380, { prop: 1 })], peak: K('sort2', 380, { prop: 1 }), recover: [K('sort1', 380, { prop: 1 }), K('sort2', 380, { prop: 1 }), K(null, 160)], at: 'surface' });
  def('stamp', { label: 'stamping forms', prop: 'stamp', entry: [K('stampup', 300, { prop: 1 })], peak: K('stampdown', 240, { prop: 1 }), recover: [K('stampup', 300, { prop: 1 }), K('stampdown', 240, { prop: 1 }), K(null, 160)], at: 'surface' });
  def('pour', { label: 'pouring', prop: 'teapot', entry: [K('hold', 260, { prop: 1 })], peak: K('pour', 1100, { prop: 1 }), recover: [K('hold', 240, { prop: 1 }), K(null, 140)], at: 'tea' });
  def('stir', { label: 'stirring the pot', entry: [K('stir1', 340)], peak: K('stir2', 340), recover: [K('stir1', 340), K('stir2', 340), K('stir1', 340), K(null, 140)], at: 'hearth' });
  def('polish', { label: 'polishing', prop: 'cup', entry: [K('polish1', 300, { prop: 1 })], peak: K('polish2', 300, { prop: 1 }), recover: [K('polish1', 300, { prop: 1 }), K('polish2', 300, { prop: 1 }), K(null, 140)], needs: 'two' });
  def('hangwash', { label: 'hanging and folding', entry: [K('hang', 700)], peak: K('fold', 600), recover: [K('hang', 700), K('fold', 600), K(null, 160)], needs: 'two', at: 'laundry' });
  def('hammer', { label: 'repairing', entry: [K('hammer1', 260)], peak: K('hammer2', 200), recover: [K('hammer1', 260), K('hammer2', 200), K('hammer1', 260), K('hammer2', 200), K(null, 160)], at: 'bench' });
  def('tendlamp', { label: 'tending a lamp', entry: [K('lampup', 300)], peak: K('trim', 1400), recover: [K('lampup', 240), K(null, 140)], needs: 'lamp' });
  def('tendlight', { label: 'tending a light', entry: [K('tend1', 300, { gaze: 'u' })], peak: K('tend2', 1000, { gaze: 'u' }), recover: [K(null, 160)], at: 'light' });
  def('feedfire', { label: 'tending a fire', entry: [K('bend', 300)], peak: K('feed', 1400), recover: [K('bend', 260), K(null, 140)], at: 'fire' });
  // glassblowing: the pipe turned without a stop, a breath into it now and then (a loop: in a scene it
  // keeps going through the lines when held; idle it plays a few turns); 'cool' sets the gather to cool
  def('glasswork', { label: 'turning the blowpipe, shaping the gather', prop: 'pipeA', loop: true, cycles: 3,
    entry: [K('pipe1', 260, { prop: 'pipeA' })], peak: K('pipe2', 260, { prop: 'pipeB' }),
    recover: [K('pipe3', 260, { prop: 'pipeC' }), K('pipe1', 260, { prop: 'pipeA' }), K('pipe2', 260, { prop: 'pipeB' }), K('pipe3', 260, { prop: 'pipeC' }), K('blow', 700, { prop: 'pipeA' }), K('pipe1', 260, { prop: 'pipeB' })],
    hold: true, still: 'pipehold' });
  def('cool', { label: 'the gather held still to cool', prop: 'pipecool', entry: [K('pipehold', 300, { prop: 'pipeB' })], peak: K('pipehold', 420, { prop: 'pipecool', gaze: 'target' }), recover: [K(null, 200)], hold: true, still: 'pipehold' });
  def('jiggle', { label: 'jiggling a line or net', entry: [K('jiggle1', 300)], peak: K('jiggle2', 300), recover: [K('jiggle1', 300), K('jiggle2', 300), K(null, 140)], needs: 'two' });
  def('knead', { label: 'kneading', entry: [K('knead1', 340)], peak: K('knead2', 340), recover: [K('knead1', 340), K('knead2', 340), K(null, 140)], needs: 'two', at: 'surface' });
  def('sip', { label: 'a sip from a cup', prop: 'cup', entry: [K('cuphold', 400, { prop: 1 })], peak: K('sip', 700, { prop: 1 }), recover: [K('cuphold', 500, { prop: 1 }), K(null, 140)], needs: 'free' });
  def('countidle', { label: 'counting on the fingers', entry: [K('count1', 420)], peak: K('count2', 420), recover: [K('count3', 500), K(null, 160)], needs: 'free' });
  def('hum', { label: 'weight on one leg, humming (no sound)', entry: [K('tilt', 700)], peak: K('hip', 900), recover: [K('tilt', 500), K(null, 160)] });
  def('heeltap', { label: 'a heel tap', entry: [K(null, 120, { dy: -1 })], peak: K(null, 160, { dy: 0 }), recover: [K(null, 120, { dy: -1 }), K(null, 160, { dy: 0 })] });
  def('bounce', { label: 'bouncing on the toes', entry: [K('bounce', 150, { dy: -1 })], peak: K(null, 150, { dy: 0 }), recover: [K('bounce', 150, { dy: -1 }), K(null, 150, { dy: 0 }), K('bounce', 150, { dy: -1 }), K(null, 150, { dy: 0 })] });
  def('peek', { label: 'peeking at visitors', entry: [K('listen', 200, { turn: 1, gaze: 'target' })], peak: K('peek', 800, { gaze: 'target' }), recover: [K(null, 160)] });
  def('crouch', { label: 'crouching to the snow', entry: [K('bend', 260)], peak: K('crouch', 1600), recover: [K('bend', 220), K(null, 140)] });
  def('doze', { label: 'dozing', entry: [K('nod1', 600)], peak: K('nod2', 1400, { gaze: 'c' }), recover: [K('nod1', 300), K(null, 200)] });
  def('stiff', { label: 'a fixed-angle tilt (a non-human figure)', entry: [K(null, 300, { turn: 1 })], peak: K(null, 700, { gaze: 'target' }), recover: [K(null, 200)] });
  def('fold', { label: 'arms folded a while', entry: [K('half', 160)], peak: K('folded', 2400), recover: [K('half', 140), K(null, 90)], needs: 'two' });
  def('handsbehind', { label: 'hands behind the back a while', entry: [K('behind', 2600)], peak: K('behind', 600), recover: [K(null, 160)], needs: 'two' });
  // a supporting hand: a half-step to someone beside you and a hand laid on their back (held)
  def('touchback', { label: 'a hand laid on someone\'s back', entry: [K('half', 220, { turn: 1, dx: 4 })], peak: K('reach', 420, { dx: 10 }), recover: [K('half', 220, { dx: 5 }), K(null, 180, { dx: 0 })], hold: true, still: 'reach', needs: 'free' });
  def('cupear', { label: 'a hand to the ear (listening for something)', entry: [K('half', 260)], peak: K('cupear', 1200, { gaze: 'u' }), recover: [K('half', 200), K(null, 160)], needs: 'free' });
  def('sitidle', { label: 'sitting a while', entry: [K('sit', 400)], peak: K('sitlook', 1800, { gaze: 'u' }), recover: [K('sit', 300)] });

  // ---- queries ------------------------------------------------------------------------------------------
  function get(id) { return G[id] || null; }
  function list() { return Object.values(G); }
  function keys(g) { return g.entry.concat([g.peak], g.recover); }
  function duration(id) { const g = typeof id === 'string' ? G[id] : id; return g ? keys(g).reduce((t, k) => t + k[1], 0) : 0; }
  function toPeak(id) { const g = typeof id === 'string' ? G[id] : id; return g ? g.entry.reduce((t, k) => t + k[1], 0) + g.peak[1] : 0; }
  // the primitives in the addendum's order, one per number (the main form; variants listed separately)
  const PRIM = {};
  for (const g of list()) if (g.n && !g.variant) PRIM[g.n] = g;
  // whether a person (their look) can do it: glasses for the glasses adjustment, two free hands for a
  // two-handed gesture (a cane hand never leaves the cane), something to hold for a presentation
  function can(id, look, o) {
    const g = G[id];
    if (!g) return false;
    const acc = (look && look.acc) || [];
    const pose = RB.sprites && RB.sprites._pose;
    const h = pose ? pose.holds(look || {}) : { L: null, R: null };
    if (look && look.pet) return false;
    // a non-human figure drawn whole (a goat, a spirit, the Catalogue Clerk) only turns and looks
    if (look && look.custom) return id === 'stiff' || id === 'glance' || id === 'lookroad' || id === 'listen';
    if (g.needs === 'glasses') return acc.includes('glasses');
    if (g.needs === 'two') return h.L !== 'cane' && !(h.L && h.R);
    if (g.needs === 'lamp') return acc.includes('lamp');
    if (g.needs === 'prop') return !!(o && o.prop) || !!g.prop;
    if (id === 'kneel' && (look.age === 'old' || h.L === 'cane')) return false;
    if (id === 'bow' && look.size === 'child') return false;
    return true;
  }
  // the gesture a person actually performs for a requested one (its alternative when they cannot)
  function fit(id, look, o) {
    let cur = id, guard = 0;
    while (cur && !can(cur, look, o) && guard++ < 4) cur = (G[cur] || {}).alt || null;
    return cur && can(cur, look, o) ? cur : null;
  }
  // structural check (used by the unit test and the dev viewer)
  function validate() {
    const out = [];
    const poses = RB.sprites && RB.sprites._pose ? RB.sprites._pose.POSES : null;
    for (const g of list()) {
      if (!g.entry || !g.entry.length) out.push(g.id + ': no entry');
      if (!g.peak) out.push(g.id + ': no peak');
      if (!g.recover) out.push(g.id + ': no recovery');
      for (const k of keys(g)) {
        if (k[0] && poses && !poses[k[0]]) out.push(g.id + ': unknown pose ' + k[0]);
        if (!(k[1] > 0)) out.push(g.id + ': a key without a time');
      }
      if (g.alt && !G[g.alt]) out.push(g.id + ': unknown alternative ' + g.alt);
    }
    for (let n = 1; n <= 32; n++) if (!PRIM[n]) out.push('primitive ' + n + ' missing');
    return out;
  }
  return { get, list, keys, duration, toPeak, can, fit, validate, PRIM, G };
})();
