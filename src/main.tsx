import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/AuthProvider";
import { CalendarProvider } from "./components/CalendarProvider";
import "./style.css";
import { registerSW } from "virtual:pwa-register";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <App />
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
registerSW({ immediate: true });
