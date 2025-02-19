import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import NavBar from './pages/Components/Header/NavBar';
import CardEditor from './pages/CardEditor/CardEditor';
import PrivacyStatement from './pages/PrivacyStatement/PrivacyStatement';
import Footer from './pages/Components/Footer/Footer';

function App() {
    return (
        <div className="min-h-screen min-w-screen overflow-hidden bg-neutral-900 text-white font-sans leading-6 font-normal antialiased">
            <Router>
                <NavBar />
                <Routes>
                    <Route path="/" element={<Navigate to="/editor" />} />
                    <Route path="/editor" element={<CardEditor />} />
                    <Route path="/privacy" element={<PrivacyStatement />} />
                </Routes>
                <Footer />
            </Router>
        </div>
    );
}

export default App;
