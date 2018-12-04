// https://adventofcode.com/2018/day/2

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AoC_02
{
	internal class Program
	{
		private static int GenerateChecksum(IEnumerable<string> boxIds)
		{
			var boxIdsWithDoubledCharacters = 0;
			var boxIdsWithTripledCharacters = 0;

			foreach (var boxId in boxIds)
			{
				var characterCounts = new Dictionary<char, int>();
				foreach (var character in boxId)
				{
					characterCounts.TryGetValue(character, out var characterCount);
					characterCounts[character] = (characterCount + 1);
				}

				if (characterCounts.Any(count => count.Value == 2))
				{
					boxIdsWithDoubledCharacters++;
				}

				if (characterCounts.Any(count => count.Value == 3))
				{
					boxIdsWithTripledCharacters++;
				}
			}

			return (boxIdsWithDoubledCharacters * boxIdsWithTripledCharacters);
		}

		private static string CalculateCommonBoxId(string leftBoxId, string rightBoxId)
		{
			if (leftBoxId.Length != rightBoxId.Length ||
				leftBoxId == rightBoxId)
			{
				return string.Empty;
			}

			var commonBoxId = string.Empty;
			for (var characterIndex = 0; characterIndex < leftBoxId.Length; characterIndex++)
			{
				var leftCharacter = leftBoxId[characterIndex];
				var rightCharacter = rightBoxId[characterIndex];
				if (leftCharacter == rightCharacter)
				{
					commonBoxId += leftCharacter;
				}
			}

			return (commonBoxId.Length == leftBoxId.Length - 1)
				? commonBoxId
				: string.Empty;
		}

		private static string CalculateCommonBoxId(IReadOnlyList<string> boxIds)
		{
			var commonBoxId = string.Empty;
			for (var leftIndex = 0; leftIndex < boxIds.Count && string.IsNullOrEmpty(commonBoxId); leftIndex++)
			{
				for (var rightIndex = leftIndex + 1; rightIndex < boxIds.Count && string.IsNullOrEmpty(commonBoxId); rightIndex++)
				{
					commonBoxId = CalculateCommonBoxId(boxIds[leftIndex], boxIds[rightIndex]);
				}
			}
			return commonBoxId;
		}

		static void Main(string[] args)
		{
			var boxIds = File.ReadAllLines(args[0]);
			var checksum = GenerateChecksum(boxIds);
			var commonBoxId = CalculateCommonBoxId(boxIds);

			Console.WriteLine("(Part 1) The checksum of the input list of box IDs is: {0}", checksum);
			Console.WriteLine("(Part 2) The common letters between the two correct box IDs are: {0}", commonBoxId);
			Console.ReadKey();
		}
	}
}