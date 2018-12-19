// https://adventofcode.com/2018/day/8

class TreeNode
{
	children: TreeNode[];
	metadata: number[];

	constructor()
	{
		this.children = [];
		this.metadata = [];
	}

	static fromDataArray(dataArray: number[]): TreeNode
	{
		const childCount = dataArray[0];
		const metadataCount = dataArray[1];
		const node = new TreeNode();

		let dataStartIndex = 2;
		for (let _ = 0; _ < childCount; _++)
		{
			const childNode = TreeNode.fromDataArray(dataArray.slice(dataStartIndex));

			node.children.push(childNode);
			dataStartIndex += childNode.asDataArray().length;
		}

		node.metadata = node.metadata.concat(dataArray.slice(dataStartIndex, dataStartIndex + metadataCount));

		return node;
	}

	asDataArray(): number[]
	{
		let result = [this.children.length, this.metadata.length];
		for (let child of this.children)
		{
			result = result.concat(child.asDataArray());
		}
		return result.concat(this.metadata);
	}

	// (Part 1) Recursively sums of all metadata entries on this node and every child of it.
	sum(): number
	{
		let result = this.metadata.reduce((a, b) => a + b, 0);
		for (let child of this.children)
		{
			result += child.sum();
		}
		return result;
	}

	// (Part 2) Finds the value of this node by following 2 rules:
	// - If this node has no children, the value is the sum of it's metadata entries.
	// - If this node has children, the value is the sum of the values of it's children
	//   as indexed by it's metadata entries (recursive).
	value(): number
	{
		let result = 0;
		if (this.children.length === 0)
		{
			result = this.metadata.reduce((a, b) => a + b, 0);
		}
		else
		{
			for (let childIndex of this.metadata)
			{
				childIndex -= 1;
				if (childIndex >= 0 && childIndex < this.children.length)
				{
					result += this.children[childIndex].value();
				}
			}
		}
		return result;
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
					const dataArray = (fileReader.result as string)
						.split(" ")
						.map(data => parseInt(data));
					const rootNode = TreeNode.fromDataArray(dataArray);
					const rootNodeSum = rootNode.sum();
					const rootNodeValue = rootNode.value();

					// Spit out the answers
					(document.getElementById("part1Answer") as HTMLDivElement).textContent =
						`The sum of all metadata entries is: ${rootNodeSum}`;
					(document.getElementById("part2Answer") as HTMLDivElement).textContent =
						`The value of the root node is: ${rootNodeValue}`;
				});
			fileReader.readAsText(inputFile);
		});
};
