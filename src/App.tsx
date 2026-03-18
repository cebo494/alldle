import AlldleUI from "./alldle_ui";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Alldle, type GuessResult } from "./alldle";
import EndScreen from "./end_screen";
import { getLocalStorageValue, setLocalStorageValue, useLocalStorage } from "./storage";
import HowToPlay from "./how_to_play";
import './alldle.css'
import seedrandom from 'seedrandom';

const WORD_LIST_PATH = '/cel_2-45.txt';
const ANSWER_LIST_PATH = '/lemmas.txt';

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
			guesses: []
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
		game.isDaily = true;
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
	const [date, setDate] = useState(dateString(new Date()));
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
			lastPlayed: date,
			playing: !isWin,
			targetWord: game.targetWord,
			guesses: game.guesses
		}));
	}, [game, date]);

	const resetGame = () => {
		setShowEndScreen(null);
		game.reset();
		setStatus('playing');
		const newDate = dateString(new Date());
		setDate(newDate);
		setLocalStorageValue('alldle-load-state', JSON.stringify({
			lastPlayed: newDate,
			playing: true,
			targetWord: game.targetWord,
			guesses: game.guesses
		}));
	}

	useEffect(() => {
		if (status !== 'playing') {
			setTimeout(() => setShowEndScreen(status), 1000);
		}
	}, [status]);

	return (
		<div className={`game-container ${isHighContrast ? 'high-contrast' : ''}`}>
			<HeaderBar
				status={status}
				setStatus={setStatus}
				setShowEndScreen={setShowEndScreen}
				resetGame={resetGame}
				isHighContrast={isHighContrast}
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
					onPlayAgain={resetGame}
					onClose={() => setShowEndScreen(null)}
				/>
			)}
		</div>
	);
}

function HeaderBar({
	status,
	setStatus,
	setShowEndScreen,
	resetGame,
	isHighContrast,
	setIsHighContrast
}: {
	status: 'playing' | 'won' | 'lost',
	setStatus: (status: 'playing' | 'won' | 'lost') => void,
	setShowEndScreen: (status: 'won' | 'lost' | null) => void,
	resetGame: () => void,
	isHighContrast: boolean,
	setIsHighContrast: (isHighContrast: boolean) => void
}) {
	const [showHelp, setShowHelp] = useState(false);

	return (
		<div className="header">
			<div className="game-title">
				<span>ALL</span>
				<span>DLE</span>
			</div>
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
					onClick={() => setShowHelp(true)}
				>
					How to Play
				</button>
				{showHelp && (
					<HowToPlay onClose={() => setShowHelp(false)} />
				)}
				<button
					className="action-btn"
					onClick={() => setIsHighContrast(!isHighContrast)}
				>
					Colors
					<div className="color-swatch" data-state="correct"></div>
					<div className="color-swatch" data-state="misplaced"></div>
				</button>
			</div>
		</div>
	)
}