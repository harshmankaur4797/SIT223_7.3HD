import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import TopImage from "./components/TopImage";
import FeaturedDrinks from "./components/FeaturedDrinks";
import FeaturedCookies from "./components/FeaturedCookies";
import SignUp from "./components/SignUp";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <TopImage />
              <FeaturedDrinks />
              <FeaturedCookies />
              <SignUp />
              <Footer />
            </>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
