import { PixelAvatar } from "./PixelArt";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Person } from "../models";
import { birthdayLabel, countdown } from "../lib/dates";
import Icon from "./Icon";
export default function FriendDetail({
  person,
  onSave,
  onEdit,
  onDelete,
}: {
  person: Person;
  onSave: (p: Person) => Promise<void>;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [confirmDelete, setConfirmDelete] = useState(false);
  const [purchase, setPurchase] = useState<{
    id: string;
    value: boolean;
  } | null>(null);
  async function update(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError("Não foi possível salvar a alteração. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  async function addGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form),
      title = String(data.get("title")).trim(),
      url = String(data.get("url")).trim();
    if (!title) {
      setError("Digite uma ideia de presente.");
      return;
    }
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Use um link que comece com https:// ou http://.");
      return;
    }
    await update(async () => {
      await onSave({
        ...person,
        gifts: [
          ...person.gifts,
          {
            id: crypto.randomUUID(),
            title,
            url,
            notes: String(data.get("notes")).trim(),
            purchased: false,
          },
        ],
      });
      form.reset();
    });
  }
  return (
    <div className="friend-detail">
      <div className="profile-top">
        <span className="avatar large">
          <PixelAvatar emoji={person.emoji} size={40} />
        </span>
        <div>
          <h3>{person.name}</h3>
          <p>{birthdayLabel(person.birthDate)}</p>
          <span className="badge">{countdown(person.birthDate)}</span>
        </div>
        <button className="text-button" disabled={busy} onClick={onEdit}>
          Editar
        </button>
      </div>
      <div className="preferences">
        <section>
          <h4>♡ Coisas que ama</h4>
          <p>{person.likes || "Nenhuma preferência registrada ainda."}</p>
        </section>
        <section>
          <h4>Coisas que não gosta</h4>
          <p>{person.dislikes || "Nenhuma preferência registrada ainda."}</p>
        </section>
      </div>
      {person.notes && (
        <section className="notes">
          <h4>Para lembrar</h4>
          <p>{person.notes}</p>
        </section>
      )}
      <div className="section-heading">
        <h3>Ideias de presentes</h3>
        <span className="count">{person.gifts.length}</span>
      </div>
      <p className="muted">Marque o que já comprou para se organizar.</p>
      <div className="gift-list">
        {person.gifts.map((gift) => (
          <div
            className={`gift-row ${gift.purchased ? "purchased" : ""}`}
            key={gift.id}
          >
            <input
              type="checkbox"
              checked={
                purchase?.id === gift.id ? purchase.value : !!gift.purchased
              }
              disabled={busy}
              aria-label={`Marcar ${gift.title} como ${gift.purchased ? "pendente" : "comprado"}`}
              onChange={(event) => {
                const value = event.target.checked;
                setPurchase({ id: gift.id, value });
                void update(async () => {
                  try {
                    await onSave({
                      ...person,
                      gifts: person.gifts.map((g) =>
                        g.id === gift.id ? { ...g, purchased: value } : g,
                      ),
                    });
                  } finally {
                    setPurchase(null);
                  }
                });
              }}
            />
            <div>
              <strong>{gift.title}</strong>
              {gift.notes && <p>{gift.notes}</p>}
              {gift.url && /^https?:\/\//i.test(gift.url) && (
                <a href={gift.url} target="_blank" rel="noopener noreferrer">
                  Ver na loja ↗
                </a>
              )}
            </div>
            <button
              className="icon-button"
              disabled={busy}
              aria-label={`Remover ${gift.title}`}
              onClick={() =>
                update(() =>
                  onSave({
                    ...person,
                    gifts: person.gifts.filter((g) => g.id !== gift.id),
                  }),
                )
              }
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
        {!person.gifts.length && (
          <p className="gift-empty">
            Nenhum presente adicionado. Registre sua primeira ideia abaixo.
          </p>
        )}
      </div>
      <form className="gift-form" onSubmit={addGift}>
        <label>
          Nova ideia
          <input
            name="title"
            placeholder="Ex.: um livro que ele comentou"
            maxLength={160}
            required
          />
        </label>
        <label>
          Link da loja <span>(opcional)</span>
          <input name="url" type="url" placeholder="https://" />
        </label>
        <label>
          Detalhes <span>(opcional)</span>
          <input
            name="notes"
            placeholder="Cor, tamanho, preço…"
            maxLength={1000}
          />
        </label>
        <button className="button secondary" disabled={busy}>
          <Icon name="plus" size={17} />
          Adicionar ideia
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="delete-area">
        {confirmDelete ? (
          <>
            <p>
              Excluir {person.name} e suas ideias de presentes? Essa ação não
              pode ser desfeita.
            </p>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => update(onDelete)}
            >
              Sim, excluir
            </button>
            <button
              className="text-button"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            className="text-button danger-text"
            onClick={() => setConfirmDelete(true)}
          >
            Excluir amigo
          </button>
        )}
      </div>
    </div>
  );
}
