import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthPage, VoidChatPage } from "./pages/AuthPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Settings } from "./pages/Settings";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<VoidChatPage />} />
            <Route path="/chat/:id" element={<VoidChatPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
