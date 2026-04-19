import React from "react";
import "./TopImage.css";
import TopImageFile from "../Images/TopImage.jpg";

export default function TopImage() {
  return (
    <div className="top-image">
      <img src={TopImageFile} alt="Coffee" />
    </div>
  );
}
