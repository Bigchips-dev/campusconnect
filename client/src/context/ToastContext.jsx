import { createContext, useState, useCallback, useRef } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const addToast = useCallback(
    ({ type = 'success', message, duration = 4000 }) => {
      const id = ++toastId;
      setToasts((prev) => {
        const next = [...prev, { id, type, message, exiting: false }];
        return next.length > 5 ? next.slice(-5) : next;
      });

      if (duration > 0) {
        timers.current[id] = setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = { toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
