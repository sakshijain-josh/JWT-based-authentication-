import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const API = "http://localhost:8080";

  // Generate section
  const [userId, setUserId] = useState("101");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState(null); // unix seconds
  const [remaining, setRemaining] = useState(null); // seconds
  const timerRef = useRef(null);

  // Validate section
  const [validateInput, setValidateInput] = useState("");
  const [result, setResult] = useState(null);
  const [loadingValidate, setLoadingValidate] = useState(false);

  const isExpired = useMemo(() => {
    if (remaining === null) return false;
    return remaining <= 0;
  }, [remaining]);

  const formatTime = (sec) => {
    if (sec === null) return "--";
    const s = Math.max(0, sec);
    return `${s}s`;
  };

  // countdown logic
  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiresAt - now;
      setRemaining(diff);
    };

    tick();

    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  const generateToken = async () => {
    setResult(null);

    const res = await fetch(`${API}/generate?userId=${userId}`);
    const data = await res.json();

    setToken(data.token);
    setValidateInput(data.token); // ✅ auto-fill validate section
    setExpiresAt(data.expiresAt);
  };

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
  };

  const clearAll = () => {
    setToken("");
    setValidateInput("");
    setResult(null);
    setExpiresAt(null);
    setRemaining(null);
    clearInterval(timerRef.current);
  };

  const validateToken = async () => {
    setLoadingValidate(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: validateInput }),
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ message: "Token Invalid" });
    } finally {
      setLoadingValidate(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="hero">
          <div>
            <h1>JWT Lab </h1>
            
          </div>

          <button className="btn ghost" onClick={clearAll}>
            Reset
          </button>
        </div>

        <div className="grid">
          {/* ✅ Generate Section */}
          <section className="card">
            <div className="cardHead">
              <h2>Create Token</h2>
              <span className="pill">HS256</span>
            </div>

            <div className="fieldRow">
              <div className="field">
                <label>User ID</label>
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="101"
                />
              </div>

              <button className="btn primary" onClick={generateToken}>
                Generate JWT
              </button>
            </div>

            <div className="field">
              <label>Generated Token</label>
              <textarea
                value={token}
                readOnly
                rows={6}
                placeholder="Your JWT token will appear here..."
              />
            </div>

            <div className="actions">
              <button className="btn" onClick={copyToken} disabled={!token}>
                Copy
              </button>

              <div className={`timer ${isExpired ? "expired" : ""}`}>
                <span className="dot" />
                <span>
                  {expiresAt ? (
                    <>
                      Expires in: <b>{formatTime(remaining)}</b>
                    </>
                  ) : (
                    <>No active token</>
                  )}
                </span>
              </div>
            </div>

            {expiresAt && (
              <div className="hint">
                {isExpired ? (
                  <span className="warn">⛔ Token expired — generate again.</span>
                ) : (
                  <span className="ok">✅ Token is still valid (for now).</span>
                )}
              </div>
            )}
          </section>

          {/* ✅ Validate Section */}
          <section className="card">
            <div className="cardHead">
              <h2>Validate Token</h2>
              <span className="pill">Verify + Decode</span>
            </div>

            <div className="field">
              <label>Paste Token Here</label>
              <textarea
                value={validateInput}
                onChange={(e) => setValidateInput(e.target.value)}
                rows={6}
                placeholder="Paste JWT token here..."
              />
            </div>

            <div className="actions">
              <button
                className="btn primary"
                onClick={validateToken}
                disabled={!validateInput.trim() || loadingValidate}
              >
                {loadingValidate ? "Validating..." : "Validate JWT"}
              </button>

              {result && (
                <span
                  className={`status ${
                    result.message === "Token Valid" ? "ok" : "bad"
                  }`}
                >
                  {result.message}
                </span>
              )}
            </div>

            {result?.claims && (
              <div className="payloadBox">
                <div className="payloadTitle">Decoded Claims</div>
                <pre>{JSON.stringify(result.claims, null, 2)}</pre>
              </div>
            )}
          </section>
        </div>

        <div className="footer">
          ⚡ Tip: Wait 30 seconds and validate again to see it reject expired
          tokens.
        </div>
      </div>
    </div>
  );
}
