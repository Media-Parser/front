import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingWrapper from "../features/Landing/LandingWrapper";
import OAuthCallback from "../features/Login/OAuthCallback";
import DashBoardPage from "../features/Dashboard/DashboardPage";
import TrashPage from "../features/Trash/TrashPage";
// import DetailPage from '../features/Detail/DetailPage';
// import UploadPage from '../features/Upload/UploadPage';
// import Homepage from "../features/Home/HomePage";
// import Loginpage from "../features/Login/LoginPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LandingWrapper />} />
        {/* <Route path="/" element={<HomePage />} /> */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/trash" element={<TrashPage />} />
        {/* <Route path="/detail/:id" element={<DetailPage />} /> */}
        {/* <Route path="/upload" element={<UploadPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
