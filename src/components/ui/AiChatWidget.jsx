import { useMemo, useRef, useState } from "react";
import { sendChatMessage } from "../../api/chatApi.js";
import { backendUrl } from "../../services/appConfig.js";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Ciao sono JOLBOT! Posso consigliarti birre dal catalogo JOLBEER. Scrivimi gusto, stile o budget.",
};

function createMessage(role, content) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const listRef = useRef(null);

  const canSend = useMemo(() => {
    return input.trim().length > 0 && input.trim().length <= 500 && !loading;
  }, [input, loading]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const message = input.trim();

    if (!message || message.length > 500 || loading) return;

    const userMessage = createMessage("user", message);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const response = await sendChatMessage({ backendUrl, message });
      const replyText = String(response?.reply || "").trim();
      const assistantMessage = createMessage(
        "assistant",
        replyText || "Non sono riuscita a generare una risposta utile."
      );
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const status = error?.response?.status;
      let fallback = "Errore chat IA. Riprova tra poco.";

      if (status === 429) {
        fallback = "Hai raggiunto il limite richieste. Attendi un minuto e riprova.";
      } else if (status === 400) {
        fallback = error?.response?.data?.error || "Messaggio non valido.";
      }

      setMessages((prev) => [...prev, createMessage("assistant", fallback)]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  return (
    <div className="ai-chat-widget" aria-live="polite">
      {!open && (
        <button
          type="button"
          className="ai-chat-trigger"
          onClick={() => setOpen(true)}
          aria-label="Apri chat IA catalogo"
        >
          Chat IA
        </button>
      )}

      {open && (
        <section className="ai-chat-panel shadow" role="dialog" aria-label="Chat IA catalogo">
          <header className="ai-chat-header">
            <div>
              <div className="ai-chat-title">Assistente Catalogo</div>
              <div className="ai-chat-subtitle">Risposte basate sui prodotti disponibili</div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Chiudi chat IA"
              onClick={() => setOpen(false)}
            />
          </header>

          <div className="ai-chat-messages" ref={listRef}>
            {messages.map((msg) => (
              <div
                key={msg.id || `welcome-${msg.role}`}
                className={`ai-chat-bubble ${msg.role === "user" ? "is-user" : "is-assistant"}`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="ai-chat-bubble is-assistant ai-chat-loader">IA sta scrivendo...</div>
            )}
          </div>

          <form className="ai-chat-form" onSubmit={handleSubmit}>
            <textarea
              className="form-control"
              rows={2}
              maxLength={500}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Es: consigliami una IPA sotto € 8"
            />
            <div className="d-flex justify-content-between align-items-center gap-2 mt-2">
              <small className="text-muted">{input.trim().length}/500</small>
              <button type="submit" className="btn btn-brand btn-sm" disabled={!canSend}>
                Invia
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
