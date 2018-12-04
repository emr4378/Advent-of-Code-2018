// https://adventofcode.com/2018/day/1

#include <cassert>
#include <fstream>
#include <iostream>
#include <set>
#include <string>
#include <utility>
#include <vector>

typedef std::vector<int> FrequencyList;
typedef std::set<int> FrequencyCache;
typedef std::pair<FrequencyCache::iterator, bool> FrequencyCacheInsertResult;

static bool parseFrequencyInput(const char* inputFilePath, FrequencyList *outFrequencyList)
{
	assert(inputFilePath != nullptr);
	assert(outFrequencyList != nullptr);

	bool result = false;
	std::string line;
	std::ifstream inputStream(inputFilePath);

	if (inputStream.is_open())
	{
		while (std::getline(inputStream, line))
		{
			outFrequencyList->push_back(std::stoi(line));
		}

		result = true;
	}

	return result;
}

int main(int argc, char** argv)
{
	FrequencyList frequencyList;

	if (parseFrequencyInput(argv[1], &frequencyList))
	{
		FrequencyList resultingFrequencies;
		FrequencyCache seenFrequencies;
		int firstRepeatedFrequency = 0;
		bool hasAnyFrequencyRepeated = false;
		int currentFrequency = 0;

		seenFrequencies.insert(currentFrequency);

		while (!hasAnyFrequencyRepeated)
		{
			for (FrequencyList::const_iterator frequencyListIter = frequencyList.begin();
				frequencyListIter != frequencyList.end();
				frequencyListIter++)
			{
				currentFrequency += *frequencyListIter;

				FrequencyCacheInsertResult insertResult = seenFrequencies.insert(currentFrequency);
				bool wasNewFrequency = insertResult.second;

				if (!wasNewFrequency &&
					!hasAnyFrequencyRepeated)
				{
					firstRepeatedFrequency = currentFrequency;
					hasAnyFrequencyRepeated = true;
				}
			}

			resultingFrequencies.push_back(currentFrequency);
		}

		std::cout << "(Part 1) The resulting frequency is: " << resultingFrequencies[0] << std::endl;
		if (hasAnyFrequencyRepeated)
		{
			std::cout << "(Part 2) The first frequency reached twice is: " << firstRepeatedFrequency << std::endl;
		}
		else
		{
			std::cout << "(Part 2) The first frequency reached twice is: N/A" << std::endl;
		}
	}
	else
	{
		std::cerr << "Whelp, something's fucky." << std::endl;
	}
}
