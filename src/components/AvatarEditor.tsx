import { useState } from "react";
import type { Avatar } from "../models";
import {
  AGES,
  BEARDS,
  EARRINGS,
  EYE_COLORS,
  GLASSES,
  HAIR_COLORS,
  HAIR_STYLES,
  HATS,
  SHIRT_COLORS,
  SKIN_TONES,
  describeAvatar,
  randomAvatar,
} from "../lib/avatar";
import { FaceAvatar } from "./FriendAvatar";

type Part = keyof Avatar;
type Option = { id: string; label: string; ramp?: Record<string, string> };

// Shapes are picked from small face previews, colors from swatches. Swatch keys go light to dark.
const tabs: { part: Part; label: string; options: Option[]; swatch?: string[]; fallback: string }[] = [
  { part: "hair", label: "Cabelo", options: HAIR_STYLES, fallback: "bald" },
  { part: "hairColor", label: "Cor do cabelo", options: HAIR_COLORS, swatch: ["4", "3", "2"], fallback: "black" },
  { part: "skin", label: "Pele", options: SKIN_TONES, swatch: ["k", "s"], fallback: "porcelain" },
  { part: "eyes", label: "Olhos", options: EYE_COLORS, swatch: ["i", "I"], fallback: "dark-brown" },
  { part: "shirt", label: "Camiseta", options: SHIRT_COLORS, swatch: ["1", "3", "2"], fallback: "teal" },
  { part: "age", label: "Idade", options: AGES, fallback: "adult" },
  { part: "beard", label: "Barba", options: BEARDS, fallback: "none" },
  { part: "hat", label: "Chapéu", options: HATS, fallback: "none" },
  { part: "earrings", label: "Brinco", options: EARRINGS, fallback: "none" },
  { part: "glasses", label: "Óculos", options: GLASSES, fallback: "none" },
];

export default function AvatarEditor({
  value,
  onChange,
}: {
  value: Avatar;
  onChange: (avatar: Avatar) => void;
}) {
  const [part, setPart] = useState<Part>("hair");
  const tab = tabs.find((item) => item.part === part)!;
  const current = value[part] || tab.fallback;
  // A face saved by a newer version of the app may use an option this version doesn't know.
  const currentLabel = tab.options.find((option) => option.id === current)?.label ?? "Opção indisponível nesta versão";
  return (
    <div className="avatar-editor">
      <div className="avatar-preview">
        <span className="avatar-frame">
          <FaceAvatar avatar={value} size={96} label={`Prévia do rosto: ${describeAvatar(value)}`} />
        </span>
        <button type="button" className="text-button" onClick={() => onChange(randomAvatar())}>
          Sortear
        </button>
      </div>
      <div className="avatar-controls">
        <div className="avatar-tabs" role="group" aria-label="Parte do rosto para editar">
          {tabs.map((item) => (
            <button
              type="button"
              key={item.part}
              aria-pressed={part === item.part}
              onClick={() => setPart(item.part)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="avatar-current" aria-live="polite">{currentLabel}</p>
        <div
          className={`avatar-options ${tab.swatch ? "swatch-options" : "preview-options"}`}
          role="group"
          aria-label={tab.label}
        >
          {tab.options.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-label={`${tab.label} ${option.label}`}
              aria-pressed={current === option.id}
              onClick={() => onChange({ ...value, [part]: option.id })}
              style={
                tab.swatch && option.ramp
                  ? {
                      background: `linear-gradient(135deg, ${tab.swatch
                        .map((key, i, keys) => `${option.ramp![key]} ${(i * 100) / keys.length}% ${((i + 1) * 100) / keys.length}%`)
                        .join(", ")})`,
                    }
                  : undefined
              }
            >
              {!tab.swatch && <FaceAvatar avatar={{ ...value, [part]: option.id }} size={40} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
