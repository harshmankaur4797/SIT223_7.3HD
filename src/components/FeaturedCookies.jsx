import React from "react";
import "./FeaturedCookies.css";
import chocoChipImg from "../Images/chocochip.jpg";
import oatmealImg from "../Images/oatmeal.jpg";
import brownieImg from "../Images/brownie.jpg";

const cookies = [
  {
    id: 1,
    title: "Chocolate Chip Cookie",
    desc: "Crispy on the edges, chewy in the center, loaded with chocolate chips.",
    img: chocoChipImg,
    rating: 5,
  },
  {
    id: 2,
    title: "Oatmeal Cookie",
    desc: "Soft, healthy, and delicious with a hint of cinnamon.",
    img: oatmealImg,
    rating: 4,
  },
  {
    id: 3,
    title: "Fudgy Brownie",
    desc: "Rich and gooey chocolate brownie, perfect for chocolate lovers.",
    img: brownieImg,
    rating: 5,
  },
];

function FeaturedCookies() {
  return (
    <section className="featured-cookies">
      <div className="cookies-header">
        <h2>Featured Cookies</h2>
      </div>

      <div className="cookies-grid">
        {cookies.map((cookie) => (
          <div key={cookie.id} className="cookie-card">
            <img src={cookie.img} alt={cookie.title} />
            <div className="cookie-content">
              <h3>{cookie.title}</h3>
              <p>{cookie.desc}</p>
            </div>
            <div className="cookie-rating">
              {"★".repeat(cookie.rating)}
              {"☆".repeat(5 - cookie.rating)}
            </div>
          </div>
        ))}
      </div>

      <div className="cookies-button">
        <button>See All Cookies</button>
      </div>
    </section>
  );
}

export default FeaturedCookies;