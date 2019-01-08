// https://adventofcode.com/2018/day/11

#include <iostream>

#define POWER_GRID_DIMENSION 300
typedef int SummedAreaTable[POWER_GRID_DIMENSION+1][POWER_GRID_DIMENSION+1];

int calculateCellPowerLevel(int x, int y, int serialNumber)
{
	int rackID = x + 10;						// 1) Find the fuel cell's rack ID, which is its X coordinate plus 10.
	int powerLevel = rackID * y;				// 2) Begin with a power level of the rack ID times the Y coordinate.
	powerLevel += serialNumber;					// 3) Increase the power level by the value of the grid serial number.
	powerLevel *= rackID;						// 4) Set the power level to itself multiplied by the rack ID.
	powerLevel = (abs(powerLevel) / 100) % 10;	// 5) Keep only the hundreds digit of the power level
	powerLevel -= 5;							// 6) Subtract 5 from the power level.
	return powerLevel;
}

// https://en.wikipedia.org/wiki/Summed-area_table
// http://apurvsaxena.blogspot.com/2012/06/summed-area-table.html
// https://www.seas.upenn.edu/~cis565/Lectures2011/Lecture15_SAT.pdf
void populateSummedAreaTable(int serialNumber, SummedAreaTable* outSummedAreaTable)
{
	memset(*outSummedAreaTable, 0, sizeof(int) * (POWER_GRID_DIMENSION + 1) * (POWER_GRID_DIMENSION + 1));

	for (int y = 1; y <= POWER_GRID_DIMENSION; y++)
	{
		for (int x = 1; x <= POWER_GRID_DIMENSION; x++)
		{
			(*outSummedAreaTable)[y][x] =
				calculateCellPowerLevel(x, y, serialNumber)
				+ (*outSummedAreaTable)[y-1][x]
				+ (*outSummedAreaTable)[y][x-1]
				- (*outSummedAreaTable)[y-1][x-1];
		}
	}
}

int calculateSquarePowerLevel(const SummedAreaTable* summedAreaTable, int x, int y, int size)
{
	// Subtract 1 from the X/Y here so the summed areas we're removing don't include the given top-left X/Y.
	x -= 1;
	y -= 1;

	return
		(*summedAreaTable)[y+size][x+size]
		- (*summedAreaTable)[y+size][x]
		- (*summedAreaTable)[y][x+size]
		+ (*summedAreaTable)[y][x];
}

// (Part 1) Determines the best power square given a fixed size.
int findBestPowerSquare(const SummedAreaTable* summedAreaTable, int size, int* outX, int* outY)
{
	*outX = 0;
	*outY = 0;
	int bestSquarePower = INT_MIN;
	for (int y = 1; y <= POWER_GRID_DIMENSION - size; y++)
	{
		for (int x = 1; x <= POWER_GRID_DIMENSION - size; x++)
		{
			int squarePower = calculateSquarePowerLevel(summedAreaTable, x, y, size);
			if (squarePower > bestSquarePower)
			{
				*outX = x;
				*outY = y;
				bestSquarePower = squarePower;
			}
		}
	}
	return bestSquarePower;
}

// (Part 2) Determines the best power square given a variable size in the range [1, POWER_GRID_DIMENSION].
int findBestPowerSquare(const SummedAreaTable* summedAreaTable, int *outSize, int* outX, int* outY)
{
	*outX = 0;
	*outY = 0;
	*outSize = 0;
	int bestSquarePower = INT_MIN;
	for (int squareSize = 1; squareSize <= POWER_GRID_DIMENSION; squareSize++)
	{
		int tempX;
		int tempY;
		int squarePower = findBestPowerSquare(summedAreaTable, squareSize, &tempX, &tempY);
		if (squarePower > bestSquarePower)
		{
			*outX = tempX;
			*outY = tempY;
			*outSize = squareSize;
			bestSquarePower = squarePower;
		}
	}
	return bestSquarePower;
}

int main(int argc, char** argv)
{
	// Parse command line input and generate a summed area table for the power grid.
	int serialNumber = std::atoi(argv[1]);
	int summedAreaTable[POWER_GRID_DIMENSION + 1][POWER_GRID_DIMENSION + 1] = {0};
	populateSummedAreaTable(serialNumber, &summedAreaTable);

	// (Part 1) Determine the best power square given fixed size (3).
	int bestSquareX;
	int bestSquareY;
	int bestSquarePower = findBestPowerSquare(&summedAreaTable, 3, &bestSquareX, &bestSquareY);

	std::cout
		<< "(Part 1) The coordinate of 3x3 square with the largest total power is: "
		<< bestSquareX
		<< ","
		<< bestSquareY
		<< std::endl;

	// (Part 2) Determine the best power square given a variable size.
	int bestSquareSize;
	bestSquarePower = findBestPowerSquare(&summedAreaTable, &bestSquareSize, &bestSquareX, &bestSquareY);

	std::cout
		<< "(Part 2) The X,Y,size identified of the square with the largest total power is: "
		<< bestSquareX
		<< ","
		<< bestSquareY
		<< ","
		<< bestSquareSize
		<< std::endl;
}
