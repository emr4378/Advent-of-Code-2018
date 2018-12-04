// https://adventofcode.com/2018/day/3

class AreaClaim
{
	private _id: number;
	private _x: number;
	private _y: number;
	private _width: number;
	private _height: number;
	private _isIntact: boolean;

	get id(): number { return this._id; }
	get x(): number { return this._x; }
	get y(): number { return this._y; }
	get width(): number { return this._width; }
	get height(): number { return this._height; }

	get isIntact(): boolean { return this._isIntact; }
	set isIntact(isIntact: boolean) { this._isIntact = isIntact; }

	constructor(id: number, x: number, y: number, width: number, height: number)
	{
		this._id = id;
		this._x = x;
		this._y = y;
		this._width = width;
		this._height = height;
		this._isIntact = true;
	}

	toString(): string
	{
		return `#${this._id} @ ${this.x},${this.y}: ${this.width}x${this.height}`;
	}

	static fromString(s: string): AreaClaim
	{
		const matchArray = s.match(/#(\d+?) @ (\d+?),(\d+?): (\d+?)x(\d+)/);
		return new AreaClaim(
			parseInt(matchArray[1]),
			parseInt(matchArray[2]),
			parseInt(matchArray[3]),
			parseInt(matchArray[4]),
			parseInt(matchArray[5]));
	}
};

class FabricUnit
{
	claimingIds: number[];

	constructor()
	{
		this.claimingIds = [];
	}
}

window.onload = () =>
{
	(document.getElementById("fileInput") as HTMLInputElement).addEventListener("change",
		(e: Event): void =>
		{
			const inputFile = (e.srcElement as HTMLInputElement).files[0];
			const fileReader = new FileReader();

			fileReader.addEventListener("load",
				(): void =>
				{
					// Initialize the 2d-array representing the fabric
					const fabricUnits: FabricUnit[][] = [];
					for (let row = 0; row < 1000; row++)
					{
						fabricUnits[row] = [];
						for (let col = 0; col < 1000; col++)
						{
							fabricUnits[row][col] = new FabricUnit();
						}
					}

					// Parse the input file into an array of AreaClaims
					const areaClaims = (fileReader.result as string)
						.split("\n")
						.filter((s: string): boolean => s !== "")
						.map(AreaClaim.fromString);

					// Apply every AreaClaim to the fabric
					areaClaims.forEach((areaClaim: AreaClaim) =>
					{
						for (let y = areaClaim.y; y < areaClaim.y + areaClaim.height; y++)
						{
							for (let x = areaClaim.x; x < areaClaim.x + areaClaim.width; x++)
							{
								fabricUnits[y][x].claimingIds.push(areaClaim.id);
							}
						}
					});

					// Calculate how many total fabric units are overlapping (part 1) and which area claims remain intact (part 2)
					let numberOfOverlappingUnits = 0;
					for (let row = 0; row < 1000; row++)
					{
						for (let col = 0; col < 1000; col++)
						{
							if (fabricUnits[row][col].claimingIds.length > 1)
							{
								numberOfOverlappingUnits++;

								for (let idIndex = 0;
									idIndex < fabricUnits[row][col].claimingIds.length;
									idIndex++)
								{
									const areaClaimId = fabricUnits[row][col].claimingIds[idIndex];
									const areaClaimIndex = areaClaimId - 1;
									areaClaims[areaClaimIndex].isIntact = false;
								}
							}
						}
					}

					const intactClaimIdsString = areaClaims
						.filter((areaClaim: AreaClaim): boolean => { return areaClaim.isIntact; })
						.map((areaClaim: AreaClaim): number => { return areaClaim.id; })
						.toString();

					// Spit out the answers
					(document.getElementById("part1Answer") as HTMLDivElement).textContent =
						`The number of square inches of fabric within two or more claims is: ${numberOfOverlappingUnits
						}`;
					(document.getElementById("part2Answer") as HTMLDivElement).textContent =
						`The IDs of claims that don't overlap are: ${intactClaimIdsString}`;
				});
			fileReader.readAsText(inputFile);
		});
};
