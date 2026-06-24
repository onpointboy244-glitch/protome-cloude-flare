import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/useAuth";
import "./Auth.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Auth({ onClose }) {
  const { user, signUp, signIn } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup | confirmation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Close modal once user is confirmed signed in
  useEffect(() => {
    if (user) onClose?.();
  }, [user]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    previousFocusRef.current = document.activeElement;

    const focusable = modal.querySelectorAll(FOCUSABLE);
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = modal.querySelectorAll(FOCUSABLE);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [onClose, mode]);

  // Cross-tab sync: auto-close when session becomes active after email confirmation
  useEffect(() => {
    const handleStorage = (e) => {
      if (
        (e.key?.startsWith("sb-") || e.key === "supabase.auth.token") &&
        e.newValue
      ) {
        // Session appeared in another tab — re-check will update `user` and modal will close
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "signup") {
        const { data, error } = await signUp(email, password);
        if (error) throw error;

        // Supabase returns an existing user with empty identities instead of an error
        // when the email is already registered.
        if (data?.user?.identities?.length === 0) {
          setError(
            "An account with this email already exists. Try signing in instead.",
          );
          return;
        }

        setMode("confirmation");
        setEmail("");
        setPassword("");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        // useEffect above closes modal when user updates
      }
    } catch (err) {
      console.error("Auth error:", err);

      // Friendly messages for common errors
      const msg = (
        err?.message ||
        err?.error_description ||
        err?.error ||
        ""
      ).toLowerCase();
      const code = (err?.code || "").toLowerCase();

      if (
        msg.includes("rate limit") ||
        msg.includes("too many requests") ||
        msg.includes("over_email_send_rate_limit") ||
        code.includes("over_email_send_rate_limit") ||
        code.includes("email_rate_limit")
      ) {
        setError("Too many signup attempts. Please try again later.");
      } else if (
        mode === "signup" &&
        (msg.includes("already registered") ||
          code.includes("user_already_exists"))
      ) {
        setError("This email is already registered. Try signing in instead.");
      } else {
        setError(
          typeof msg === "string" && msg
            ? err.message || err.error_description || err.error
            : typeof err === "string"
              ? err
              : "Something went wrong. Try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- Confirmation view (shown after signup) ---
  if (mode === "confirmation") {
    return (
      <div className="auth-overlay" onClick={onClose}>
        <div
          className="auth-modal"
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm your email"
        >
          <button className="auth-close" onClick={onClose} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="auth-confirmation">
            <div className="auth-confirmation__icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-confirmation__text">
              We sent a confirmation link to <strong>{email}</strong>. Open it
              to activate your account, then sign in.
            </p>
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <div className="auth-confirmation__actions">
              <button
                className="btn btn--primary auth-submit"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Sign in now
              </button>
              <button
                className="btn btn--text"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Sign in manually
              </button>
              <button className="btn btn--text" onClick={onClose}>
                Do it later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Sign in / Sign up form ---
  return (
    <div className="auth-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "signin" ? "Sign in" : "Sign up"}
      >
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="auth-title">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="auth-subtitle">
          {mode === "signin"
            ? "Sign in to manage your protome profile."
            : "Sign up to claim your protome username."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete={mode === "signin" ? "email" : "username"}
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary auth-submit"
            disabled={submitting}
          >
            {submitting
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Sign up"}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                className="auth-toggle-btn"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="auth-toggle-btn"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
