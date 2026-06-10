import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/styles/theme.css";
import "./index.css";
import { CartProvider } from "./context/CartContext.jsx";
import { FavouritesProvider } from "./context/FavouritesContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FavouritesProvider>
      <CartProvider>
        <App />
        <ToastContainer position="bottom-right" autoClose={1500} />
      </CartProvider>
    </FavouritesProvider>
  </React.StrictMode>
);