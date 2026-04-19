import React from "react";
import "./FeaturedDrinks.css";
import blackImg from "../Images/black.jpg";
import frappeImg from "../Images/frappe.jpg";
import layeredImg from "../Images/layered.jpg";

const drinks = [
  {
    id: 1,
    title: "Classic Black Coffee Latte",
    desc: "Classic Black Coffee Latte - bold, smooth, no frills.",
    img: blackImg,
    rating: 4,
  },
  {
    id: 2,
    title: "Cafe Frappe",
    desc: "Cafe Frappe - chilled, foamy, and refreshingly bold",
    img: frappeImg,
    rating: 5,
  },
  {
    id: 3,
    title: "Layered Coffee Latte",
    desc: "Layered Coffee Latte - smooth espresso meets silky milk in perfect layers.",
    img: layeredImg,
    rating: 3,
  },
];

export default function FeaturedDrinks() {
  return (
    <section className="featured-drinks">
      <div className="drinks-header">
        <h2>Featured Drinks</h2>
      </div>

      <div className="drinks-grid">
        {drinks.map((drink) => (
          <div key={drink.id} className="drink-card">
            <img src={drink.img} alt={drink.title} />
            <div className="drink-content">
              <h3>{drink.title}</h3>
              <p>{drink.desc}</p>
            </div>
            <div className="drink-rating">
              {"★".repeat(drink.rating)}
              {"☆".repeat(5 - drink.rating)}
            </div>
          </div>
        ))}
      </div>

      <div className="drinks-button">
        <button>See All Drinks</button>
      </div>
    </section>
  );
}
