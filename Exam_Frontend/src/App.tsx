// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';//
import MainPage from './Pages/MainPage';
import './App.css';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ProfilePage from './Pages/ProfilePage';
import CatalogPage from './Pages/CatalogPage'
import IphonePage from './Pages/IphonePage'
import IPadPage from './Pages/IPadPage'
import MacBookPage from './Pages/MacBookPage'
import AppleWatchPage from './Pages/AppleWatchPage'
import AirPodsPage from './Pages/AirPodsPage'
import ProductPage from './Pages/ProductPage'
import BasketPage from './Pages/BasketPage'
import MakingOrderPage from './Pages/MakingOrderPage'
import OrderPage from './Pages/OrderPage'
import DeliveryPaymentPage from "./Pages/DeliveryPaymentPage"
import WarrantyPage from "./Pages/WarrantyPage"
import ServiceCenterPage from "./Pages/ServiceCenterPage"
import TraidInPage from "./Pages/TraidInPage"
import ContactsPage from "./Pages/ContactsPage"
import UserManagementPage from "./Pages/UserManagementPage"
import ProductManagementPage from "./Pages/ProductManagementPage"
import ProductPhotosPage from "./Pages/ProductPhotosPage"
import ProductSpecificationsPage from "./Pages/ProductSpecificationsPage"
import OrdersManagementPage from "./Pages/OrdersManagementPage"
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage"
import TermsOfServicePage from './Pages/TermsOfServicePage';
import CategoriesManagementPage from './Pages/CategoriesManagementPage'
import TermsOfUsePage from './Pages/TermsOfUsePage';
import SamsungPage from './Pages/SamsungPage'
import GamingPage from './Pages/GamingPage'
import AudioPage from "./Pages/AudioPage";
import DysonPage from "./Pages/DysonPage";
import StatsPage from "./Pages/StatsPage"
import ReviewsModerationPage from "./Pages/ReviewsModerationPage";
import ImportPricePage from "./Pages/ImportPricePage"
import NotFoundPage from "./Pages/NotFoundPage"

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/iphone" element={<IphonePage />} />
          <Route path="/catalog/ipad" element={<IPadPage />} />
          <Route path="/catalog/macbook" element={<MacBookPage />} />
          <Route path="/catalog/applewatch" element={<AppleWatchPage />} />
          <Route path="/catalog/airpods" element={<AirPodsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/basket" element={<BasketPage />} />
          <Route path="/makingorder" element={<MakingOrderPage />} />
          <Route path="/order/:orderId" element={<OrderPage />} />
          <Route path="/delivery_payment" element={<DeliveryPaymentPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/service-center" element={<ServiceCenterPage />} />
          <Route path="/trade-in" element={<TraidInPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/users_management" element={<UserManagementPage />} />
          <Route path="/products_management" element={<ProductManagementPage />} />
          <Route path="/products_management/:productId/photos" element={<ProductPhotosPage />} />
          <Route path="/products_management/:productId/specifications" element={<ProductSpecificationsPage />} />
          <Route path="/orders_management" element={<OrdersManagementPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/categories_management" element = {<CategoriesManagementPage/>}/>
          <Route path="/termsOfUse" element = {<TermsOfUsePage/>}/>
          <Route path="/termsOfUse" element = {<TermsOfUsePage/>}/>
          <Route path="/catalog/samsung" element = {<SamsungPage/>}/>
          <Route path="/catalog/gaming" element = {<GamingPage/>}/>
          <Route path="/catalog/audio" element = {<AudioPage/>}/>
          <Route path="/catalog/dyson" element = {<DysonPage/>}/>
          <Route path="/stats" element = {<StatsPage/>}/>
          <Route path="/reviews_moderation" element = {<ReviewsModerationPage/>}/>
          <Route path="/import_prices" element = {<ImportPricePage/>}/>

          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;