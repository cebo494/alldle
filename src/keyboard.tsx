import type { LetterState } from "./alldle";


const KEYBOARD_LAYOUT = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
	['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
	['←', 'SPACE', '→'],
];

export type KeyboardProps = {
	correctLetters: Set<string>;
	misplacedLetters: Set<string>;
	absentLetters: Set<string>;
	typeLetter: (letter: string) => void;
	deleteLetter: () => void;
	submitGuess: () => void;
	moveCursor: (offset: number) => void;
}


export default function Keyboard({
	correctLetters,
	misplacedLetters,
	absentLetters,
	typeLetter,
	deleteLetter,
	submitGuess,
	moveCursor
}: KeyboardProps) {
	return (
		<div className="keyboard">
			{KEYBOARD_LAYOUT.map((row, i) => (
				<div key={i} className="keyboard-row">
					{row.map(key => {
						let className = "keyboard-key";
						let action;
						switch (key) {
							case 'ENTER':
								className += " wide";
								action = submitGuess;
								break;
							case 'BACKSPACE':
								className += " wide";
								action = deleteLetter;
								break;
							case 'SPACE':
								className += " extra-wide";
								action = () => typeLetter(' ');
								break;
							case '←':
								action = () => moveCursor(-1);
								break;
							case '→':
								action = () => moveCursor(1);
								break;
							default:
								action = () => typeLetter(key);
								break;
						}
						const onClick = (e: React.MouseEvent) => {
							(e.currentTarget as HTMLButtonElement).blur();
							action();
						}
						const state = getLetterState(key, correctLetters, misplacedLetters, absentLetters);
						return (
							<button
								key={key}
								className={className}
								data-state={state}
								onClick={onClick}
							>
								{key}
							</button>
						)
					})}
				</div>
			))}
		</div>
	);
}


function getLetterState(
	letter: string,
	correctLetters: Set<string>,
	misplacedLetters: Set<string>,
	absentLetters: Set<string>
): LetterState {
	if (correctLetters.has(letter)) {
		return 'correct';
	} else if (misplacedLetters.has(letter)) {
		return 'misplaced';
	} else if (absentLetters.has(letter)) {
		return 'unused';
	} else {
		return 'absent';
	}
	// Absent and Unused are intentially swapped so they use the right colors	
}