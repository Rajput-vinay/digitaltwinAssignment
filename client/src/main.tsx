import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./theme/ThemeContext";
import { UsersProvider } from "./context/UsersContext";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UsersProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UsersProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
