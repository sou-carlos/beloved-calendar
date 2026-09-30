import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import PixelArt from "./PixelArt";
import { useAuth } from "./AuthProvider";

export default function ProfilePage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    account,
    loading,
    connectionError,
    refresh,
    signIn,
    signUp,
    signOut,
  } = useAuth();
  const register = pathname === "/cadastro";
  const form = register || pathname === "/login";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const data = new FormData(event.currentTarget);
    if (register && !String(data.get("name")).trim()) {
      setError("Informe seu nome.");
      return;
    }
    if (register && data.get("password") !== data.get("confirmation")) {
      setError("As senhas não coincidem. Confira e tente novamente.");
      return;
    }
    setBusy(true);
    try {
      const email = String(data.get("email")).trim();
      const password = String(data.get("password"));
      if (register)
        await signUp(String(data.get("name")).trim(), email, password);
      else await signIn(email, password);
      navigate("/perfil", { replace: true });
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function exitAccount() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await signOut();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (account && form && !loading) return <Navigate to="/perfil" replace />;

  return (
    <>
      <section className="page-heading">
        <div>
          <p className="eyebrow">SEU CANTINHO NO BELOVED</p>
          <h1>
            {register
              ? "Criar sua conta"
              : form
                ? "Entrar na sua conta"
                : "Meu perfil"}
          </h1>
          <p className="muted">
            Seu calendário está sempre aberto, mesmo sem uma conta.
          </p>
        </div>
        <PixelArt kind="heart" size={48} />
      </section>
      <div className="account-layout">
        <section className="panel account-card" aria-labelledby="account-title">
          <span className="account-avatar">
            <PixelArt kind="cat" size={64} />
          </span>
          <p className="eyebrow">
            {account
              ? "BOM TER VOCÊ POR AQUI"
              : form
                ? "BOM TER VOCÊ POR AQUI"
                : "À VONTADE, SEM PRESSA"}
          </p>
          <h2 id="account-title">
            {account
              ? `Olá, ${account.name}!`
              : register
                ? "Um lugar para suas lembranças"
                : form
                  ? "Bem-vindo de volta"
                  : "Olá, visitante!"}
          </h2>
          <p className="muted">
            {account
              ? account.email
              : form
                ? "Aniversários especiais começam com pessoas especiais."
                : "Adicione amigos, lembre dos aniversários e organize presentes sem precisar fazer login."}
          </p>
          {loading ? (
            <p className="account-availability" role="status">
              Verificando sua conta…
            </p>
          ) : account ? (
            <div className="account-actions">
              <p className="muted">
                Seus aniversários e presentes são salvos neste dispositivo e
                sincronizados com sua conta quando há conexão.
              </p>
              {connectionError && (
                <p className="error" role="alert">
                  Não foi possível atualizar sua sessão. {connectionError}
                </p>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <Link className="button" to="/">
                Abrir meu calendário
              </Link>
              <button
                className="button secondary"
                disabled={busy}
                onClick={exitAccount}
              >
                {busy ? "Saindo…" : "Sair da conta"}
              </button>
              <small className="muted">
                Ao sair, você volta ao calendário de visitante. Alterações
                pendentes ficam guardadas para esta conta.
              </small>
            </div>
          ) : form ? (
            <>
              <form
                className="account-form"
                onSubmit={submit}
                onChange={() => setError("")}
              >
                {register && (
                  <label htmlFor="account-name">
                    Nome
                    <input
                      id="account-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Como podemos chamar você?"
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={busy}
                    />
                  </label>
                )}
                <label htmlFor="account-email">
                  E-mail
                  <input
                    id="account-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="voce@exemplo.com"
                    required
                    maxLength={254}
                    disabled={busy}
                  />
                </label>
                <label htmlFor="account-password">
                  Senha
                  <input
                    id="account-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                    required
                    minLength={register ? 8 : undefined}
                    maxLength={128}
                    disabled={busy}
                    aria-describedby={register ? "password-hint" : undefined}
                  />
                </label>
                {register && (
                  <small id="password-hint" className="muted">
                    Use pelo menos 8 caracteres.
                  </small>
                )}
                {register && (
                  <label htmlFor="account-confirmation">
                    Confirmar senha
                    <input
                      id="account-confirmation"
                      name="confirmation"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      maxLength={128}
                      disabled={busy}
                    />
                  </label>
                )}
                <label className="password-toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) => setShowPassword(event.target.checked)}
                  />
                  Mostrar {register ? "senhas" : "senha"}
                </label>
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                <button className="button" type="submit" disabled={busy}>
                  {busy
                    ? register
                      ? "Criando conta…"
                      : "Entrando…"
                    : register
                      ? "Criar conta"
                      : "Entrar"}
                </button>
              </form>
              <p className="account-switch">
                {register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
                <Link
                  className="text-button"
                  to={register ? "/login" : "/cadastro"}
                >
                  {register ? "Entrar" : "Criar conta"}
                </Link>
              </p>
              <Link className="text-button" to="/perfil">
                ← Voltar ao perfil
              </Link>
            </>
          ) : (
            <div className="account-actions">
              <Link className="button" to="/login">
                Entrar na minha conta
              </Link>
              <Link className="button secondary" to="/cadastro">
                Criar uma conta
              </Link>
              {connectionError && (
                <>
                  <p className="error" role="alert">
                    {connectionError}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => void refresh()}
                  >
                    Tentar conectar novamente
                  </button>
                </>
              )}
            </div>
          )}
          <Link className="text-button account-guest" to="/">
            {account ? "Voltar ao calendário →" : "Continuar sem entrar →"}
          </Link>
        </section>
        <aside className="panel account-note">
          <PixelArt kind="book" size={48} />
          <h2>Seu calendário, no seu ritmo</h2>
          <p>
            {account
              ? "Seus dados acompanham você, mesmo offline."
              : "Você já pode aproveitar o Beloved como visitante."}
          </p>
          <ul>
            <li>Guarde as datas de quem você gosta.</li>
            <li>Anote preferências e ideias de presentes.</li>
            <li>
              Consulte seu calendário mesmo offline após a primeira visita.
            </li>
          </ul>
          <p className="muted">
            {account
              ? "Os dados desta conta ficam separados dos dados de visitante e de outras contas. Use a sincronização acima para acompanhar os envios."
              : "Como visitante, seus dados ficam neste navegador. Ao entrar, você pode escolher adicioná-los à conta. Use “Exportar meus dados” para guardar uma cópia."}
          </p>
          <Link className="text-button" to="/">
            Ir para o calendário →
          </Link>
        </aside>
      </div>
    </>
  );
}
