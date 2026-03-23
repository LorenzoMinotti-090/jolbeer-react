import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import NovitaPage from "./pages/NovitaPage.jsx";
import AboutPage from "./pages/AboutPage";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import FavouritesPage from "./pages/FavouritesPage.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import "./App.css";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cerca" element={<Navigate to="/prodotti" replace />} />
          <Route path="/prodotti" element={<ProductsPage />} />
          <Route path="/novita" element={<NovitaPage />} />
          <Route path="/prodotti/:id" element={<ProductDetailPage />} />
          <Route path="/chi-siamo" element={<AboutPage />} />
          <Route path="/preferiti" element={<FavouritesPage />} />
          <Route path="/carrello" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/ordine/:id" element={<OrderSuccessPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

