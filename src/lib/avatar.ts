/**
 * Pixel-art bust builder. The implementation lives in ./avatar/, this file is its public API.
 * Original art in the style of farm-life RPG portraits: hue-shifted ramps, colored outlines that
 * soften on the lit side, hair drawn in locks. Light comes from the top left.
 */
export { SIZE } from "./avatar/grid";
export { EYE_COLORS, HAIR_COLORS, SHIRT_COLORS, SKIN_TONES } from "./avatar/palettes";
export { HAIR_STYLES } from "./avatar/hair";
export { AGES } from "./avatar/face";
export { BEARDS, EARRINGS, GLASSES, HATS } from "./avatar/accessories";
export { avatarPixels, avatarRects, describeAvatar, randomAvatar } from "./avatar/render";
