import type { HTMLAttributes } from "react";
import type { GuessResult, LetterState } from "./alldle";



export function GuessRow({ guess, targetWord, animated = true, usePlaceholder = true }: { guess: GuessResult, targetWord: string, animated?: boolean, usePlaceholder?: boolean }) {
	return (
		<div className="guess-row">
			<LengthTile word={guess.word.trim()} targetWord={targetWord} animated={animated} />
			{guess.result.map((res, j) => (
				<Tile key={j} state={res} animated={animated}>
					{guess.word[j]}
				</Tile>
			))}
			{usePlaceholder && <Tile state="unused" animated={false} className="invisible" />}
		</div>
	);
}


export function LengthTile({ word, targetWord, animated = true }: { word: string, targetWord: string, animated?: boolean }) {
	let lengthMarker = null;
	let lengthTitle = '';
	if (word.length < targetWord.length) {
		lengthMarker = '>';
		lengthTitle = 'This word was too short.';
	} else if (word.length > targetWord.length) {
		lengthMarker = '<';
		lengthTitle = 'This word was too long.';
	}

	let lengthState: LetterState = 'unused';
	const diff = Math.abs(word.length - targetWord.length);
	if (diff == 0) {
		lengthState = 'correct';
	} else if (diff == 1) {
		lengthState = 'misplaced';
	} else {
		lengthState = 'absent';
	}

	return (
		<Tile state={lengthState} title={lengthTitle} className="length-tile" animated={animated}>
			{lengthMarker}
			{word.length}
		</Tile>
	);
}


export function Tile({ state, selectable = false, hasCursor = false, animated = true, className, ref, ...otherProps }: { state: LetterState, selectable?: boolean, hasCursor?: boolean, animated?: boolean, ref?: React.Ref<HTMLDivElement | null> } & HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			ref={ref}
			tabIndex={-1}
			className={`tile ${animated ? 'flip' : ''} ${hasCursor ? 'cursor' : ''} ${selectable ? 'selectable' : ''} ${className || ""}`}
			data-state={state}
			{...otherProps}
		/>
	);
}