// https://adventofcode.com/2018/day/14
using System;
using System.Collections.Generic;
using System.Linq;

namespace AOC_14
{
	public class Program
	{
		private const int ElfCount = 2;
		private const int ResultLength = 10;
		private const string InitialScores = "37";

		private static IEnumerable<int> GetDigits(string numberString)
		{
			return numberString.Select(c => (int)char.GetNumericValue(c));
		}

		private static IEnumerable<int> GetDigits(int number)
		{
			if (number == 0) return new[] { 0 };

			var result = new List<int>();
			while (number > 0)
			{
				result.Add(number % 10);
				number /= 10;
			}

			return ((IEnumerable<int>)result).Reverse();
		}

		private static int GetSubsequenceIndex(
			IReadOnlyList<int> subsequence,
			IReadOnlyList<int> sequence,
			int sequenceStartIndex)
		{
			sequenceStartIndex = Math.Max(sequenceStartIndex, 0);

			var result = -1;
			for (var sequenceIndex = sequenceStartIndex;
				sequenceIndex < sequence.Count - subsequence.Count;
				sequenceIndex++)
			{
				var isMatch = !subsequence
					.Where((t, subsequenceIndex) => t != sequence[sequenceIndex + subsequenceIndex])
					.Any();
				if (isMatch)
				{
					result = sequenceIndex;
					break;
				}
			}
			return result;
		}

		public static void Main(string[] args)
		{
			if (args.Length != 1)
			{
				Console.WriteLine("Expected 1 argument: input recipe scores");
				return;
			}

			var elves = Enumerable.Range(0, ElfCount).ToArray();
			var scores = GetDigits(InitialScores).ToList();
			var inputScores = GetDigits(args[0]).ToArray();
			var inputScoresInt = int.Parse(args[0]);

			var searchStartIndex = 0;
			var substringStartIndex = -1;
			while (scores.Count < inputScoresInt + ResultLength || substringStartIndex == -1)
			{
				var scoreSum = elves
					.Select(scoreIndex => scores[scoreIndex])
					.Sum();

				// Create new recipes from the digits of the sum of the current recipes.
				scores.AddRange(GetDigits(scoreSum));

				// Pick new recipes for each elf based on the score of their current recipe.
				for (var i = 0; i < elves.Length; i++)
				{
					var scoreIndex = elves[i];
					elves[i] = (scoreIndex + 1 + scores[scoreIndex]) % scores.Count;
				}

				// Check the current recipe scores to see if the input scores is a subsequence of it (part 2).
				if (substringStartIndex == -1 && scores.Count >= searchStartIndex + inputScores.Length)
				{
					substringStartIndex = GetSubsequenceIndex(
						inputScores,
						scores,
						searchStartIndex - inputScores.Length);
					searchStartIndex = scores.Count;
				}
			}

			Console.WriteLine(
				"(Part 1) The scores of the {0} recipes immediately following the input scores are: {1}",
				ResultLength,
				string.Join("", scores.Skip(inputScoresInt).Take(ResultLength)));
			Console.WriteLine(
				"(Part 2) The number of recipes to the left of the input score sequence is: {0}",
				substringStartIndex);
		}
	}
}
