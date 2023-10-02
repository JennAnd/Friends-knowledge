import React from "react";
import "./styles/gameinstructions.css";

function GameInstructionsPopup({ showInstructions, onClose }) {
  if (!showInstructions) {
    return null;
  }

  return (
    <div className="game-instructions-popup">
      <div className="game-instructions-text">
        <p>
          "Guess the right character in the TV show "Friends"! A random
          character from Friends will be displayed. Read the brief article and
          try to guess the right character. Pay attention to titles like "Mr.",
          "Dr.", or "Jr.", and include the dot when guessing. <br></br>
          If you guess correctly, you can move on to the next character by
          pressing the "Next Character" button. If your guess is wrong, keep
          trying until you get it right. If you hover over the hidden words you
          can see the amount of characters. If you can't guess the character,
          you can aswell press the "Next Character" button to skip to the next
          one. Enjoy the game and test your "Friends" knowledge!"
        </p>
      </div>
      <button className="popup-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export default GameInstructionsPopup;
