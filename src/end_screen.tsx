import { dateString, type GuessResult } from "./alldle";

export interface EndScreenProps {
	status: 'won' | 'lost',
	targetWord: string,
	guesses: GuessResult[],
	isHighContrast: boolean,
	seed: string,
	onPlayAgain: () => void,
	onClose: () => void
}

export default function EndScreen({
	status,
	targetWord,
	guesses,
	isHighContrast,
	seed,
	onPlayAgain,
	onClose
}: EndScreenProps) {
	const calculateScore = () => {
		let score = 0;
		for (const guess of guesses) {
			score += guess.result.length + 1;
		}
		return score;
	}
	// const score = status === 'won' ? calculateScore() : 'N/A';
	const score = calculateScore();

	const createGameSummary = () => {
		const padding = guesses.reduce((max, g) => Math.max(max, g.word.length), 0).toString().length;
		const guessGrid = guesses.map(g => {
			const emojiRow = g.result.map(res => {
				if (res === 'correct') return isHighContrast ? '🟧' : '🟩';
				if (res === 'misplaced') return isHighContrast ? '🟦' : '🟨';
				if (res === 'unused') return '◾';
				return '⬛';
			}).join('');
			return `[${g.word.length.toString().padStart(padding, ' ')}]${emojiRow}`;
		})
			.join('\n');

		return (
			"ALLDLE"
			+ (seed === 'daily' ? (" Daily " + dateString(new Date())) : ` `)
			+ "\n"
			+ (status === 'won' ? `${score} Tiles` : `FF (${score} Tiles)`)
			+ "\n"
			+ guessGrid
			+ "\n"
			+ "https://cebo494.github.io/alldle/"
		);
	};

	const summary = createGameSummary();

	const copyToClipboard = () => {
		navigator.clipboard.writeText(summary);
		alert('Copied to clipboard!');
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content end-screen" onClick={e => e.stopPropagation()}>
				<h2 className={`modal-title ${status}`}>
					{status === 'won'
						? (guesses.length === 1 ? "PERFECT!" : 'You Win!')
						: 'Forfeited'
					}
				</h2>

				<div className="target-word">
					{seed === 'daily' ? "The Word of the Day was:" : 'The word was:'} <span>{targetWord}</span>
				</div>

				<div className="stats">
					<div className="stat-item">
						<span className="stat-value">{guesses.length}</span>
						<span className="stat-label">Guesses</span>
					</div>
					<div className="stat-item">
						<span className="stat-value">{score}</span>
						<span className="stat-label">Score</span>
					</div>
				</div>

				<div className="emoji-copy-container">
					<div>
						{summary}
					</div>
				</div>

				<div className="btn-group">
					<button className="action-btn primary" onClick={onPlayAgain}>
						Play Again
					</button>
					<button className="action-btn" onClick={onClose}>
						Close
					</button>
					<button className="action-btn" onClick={copyToClipboard}>
						Copy
					</button>
				</div>
			</div>
		</div>
	);
}