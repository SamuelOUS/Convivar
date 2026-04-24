import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicRoute from "./components/routing/PublicRoute";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { navigationItems } from "./features/navigation/navigationItems";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SectionPage from "./pages/SectionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<Login />} path="/login" />
          <Route element={<Register />} path="/registro" />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<Dashboard />} path="/" />
            {navigationItems
              .filter((item) => item.path !== "/")
              .map((item) => (
                <Route
                  element={<SectionPage item={item} />}
                  key={item.path}
                  path={item.path}
                />
              ))}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
