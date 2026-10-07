import type { Avatar, Person } from "../models";
import { SIZE, avatarRects } from "../lib/avatar";
import { PixelAvatar } from "./PixelArt";

// Each face is drawn once into a PNG and reused, so editor previews and long lists stay light.
const images = new Map<string, string>();
const IMAGE_LIMIT = 300;
function faceImage(avatar: Avatar): string {
  const key = JSON.stringify(avatar);
  const cached = images.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d");
  if (!context) return "";
  for (const rect of avatarRects(avatar)) {
    context.fillStyle = rect.color;
    context.fillRect(rect.x, rect.y, rect.width, 1);
  }
  const url = canvas.toDataURL("image/png");
  if (images.size >= IMAGE_LIMIT) images.delete(images.keys().next().value!);
  images.set(key, url);
  return url;
}

export function FaceAvatar({
  avatar,
  size = 32,
  label,
}: {
  avatar: Avatar;
  size?: number;
  /** Accessible description. Without it the face is decorative. */
  label?: string;
}) {
  return (
    <img
      className="pixel-art face-avatar"
      src={faceImage(avatar)}
      width={size}
      height={size}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
    />
  );
}

/** The friend's face when one was built, otherwise their pixel symbol. */
export default function FriendAvatar({
  person,
  size = 32,
}: {
  person: Pick<Person, "avatar" | "emoji">;
  size?: number;
}) {
  return person.avatar ? (
    <FaceAvatar avatar={person.avatar} size={size} />
  ) : (
    <PixelAvatar emoji={person.emoji} size={size} />
  );
}
