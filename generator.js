'use strict';
var util = require('util');


/**
 * Class representing the word generator
 * @module generator
 */
class Generator {
  /**
   * Create a generator instance.
   * @param {number} [markovLen] - The length of the Markov chain.
   *        This parameter defines the depth of the probability chain (2 would mean that a character will be chosen depending on the 2 preceding characters).
   *        2 to 3 are usually fine values.
   *        Highest values will give you less variety in the generated words since they would look just like in the original word list.
   *        Avoid high values unless you turn config.allowExist back on.
   * @param {object} [config] - The configuration of the generator.
   * @param {string} [config.wordStart='!'] - The default character at the beginning of a word when analyzing/generating.
   *        Use one that is not in any word of the original list.
   *        This character is used internally, please do not add it in the original word list that you pass in (good word: 'doctor', NOT good: '!doctor?').
   *        It's just meant to mark the starting point of a word.
   *        Note: If this character ('!') may appear in you original list, change it to something that don't. Ex.: '£' or '$'.
   * @param {string} [config.wordEnd='?'] - The default character at the end of a word when analyzing/generating.
   *        Use one that is not in any word of the original list (as above).
   * @param {number} [config.minLength=1] - The minimum length of a word.
   * @param {number} [config.maxLength=20] - The maximum length of a word.
   * @param {boolean} [config.allowExist=false] - Allow to add existing words (from the original word list).
   */
  constructor(markovLen = 2, config = {}) {
    let _config = {
      wordStart: '!',
      wordEnd: '?',
      minLength: 1,
      maxLength: 20,
      allowExist: false
    };
    this.config = Object.assign(_config, config);
    this.markovLen = markovLen;
    this.stats = new Map();
    this.originWords = new Set();
  }
  
  /**
   * Analyse the word list passed in.
   * The use of this method is mandatory before using the "generate" method since you have to compute the probabilities of each character to appear before being able to generate words.
   * @param {set} words - The word list.
   * @example
   * Generator.analyze(Set { 'home', 'coding', 'generator' });
   */
  analyze(words) {
    //console.log(words);
    let _chars = new Set();
    let _subStrings = new Set();
    let _words = new Set();
    
    words.forEach((word) => {
      this.originWords.add(word);
      _words.add(`${this.config.wordStart}${word}${this.config.wordEnd}`);
    });
    
    _words.forEach((word) => {
      let _word = word;
      //console.log('Word : ' + _word);
      for (let c = 0; c < _word.length; c++) {
        _chars.add(_word[c]);
        //console.log('Character : ' + _word[c]);
        if (c >= this.markovLen) {
          let _subString = '';
          for (let x = this.markovLen-1; x >= 0; x--) {
            _subString += _word[c-x];
            //console.log('Syll : ' + _subString);
          }
          _subStrings.add(_subString);
        } else {
          let _subString = '';
          for (let x = c; x >= 0; x--) {
            _subString += _word[c-x];
            //console.log('Syll : ' + _subString);
          }
          _subStrings.add(_subString);
        }
      }
    });
    
    _subStrings.forEach((subString) => {
      let _subString = [...subString];
      genStats(_subString, this.stats, _chars);
    });
    
    _words.forEach((word) => {
      let _word = [...word];
      for (let c = 1; c < word.length; c++) {
        let _subString = _word.slice(Math.max(c - this.markovLen, 0), c + 1);
        let _char = _subString.splice(_subString.length - 1);
        incStat(_subString, this.stats, _char);
      }
    });
    
    normalize(this.stats);
  }
  
  /**
   * Generate a word.
   * @return {string} The word generated.
   * @example
   * Generator.genWord();
   * // returns: 'generator'
   */
  genWord() {
    while (true) {
      let _word = ['!'];
      
      while (_word[_word.length - 1] != this.config.wordEnd) {
        let _tmpWord = _word.slice(0);
        _word[_word.length] = findChar(this.stats, _tmpWord);
      }
      
      _word.splice(0, 1);
      _word.splice(_word.length - 1, 1);
      _word = _word.join('');
      
      if ((_word.length >= this.config.minLength) && (_word.length <= this.config.maxLength) && (this.config.allowExist || !this.originWords.has(_word))) {
        return _word;
      }
    }
  }
  
  /**
   * Generate a word list.
   * @param {number} [nb=10] - Length of the word list to generate.
   * @return {set} The word list.
   * @example
   * Generator.generate(3);
   * // returns: Set { 'home', 'coding', 'generator' }
   */
  genSet(nb = 10) {
    let _words = new Set();
    while (_words.size < nb) {
      _words.add(this.genWord());
    }
    return _words;
  }
  
  get export() {
    //return JSON.stringify([...this.stats]);
    return util.inspect(this.stats, true, null, false);
  }
}


/**
 * Find the next character of a word.
 * @private
 * @param {map} map - A map of probabilities.
 * @param {array} word - The array of preceding character of the current word.
 * @return {string} The next character.
 */
function findChar(map, word) {
  let _lastChar = word.splice(word.length-1,1);
  map = map.get(`${_lastChar}`);
  
  if (typeof map.values().next().value == 'number') {
    let _rand = Math.random();
    let _acc = 0;
    for (var [key, val] of map) {
      _acc += val;
      if (_rand <= _acc) {
        return key;
      }
    }
  } else {
    return findChar(map, word);
  }
}


/**
 * Normalize the map of probabilities for each character chain from 0 to 1.
 * This is used to normalize the probability of each character to appear after a specific chain of characters in a scale form 0 to 1 (float number) instead of random integers.
 * @private
 * @param {map} map - The map of probabilities.
 */
function normalize(map) {
  let _acc = 0;
  map.forEach((val, key) => {
    if (typeof val == 'number') {
      _acc += val;
    } else {
      let _map = map;
      _map = _map.get(`${key}`);
      normalize(_map);
    }
  });
  if (_acc > 0) {
    map.forEach((val, key) => {
      map.set(`${key}`, val/_acc);
    });
  }
}


/**
 * Increment probabilities of a character to appear after a specific chain of characters.
 * @private
 * @param {array} arr - The array of characters preceding the current character.
 * @param {map} map - The map of probabilities.
 * @param {string} char - The character to increment.
 */
function incStat(arr, map, char) {
  let _lastChar = arr.splice(arr.length-1,1);
  let _map = map.get(`${_lastChar}`);
  if (arr.length > 0) {
    incStat(arr, _map, char);
  } else {
    if (!_map.has(`${char}`)) {
      _map.set(`${char}`, 0);
    }
    _map.set(`${char}`, _map.get(`${char}`) + 1);
  }
}


/**
 * Generate the tree of probabilities for each substring passed in.
 * @private
 * @param {array} arr - The array of characters from the substring.
 * @param {map} map - A map of probabilities.
 * @param {set} chars - The set of all used chars.
 */
function genStats(arr, map, chars) {
  if (arr.length > 0) {
    let _char = arr.splice(arr.length-1,1);
    if (!map.has(`${_char}`)) {
      map.set(`${_char}`, new Map());
    }
    map = map.get(`${_char}`);
    genStats(arr, map, chars);
  }
}


module.exports = exports = Generator;
