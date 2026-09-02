import React, { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { NetworkProvider } from './context/NetworkContext';
import { ConnectionBanner } from './components/network/NetworkExperience';

const NotesApp = lazy(() => import("./pages/NotesApp"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <NetworkProvider>
    <BrowserRouter basename="/">
      <ConnectionBanner />
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-full bg-gray-50 dark:bg-[#1a1a1a]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes" element={<NotesApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </NetworkProvider>
  );
}

export default App;
