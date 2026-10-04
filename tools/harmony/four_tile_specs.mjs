// Pose specs for the four-tile companion reference pages (tests/e2e/harmony_four_tile_refs.mjs).
// Pose guides for the four-tile companion sheets. Coordinates are art px on the 192 x 160 bust canvas, in the same
// framing as the approved Suzu sheet (her head sits right of centre; the bust runs off the bottom edge; hair and the
// gesture flow to the left). Face centres and tilts per tile are Suzu's, nudged per character.
export const SUZU_FACE = [
  { cx: 137, cy: 80, tilt: -10 }, // tile 1, prep_a
  { cx: 130, cy: 81, tilt: -13 }, // tile 2, cue
  { cx: 134, cy: 75, tilt: -5 }, // tile 3, peak
  { cx: 132, cy: 80, tilt: -13 }, // tile 4, settle_b
];

export const CHARS = {
  nao: {
    name: 'Nao', pron: 'they', role: 'courier', technique: 'Read the Opening',
    hair: 'spiky', glasses: false, extras: ['scarf', 'strap', 'pencil'],
    colours: { skin: '#c08a5e', hair: '#3b2a20', cloth: '#5a6a4a', accent: '#c8962e' },
    tiles: [
      { state: 'prep_a', title: 'Reading the road', face: { dx: 0, dy: 0, tilt: -6, look: 'left' }, eyes: 'narrow', mouth: 'set',
        arms: [{ from: [84, 160], el: [96, 150], hand: [108, 136], type: 'strap', ang: -60 }],
        lines: ['Focused and still: eyes cut to the left, reading the way ahead.', 'Thumb hooked under the satchel strap; pencil behind the left ear.', 'Brows level and low, mouth set.'] },
      { state: 'cue', title: 'Found it', face: { dx: -2, dy: 1, tilt: -10, look: 'left' }, eyes: 'open', mouth: 'small',
        arms: [{ from: [80, 160], el: [86, 136], hand: [98, 106], type: 'point', ang: -150 }], from: [[108, 136]],
        lines: ['The glance sharpens; the hand leaves the strap and two fingers begin to point.', 'Eyes open wider, brows lift at the inner ends, lips part: "there".', 'Scarf tail starts to swing.'] },
      { state: 'peak', title: 'Read the Opening', face: { dx: 0, dy: 1, tilt: -4, look: 'front' }, eyes: 'confident', mouth: 'grin',
        arms: [{ from: [84, 160], el: [74, 122], hand: [46, 84], type: 'point', ang: -165 }], from: [[98, 106]], fx: [[30, 80, 'glint']],
        lines: ['A precise point: index and middle finger together, aimed at the far left edge.', 'Head turned to us, an assured lopsided grin, one brow slightly raised.', 'Purposeful, not showy. One small glint at the fingertips (separate effect).'] },
      { state: 'settle_b', title: 'Noted', face: { dx: -2, dy: 0, tilt: -12, look: 'front' }, eyes: 'relaxed', mouth: 'half',
        arms: [{ from: [84, 160], el: [96, 150], hand: [108, 136], type: 'strap', ang: -60 }, { from: [186, 160], el: [190, 112], hand: [172, 68], type: 'tap', ang: -120 }], from: [[46, 84]],
        lines: ['The pointing hand drops back to the strap; the other hand taps the pencil behind the ear.', 'An easy half-smile, eyelids relaxed: job done.', 'Scarf tail settles.'] },
    ],
  },
  mio: {
    name: 'Mio', pron: 'she', role: 'apothecary', technique: 'Clearwater Draught',
    hair: 'bun', glasses: false, extras: ['apron'],
    colours: { skin: '#eec8a4', hair: '#1e1a1c', cloth: '#6a8a7a', accent: '#e8e0c8' },
    tiles: [
      { state: 'prep_a', title: 'Measured', face: { dx: 0, dy: 0, tilt: -8, look: 'down' }, eyes: 'down', mouth: 'soft',
        arms: [{ from: [92, 160], el: [104, 150], hand: [128, 136], type: 'hold', ang: -30 }, { from: [180, 160], el: [168, 152], hand: [146, 146], type: 'cup', ang: 180 }],
        prop: { type: 'vial', x: 132, y: 130, ang: 0 },
        lines: ['A small corked vial of clear water held upright at her chest, the other hand cupped beneath.', 'Calm and attentive, eyes on the vial, a gentle closed smile.', 'Black hair in a bun with gold pins; cream apron over the sage dress.'] },
      { state: 'cue', title: 'To the light', face: { dx: -3, dy: 1, tilt: -14, look: 'left' }, eyes: 'focus', mouth: 'soft',
        arms: [{ from: [88, 160], el: [86, 124], hand: [98, 90], type: 'hold', ang: -80 }, { from: [180, 160], el: [168, 152], hand: [150, 142], type: 'rest', ang: 180 }],
        prop: { type: 'vial', x: 99, y: 78, ang: -10 }, from: [[128, 136]],
        lines: ['She raises the vial beside her face and turns it to the light, thumb on the cork.', 'Eyes on the vial, brows drawn in with concentration.', 'Composed and competent, never timid.'] },
      { state: 'peak', title: 'Clearwater Draught', face: { dx: 0, dy: 1, tilt: -4, look: 'front' }, eyes: 'warm', mouth: 'smile_open',
        arms: [{ from: [88, 160], el: [78, 120], hand: [58, 88], type: 'hold', ang: -150 }, { from: [180, 160], el: [176, 138], hand: [158, 122], type: 'open', ang: -100 }],
        prop: { type: 'vial', x: 52, y: 80, ang: -55 }, from: [[98, 90]], fx: [[36, 70, 'drops'], [26, 86, 'drops']],
        lines: ['A deliberate pour: the vial tipped forward at a controlled angle, cork lifted, clear drops arcing out.', 'Her other hand open at her chest, palm out: reassuring.', 'A steady, warm, confident smile straight at us. Drops and a soft sparkle are a separate effect.'] },
      { state: 'settle_b', title: 'All will be well', face: { dx: -2, dy: 0, tilt: -15, look: 'front' }, eyes: 'soft', mouth: 'soft',
        arms: [{ from: [92, 160], el: [106, 150], hand: [134, 136], type: 'hold', ang: -20 }, { from: [180, 160], el: [168, 150], hand: [146, 132], type: 'over', ang: 170 }],
        prop: { type: 'vial', x: 138, y: 130, ang: 10 }, from: [[58, 88]],
        lines: ['The vial capped and held to her chest, her other hand resting over it.', 'Head tilted kindly, eyes softly half-lidded, a gentle smile.', 'Bun pins and loose strands settle.'] },
    ],
  },
  ren: {
    name: 'Ren', pron: 'they', role: 'lantern keeper', technique: 'Lantern Ward',
    hair: 'ponytail', glasses: true, extras: ['collar'],
    colours: { skin: '#dcae84', hair: '#1e2a44', cloth: '#3a3e6a', accent: '#d8b060' },
    tiles: [
      { state: 'prep_a', title: 'Steady', face: { dx: 0, dy: 0, tilt: -6, look: 'front' }, eyes: 'narrow', mouth: 'set',
        arms: [{ from: [84, 160], el: [80, 150], hand: [86, 138], type: 'hold', ang: -90 }, { from: [180, 160], el: [176, 140], hand: [160, 118], type: 'collar', ang: -140 }],
        prop: { type: 'lamp', x: 86, y: 146, ang: 0, glow: 0.3 },
        lines: ['The small brass lamp held low by its ring, a dim glow; the other hand at the coat collar.', 'Thoughtful and exact: eyes slightly narrowed behind round glasses, mouth level.', 'Blue-black ponytail, side parting, navy high-collared coat with brass buttons.'] },
      { state: 'cue', title: 'Ready the light', face: { dx: -2, dy: 1, tilt: -10, look: 'front' }, eyes: 'focus', mouth: 'set',
        arms: [{ from: [84, 160], el: [82, 132], hand: [96, 112], type: 'hold', ang: -90 }, { from: [184, 160], el: [182, 116], hand: [166, 84], type: 'glasses', ang: -150 }],
        prop: { type: 'lamp', x: 96, y: 120, ang: 0, glow: 0.6 }, from: [[86, 138], [160, 118]],
        lines: ['The lamp rises to chest height and brightens.', 'A quick push of the glasses by the hinge at the temple, clear of the eyes: a secondary beat, not the performance.', 'Intent eyes, a glint on the lenses, mouth firm.'] },
      { state: 'peak', title: 'Lantern Ward', face: { dx: 0, dy: 1, tilt: -4, look: 'front' }, eyes: 'intent', mouth: 'firm_smile',
        arms: [{ from: [84, 160], el: [70, 110], hand: [80, 64], type: 'hold', ang: -90 }, { from: [186, 160], el: [190, 128], hand: [176, 104], type: 'ward', ang: -90 }],
        prop: { type: 'lamp', x: 80, y: 54, ang: 0, glow: 1 }, from: [[96, 112], [166, 84]], fx: [[80, 54, 'halo']],
        lines: ['The lamp held up beside the face, its warm light framing an intent face.', 'The free hand raised palm-out at the right: a measured, protective ward.', 'Determined eyes behind the glasses, a small firm smile. Glow and motes are a separate effect.'] },
      { state: 'settle_b', title: 'Kept', face: { dx: -2, dy: 0, tilt: -12, look: 'front' }, eyes: 'soft', mouth: 'soft',
        arms: [{ from: [96, 160], el: [104, 152], hand: [128, 140], type: 'cradle', ang: -10 }, { from: [180, 160], el: [170, 152], hand: [150, 140], type: 'cradle', ang: 190 }],
        prop: { type: 'lamp', x: 139, y: 132, ang: 0, glow: 0.45 }, from: [[80, 64], [176, 104]],
        lines: ['The lamp lowered and cradled in both hands at the chest, glow softened.', 'A quiet, reassured smile; calm eyes; a soft glint on the lenses.', 'Ponytail and coat tails settle.'] },
    ],
  },
};
