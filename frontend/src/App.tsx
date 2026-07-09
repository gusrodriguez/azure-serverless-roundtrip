import { useState, useEffect, FormEvent } from "react";
import "./App.css";

interface Item {
  id: string;
  title: string;
  payload: string | null;
  submittedAt: string;
  processedAt: string | null;
  status: string;
}

interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

const API_BASE = "/api";

function App() {
  const [title, setTitle] = useState("");
  const [payload, setPayload] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_BASE}/items`);
        if (res.ok) {
          const data: { items: Item[] } = await res.json();
          setItems(data.items);
        }
      } catch {
        // Silently retry on next poll
      }
    };

    fetchItems();
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    try {
      const res = await fetch(`${API_BASE}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, payload: payload || undefined }),
      });

      if (res.status === 202) {
        const data: { correlationId: string } = await res.json();
        setSubmitStatus({
          type: "success",
          message: `Submitted. Correlation ID: ${data.correlationId}`,
        });
        setTitle("");
        setPayload("");
      } else {
        const text = await res.text();
        setSubmitStatus({
          type: "error",
          message: `Submission failed (${res.status}): ${text}`,
        });
      }
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: `Network error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  };

  return (
    <div className="container">
      <h1>Azure Round Trip</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Payload
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>

      {submitStatus && (
        <div className={`status ${submitStatus.type === "error" ? "error" : ""}`}>
          {submitStatus.message}
        </div>
      )}

      <h2>Processed Items</h2>
      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <ul className="items-list">
          {items.map((item) => (
            <li key={item.id}>
              <span className="item-title">{item.title}</span>
              {item.payload && <> &mdash; {item.payload}</>}
              <div className="item-meta">
                Status: {item.status} | Submitted:{" "}
                {new Date(item.submittedAt).toLocaleString()}
                {item.processedAt && (
                  <> | Processed: {new Date(item.processedAt).toLocaleString()}</>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
