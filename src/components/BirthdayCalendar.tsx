import { PixelAvatar } from "./PixelArt";
import { useState } from "react";
import type { Person } from "../models";
import { birthdayInYear } from "../lib/dates";
import Icon from "./Icon";
export default function BirthdayCalendar({
  people,
  onPerson,
  onAdd,
}: {
  people: Person[];
  onPerson: (id: string) => void;
  onAdd: () => void;
}) {
  const today = new Date();
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const year = view.getFullYear(),
    month = view.getMonth();
  const count = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay();
  const birthdays = people.filter(
    (p) => birthdayInYear(p.birthDate, year).getMonth() === month,
  );
  const dayPeople = birthdays.filter(
    (p) => birthdayInYear(p.birthDate, year).getDate() === selected,
  );
  function move(delta: number) {
    setView(new Date(year, month + delta, 1));
    setSelected(null);
  }
  return (
    <section className="panel calendar-panel">
      <div className="calendar-toolbar">
        <div>
          <span className="eyebrow">CALENDÁRIO</span>
          <h2>
            {view.toLocaleDateString("pt-BR", { month: "long" })}{" "}
            <span>{year}</span>
          </h2>
        </div>
        <div className="calendar-controls">
          <button
            className="today-button"
            onClick={() => {
              setView(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelected(today.getDate());
            }}
          >
            Hoje
          </button>
          <button
            className="icon-button previous"
            aria-label="Mês anterior"
            onClick={() => move(-1)}
          >
            <Icon name="chevron" />
          </button>
          <button
            className="icon-button"
            aria-label="Próximo mês"
            onClick={() => move(1)}
          >
            <Icon name="chevron" />
          </button>
        </div>
      </div>
      <div className="calendar-grid weekdays">
        {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid days">
        {Array.from({ length: Math.ceil((count + offset) / 7) * 7 }, (_, i) => {
          const day = i - offset + 1;
          if (day < 1 || day > count)
            return <div className="day outside" key={i} />;
          const friends = birthdays.filter(
            (p) => birthdayInYear(p.birthDate, year).getDate() === day,
          );
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          return (
            <button
              key={i}
              className={`day ${friends.length ? "has-birthday" : ""} ${isToday ? "is-today" : ""} ${selected === day ? "selected" : ""}`}
              onClick={() => setSelected(day)}
              aria-pressed={selected === day}
              aria-label={`${day} de ${view.toLocaleDateString("pt-BR", { month: "long" })}${friends.length ? `: aniversário de ${friends.map((p) => p.name).join(", ")}` : ""}`}
              aria-current={isToday ? "date" : undefined}
            >
              <span className="day-number">{day}</span>
              {friends.length > 0 && (
                <>
                  <span className="day-emoji">
                    <PixelAvatar emoji={friends[0].emoji} size={24} />
                    {friends.length > 1 && <sup>+{friends.length - 1}</sup>}
                  </span>
                  <span className="day-name">{friends[0].name}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      <div className="calendar-footer">
        <span>
          <i /> Aniversário
        </span>
        <span>
          {birthdays.length}{" "}
          {birthdays.length === 1
            ? "aniversário neste mês"
            : "aniversários neste mês"}
        </span>
      </div>
      {selected !== null && (
        <div className="selected-day" aria-live="polite">
          <strong>
            {selected} de {view.toLocaleDateString("pt-BR", { month: "long" })}
          </strong>
          {dayPeople.length ? (
            dayPeople.map((p) => (
              <button
                className="day-person"
                key={p.id}
                onClick={() => onPerson(p.id)}
              >
                <PixelAvatar emoji={p.emoji} size={24} /> {p.name}
                <Icon name="chevron" size={16} />
              </button>
            ))
          ) : (
            <p className="muted">
              Nenhum aniversário por aqui.{" "}
              <button className="text-button" onClick={onAdd}>
                Adicionar amigo
              </button>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
