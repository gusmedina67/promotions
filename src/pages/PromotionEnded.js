import { useState } from "react";
import logo from "../assets/chilspot-logo.png";
import "../App.css"; // Import CSS styles
import { Alert } from "../components/ui/alert";

export default function PromotionEnded() {
  return (
    <div className="container">
      <img src={logo} alt="ChilSpot Logo" className="App-logo" />
      <h2>¡Gracias por participar en esta promoción!</h2>
      <p>
        Lamentablemente, la promoción ha finalizado. ¡Mantente atento a nuevas y
        sorprendentes novedades que se vienen pronto!
      </p>
    </div>
  );
}
