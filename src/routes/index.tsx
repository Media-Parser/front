import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/Home/HomePage';
import LoginPage from '../features/Login/LoginPage';
import OAuthCallback from '../features/Login/OAuthCallback';
// import TrashPage from '../features/Trash/TrashPage';
// import DetailPage from '../features/Detail/DetailPage';
// import UploadPage from '../features/Upload/UploadPage';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        {/* <Route path="/trash" element={<TrashPage />} /> */}
        {/* <Route path="/detail/:id" element={<DetailPage />} /> */}
        {/* <Route path="/upload" element={<UploadPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
