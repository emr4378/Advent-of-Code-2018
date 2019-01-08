// https://adventofcode.com/2018/day/10

#include <fstream>
#include <iomanip>
#include <iostream>
#include <regex>
#include <string>
#include <valarray>
#include <vector>

typedef long long int int64;
typedef std::valarray<int64> Vec2;

struct Star
{
	Vec2 position {0, 0};
	Vec2 velocity {0, 0};

	bool operator<(const Star& other) const
	{
		bool result = false;

		if (position[1] < other.position[1] ||
			(position[1] == other.position[1] && position[0] < other.position[0]))
		{
			result = true;
		}

		return result;
	}
};
typedef std::vector<Star> StarList;

struct Bounds
{
	Vec2 topLeft { LONG_MAX, LONG_MAX };
	Vec2 bottomRight { LONG_MIN, LONG_MIN };

	inline int64 getWidth() const { return bottomRight[0] - topLeft[0]; }
	inline int64 getHeight() const { return bottomRight[1] - topLeft[1]; }
	inline int64 getArea() const { return getWidth() * getHeight(); }
};

void parseInput(const char* inputFilePath, StarList* outStarList)
{
	std::ifstream inputStream(inputFilePath);

	if (inputStream.is_open())
	{
		std::regex regex("position=<(.*?\\d+),(.*?\\d+)> velocity=<(.*?\\d+),(.*?\\d+)>");
		std::smatch match;
		std::string line;

		while (std::getline(inputStream, line))
		{
			if (std::regex_match(line, match, regex))
			{
				Star star;
				star.position[0] = std::stoi(match[1].str());
				star.position[1] = std::stoi(match[2].str());
				star.velocity[0] = std::stoi(match[3].str());
				star.velocity[1] = std::stoi(match[4].str());
				outStarList->push_back(star);
			}
		}
	}
}

int main(int argc, char** argv)
{
	StarList starList;
	parseInput(argv[1], &starList);

	// Find the time at which the stars are most tightly clustered together (minimal bounds). This will (hopefully) be
	// when it's legible. NOTE: Backup plan - do straight line detection, pick the step with the most straight lines.
	Bounds smallestBounds;
	int step = 0;
	while (true)
	{
		Bounds bounds;

		for (StarList::iterator starIter = starList.begin();
			starIter != starList.end();
			starIter++)
		{
			starIter->position += starIter->velocity;

			bounds.topLeft[0] = std::min(bounds.topLeft[0], starIter->position[0]);
			bounds.topLeft[1] = std::min(bounds.topLeft[1], starIter->position[1]);
			bounds.bottomRight[0] = std::max(bounds.bottomRight[0], starIter->position[0]);
			bounds.bottomRight[1] = std::max(bounds.bottomRight[1], starIter->position[1]);
		}

		if (step == 0 || bounds.getArea() < smallestBounds.getArea())
		{
			smallestBounds = bounds;
			step++;
		}
		else
		{
			break;
		}
	}

	// The star list is actually one step ahead so we need to backtrack once.
	for (StarList::iterator starIter = starList.begin();
		starIter != starList.end();
		starIter++)
	{
		starIter->position -= starIter->velocity;
	}

	// Sort the list by position (y-major, x-minor) - see Star::operator<
	std::sort(starList.begin(), starList.end());

	// (Part 1) Print the sorted star cluster to the console and hope it looks like letters.
	std::cout << "(Part 1) The message that will eventually appear:" << std::endl;

	int starIndex = 0;
	for (int64 y = smallestBounds.topLeft[1]; y <= smallestBounds.bottomRight[1]; y++)
	{
		for (int64 x = smallestBounds.topLeft[0]; x <= smallestBounds.bottomRight[0]; x++)
		{
			bool isStar = false;

			while (starIndex < starList.size() &&
				starList[starIndex].position[0] == x &&
				starList[starIndex].position[1] == y)
			{
				starIndex++;
				isStar = true;
			}

			std::cout << (isStar ? '#' : ' ');
		}

		std::cout << std::endl;
	}

	// (Part 2) Print the steps/seconds it took to see that message.
	std::cout << "(Part 2) The number of seconds the elves would have to wait is: " << step << std::endl;
}
