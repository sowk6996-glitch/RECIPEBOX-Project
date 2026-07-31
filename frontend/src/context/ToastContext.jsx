import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    // Automatically remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-emerald-500 text-white';
          let icon = <FiCheckCircle className="w-5 h-5 flex-shrink-0" />;

          if (toast.type === 'error') {
            bgColor = 'bg-rose-500 text-white';
            icon = <FiAlertCircle className="w-5 h-5 flex-shrink-0" />;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-amber-500 text-white';
            icon = <FiAlertCircle className="w-5 h-5 flex-shrink-0" />;
          } else if (toast.type === 'info') {
            bgColor = 'bg-blue-500 text-white';
            icon = <FiInfo className="w-5 h-5 flex-shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-xl shadow-lg border border-white/10 backdrop-blur-md transform transition-all duration-300 translate-y-0 scale-100 animate-slide-in pointer-events-auto ${bgColor}`}
              style={{
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors duration-150 ml-3"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      {/* Custom Styles Inject for Animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(1rem) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
export default ToastContext;
