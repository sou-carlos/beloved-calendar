import { PixelAvatar } from "./PixelArt";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Avatar, Person } from "../models";
import { MONTHS, composeBirthDate, daysInMonth, isYearUnknown, splitBirthDate } from "../lib/dates";
import { randomAvatar } from "../lib/avatar";
import AvatarEditor from "./AvatarEditor";
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
  initialDate,
  onSave,
  onClose,
}: {
  person?: Person;
  /** Day and month to prefill when adding a friend from a calendar day. */
  initialDate?: { day: number; month: number };
  onSave: (person: Person) => Promise<void>;
  onClose: () => void;
}) {
  const [emoji, setEmoji] = useState(person?.emoji || "🌷");
  const saved = splitBirthDate(person);
  const [day, setDay] = useState(saved.day || String(initialDate?.day ?? ""));
  const [month, setMonth] = useState(saved.month || String(initialDate?.month ?? ""));
  const [year, setYear] = useState(saved.year);
  // New friends start with a face. Existing friends keep the symbol until a face is built.
  const [look, setLook] = useState<"face" | "symbol">(
    person && !person.avatar ? "symbol" : "face",
  );
  const [avatar, setAvatar] = useState<Avatar>(person?.avatar || randomAvatar);
  const savedYear = person && !isYearUnknown(person) ? Number(person.birthDate.slice(0, 4)) : undefined;
  const typedYear = /^\d{1,4}$/.test(year) ? Number(year) : undefined;
  const dayCount = month ? daysInMonth(Number(month), typedYear) : 31;
  // Keep the chosen day valid when the month changes, e.g. 31 then April. A year that makes
  // February 29 invalid is reported on save instead, so a leap-day birthday is never moved silently.
  const monthDays = month ? daysInMonth(Number(month)) : 31;
  useEffect(() => {
    if (Number(day) > monthDays) setDay(String(monthDays));
  }, [day, monthDays]);
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
    const date = composeBirthDate(
      Number(day),
      Number(month),
      year.trim() ? Number(year) : undefined,
      savedYear,
    );
    if ("error" in date) {
      setError(date.error);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave({
        ...person,
        id: person?.id || crypto.randomUUID(),
        name,
        birthDate: date.birthDate,
        yearUnknown: date.yearUnknown || undefined,
        avatar: look === "face" ? avatar : undefined,
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
        <legend>Como essa pessoa aparece</legend>
        <div className="look-switch" role="group" aria-label="Escolher aparência">
          <button
            type="button"
            aria-pressed={look === "face"}
            onClick={() => setLook("face")}
          >
            Montar rosto
          </button>
          <button
            type="button"
            aria-pressed={look === "symbol"}
            onClick={() => setLook("symbol")}
          >
            Usar símbolo
          </button>
        </div>
        {look === "symbol" && person?.avatar && (
          <p className="look-warning" role="status">
            O rosto montado será removido quando você salvar.
          </p>
        )}
        {look === "face" ? (
          <AvatarEditor value={avatar} onChange={setAvatar} />
        ) : (
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
        )}
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
      <fieldset className="birth-fieldset" aria-describedby="birth-help">
        <legend>Aniversário</legend>
        <div className="birth-fields">
          <div className="birth-field">
            <label htmlFor="birth-day">Dia</label>
            <select
              id="birth-day"
              name="day"
              value={day}
              onChange={(event) => setDay(event.target.value)}
              required
            >
              <option value="" disabled>
                Dia
              </option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((value) => (
                <option key={value} value={value} disabled={value > dayCount}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="birth-field">
            <label htmlFor="birth-month">Mês</label>
            <select
              id="birth-month"
              name="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              required
            >
              <option value="" disabled>
                Mês
              </option>
              {MONTHS.map((label, i) => (
                <option key={label} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="birth-field">
            <label htmlFor="birth-year">Ano</label>
            <input
              id="birth-year"
              name="year"
              inputMode="numeric"
              maxLength={4}
              placeholder="Opcional"
              value={year}
              onChange={(event) => setYear(event.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
        <small id="birth-help">
          O ano é opcional. O calendário usa só o dia e o mês.
        </small>
      </fieldset>
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
