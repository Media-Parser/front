// 📁 src/routes/index.tsx

import {Routes, Route } from "react-router-dom";
import LandingWrapper from "../features/Landing/LandingWrapper";
import OAuthCallback from "../features/Login/OAuthCallback";
import TrashPage from "../features/Trash/TrashPage";
import AccountPage from "../features/Account/AccountPage";
import SupportPage from "../features/Support/SupportPage";
import ProtectedRoute from "./ProtectedRoute";
import EditorPage from "../features/Editor/EditorPage";
import DashboardPage from "../features/Dashboard/DashboardPage";

const AppRouter = () => {
  return (
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LandingWrapper />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:categoryPath" element={<DashboardPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Route>
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
  );
};

export default AppRouter;
