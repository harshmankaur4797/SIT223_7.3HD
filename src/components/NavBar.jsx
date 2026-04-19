import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ProfileImg from "../Images/profile.png"; 
import "./NavBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";


export default function NavBar() {
  const [user, setUser] = useState(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };
  
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="brand">Dev@DeakinCoffee</div>

        <form
          className="search-form"
          role="search"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Site search"
        >
          <label htmlFor="site-search" className="sr-only">
            Search
          </label>
          <input id="site-search" type="search" placeholder="Search" />
          <button type="submit" aria-label="Search">
            <FontAwesomeIcon icon={faMagnifyingGlass} style={{ color: "#2e7a63" }} />
          </button>
        </form>

        <div className="actions">
          {!user ? (
            <>
              <Link to="/" className="action-link">
                Home
              </Link>
              <Link to="/login" className="action-link">
                Login
              </Link>
            </>
          ) : (
            <div className="profile-wrapper">
              <div
                className="profile-avatar-container"
                onClick={() => setShowCard(!showCard)}
              >
                <img src={ProfileImg} alt="Profile" />
              </div>
              {showCard && (
                <div className="profile-card">
                  <p>{user.displayName}</p>
                  <p>{user.email}</p>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
