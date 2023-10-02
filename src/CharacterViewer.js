import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles/fonts.css";
import "./styles/characterviewer.css";
import "./styles/index.css";
import LoadingSpinner from "./LoadingSpinner";
import GameInstructionsPopup from "./GameInstructions";
import InputForm from "./InputForm";

function CharacterViewer() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState(null);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(
    parseInt(localStorage.getItem("currentCharacterIndex")) || 0
  );
  const [guessedTitle, setGuessedTitle] = useState("");
  const [hiddenWords, setHiddenWords] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [newGuesses, setNewGuesses] = useState([]); // Define the newGuesses state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Update windowWidth state when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* Show/hide game instructions popup */
  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  /* Calculate hidden words based on guessedTitle */
  useEffect(() => {
    const titleWords = currentCharacter?.title?.split(" ");

    setHiddenWords(
      titleWords?.map((word) => ({
        word,
        isHidden: !guessedTitle.toLowerCase().includes(word.toLowerCase()),
      })) || []
    );
  }, [currentCharacter?.title, guessedTitle]);

  /*   Handle a word guess */
  const handleGuess = (wordIndices, wordGuess) => {
    const newHiddenWords = [...hiddenWords];
    const newGuesses = [...guesses];
    const updatedNewGuesses = [...newGuesses, wordGuess.toLowerCase()]; // Add the new guess to newGuesses

    wordIndices.forEach((wordIndex) => {
      const hiddenWord = newHiddenWords[wordIndex];

      if (hiddenWord) {
        const isGuessed =
          wordGuess.toLowerCase() === hiddenWord.word.toLowerCase();

        if (isGuessed) {
          hiddenWord.isHidden = false;
        }
      }
    });

    setHiddenWords(newHiddenWords);
    setGuesses(updatedNewGuesses);

    // Check if all words have been correctly guessed
    const isAllWordsGuessed = newHiddenWords.every(
      (hiddenWord) => !hiddenWord.isHidden
    );

    if (isAllWordsGuessed) {
      setGuessedTitle("");
      setShowThumbnail(true); // Show the thumbnail when all words are guessed
    }

    // Update the newGuesses state
    setNewGuesses(updatedNewGuesses);
  };

  /* Fetch character data from the API */
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/characters", {
        headers: {
          Accept: "application/json",
        },
      });

      const excludedCharacterIds = [
        19359, 3398, 9223, 1901, 20041, 4998, 5247, 3207, 5203, 4901, 5204,
        18174, 5377, 5375, 3445, 4669, 4939, 22755, 26222, 6265, 4033, 7605,
        18042, 2457, 8982, 22982, 5180, 3260, 22071, 18252, 16484, 2208, 2762,
        5040,
      ];

      const charactersWithThumbnailAndAbstract = response.data.filter(
        (character) =>
          character.thumbnail !== null &&
          character.abstract !== null &&
          character.abstract.length >= 100 &&
          !excludedCharacterIds.includes(character.id)
      );

      const randomizedCharacters = shuffleArray(
        charactersWithThumbnailAndAbstract
      );
      setCharacters(randomizedCharacters);

      const storedIndex = localStorage.getItem("currentCharacterIndex");
      if (storedIndex && !isNaN(storedIndex)) {
        setCurrentCharacterIndex(parseInt(storedIndex));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  /*  Fetch character thumbnail data when the current character changes */
  const fetchThumbnail = async (character) => {
    try {
      const response = await axios.get("/api/thumbnails", {
        params: { url: character.thumbnail },
        responseType: "blob",
      });
      const thumbnailUrl = URL.createObjectURL(response.data);
      setCurrentThumbnail(thumbnailUrl);
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
    }
  };

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const resetInputGuesses = () => {
    if (guesses.length > 0) {
      setGuesses([]);
    }
  };
  const nextCharacter = () => {
    resetInputGuesses();
    setShowThumbnail(false); // Reset the showThumbnail state to hide the thumbnail
    setCurrentCharacterIndex((prevIndex) => {
      const newIndex = prevIndex === characters.length - 1 ? 0 : prevIndex + 1;
      localStorage.setItem("currentCharacterIndex", newIndex.toString());
      return newIndex;
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    const truncatedText = text.substring(0, maxLength);
    return truncatedText.replace(/\s+\S*$/, "...");
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentCharacterIndex !== null && characters.length > 0) {
      setCurrentCharacter(characters[currentCharacterIndex]);
      fetchThumbnail(characters[currentCharacterIndex]);
    }
  }, [characters, currentCharacterIndex]);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (currentCharacter !== null) {
        await fetchThumbnail(currentCharacter);
      }
    };

    fetchCharacterData();
  }, [currentCharacter]);

  useEffect(() => {
    // Store the current character index in localStorage
    localStorage.setItem(
      "currentCharacterIndex",
      currentCharacterIndex.toString()
    );
  }, [currentCharacterIndex]);

  return (
    <React.Fragment>
      {/* Warning message for small screens (visible when windowWidth < 1024) */}
      {windowWidth < 1024 && (
        <div className="mobile-warning">
          This game is best experienced on a desktop screen with a minimum width
          of 1024 pixels.
        </div>
      )}

      {/* Character viewer content (visible when windowWidth >= 1024) */}
      <div
        className={`character-viewer-container ${
          windowWidth >= 1024 ? "content-visible" : "content-hidden"
        }`}
      >
        {showInstructions && <div className="overlay" />}
        <div className="input-container">
          {showInstructions && (
            <div className="popup-container">
              <GameInstructionsPopup
                showInstructions={showInstructions}
                onClose={handleCloseInstructions}
              />
            </div>
          )}

          <div className="input-box">
            <InputForm
              onGuess={handleGuess}
              hiddenWords={hiddenWords}
              guesses={guesses}
              setGuesses={setGuesses}
            />
          </div>
        </div>
        <div className="container">
          <h1 className="game-title">"Friends" Knowledge</h1>
          <button className="game-rules" onClick={handleShowInstructions}>
            How to play
          </button>
        </div>

        {currentCharacter !== null ? (
          <div className="character-box" key={currentCharacter.id}>
            <div className="title-box">
              {/* Title section */}
              <h2
                className={`title ${
                  hiddenWords.every((hiddenWord) => hiddenWord.isHidden)
                    ? ""
                    : "guessed"
                }`}
              >
                {hiddenWords.map((hiddenWord, index) => (
                  <div
                    key={index}
                    className={`box ${hiddenWord.isHidden ? "hidden" : ""}`}
                    title={`${hiddenWord.word.length} characters`}
                    style={{
                      backgroundColor: hiddenWord.isHidden
                        ? "#dc8400"
                        : "inherit",
                      display: "inline-block",
                      marginRight: "5px",
                      marginBottom: "5px",
                      paddingRight: "5px",
                      border: "1px",
                      borderRadius: "2px",
                    }}
                  >
                    <span
                      className={`box-content ${
                        hiddenWord.isHidden ? "hidden" : ""
                      }`}
                      style={{
                        visibility: hiddenWord.isHidden ? "hidden" : "visible",
                        color: "#dc8400",
                        fontSize: "26px",
                        fontFamily: "Trade Gothic Bold Condensed",
                      }}
                    >
                      {hiddenWord.isHidden ? (
                        <input
                          type="text"
                          value=""
                          onChange={(e) => handleGuess(index, e.target.value)}
                        />
                      ) : (
                        hiddenWord.word
                      )}
                    </span>
                  </div>
                ))}
              </h2>
            </div>

            <div className="abstract-box">
              <p
                className="abstract"
                style={{
                  color: "rgba(245, 245, 245, 0.879)",
                  fontFamily: "Helvetica Condensed",
                  lineHeight: "26px",
                  letterSpacing: "0.54px",
                }}
              >
                {truncateText(currentCharacter.abstract, 499)
                  .split(" ")
                  .map((word, index) => {
                    const isTitleWord = hiddenWords.some(
                      (hiddenWord) =>
                        hiddenWord.word.toLowerCase() === word.toLowerCase()
                    );

                    const isWordGuessed = newGuesses.includes(
                      word.toLowerCase()
                    );

                    return (
                      <span key={index} className="abstract-word">
                        {isTitleWord ? (
                          <div
                            className={`hidden-box ${
                              isWordGuessed ? "hidden" : ""
                            }`}
                            style={{
                              display: "inline-block",
                              marginRight: "5px",
                              marginBottom: "5px",
                              padding: isWordGuessed ? "0" : "2px 5px",
                              border: "1px solid",
                              borderRadius: "2px",
                              backgroundColor: isWordGuessed
                                ? "transparent" // Remove background color when guessed right
                                : "rgba(245, 245, 245, 0.879)",
                              borderColor: isWordGuessed
                                ? "transparent"
                                : "#000",
                            }}
                          >
                            {isWordGuessed ? (
                              <span className="guessed-word">{word}</span>
                            ) : (
                              <span
                                title={`${word.length} characters`}
                                className="not-guessed-word"
                                style={{
                                  userSelect: "none",
                                }}
                              >
                                {word}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="not-hidden-title-word">{word} </span>
                        )}
                      </span>
                    );
                  })}
              </p>
            </div>

            {/* Thumbnail section */}
            {showThumbnail && currentThumbnail && (
              <img
                className="image"
                src={currentThumbnail}
                alt={currentCharacter.title}
              />
            )}
            {!showThumbnail && <div className="thumbnail-placeholder"></div>}

            {/* Next Character button */}
            <button className="next-button" onClick={nextCharacter}>
              Next Character
            </button>
          </div>
        ) : (
          <div className="spinner-wrapper">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

export default CharacterViewer;
