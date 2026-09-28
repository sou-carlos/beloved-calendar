import { PixelAvatar } from "./PixelArt";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Person } from "../models";
const symbolLabels: Record<string, string> = {
  "🌷": "flor",
  "🌻": "estrela",
  "🍄": "cogumelo",
  "🌿": "folha",
  "🐱": "gato",
  "🦊": "raposa",
  "🍓": "bolo",
  "🦋": "presente",
};
const emojis = ["🌷", "🌻", "🍄", "🌿", "🐱", "🦊", "🍓", "🦋"];
export default function FriendForm({
  person,
  onSave,
  onClose,
}: {
  person?: Person;
  onSave: (person: Person) => Promise<void>;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState(person?.emoji || "🌷");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name) {
      setError("Preencha o nome do seu amigo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...person,
        id: person?.id || crypto.randomUUID(),
        name,
        birthDate: String(data.get("birthDate")),
        emoji,
        likes: String(data.get("likes")).trim(),
        dislikes: String(data.get("dislikes")).trim(),
        notes: String(data.get("notes")).trim(),
        gifts: person?.gifts || [],
      });
      onClose();
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
      setBusy(false);
    }
  }
  return (
    <form className="friend-form" onSubmit={submit}>
      <p className="muted">
        Preencha o aniversário e as preferências do seu amigo.
      </p>
      <fieldset>
        <legend>Um símbolo para essa pessoa</legend>
        <div className="emoji-options">
          {emojis.map((item) => (
            <button
              type="button"
              key={item}
              aria-label={`Escolher ${symbolLabels[item]}`}
              aria-pressed={emoji === item}
              onClick={() => setEmoji(item)}
            >
              <PixelAvatar emoji={item} size={28} />
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        Nome
        <input
          name="name"
          defaultValue={person?.name}
          placeholder="Como seu amigo se chama?"
          maxLength={80}
          required
          autoFocus
        />
      </label>
      <label>
        Aniversário
        <input
          name="birthDate"
          aria-label="Aniversário"
          aria-describedby="birth-help"
          type="date"
          defaultValue={person?.birthDate}
          max="9999-12-31"
          required
        />
        <small id="birth-help">
          Não sabe o ano? Use 2000. O calendário considera o dia e o mês.
        </small>
      </label>
      <label>
        ♡ Coisas que ama
        <textarea
          name="likes"
          defaultValue={person?.likes}
          placeholder="Café, livros de fantasia, girassóis…"
          maxLength={2000}
        />
      </label>
      <label>
        Coisas que não gosta
        <textarea
          name="dislikes"
          defaultValue={person?.dislikes}
          placeholder="Chocolate branco, perfumes doces…"
          maxLength={2000}
        />
      </label>
      <label>
        Anotações
        <textarea
          name="notes"
          defaultValue={person?.notes}
          placeholder="Tamanho da camiseta, uma conversa para lembrar…"
          maxLength={4000}
        />
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="button secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="button" disabled={busy}>
          {busy ? "Salvando…" : "Salvar amigo"}
        </button>
      </div>
    </form>
  );
}
