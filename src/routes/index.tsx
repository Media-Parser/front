// 📁 src/routes/index.tsx

import { Routes, Route } from "react-router-dom";
import LandingWrapper from "../features/Landing/LandingWrapper";
import OAuthCallback from "../features/Login/OAuthCallback";
import TrashPage from "../features/Trash/TrashPage";
import AccountPage from "../features/Account/AccountPage";
import SupportPage from "../features/Support/SupportPage";
import ProtectedRoute from "./ProtectedRoute";
import EditorPage from "../features/Editor/EditorPage";
import DashboardPage from "../features/Dashboard/DashboardPage";
import Suggestion from "../features/Suggestion/Suggestion";
import Keyword from "../features/Keyword/Keyword";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingWrapper />} />
      <Route path="/login" element={<LandingWrapper />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:categoryPath" element={<DashboardPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/keyword" element={<Keyword />} />
        <Route path="/editor/:id" element={<EditorPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
