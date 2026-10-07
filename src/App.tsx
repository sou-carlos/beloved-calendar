import PixelArt from "./components/PixelArt";
import FriendAvatar from "./components/FriendAvatar";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { Person } from "./models";
import { useCalendar } from "./components/CalendarProvider";
import SyncPanel from "./components/SyncPanel";
import { birthdayLabel, countdown, daysUntil } from "./lib/dates";
import Icon from "./components/Icon";
import type { IconName } from "./components/Icon";
import BirthdayCalendar from "./components/BirthdayCalendar";
import Modal from "./components/Modal";
import FriendForm from "./components/FriendForm";
import FriendDetail from "./components/FriendDetail";
import ProfilePage from "./components/ProfilePage";
const navigation: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Calendário", icon: "calendar" },
  { to: "/people", label: "Amigos", icon: "people" },
  { to: "/gifts", label: "Presentes", icon: "gift" },
  { to: "/perfil", label: "Perfil", icon: "people" },
];
export default function App() {
  const {
    people,
    loading,
    error,
    save: savePerson,
    remove: removePerson,
  } = useCalendar();
  const [selectedId, setSelectedId] = useState<string | null>(null),
    [editing, setEditing] = useState<Person | "new" | null>(null),
    [draftDate, setDraftDate] = useState<{ day: number; month: number }>();
  const [search, setSearch] = useState(""),
    [giftFilter, setGiftFilter] = useState("pending"),
    [notice, setNotice] = useState("");
  const location = useLocation(),
    page = ["/perfil", "/login", "/cadastro"].includes(location.pathname)
      ? "profile"
      : location.pathname === "/people"
        ? "people"
        : location.pathname === "/gifts"
          ? "gifts"
          : "calendar";
  useEffect(() => {
    setSearch("");
  }, [page]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const sorted = [...people].sort(
    (a, b) =>
      daysUntil(a.birthDate) - daysUntil(b.birthDate) ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
  const selected = people.find((p) => p.id === selectedId);
  const upcoming = sorted.filter((p) => daysUntil(p.birthDate) <= 30);
  const gifts = sorted.flatMap((person) =>
    person.gifts.map((gift) => ({ person, gift })),
  );
  const pending = gifts.filter(({ gift }) => !gift.purchased);
  async function save(person: Person) {
    await savePerson(person, editing && editing !== "new" ? editing : selected);
    setNotice("Alterações salvas.");
  }
  async function remove() {
    if (!selected) return;
    await removePerson(selected.id, selected);
    setSelectedId(null);
    setNotice("Amigo excluído.");
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({ version: 1, people }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beloved-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Cópia dos seus dados exportada.");
  }
  function add(date?: { day: number; month: number }) {
    setSelectedId(null);
    setDraftDate(date);
    setEditing("new");
  }
  function personRow(person: Person) {
    return (
      <button
        className="person-row"
        key={person.id}
        onClick={() => setSelectedId(person.id)}
      >
        <span className="avatar">
          <FriendAvatar person={person} />
        </span>
        <span className="person-info">
          <strong>{person.name}</strong>
          <small>{birthdayLabel(person.birthDate)}</small>
        </span>
        <span
          className={`badge ${daysUntil(person.birthDate) === 0 ? "birthday-now" : ""}`}
        >
          {countdown(person.birthDate)}
        </span>
        <Icon name="chevron" size={16} />
      </button>
    );
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Beloved, início">
          <span className="brand-mark">
            <PixelArt kind="heart" size={32} />
          </span>
          <span>
            Beloved
            <small>aniversários & presentes</small>
          </span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={
                item.to === "/perfil" && page === "profile"
                  ? "active"
                  : undefined
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="header-note">
          <PixelArt kind="star" size={20} /> Meu calendário pessoal
        </span>
      </header>
      <main id="main">
        <SyncPanel />
        {page === "profile" ? (
          <ProfilePage key={location.pathname} />
        ) : (
          <>
            <section className="page-heading">
              <div>
                <p className="eyebrow">SEU QUADRO DE ANIVERSÁRIOS</p>
                <h1>
                  {page === "calendar"
                    ? "Calendário de aniversários"
                    : page === "people"
                      ? "Seus amigos"
                      : "Lista de presentes"}
                </h1>
                <p className="muted">
                  {page === "calendar"
                    ? "Datas importantes e ideias para acertar no presente."
                    : page === "people"
                      ? "Aniversários, preferências e anotações em um só lugar."
                      : "Organize suas ideias e acompanhe o que já comprou."}
                </p>
              </div>
              <button
                className="button add-friend"
                onClick={() => add()}
                disabled={loading || !!error}
              >
                <Icon name="plus" />
                Adicionar amigo
              </button>
            </section>
            {error && (
              <div role="alert" className="error">
                {error}
              </div>
            )}
            {loading ? (
              <div className="panel empty" role="status">
                Preparando seu calendário…
              </div>
            ) : (
              !error && (
                <>
                  {page === "calendar" && (
                    <>
                      <section className="quest-note">
                        <PixelArt kind="cake" size={40} />
                        <div>
                          <strong>
                            {sorted.length
                              ? `Próximo aniversário: ${sorted[0].name}`
                              : "Seu calendário começa aqui"}
                          </strong>
                          <p>
                            {sorted.length
                              ? `${birthdayLabel(sorted[0].birthDate)} · ${countdown(sorted[0].birthDate)}`
                              : "Adicione seus amigos para ver as datas no quadro."}
                          </p>
                        </div>
                        <PixelArt kind="star" size={24} />
                      </section>
                      <div className="stats">
                        <div>
                          <span className="stat-icon peach">
                            <PixelArt kind="cat" size={32} />
                          </span>
                          <span>
                            <strong>{people.length}</strong>
                            <small>amigos cadastrados</small>
                          </span>
                        </div>
                        <div>
                          <span className="stat-icon yellow">
                            <PixelArt kind="calendar" size={32} />
                          </span>
                          <span>
                            <strong>{upcoming.length}</strong>
                            <small>aniversários em 30 dias</small>
                          </span>
                        </div>
                        <div>
                          <span className="stat-icon green">
                            <PixelArt kind="gift" size={32} />
                          </span>
                          <span>
                            <strong>{pending.length}</strong>
                            <small>ideias para presentear</small>
                          </span>
                        </div>
                      </div>
                      <div className="calendar-layout">
                        <BirthdayCalendar
                          people={people}
                          onPerson={setSelectedId}
                          onAdd={add}
                        />
                        <aside>
                          <section className="panel upcoming">
                            <div className="section-heading">
                              <h2>Próximos aniversários</h2>
                              <span className="count">{sorted.length}</span>
                            </div>
                            <p className="muted">
                              Aniversários em ordem de chegada.
                            </p>
                            {sorted.length ? (
                              sorted.slice(0, 4).map(personRow)
                            ) : (
                              <div className="empty small-empty">
                                <span className="empty-symbol">
                                  <PixelArt kind="book" size={56} />
                                </span>
                                <h3>
                                  Nenhum aniversário
                                  <br />
                                  cadastrado ainda.
                                </h3>
                                <p>
                                  Adicione alguém especial e veja o próximo
                                  aniversário aqui.
                                </p>
                                <button className="text-button" onClick={() => add()}>
                                  Adicionar meu primeiro amigo →
                                </button>
                              </div>
                            )}
                            {sorted.length > 0 && (
                              <NavLink
                                to="/people"
                                className="text-button all-friends"
                              >
                                Ver todos os amigos{" "}
                                <Icon name="chevron" size={15} />
                              </NavLink>
                            )}
                          </section>
                          <section className="little-note">
                            <PixelArt kind="book" size={32} />
                            <div>
                              <h3>Dica rápida</h3>
                              <p>
                                Anote gostos, tamanhos e ideias no perfil de
                                cada amigo. Fica mais fácil escolher o presente
                                depois.
                              </p>
                            </div>
                          </section>
                        </aside>
                      </div>
                    </>
                  )}
                  {page === "people" && (
                    <>
                      <div className="list-toolbar">
                        <h2>
                          Meus amigos{" "}
                          <span className="count">{people.length}</span>
                        </h2>
                        <label className="search">
                          <Icon name="search" />
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar um amigo"
                            aria-label="Buscar um amigo"
                          />
                        </label>
                      </div>
                      <div className="friend-grid">
                        {sorted
                          .filter((p) =>
                            p.name
                              .toLocaleLowerCase("pt-BR")
                              .includes(search.toLocaleLowerCase("pt-BR")),
                          )
                          .map((p) => (
                            <button
                              className="panel friend-card"
                              key={p.id}
                              onClick={() => setSelectedId(p.id)}
                            >
                              <div className="friend-card-top">
                                <span className="avatar large">
                                  <FriendAvatar person={p} />
                                </span>
                                <span className="badge">
                                  {countdown(p.birthDate)}
                                </span>
                              </div>
                              <h2>{p.name}</h2>
                              <p className="muted">
                                {birthdayLabel(p.birthDate)}
                              </p>
                              <div className="friend-likes">
                                <Icon name="heart" size={16} />
                                <span>
                                  {p.likes || "Sem preferências registradas"}
                                </span>
                              </div>
                              <div className="friend-card-bottom">
                                <span>
                                  <Icon name="gift" size={16} />
                                  {p.gifts.length} ideias de presentes
                                </span>
                                <Icon name="chevron" size={18} />
                              </div>
                            </button>
                          ))}
                      </div>
                      {!sorted.some((p) =>
                        p.name
                          .toLocaleLowerCase("pt-BR")
                          .includes(search.toLocaleLowerCase("pt-BR")),
                      ) && (
                        <div className="panel empty">
                          <span className="empty-symbol">
                            <PixelArt kind="book" size={56} />
                          </span>
                          <h2>
                            {search
                              ? "Nenhum amigo encontrado"
                              : "Nenhum amigo cadastrado"}
                          </h2>
                          <p>
                            {search
                              ? "Tente buscar por outro nome."
                              : "Adicione um amigo para começar a preencher seu calendário."}
                          </p>
                          {!search && (
                            <button className="button" onClick={() => add()}>
                              Adicionar meu primeiro amigo
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {page === "gifts" && (
                    <>
                      <div className="list-toolbar">
                        <h2>
                          Inventário de presentes{" "}
                          <span className="count">{gifts.length}</span>
                        </h2>
                        <div
                          className="filter-tabs"
                          aria-label="Filtrar presentes"
                        >
                          {[
                            ["pending", "Pendentes"],
                            ["purchased", "Comprados"],
                            ["all", "Todos"],
                          ].map(([value, label]) => (
                            <button
                              aria-pressed={giftFilter === value}
                              key={value}
                              onClick={() => setGiftFilter(value)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="friend-grid">
                        {gifts
                          .filter(
                            ({ gift }) =>
                              giftFilter === "all" ||
                              !!gift.purchased === (giftFilter === "purchased"),
                          )
                          .map(({ person, gift }) => (
                            <button
                              className="panel gift-card"
                              key={`${person.id}-${gift.id}`}
                              onClick={() => setSelectedId(person.id)}
                            >
                              <span className="gift-card-icon">
                                <PixelArt kind="gift" size={40} />
                              </span>
                              <span className="badge">
                                {gift.purchased
                                  ? "✓ Comprado"
                                  : "Uma boa ideia"}
                              </span>
                              <h2>{gift.title}</h2>
                              {gift.notes && (
                                <p className="muted">{gift.notes}</p>
                              )}
                              <div className="gift-recipient">
                                <FriendAvatar person={person} />{" "}
                                <span>Para {person.name}</span>
                                <small>{countdown(person.birthDate)}</small>
                              </div>
                            </button>
                          ))}
                      </div>
                      {!gifts.some(
                        ({ gift }) =>
                          giftFilter === "all" ||
                          !!gift.purchased === (giftFilter === "purchased"),
                      ) && (
                        <div className="panel empty">
                          <span className="empty-symbol">
                            <PixelArt kind="gift" size={56} />
                          </span>
                          <h2>
                            {giftFilter === "purchased"
                              ? "Nenhum presente comprado"
                              : "Nenhuma ideia por aqui ainda"}
                          </h2>
                          <p>
                            Abra o perfil de um amigo para adicionar ideias e
                            marcar os presentes comprados.
                          </p>
                          <NavLink className="button" to="/people">
                            Ver meus amigos
                          </NavLink>
                        </div>
                      )}
                    </>
                  )}
                  <footer className="footer">
                    <span>
                      <Icon name="heart" size={14} /> Beloved · Aniversários e
                      presentes
                    </span>
                    <button className="text-button" onClick={exportData}>
                      <Icon name="download" size={15} />
                      Exportar meus dados
                    </button>
                    <small>
                      Salvo neste dispositivo · disponível offline após a
                      primeira visita
                    </small>
                  </footer>
                </>
              )
            )}
          </>
        )}
      </main>
      <nav className="mobile-nav" aria-label="Navegação principal móvel">
        {navigation.map((item) => (
          <NavLink
            to={item.to}
            end
            key={item.to}
            className={
              item.to === "/perfil" && page === "profile" ? "active" : undefined
            }
          >
            <Icon name={item.icon} size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          ✓ {notice}
        </div>
      )}
      {editing && (
        <Modal
          title={editing === "new" ? "Adicionar amigo" : "Editar amigo"}
          onClose={() => setEditing(null)}
        >
          <FriendForm
            person={editing === "new" ? undefined : editing}
            initialDate={editing === "new" ? draftDate : undefined}
            onSave={save}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
      {selected && !editing && (
        <Modal title="Perfil do amigo" onClose={() => setSelectedId(null)}>
          <FriendDetail
            person={selected}
            onSave={save}
            onEdit={() => {
              setEditing(selected);
            }}
            onDelete={remove}
          />
        </Modal>
      )}
    </div>
  );
}
