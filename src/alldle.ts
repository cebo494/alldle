
let doLogging = false;
console.log(
	'To enable logging, type "toggleLogging()"\n',
	"WARNING: This will reveal the answer when you start a new game! Don't Cheat!",
);
declare global {
	function toggleLogging(): void;
}
globalThis.toggleLogging = () => {
	doLogging = !doLogging;
	console.log(`Logging: ${doLogging}`);
}
function log(message: string) {
	if (doLogging) {
		console.log(message);
	}
}

export type LetterState = 'correct' | 'misplaced' | 'absent' | 'unused';

export interface GuessResult {
	word: string;
	result: LetterState[];
}

export class Alldle {
	private listeners = new Set<() => void>();

	public wordList: string[];
	public answersList: string[];

	public targetWord: string;
	public guesses: GuessResult[];
	public longestGuess: number;
	public seed: string;

	constructor(wordList: string[], answersList: string[]) {
		this.wordList = wordList;
		this.answersList = answersList;
		this.targetWord = "";
		this.guesses = [];
		this.longestGuess = 0;
		this.seed = "";

		this.subscribe = this.subscribe.bind(this);
		this.emitChange = this.emitChange.bind(this);
		this.loadGame = this.loadGame.bind(this);
		this.reset = this.reset.bind(this);
		this.isValidWord = this.isValidWord.bind(this);
		this.guess = this.guess.bind(this);
		this.isWin = this.isWin.bind(this);
		this.evaluateWord = this.evaluateWord.bind(this);
	}

	public subscribe(callback: () => void) {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		}
	}

	private emitChange() {
		this.listeners.forEach(callback => callback());
	}

	public loadGame(targetWord: string, guesses: GuessResult[]) {
		this.targetWord = targetWord;
		this.guesses = guesses;
		this.longestGuess = guesses.reduce((max, guess) => Math.max(max, guess.word.length), 0);
		log(`Loaded Target Word: ${this.targetWord}`);
		this.emitChange();
	}

	public reset() {
		const seed = Math.random();
		this.targetWord = this.answersList[Math.floor(seed * this.answersList.length)];
		this.seed = seed.toString();
		this.longestGuess = 0;
		this.guesses = [];
		log(`Target Word: ${this.targetWord}`);
		this.emitChange();
	}

	public isValidWord(word: string): boolean {
		const isValid = this.wordList.includes(word);
		if (!isValid) {
			log(`"${word}" is not a valid word`);
		}
		return isValid;
	}

	public guess(word: string): GuessResult {
		log(`Guessing "${word}"`);
		const result = this.evaluateWord(word);
		log(`Result: ${result.result.map(r => {
			switch (r) {
				case 'correct':
					return 'C';
				case 'misplaced':
					return 'M';
				case 'absent':
					return 'A';
				case 'unused':
					return '_';
			}
		}).join('')}`);

		if (word.length > this.longestGuess) {
			this.longestGuess = word.length;
		}

		this.guesses = [...this.guesses, result];
		this.emitChange();

		return result;
	}

	public isWin(): boolean {
		return this.guesses.length > 0 && this.guesses[this.guesses.length - 1].word === this.targetWord;
	}

	private evaluateWord(word: string): GuessResult {
		const letters: LetterState[] = Array(Math.max(word.length, this.longestGuess)).fill('unused');
		const consumed: boolean[] = new Array(this.targetWord.length).fill(false);
		// Check for correct letters first
		for (let i = 0; i < word.length; i++) {
			if (word[i] === this.targetWord[i]) {
				letters[i] = 'correct';
				consumed[i] = true;
			}
		}
		// Check for misplaced and absent after
		for (let i = 0; i < word.length; i++) {
			if (letters[i] === 'unused') {
				for (let j = 0; j < this.targetWord.length; j++) {
					if (j == i) continue;
					if (consumed[j]) continue;

					if (word[i] === this.targetWord[j]) {
						letters[i] = 'misplaced';
						consumed[j] = true;
						break;
					}
				}
				if (letters[i] === 'unused') {
					letters[i] = 'absent';
				}
			}
		}

		const result: GuessResult = { word, result: letters };
		return result;
	}

}