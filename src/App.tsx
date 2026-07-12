import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Ranking from "@/pages/Ranking";
import EquityDashboard from "@/pages/EquityDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/equity" element={<EquityDashboard />} />
      </Routes>
    </Router>
  );
}
