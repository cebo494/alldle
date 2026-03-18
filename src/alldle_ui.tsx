import Keyboard from "./keyboard";
import { type GuessResult } from "./alldle";
import { useCallback, useEffect, useRef, useState } from "react";
import { GuessRow, Tile } from "./guess";


export interface AlldleProps {
	guesses: GuessResult[];
	targetWord: string;
	longestGuess: number;
	isValidWord: (word: string) => boolean;
	guess: (word: string) => void;
}

export default function AlldleUI({ guesses, targetWord, longestGuess, isValidWord, guess }: AlldleProps) {
	const [currentGuess, _setCurrentGuess] = useState('');
	const [cursor, setCursor] = useState(0);
	const [isGuessInvalid, setIsGuessInvalid] = useState(false);
	const guessLetterRefs = useRef<Record<number, HTMLElement>>({});
	const placeholderRef = useRef<HTMLDivElement | null>(null);
	const gridRef = useRef<HTMLDivElement | null>(null);

	const subscribeRef = useCallback((el: HTMLElement | null, index: number) => {
		if (el) {
			guessLetterRefs.current[index] = el
		}
		return () => {
			if (guessLetterRefs.current[index] === el) {
				delete guessLetterRefs.current[index]
			}
		}
	}, []);

	const setCurrentGuess = useCallback((newGuess: string) => {
		_setCurrentGuess(newGuess);
		setIsGuessInvalid(false);
	}, []);

	const typeLetter = useCallback((letter: string) => {
		setCurrentGuess((
			currentGuess.slice(0, cursor).padEnd(cursor, " ")
			+ letter
			+ currentGuess.slice(cursor + 1)
		).trimEnd());
		setCursor(cursor + 1);
	}, [currentGuess, cursor, setCurrentGuess, setCursor]);

	const backspace = useCallback(() => {
		if (cursor === currentGuess.length) {
			setCurrentGuess(currentGuess.slice(0, -1).trimEnd());
		} else {
			setCurrentGuess((
				currentGuess.slice(0, cursor - 1)
				+ " "
				+ currentGuess.slice(cursor)
			).trimEnd());
		}
		setCursor(Math.max(0, cursor - 1));
	}, [currentGuess, cursor, setCurrentGuess, setCursor]);

	const submitGuess = useCallback(() => {
		const trimmedGuess = currentGuess.trimEnd();
		if (isValidWord(trimmedGuess)) {
			guess(trimmedGuess);
			setCurrentGuess('');
			setCursor(0);
		} else {
			setIsGuessInvalid(true);
		}
	}, [currentGuess, isValidWord, guess, setCurrentGuess, setCursor]);

	const moveCursor = useCallback((offset: number) => {
		const newCursor = Math.max(0, cursor + offset);
		setCursor(newCursor);
	}, [cursor, setCursor]);

	const onKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			submitGuess();
			return;
		}

		if (e.key === 'Backspace') {
			if (e.ctrlKey || e.metaKey) {
				setCurrentGuess(
					currentGuess.slice(cursor)
						.padStart(currentGuess.length)
				);
				setCursor(0);
			} else {
				backspace();
			}
			return;
		}

		if (e.key === 'Delete') {
			if (e.ctrlKey || e.metaKey) {
				setCurrentGuess(
					currentGuess.slice(0, cursor)
				);
			} else {
				setCurrentGuess((
					currentGuess.slice(0, cursor)
					+ " "
					+ currentGuess.slice(cursor + 1)
				).trimEnd());
				setCursor(Math.max(0, cursor + 1));
			}
			return;
		}

		if (e.key.length === 1 && e.key.match(/[a-zA-Z ]/)) {
			typeLetter(e.key.toUpperCase());
			return;
		}

		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			moveCursor(-1);
			return;
		}

		if (e.key === 'ArrowRight') {
			e.preventDefault();
			moveCursor(1);
			return;
		}

		if (e.key === 'Home') {
			e.preventDefault();
			setCursor(0);
			return;
		}

		if (e.key === 'End') {
			e.preventDefault();
			setCursor(currentGuess.length);
			return;
		}
	}, [currentGuess, cursor, setCurrentGuess, submitGuess, backspace, typeLetter, moveCursor, setCursor]);

	// Init keyboard listener
	useEffect(() => {
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		}
	}, [onKeyDown]);

	// Auto Scroll
	useEffect(() => {
		const targetTile = cursor < currentGuess.length
			? guessLetterRefs.current[cursor]
			: placeholderRef.current;

		if (targetTile) {
			targetTile.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'end'
			});
		}
	}, [currentGuess, cursor]);

	const correctLetters = new Set<string>();
	const misplacedLetters = new Set<string>();
	const absentLetters = new Set<string>();
	for (const guess of guesses) {
		for (let i = 0; i < guess.word.length; i++) {
			if (guess.result[i] === 'correct') {
				correctLetters.add(guess.word[i]);
			} else if (guess.result[i] === 'misplaced') {
				misplacedLetters.add(guess.word[i]);
			} else {
				absentLetters.add(guess.word[i]);
			}
		}
	}

	const displayGuess = currentGuess.padEnd(Math.max(longestGuess, cursor));

	return (<>
		{(guesses.length === 0 && displayGuess.length === 0) && (
			<div>Guess a word</div>
		)}
		<div className="guess-grid" ref={gridRef}>
			{guesses.map((guess, index) => (
				<GuessRow guess={guess} targetWord={targetWord} key={index} />
			))}
			<div className="guess-row">
				<Tile state="unused" animated={false} className="length-tile">
					{/* Current instead of Display since we want to show the
							actual length of the word, not the number of tiles */}
					{currentGuess.length}
				</Tile>

				{displayGuess.split('').map((letter, index) => (
					<Tile
						key={index}
						state="unused"
						className={isGuessInvalid ? 'invalid' : ''}
						hasCursor={cursor === index}
						animated={false}
						ref={el => subscribeRef(el, index)}
						onClick={() => setCursor(index)}
						selectable={true}
					>
						{letter}
					</Tile>
				))}
				<Tile
					// Invisible tile representing the slot for the next letter
					ref={placeholderRef}
					state="unused"
					hasCursor={cursor === displayGuess.length}
					animated={false}
					className="invisible"
				/>
			</div>
		</div>
		<Keyboard
			correctLetters={correctLetters}
			misplacedLetters={misplacedLetters}
			absentLetters={absentLetters}
			typeLetter={typeLetter}
			deleteLetter={backspace}
			submitGuess={submitGuess}
			moveCursor={moveCursor}
		/>
	</>);
}

