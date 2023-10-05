import React, { useState, useEffect } from "react";
import "./styles/inputform.css";

function InputForm({ onGuess, hiddenWords, guesses, setGuesses }) {
  const [guess, setGuess] = useState("");
  const [uniqueGuesses, setUniqueGuesses] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Split the guess into individual words
    const words = guess.split(" ");

    // Find the word indices of the hidden words in the guess
    const wordIndices = words.reduce((indices, word, index) => {
      const hiddenWordIndex = hiddenWords.findIndex(
        (hiddenWord) => hiddenWord.word.toLowerCase() === word.toLowerCase()
      );
      if (hiddenWordIndex !== -1) {
        indices.push(hiddenWordIndex);
      }
      return indices;
    }, []);

    onGuess(wordIndices, guess);
    setGuess("");
    const normalizedGuess = guess.toLowerCase(); // Normalize the guess to lowercase
    setGuesses((prevGuesses) => [...prevGuesses, normalizedGuess]);
  };

  const handleChange = (event) => {
    setGuess(event.target.value);
  };

  const isGuessedWordMatching = (word) => {
    return hiddenWords.some(
      (hiddenWord) => hiddenWord.word.toLowerCase() === word.toLowerCase()
    );
  };

  useEffect(() => {
    if (hiddenWords.every((hiddenWord) => !hiddenWord.isHidden)) {
      setGuesses([]);
      setUniqueGuesses([]);
    }
  }, [hiddenWords]);

  useEffect(() => {
    // Update unique guesses whenever guesses change
    const uniqueGuessSet = new Set(guesses);
    setUniqueGuesses(Array.from(uniqueGuessSet));
  }, [guesses]);

  return (
    <div className="input-form-container">
      <div className="input-form">
        <form onSubmit={handleSubmit}>
          <div className="input-label">
            <label htmlFor="guess">Your guess:</label>
          </div>
          <input
            type="text"
            id="guess"
            name="guess"
            autoComplete="off"
            value={guess}
            onChange={handleChange}
          />
          <button className="submit-guess" type="submit">
            Guess
          </button>
        </form>
      </div>
      <div className="your-guesses">
        {/* Render unique guesses */}
        {uniqueGuesses
          .slice()
          .reverse()
          .map((uniqueGuess, index) => (
            <p
              key={index}
              className={
                isGuessedWordMatching(uniqueGuess) ? "matching-guess" : ""
              }
            >
              {uniqueGuess}
            </p>
          ))}
      </div>
    </div>
  );
}

export default InputForm;
