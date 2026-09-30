/* The Mill Road repair (addendum §14.1; the map and scenes are in
 * src/content/ch1/11_maps_mill.js and 31_scenes_mill.js). The narrows push
 * back whoever walks up into them, never whoever walks down out of them: this
 * hook tells the scene which way the player was going when they reached the
 * narrows' mouth, so a player on the mill side (by the other approach, from an
 * older save, or coming out of the mill) is never held there. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};
RB.hooks.mr_heading = async () => {
  const s = RB.game.s, p = RB.world.W.player;
  s.vars._mr_down = p && p.dir === 'down' ? 1 : 0;
};
