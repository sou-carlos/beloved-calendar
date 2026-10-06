import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Person } from "../models";
import { useAuth } from "./AuthProvider";
import { birthdayLabel } from "../lib/dates";
import { birthdayCardFilename, renderBirthdayCard } from "../lib/birthdayCard";
import Icon from "./Icon";

export default function BirthdayCardEditor({ person, onBack }: { person: Person; onBack: () => void }) {
  const { account } = useAuth();
  const [message, setMessage] = useState("Que seu dia seja cheio de alegria, carinho e boas surpresas. Feliz aniversário!");
  const [sender, setSender] = useState(account?.name || "");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState("");
  const rendered = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError("");
    setNotice("");
    setPreview("");
    rendered.current = null;
    if (!message.trim() || !sender.trim()) return;
    void renderBirthdayCard({ name: person.name, birthDate: person.birthDate, message, sender })
      .then((canvas) => {
        if (cancelled) return;
        rendered.current = canvas;
        setPreview(canvas.toDataURL("image/png"));
        setReady(true);
      })
      .catch((failure: Error) => { if (!cancelled) setError(failure.message); });
    return () => { cancelled = true; };
  }, [person.name, person.birthDate, message, sender]);

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !rendered.current || downloading) return;
    setDownloading(true);
    setNotice("");
    try {
      const blob = await new Promise<Blob>((resolve, reject) => rendered.current!.toBlob((value) => value ? resolve(value) : reject(new Error("Não foi possível baixar a imagem. Tente novamente.")), "image/png"));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = birthdayCardFilename(person.name);
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setNotice("Sua carta foi preparada para download.");
    } catch (failure) {
      setError((failure as Error).message);
    } finally { setDownloading(false); }
  }

  return (
    <section className="birthday-editor" aria-labelledby="birthday-editor-title">
      <button className="text-button" type="button" onClick={onBack} autoFocus>← Voltar à pessoa</button>
      <div>
        <h3 id="birthday-editor-title">Uma carta de aniversário</h3>
        <p className="muted">Para {person.name} · {birthdayLabel(person.birthDate)}</p>
      </div>
      <form className="birthday-card-form" onSubmit={download}>
        <div className="birthday-card-field">
          <label htmlFor="birthday-message">Mensagem</label>
          <textarea id="birthday-message" rows={5} maxLength={600} required value={message} disabled={downloading} onChange={(event) => { setReady(false); setMessage(event.target.value); }} aria-describedby="birthday-message-hint" />
        </div>
        <small id="birthday-message-hint" className="muted birthday-message-hint">{message.length}/600 caracteres · Sua mensagem aparecerá na carta.</small>
        <div className="birthday-card-field">
          <label htmlFor="birthday-sender">Remetente</label>
          <input id="birthday-sender" autoComplete="name" maxLength={80} required placeholder="Seu nome ou assinatura" value={sender} disabled={downloading} onChange={(event) => { setReady(false); setSender(event.target.value); }} />
        </div>
        {error && <p className="error" role="alert">{error}</p>}
        <figure className="birthday-card-preview">
          {preview ? <img src={preview} alt={"Carta de parabéns para " + person.name + ", " + birthdayLabel(person.birthDate) + ". " + message.trim() + " — Com carinho, " + sender.trim()} /> : <p className="muted" role="status">{error || !message.trim() || !sender.trim() ? "Preencha os campos para visualizar sua carta." : "Preparando sua carta…"}</p>}
          <figcaption>Prévia da imagem que você vai baixar</figcaption>
        </figure>
        <button type="submit" className="button" disabled={!ready || downloading}><Icon name="download" />{downloading ? "Preparando…" : "Baixar imagem de parabéns"}</button>
        {notice && <p role="status" className="muted">{notice}</p>}
        <p className="muted">Imagem PNG, pronta para compartilhar. Você também pode criar a carta sem uma conta.</p>
      </form>
    </section>
  );
}
