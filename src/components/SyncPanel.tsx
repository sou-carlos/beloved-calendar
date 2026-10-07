import { useState } from "react";
import type { Person } from "../models";
import { useCalendar } from "./CalendarProvider";
import { describeAvatar } from "../lib/avatar";
import { isYearUnknown } from "../lib/dates";

function Version({ person }: { person: Person | null }) {
  if (!person) return <p>Registro excluído nesta versão.</p>;
  return (
    <div className="sync-version">
      <strong>{person.name}</strong>
      <p>
        Aniversário: {isYearUnknown(person) ? person.birthDate.slice(5) + " (ano não informado)" : person.birthDate}
      </p>
      <p>Gosta de: {person.likes || "—"}</p>
      <p>Não gosta de: {person.dislikes || "—"}</p>
      <p>Anotações: {person.notes || "—"}</p>
      <p>
        {person.avatar ? `Rosto: ${describeAvatar(person.avatar)}` : `Símbolo: ${person.emoji || "—"}`}
      </p>
      {person.image && <p>Imagem: {person.image}</p>}
      <strong>Presentes ({person.gifts?.length || 0})</strong>
      <ul>
        {person.gifts?.map((gift) => (
          <li key={gift.id}>
            {gift.title} · {gift.purchased ? "Comprado" : "Pendente"}
            {gift.notes && <p>{gift.notes}</p>}
            {gift.url && <p>{gift.url}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SyncPanel() {
  const calendar = useCalendar();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  if (!calendar.accountId) return null;
  async function action(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
    } catch {
      setError(
        "Não foi possível salvar a alteração neste dispositivo. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  const status = !calendar.online
    ? `Offline · ${calendar.pending} alteração(ões) aguardando conexão`
    : calendar.syncing
      ? "Sincronizando…"
      : calendar.syncError
        ? "Sincronização pausada"
        : calendar.problems.length
          ? `${calendar.problems.length} registro(s) precisam de correção`
          : calendar.conflicts.length
            ? `${calendar.conflicts.length} conflito(s) para revisar`
            : calendar.pending
              ? `${calendar.pending} alteração(ões) aguardando sincronização`
              : calendar.lastSync
                ? "Dados sincronizados com sua conta"
                : "Preparando sincronização";
  return (
    <section className="panel sync-panel" aria-label="Sincronização da conta">
      <div className="sync-heading">
        <p role="status">{status}</p>
        <button
          className="text-button"
          disabled={calendar.syncing || !calendar.online}
          onClick={() => void calendar.syncNow()}
        >
          Sincronizar agora
        </button>
      </div>
      {calendar.lastSync && (
        <small className="muted">
          Última sincronização:{" "}
          {new Date(calendar.lastSync).toLocaleString("pt-BR")}
        </small>
      )}
      {calendar.syncError && (
        <p className="error" role="alert">
          {calendar.syncError}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {calendar.problems.map((row) => (
        <p key={row.id} className="error" role="alert">
          {row.person?.name || "Amigo"}: {row.problem} Abra o amigo e corrija os
          campos para tentar novamente.
        </p>
      ))}
      {calendar.guestCount > 0 && !dismissed && (
        <div className="sync-import">
          <h2>Trazer seus amigos para esta conta?</h2>
          <p>
            Você tem {calendar.guestCount} amigo(s) de visitante neste
            dispositivo. Adicione uma cópia à sua conta para acessar em outros
            dispositivos. Os dados de visitante serão mantidos.
          </p>
          <div className="sync-actions">
            <button
              className="button"
              disabled={busy || calendar.loading}
              onClick={() =>
                void action(async () => {
                  const count = await calendar.importGuests();
                  setMessage(
                    `${count} amigo(s) adicionado(s) à fila de sincronização.`,
                  );
                })
              }
            >
              {busy ? "Importando…" : "Adicionar à minha conta"}
            </button>
            <button className="text-button" onClick={() => setDismissed(true)}>
              Agora não
            </button>
          </div>
        </div>
      )}
      {calendar.conflicts.map((row) => (
        <details className="sync-conflict" key={row.id}>
          <summary>
            Revisar conflito:{" "}
            {row.person?.name || row.conflict?.person?.name || "Amigo excluído"}
          </summary>
          <p>
            Este amigo foi alterado em mais de um lugar. Compare as versões
            antes de escolher. Nenhuma será substituída até sua decisão.
          </p>
          <div className="sync-versions">
            <section>
              <h3>Neste dispositivo</h3>
              <Version person={row.person} />
            </section>
            <section>
              <h3>Na conta</h3>
              <Version person={row.conflict!.person} />
            </section>
          </div>
          <div className="sync-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                void action(() => calendar.resolve(row.id, "local"))
              }
            >
              Usar versão deste dispositivo
            </button>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() =>
                void action(() => calendar.resolve(row.id, "remote"))
              }
            >
              Usar versão da conta
            </button>
            {row.person && (
              <button
                className="text-button"
                disabled={busy}
                onClick={() =>
                  void action(() => calendar.resolve(row.id, "both"))
                }
              >
                Manter conta e criar cópia local
              </button>
            )}
          </div>
        </details>
      ))}
    </section>
  );
}
