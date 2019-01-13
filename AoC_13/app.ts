// https://adventofcode.com/2018/day/13

enum TrackType
{
	StraightVertical,
	StraightHorizontal,
	CurveForward,
	CurveBackward,
	Intersection,
	Empty
}
const kTrackTypeCount = Object.keys(TrackType).length;
const kTrackTypeStrings = ["|", "-", "/", "\\", "+", " "];

enum CartDirection
{
	Up,
	Right,
	Down,
	Left
}
const kCartDirectionCount = Object.keys(CartDirection).length;
const kCartDirectionStrings = ["^", ">", "v", "<"];

enum IntersectionTurnOrder
{
	Left,
	Straight,
	Right
}
const kIntersectionTurnOrderCount = Object.keys(IntersectionTurnOrder).length;

class Cart
{
	x: number;
	y: number;
	direction: CartDirection;
	nextTurn: IntersectionTurnOrder = IntersectionTurnOrder.Left;
	isCrashed: boolean;

	tick(track: TrackType[][], carts: Cart[]): void
	{
		if (!this.isCrashed)
		{
			// Move
			if (this.direction === CartDirection.Up) this.y -= 1;
			else if (this.direction === CartDirection.Right) this.x += 1;
			else if (this.direction === CartDirection.Down) this.y += 1;
			else if (this.direction === CartDirection.Left) this.x -= 1;
			else throw "Invalid direction";

			// Turn
			switch (track[this.y][this.x])
			{
				case TrackType.CurveForward:
					if (this.direction === CartDirection.Up) this.direction = CartDirection.Right;
					else if (this.direction === CartDirection.Right) this.direction = CartDirection.Up;
					else if (this.direction === CartDirection.Down) this.direction = CartDirection.Left;
					else if (this.direction === CartDirection.Left) this.direction = CartDirection.Down;
					break;

				case TrackType.CurveBackward:
					if (this.direction === CartDirection.Up) this.direction = CartDirection.Left;
					else if (this.direction === CartDirection.Right) this.direction = CartDirection.Down;
					else if (this.direction === CartDirection.Down) this.direction = CartDirection.Right;
					else if (this.direction === CartDirection.Left) this.direction = CartDirection.Up;
					break;

				case TrackType.Intersection:
					if (this.nextTurn === IntersectionTurnOrder.Left) this.direction -= 1;
					else if (this.nextTurn === IntersectionTurnOrder.Right) this.direction += 1;
					else if (this.nextTurn !== IntersectionTurnOrder.Straight) throw "Invalid nextTurn";

					this.direction = (this.direction + kCartDirectionCount) % (kCartDirectionCount / 2);
					this.nextTurn = (this.nextTurn + 1) % (kIntersectionTurnOrderCount / 2);
					break;
			}

			// Check for crashes (ignoring carts that have already crashed since the elves immediately remove them)
			for (let otherCartIndex = 0; otherCartIndex < carts.length && !this.isCrashed; otherCartIndex++)
			{
				const otherCart = carts[otherCartIndex];
				if (otherCart !== this && !otherCart.isCrashed &&
					otherCart.x === this.x && otherCart.y === this.y)
				{
					this.isCrashed = true;
					otherCart.isCrashed = true;
				}
			}
		}
	}
}

function compareCarts(a: Cart, b: Cart): number
{
	let result = a.y - b.y;
	if (result === 0)
	{
		result = a.x - b.x;
	}
	return result;
}

function getTrackTypeForString(str: string): TrackType
{
	return kTrackTypeStrings.indexOf(str);
}

function getStringForTrackType(track: TrackType): string
{
	return kTrackTypeStrings[track];
}

function getCartDirectionForString(str: string): CartDirection
{
	return kCartDirectionStrings.indexOf(str);
}

function getStringForCartDirection(cartDirection: CartDirection): string
{
	return kCartDirectionStrings[cartDirection];
}

function getTrackTypeForCartDirection(cartDirection: CartDirection): TrackType
{
	let result: TrackType = undefined;
	switch (cartDirection)
	{
		case CartDirection.Up:
		case CartDirection.Down:
			result = TrackType.StraightVertical;
			break;

		case CartDirection.Left:
		case CartDirection.Right:
			result = TrackType.StraightHorizontal;
			break;
	}
	return result;
}

function getStringForTrackCell(track: TrackType[][], carts: Cart[], rowIndex : number, colIndex : number) : string
{
	const cart = carts.find(c => c.x === colIndex && c.y === rowIndex);
	return (cart !== undefined && cart !== null)
		? getStringForCartDirection(cart.direction)
		: getStringForTrackType(track[rowIndex][colIndex]);
}

