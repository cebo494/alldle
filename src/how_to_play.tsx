import { Tile, LengthTile, GuessRow } from "./guess";

export default function HowToPlay({ onClose }: { onClose: () => void }) {
	return (
		<div className="modal-overlay" onClick={onClose} >
			<div className="modal-content how-to-play" onClick={e => e.stopPropagation()}>
				<div>
					<div className="modal-title">
						How to Play
					</div>
					<p>
						Your goal is to guess the target word.
						You have as many guesses as it takes.
					</p>
					<p>
						Each time you guess, it will reveal which letters from your guess were correct
						and whether your word was shorter or longer than the target.
					</p>
					<p>The goal is to get the lowest score possible. You get 1 point per Tile.</p>
					<ul>
						<li>Every guess gives 1 point for the length tile</li>
						<li>Each letter used gives an additional 1 point</li>
						<li>
							A guess cannot give fewer points than a previous guess.
							After guessing a long word, guessing a short word after won't
							help your score.
						</li>
					</ul>
				</div>

				<div>
					<h2>Letter Tiles</h2>
					<dl>
						<dd><Tile state="correct" animated={false}>A</Tile>
						</dd>
						<dt>
							This letter is in the target word and in the correct position.
						</dt>
						<dd><Tile state="misplaced" animated={false}>A</Tile></dd>
						<dt>
							This letter is in the target word but in the wrong position.
						</dt>
						<dd><Tile state="absent" animated={false}>A</Tile></dd>
						<dt>
							This letter is not in the target word.
						</dt>
					</dl>
				</div>

				<div>
					<h2>Length Tiles</h2>
					<dl>
						<dd><LengthTile word="table" targetWord="table" /></dd>
						<dt>
							The word has the correct length.
						</dt>
						<dd><LengthTile word="cat" targetWord="tables" /></dd>
						<dt>
							The word is too short.
						</dt>
						<dd><LengthTile word="lengthy" targetWord="table" /></dd>
						<dt>
							The word is too long.
						</dt>
						<dd><LengthTile word="tablet" targetWord="table" /></dd>
						<dt>
							The word is 1 letter too long.
						</dt>
						<dd><LengthTile word="four" targetWord="table" /></dd>
						<dt>
							The word is 1 letter too short.
						</dt>
					</dl>
				</div>

				<div>
					<div>
						<h2>Examples</h2>
						<p>If the target word is:</p>
						<GuessRow
							guess={{
								word: "TABLE",
								result: ["correct", "correct", "correct", "correct", "correct"],
							}}
							targetWord="TABLE"
							animated={false}
							usePlaceholder={false}
						/>
					</div>

					<div className="example">
						<GuessRow
							guess={{
								word: "CAR",
								result: ["absent", "correct", "absent"],
							}}
							targetWord="TABLE"
							animated={false}
							usePlaceholder={false}
						/>
						<p style={{ marginBottom: "1rem" }}>The "A" is correct and the guess is too short.</p>
					</div>

					<div className="example">
						<GuessRow
							guess={{
								word: "LENGTH",
								result: ["misplaced", "misplaced", "absent", "absent", "misplaced", "absent"],
							}}
							targetWord="TABLE"
							animated={false}
							usePlaceholder={false}
						/>
						<p>
							"L", "E", and "Y" are in the target word but in the wrong positions
							and the guess is 1 letter too long.
						</p>
					</div>

					<div className="example">
						<div className="guess-grid" style={{ padding: 0 }}>
							<GuessRow
								guess={{
									word: "CUT",
									result: ["absent", "absent", "misplaced"],
								}}
								targetWord="TABLE"
								animated={false}
								usePlaceholder={false}
							/>
							<GuessRow
								guess={{
									word: "LENGTH",
									result: ["misplaced", "misplaced", "absent", "absent", "misplaced", "absent"],
								}}
								targetWord="TABLE"
								animated={false}
								usePlaceholder={false}
							/>
							<GuessRow
								guess={{
									word: "TABLE",
									result: ["correct", "correct", "correct", "correct", "correct", "unused"],
								}}
								targetWord="TABLE"
								animated={false}
								usePlaceholder={false}
							/>
						</div>
						<p>
							After guessing a long word, shorter words still use the same number of tiles
							and give the same number of points. Early short words are unaffected.
						</p>
					</div>
				</div>

				<button className="action-btn" style={{ width: "100%", justifyContent: 'center' }} onClick={onClose}>Close</button>
			</div>
		</div>
	)
}
