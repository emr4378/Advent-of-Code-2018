// https://adventofcode.com/2018/day/12
using System;
using System.IO;
using System.Text;

namespace AoC_12
{
	public static class Constants
	{
		public const int PatternLength = 5;
		public const int PatternOffset = (PatternLength - 1) / 2;
		public const char UnplantedCharacter = '.';
		public const char PlantedCharacter = '#';
		public const string InitialStatePrefix = "initial state: ";
		public const string PatternResultDelimeter = " => ";
	}

	/// <summary>
	/// A node in a trie (aka prefix tree) used to represent a pattern of pots
	/// based on whether they're planted or unplanted. Allows fast searching
	/// over all patterns in one go instead of iterating over and checking each
	/// individually.
	/// </summary>
	/// <seealso cref="https://en.wikipedia.org/wiki/Trie"/>
	/// <seealso cref="https://www.geeksforgeeks.org/pattern-searching-using-trie-suffixes/"/>
	public class PatternNode
	{
		public string Pattern { get; }
		public PatternNode UnplantedNode { get; set; }
		public PatternNode PlantedNode { get; set; }
		public char? Value { get { return Pattern.Length > 0 ? Pattern[Pattern.Length - 1] : (char?)null; } }
		public char? Result { get; set; }

		public PatternNode(string pattern)
		{
			Pattern = pattern;
		}

		public bool TryGetNextNode(char nextValue, out PatternNode nextNode, bool allowCreate = false)
		{
			switch (nextValue)
			{
				case Constants.UnplantedCharacter:
					if (UnplantedNode == null && allowCreate)
					{
						UnplantedNode = new PatternNode(Pattern + nextValue);
					}
					nextNode = UnplantedNode;
					break;

				case Constants.PlantedCharacter:
					if (PlantedNode == null && allowCreate)
					{
						PlantedNode = new PatternNode(Pattern + nextValue);
					}
					nextNode = PlantedNode;
					break;

				default:
					nextNode = null;
					break;
			}

			return (nextNode != null);
		}

		public override string ToString()
		{
			return Pattern;
		}
	}

	public class Program
	{
		private static void ParseInput(string inputFilePath, out string initialState, out PatternNode rootPatternNode)
		{
			initialState = string.Empty;
			rootPatternNode = new PatternNode(string.Empty);

			using (var reader = new StreamReader(inputFilePath))
			{
				initialState = reader.ReadLine().Substring(Constants.InitialStatePrefix.Length);

				while (!reader.EndOfStream)
				{
					var noteString = reader.ReadLine();
					if (!string.IsNullOrEmpty(noteString))
					{
						var patternResult = noteString.Split(Constants.PatternResultDelimeter);
						var currentNode = rootPatternNode;
						foreach (var value in patternResult[0])
						{
							currentNode.TryGetNextNode(value, out currentNode, allowCreate: true);
						}
						currentNode.Result = patternResult[1][0];
					}
				}
			}
		}

		/// <summary>
		/// Simulates the spreading of plants in a row of pots from their initial
		/// state based on rules/patterns defined by the rootPatternNode trie
		/// after running for the given generationCount.
		/// </summary>
		/// <remarks>
		/// For large generationCounts where the state stabilizes, this function
		/// will shortcut the pattern matching generation processing.
		/// </remarks>
		private static long SimulatePlantSpread(string state, PatternNode rootPatternNode, long generationCount)
		{
			var stateOriginIndex = 0L;
			long? stableStateOriginIndexOffset = null;
			var generation = 0;
			for (; generation < generationCount && stableStateOriginIndexOffset == null; generation++)
			{
				var newState = new StringBuilder(state.Length);
				var newOriginIndexOffset = 0L;

				for (var index = -Constants.PatternOffset;
					index <= state.Length + Constants.PatternOffset;
					index++)
				{
					var currentNode = rootPatternNode;
					for (var offset = -Constants.PatternOffset; offset <= Constants.PatternOffset; offset++)
					{
						var offsetIndex = index + offset;
						var stateCharacter = (offsetIndex < 0 || offsetIndex >= state.Length)
							? '.'
							: state[offsetIndex];

						if (!currentNode.TryGetNextNode(stateCharacter, out currentNode))
						{
							break;
						}
					}

					if (currentNode != null &&
						currentNode.Result != null)
					{
						newState.Append(currentNode.Result);

						if (newOriginIndexOffset == 0 &&
							currentNode.Result == Constants.PlantedCharacter)
						{
							stateOriginIndex += index;
							newOriginIndexOffset = index;
						}
					}
					else
					{
						newState.Append(Constants.UnplantedCharacter);
					}
				}

				var tempState = newState.ToString().Trim(Constants.UnplantedCharacter);
				if (state == tempState)
				{
					stableStateOriginIndexOffset = newOriginIndexOffset;
				}
				state = tempState;
			}

			if (stableStateOriginIndexOffset != null)
			{
				stateOriginIndex += (stableStateOriginIndexOffset.Value * (generationCount - generation));
			}

			var plantedPotNumberSum = 0L;
			for (var index = 0; index < state.Length; index++)
			{
				if (state[index] == Constants.PlantedCharacter)
				{
					plantedPotNumberSum += (index + stateOriginIndex);
				}
			}

			return plantedPotNumberSum;
		}

		public static void Main(string[] args)
		{
			if (args.Length != 1 ||
				!File.Exists(args[1]))
			{
				throw new ArgumentException("Expected 1 command line argument: input file path");
			}

			ParseInput(args[0], out string initialState, out PatternNode rootPatternNode);

			var part1Sum = SimulatePlantSpread(initialState, rootPatternNode, 20);
			Console.WriteLine($"(Part 1) The sum of the numbers of all pots containing a plant after 20 generations is: {part1Sum}");

			var part2Sum = SimulatePlantSpread(initialState, rootPatternNode, 50000000000L);
			Console.WriteLine($"(Part 2) The sum of the numbers of all pots containing a plant after 50000000000 generations is: {part2Sum}");
		}
	}
}
