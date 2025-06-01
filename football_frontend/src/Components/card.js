import React from "react";
import "./card.css";

const PlayerCard = ({ player }) => {
  return (
    <div className="player-card">
      <img src={player.player_image} alt={player.name} className="player-image" />
      <div className="player-details">
        <h2>{player.name}</h2>
        <p><strong>Age:</strong> {player.age}</p>
        <p><strong>Nationality:</strong> {player.nationality}</p>
        <p><strong>Clubs Played:</strong> {player.clubs_played.join(", ")}</p>
        <p><strong>Awards:</strong> {player.awards.length > 0 ? player.awards.join(", ") : "None"}</p>
      </div>
    </div>
  );
};

export default PlayerCard;