function getStringForTrackRow(track: TrackType[][], carts: Cart[], rowIndex: number): string
{
	return track[rowIndex]
		.map((_, colIndex) => getStringForTrackCell(track, carts, rowIndex, colIndex))
		.join("");
}

function render(track: TrackType[][], carts: Cart[], textArea: HTMLTextAreaElement): void
{
	textArea.innerHTML = track
		.map((_, rowIndex) => getStringForTrackRow(track, carts, rowIndex))
		.join("&#13;&#10;");
	textArea.rows = track.length;
	textArea.cols = track[0].length;
	textArea.style.width = textArea.cols + "ch";
	textArea.style.visibility = "visible";
}

function tick(track: TrackType[][], carts: Cart[]): void
{
	carts = carts.sort(compareCarts);
	carts.forEach(c => c.tick(track, carts));
}

function updateFunction(track: TrackType[][], carts: Cart[], textArea: HTMLTextAreaElement): void
{
	tick(track, carts);
	carts = carts.filter(c => !c.isCrashed);
	render(track, carts, textArea);
}

window.onload = () =>
{
	const updateLoopInput = document.getElementById("updateLoopInput") as HTMLInputElement;
	const fileInput = document.getElementById("fileInput") as HTMLInputElement;
	const mapTextArea = document.getElementById("mapTextArea") as HTMLTextAreaElement;
	const part1AnswerDiv = document.getElementById("part1AnswerDiv") as HTMLDivElement;
	const part2AnswerDiv = document.getElementById("part2AnswerDiv") as HTMLDivElement;
	let updateHandleId: number = undefined;

	fileInput.addEventListener("change",
		(e: Event): void =>
		{
			const isUsingUpdateLoop = updateLoopInput.checked;
			const inputFile = (e.srcElement as HTMLInputElement).files[0];
			const fileReader = new FileReader();

			fileReader.addEventListener("load",
				(): void =>
				{
					const dataArray = (fileReader.result as string).split("\n");

					// Parse the input file into a 2d map of the track and a list of carts.
					const track: TrackType[][] = [];
					let carts: Cart[] = [];
					for (let y = 0; y < dataArray.length; y++)
					{
						track[y] = [];

						for (let x = 0; x < dataArray[y].length; x++)
						{
							const char = dataArray[y][x];

							let trackType: TrackType;
							const cartDirection = getCartDirectionForString(char);
							if (cartDirection !== -1)
							{
								const cart = new Cart();
								cart.x = x;
								cart.y = y;
								cart.direction = cartDirection;
								carts.push(cart);

								trackType = getTrackTypeForCartDirection(cartDirection);
							}
							else
							{
								trackType = getTrackTypeForString(char);
							}

							if (trackType !== -1)
							{
								track[y][x] = trackType;
							}
						}
					}

					if (isUsingUpdateLoop)
					{
						// (For fun) Tick the carts at a set interval and render the current state to a textarea.
						render(track, carts, mapTextArea);
						updateHandleId = setInterval(updateFunction, 100, track, carts, mapTextArea);
					}
					else
					{
						// (Part 1) Tick the carts until a collision occurs.
						let firstCollisionPosition: [number, number] = undefined;
						while (firstCollisionPosition === undefined)
						{
							tick(track, carts);

							const firstCrashedCart = carts.find(c => c.isCrashed);
							if (firstCrashedCart !== undefined && firstCrashedCart !== null)
							{
								firstCollisionPosition = [firstCrashedCart.x, firstCrashedCart.y];
							}
						}

						part1AnswerDiv.innerHTML =
							`(Part 1) The location of the first crash is: (${firstCollisionPosition})`;

						// (Part 2) Tick the carts, removing carts that have collided, until only 1 remains.
						if (carts.length % 2 === 1)
						{
							carts = carts.filter(c => !c.isCrashed);
							while (carts.length > 1)
							{
								tick(track, carts);
								carts = carts.filter(c => !c.isCrashed);
							}
							const lastRemainingCartPosition = [carts[0].x, carts[0].y];

							part2AnswerDiv.innerHTML =
								`(Part 2) The location of the last remaining cart is: (${lastRemainingCartPosition})`;
						}
						else
						{
							part2AnswerDiv.innerHTML = "(Part 2) The location of the last remaining cart is: N/A";
						}
					}
				});

			if (updateHandleId !== undefined)
			{
				clearInterval(updateHandleId);
			}
			part1AnswerDiv.innerHTML = "";
			part2AnswerDiv.innerHTML = "";
			mapTextArea.innerHTML = "";
			mapTextArea.style.visibility = "hidden";
			fileReader.readAsText(inputFile);
		});
};