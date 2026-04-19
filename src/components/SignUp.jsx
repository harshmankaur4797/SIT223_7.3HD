import React, { useState, useEffect } from "react";
import "./SignUp.css";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function SignupSubscription() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // update user state
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  // If user is logged in, don’t show the subscription bar
  if (user) return null;

  return (
    <section className="signup-bar">
      <form className="signup-form" onSubmit={handleSubmit}>
        <span className="signup-text">
          Sign Up for daily crazy deals and offers!
        </span>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}
