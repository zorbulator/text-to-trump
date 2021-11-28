import React, {useState, useEffect} from 'react';
import './App.css';

function App() {
   let [words, setWords] = useState();
   let [maxWords, setMaxWords] = useState(10);
   let [inputValue, setInputValue] = useState("");
   let [searchString, setSearchString] = useState("");
   useEffect(() => {
      fetch("https://scanuproductions.com/webtools/Text%20To%20Trump/charlierefresh.php")
         .then(data => {return data.json();})
         .then(json => {setWords(json); setMaxWords(Math.max.apply(Math, json.map(word => word.text.split(" ").length)));});
   }, []);

   function splitWords(text) {
      if (!words) {
         return {words: [], errors: []};
      }
      let wordArray = text.replace(/\./g," period ").replace(/,/g," comma ").replace(/ +(?= )/g,'').toLowerCase().split(" "); //replace periods and commas, then make lowercase, then split
      //console.log(wordArray);
      let dictionary = words.map(word => word.text.toLowerCase());

      for (let i = 0; i < wordArray.length; i++) { //for each word
         for (let j = Math.min(maxWords, wordArray.length - i); j > 1; j--) { //test each number of words from 2 to the maximum, but start larger
            let testPhrase = wordArray.slice(i,i+j).join(" "); //the combination of words that is possibly a longer phrase
            if (dictionary.includes(testPhrase)) {
               wordArray.splice(i,j,testPhrase); //replace j elements starting at i with the phrase
               break; //the phrase has been found
            }
         }
      }

      let errorWords = [];
      let wordObjArray = [];

      for (let i = 0; i < wordArray.length; i++) {
         let word = wordArray[i];
         let dictIndex = dictionary.indexOf(word);
         //console.log(word + " is at index " + dictIndex);
         if (dictIndex === -1) {
            if (word !== "") {
               errorWords.push(word);
            }
         }else {
            wordObjArray.push(words[dictIndex]);
         }
      }
      //console.log(errorWords);
      //console.log(wordObjArray);
      return {words: wordObjArray, errors: errorWords};
   }
   
   function play() {
      let wordsToPlay = splitWords(inputValue).words;
      let tempAudios = [];
      if(wordsToPlay.length > 0) {
         for (var i = 0; i < wordsToPlay.length; i++) {
            tempAudios[i] = new Audio(wordsToPlay[i].URL);
         }
      }
      tempAudios[tempAudios.length - 1].oncanplay = () => {
         setTimeout(() => {
            playAll(tempAudios, 0);
         }, 500);
      }
   } 

   function playAll(audios, index) {
      audios[index].play();
      if (index + 1 < audios.length) {
         setTimeout(() => {
            playAll(audios, index + 1);
         }, (audios[index].duration * 1000) - 30);
      }
   }

  return (
    <div className="App">
       <div className="grid-container">
          <div className="top">
             <span>Text To Trump</span>
             <input placeholder="search..." className = "searchBox" onChange = {e => setSearchString(e.target.value)} value = {searchString}/>
          </div>
          <span className="word-bank">
             {words ? words.map(word =>
             <button 
                style={{display: word.text.toLowerCase().includes(searchString.toLowerCase()) ? "inline-block" : "none"}} 
                onClick = {e => {setSearchString(""); setInputValue(inputValue + word.text.toLowerCase() + " ")}} 
                className="word" key={word.text}>{word.text.toLowerCase()}</button>
             ) : <h2>Loading words from <a href="scanuproductions.com">scanuproductions.com</a></h2>}
          </span>
          <span style={{display: splitWords(inputValue).errors.length === 0 ? "none" : "flex"}} className="unknown"><p>Unknown Words: {splitWords(inputValue).errors.join(", ")}</p></span>
          <button onClick={e => setInputValue("")} className="clear">clear</button>
          <input className="words" value={inputValue} onChange = {e => setInputValue(e.target.value)} />
          <button onClick={play} className="play">play</button>
       </div>
    </div>
  );
}

export default App;
