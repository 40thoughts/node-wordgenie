# Readme
[![NPM](https://nodei.co/npm/wordgenie.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/wordgenie/)

[![npm version](https://badge.fury.io/js/wordgenie.svg)](https://badge.fury.io/js/wordgenie) [![dependencies](https://david-dm.org/40thoughts/wordgenie.svg)](https://david-dm.org/40thoughts/wordgenie) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/c1f3a96fa9ef48ada91226d268bf82d1)](https://www.codacy.com/app/40thoughts/node-wordgenie?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=40thoughts/node-wordgenie&amp;utm_campaign=Badge_Grade)

+ [Description](#description)
+ [Installation](#installation)
+ [Usage example](#usage-example)
+ [Todos](#todos)

## Description
This package is a word (list) generator built on the [Markov chain](https://en.wikipedia.org/wiki/Markov_chain) model.

Inspired by [this article](https://sciencetonnante.wordpress.com/2015/10/16/la-machine-a-inventer-des-mots-video/) written (in french) by David Louapre.

It generates words by using the probability of a character to appear after a specific chain of characters.
Thus, depending on the original words list you put in, it will generate words which would look like those of the words list.

You can throw a lot of differents words lists at it depending on the expected result (words, names, whatever... in many languages).

It's been tested and worked fine on english, french and mythological words/names containing special characters. Just make sure the original words list is formatted as you would expect the output to be (no characters you don't want like `[space]`, `£`, `+`, `;`, ... unless you wan't them you appear in the result).

Of course, in the following example, the original words list is very short so you won't get many words generated since the pool of probabilities is very small, so to get the best results, you'll need to give it a strong words list unless you expect very specific results.

**Ex.:**
Original words list:
```
monday
tuesday
wednesday
wedding
dingo
demon
daylight
sunlight
lighthouse
```

Generated list:
```
ding
mon
weddingo
demondaylight
tuesdaylight
sunlighthouse
light
wednesdaylight
demonday
day
daylighthouse
mondaylight
wednesdaylighthouse
tuesdaylighthouse
demondaylighthouse
mondaylighthouse
```

Documentation available [here](https://40thoughts.github.io/node-wordgenie/)


## Installation
Using npm:
```sh
$ npm install wordgenie
$ npm install --save wordgenie
```

## Usage example

```javascript
var fs = require('fs');

// Load the module.
var Generator = require("wordgenie");

// Read a word list
fs.readFile("/path/to/wordlist", "utf8", function(err, data) {
    if (err) throw err;
    
    let _data = data.split('\n');       // Considering your wordlist is a file where each line is a word
    let _words = new Set(_data);
    
    let _generator = new Generator();   // Create a new instance of the generator
    _generator.analyze(_words);         // Analyze the word list (mandatory before generation)
    
    // Get and print a generated word
    let _newWord = _generator.genWord();       // <- String
    console.log("Generated Word: " + _newWord);
    
    // Get and print a list of 10 generated word
    let _newWords = _generator.genSet(10);      // <- Set
    console.log("Generated Words:");
    _newWords.forEach((word) => {
        console.log(word);
    });
});
```


## Todos
- [ ] Explain the configuration of the "analyze" method
- [ ] Explain the markovLen parameter
- [ ] Allow the user to put in a String[] instead of a Set in the "analyze" method (the Set was chosen as a good way to avoid duplicates, but I could manage that from inside the module)
- [ ] Do something about the case sensitivity (since atm it doesn't recognize the relation between lowercase chars and their uppercase equivalent)
- [ ] Implement callbacks in the "genWord", "genSet" and "analyze" methods (maybe, is there even a point to do it?)
