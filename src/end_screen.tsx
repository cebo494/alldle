import type { GuessResult } from "./alldle";

export interface EndScreenProps {
	status: 'won' | 'lost',
	targetWord: string,
	guesses: GuessResult[],
	isHighContrast: boolean,
	onPlayAgain: () => void,
	onClose: () => void
}

export default function EndScreen({
	status,
	targetWord,
	guesses,
	isHighContrast,
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

	const generateEmojiGrid = () => {
		const padding = guesses.reduce((max, g) => Math.max(max, g.word.length), 0).toString().length;
		return guesses.map(g => {
			const emojiRow = g.result.map(res => {
				if (res === 'correct') return isHighContrast ? '🟧' : '🟩';
				if (res === 'misplaced') return isHighContrast ? '🟦' : '🟨';
				if (res === 'unused') return '◾';
				return '⬛';
			}).join('');
			return `[${g.word.length.toString().padStart(padding, ' ')}]${emojiRow}`;
		})
			.join('\n');
	};

	const emojiGrid = generateEmojiGrid();

	const copyToClipboard = () => {
		const text = `ALLDLE\n${status === 'won' ? `${score}pts` : `FF (${score}pts)`}\n${emojiGrid}`;
		navigator.clipboard.writeText(text);
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
					The word was: <span>{targetWord}</span>
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
						{emojiGrid}
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