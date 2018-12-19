// https://adventofcode.com/2018/day/9

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace AoC_09
{
	public class Program
	{
		private const int ScoringMarbleValueModulo = 23;
		private const int ScoringMarbleCompanionOffset = 7;

		private static ulong SimulateMarbleMania(int playerCount, ulong lastMarbleValue)
		{
			// Setup lists representing the marble circle and the players.
			// NOTE: LinkedList is used for faster inserts/removes (using a normal List didn't go well...)
			var marbles = new LinkedList<ulong>(new[] { 0ul });
			var players = Enumerable.Repeat(0ul, playerCount).ToList();

			// Play through the game until the last marble is placed.
			var currentMarbleNode = marbles.First;
			var currentPlayerIndex = 0;
			for (var currentMarbleValue = 1ul; currentMarbleValue <= lastMarbleValue; currentMarbleValue++)
			{
				if (currentMarbleValue % ScoringMarbleValueModulo == 0)
				{
					// Move backwards to find the companion marble.
					currentMarbleNode = currentMarbleNode.PreviousOrLast(ScoringMarbleCompanionOffset);

					// Add the value of the current and companion marbles to the current player's score.
					players[currentPlayerIndex] += (currentMarbleValue + currentMarbleNode.Value);

					// Remove the companion marble, making the marble at it's old position the current marble.
					var nextMarbleNode = currentMarbleNode.NextOrFirst();
					marbles.Remove(currentMarbleNode);
					currentMarbleNode = nextMarbleNode;
				}
				else
				{
					// Add the current marble to the circle.
					currentMarbleNode = marbles.AddAfter(currentMarbleNode.NextOrFirst(), currentMarbleValue);
				}

				currentPlayerIndex = (currentPlayerIndex + 1) % players.Count;
			}

			return players.Max();
		}

		public static void Main(string[] args)
		{
			// Read in and parse the input file.
			var inputString = File.ReadAllText(args[0]);
			var regex = new Regex(@"(\d+) players; last marble is worth (\d+) points");
			var match = regex.Match(inputString);
			var playerCount = Convert.ToInt32(match.Groups[1].Value);
			var lastMarbleValue = Convert.ToUInt64(match.Groups[2].Value);

			Console.WriteLine("(Part 1) The winning Elf's score is: {0}",
				SimulateMarbleMania(playerCount, lastMarbleValue));
			Console.WriteLine("(Part 2) The winning Elf's score when the last marble is 100x larger is: {0}",
				SimulateMarbleMania(playerCount, lastMarbleValue * 100));
			Console.ReadLine();
		}
	}

	public static class LinkedListNodeExtensions
	{
		public static LinkedListNode<T> NextOrFirst<T>(this LinkedListNode<T> current, int offset = 1)
		{
			var result = current;
			for (var i = 0; i < offset; i++)
			{
				result = result.Next ?? result.List.First;
			}
			return result;
		}

		public static LinkedListNode<T> PreviousOrLast<T>(this LinkedListNode<T> current, int offset = 1)
		{
			var result = current;
			for (var i = 0; i < offset; i++)
			{
				result = result.Previous ?? result.List.Last;
			}
			return result;
		}
	}
}
