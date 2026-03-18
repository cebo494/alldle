import AlldleUI from "./alldle_ui";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Alldle, type GuessResult } from "./alldle";
import EndScreen from "./end_screen";
import { getLocalStorageValue, setLocalStorageValue, useLocalStorage } from "./storage";
import HowToPlay from "./how_to_play";
import './alldle.css'
import seedrandom from 'seedrandom';

const WORD_LIST_PATH = new URL('/cel_2-45.txt', import.meta.url).href;
const ANSWER_LIST_PATH = new URL('/lemmas.txt', import.meta.url).href;

async function fetchDictionary(): Promise<string[]> {
	const response = await fetch(WORD_LIST_PATH);
	const text = await response.text();
	return text.split('\n').map(word => word.trim().toUpperCase());
}

async function fetchPossibleAnswers(): Promise<string[]> {
	const response = await fetch(ANSWER_LIST_PATH);
	const text = await response.text();
	return text.split('\n').map(word => word.trim().toUpperCase());
}

function dateString(date: Date) {
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const day = date.getUTCDate();
	return `${year}-${month}-${day}`;
}

function getDailyWord(answers: string[]) {
	const seed = dateString(new Date());
	const rng = seedrandom(seed);
	return answers[Math.floor(rng() * answers.length)];
}

interface LoadState {
	lastPlayed: string;
	playing: boolean;
	targetWord: string;
	guesses: GuessResult[];
}

function setupGame(game: Alldle) {
	const loadState = getLocalStorageValue('alldle-load-state', '');
	const { lastPlayed, playing, targetWord, guesses } = loadState
		? (JSON.parse(loadState) as LoadState)
		: {
			lastPlayed: '',
			playing: false,
			targetWord: '',
			guesses: [],
		};

	// If they're in the middle of a game, load it.
	if (playing) {
		game.loadGame(targetWord, guesses);
		return;
	}

	// If they haven't played yet today, load the Daily
	const today = dateString(new Date());
	if (lastPlayed !== today) {
		game.loadGame(getDailyWord(game.answersList), []);
		game.seed = 'daily';
		return;
	}

	// Otherwise, use a random word
	game.reset();
}

export default function App() {
	const [game, setGame] = useState<Alldle | null>(null);

	useEffect(() => {
		const initGame = async () => {
			const [dictionary, possibleAnswers] = await Promise.all([
				fetchDictionary(),
				fetchPossibleAnswers()
			]);
			const game = new Alldle(dictionary, possibleAnswers);
			setupGame(game);

			setGame(game);
		}
		initGame();
	}, []);

	if (!game) {
		return <div>Loading...</div>;
	}

	return (
		<GameScreen game={game} />
	);
}

function GameScreen({ game }: { game: Alldle }) {
	const [gameStartedDate, setGameStartedDate] = useState(dateString(new Date()));
	const guesses = useSyncExternalStore(game.subscribe, () => game.guesses);
	const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
	const [showEndScreen, setShowEndScreen] = useState<'won' | 'lost' | null>(null);
	const highContrastState = useLocalStorage('isHighContrast', 'false');
	const [isHighContrast, setIsHighContrast] = [
		highContrastState[0] === 'true',
		(value: boolean) => highContrastState[1](value.toString())
	];

	const guess = useCallback((word: string) => {
		game.guess(word);
		const isWin = game.isWin();
		if (isWin) {
			setStatus('won');
		}
		setLocalStorageValue('alldle-load-state', JSON.stringify({
			lastPlayed: gameStartedDate,
			playing: !isWin,
			targetWord: game.targetWord,
			guesses: game.guesses
		}));
	}, [game, gameStartedDate]);

	const resetGame = () => {
		setStatus('playing');
		setShowEndScreen(null);
		game.reset();
		const newDate = dateString(new Date());
		setGameStartedDate(newDate);
		setLocalStorageValue('alldle-load-state', JSON.stringify({
			lastPlayed: newDate,
			playing: true,
			targetWord: game.targetWord,
			guesses: game.guesses
		}));
	}

	useEffect(() => {
		if (status === 'won') {
			setTimeout(() => setShowEndScreen(status), 500);
		}
	}, [status]);

	return (
		<div className={`game-container ${isHighContrast ? 'high-contrast' : ''}`}>
			<HeaderBar
				status={status}
				isHighContrast={isHighContrast}
				seed={game.seed}
				setStatus={setStatus}
				setShowEndScreen={setShowEndScreen}
				resetGame={resetGame}
				setIsHighContrast={setIsHighContrast}
			/>
			<AlldleUI
				guesses={guesses}
				targetWord={game.targetWord}
				longestGuess={game.longestGuess}
				isValidWord={game.isValidWord}
				guess={guess}
			/>
			{showEndScreen && (
				<EndScreen
					status={showEndScreen}
					targetWord={game.targetWord}
					guesses={guesses}
					isHighContrast={isHighContrast}
					seed={game.seed}
					onPlayAgain={resetGame}
					onClose={() => setShowEndScreen(null)}
				/>
			)}
		</div>
	);
}

function HeaderBar({
	status,
	isHighContrast,
	seed,
	setStatus,
	setShowEndScreen,
	resetGame,
	setIsHighContrast
}: {
	status: 'playing' | 'won' | 'lost',
	isHighContrast: boolean,
	seed: string,
	setStatus: (status: 'playing' | 'won' | 'lost') => void,
	setShowEndScreen: (status: 'won' | 'lost' | null) => void,
	resetGame: () => void,
	setIsHighContrast: (isHighContrast: boolean) => void
}) {
	const [showPopup, setShowPopup] = useState('');

	return (
		<div className="header">
			<div className="game-title">
				<span>ALL</span>
				<span>DLE</span>
			</div>
			{seed === 'daily' && (
				<div className="daily-badge">
					Daily Word
				</div>
			)}
			<div className="btn-group">
				{status === "playing"
					? (
						<button
							className="action-btn"
							onClick={() => {
								setStatus('lost');
								setShowEndScreen('lost');
							}}
						>
							Forfeit
						</button>
					)
					: (
						<>
							<button
								className="action-btn"
								onClick={() => setShowEndScreen(status)}
							>
								Stats
							</button>
							<button
								className="action-btn"
								onClick={resetGame}
							>
								Play Again
							</button>
						</>
					)
				}
				<button
					className="action-btn"
					onClick={() => setShowPopup('how to play')}
				>
					How to Play
				</button>
				<button
					className="action-btn"
					onClick={() => setIsHighContrast(!isHighContrast)}
				>
					Colors
					<div className="color-swatch" data-state="correct"></div>
					<div className="color-swatch" data-state="misplaced"></div>
				</button>
			</div>
			{showPopup === 'how to play' && (
				<HowToPlay onClose={() => setShowPopup('')} />
			)}
		</div>
	)
}