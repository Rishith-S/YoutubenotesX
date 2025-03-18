import { Routes, Route } from "react-router-dom";
import "../src/index.css";
import Layout from "./components/Layout";
import Homescreen from "./screens/Homescreen";
import IndividualPlaylist from "./screens/IndividualPlaylist";
import Login from "./components/Auth/Login";
import Callback from "./components/Auth/Callback";
import PersistentLogin from "./components/PersistentLogin";

const App = () => {
  return (
      <Routes>
        <Route path="/auth/callback/signup" element={<Callback />} />
        <Route path="/auth/callback/login" element={<Callback />} />
        <Route path="/auth" element={<Login />} />
        <Route element={<PersistentLogin />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Homescreen />} />
            <Route path="/:playlistId" element={<IndividualPlaylist />} />
          </Route>
        </Route>
      </Routes>
  );
};

export default App;
