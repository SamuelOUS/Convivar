import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ResidentialComplexProvider } from "./context/ResidentialComplexContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ResidentialComplexProvider>
        <App />
      </ResidentialComplexProvider>
    </AuthProvider>
  </StrictMode>,
);
