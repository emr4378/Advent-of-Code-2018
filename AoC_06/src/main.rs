// https://adventofcode.com/2018/day/6
extern crate regex;

#[macro_use]
extern crate lazy_static;

use regex::Regex;
use std::cmp;
use std::env;
use std::fmt;
use std::fs::File;
use std::io::{ BufReader, BufRead, Error };

const INVALID_INDEX : usize = std::usize::MAX;
const INVALID_AREA : i32 = std::i32::MAX;

struct Coordinate
{
	x : i32,
	y : i32,
}

impl Coordinate
{
	fn new(line : &str) -> Result<Coordinate, Error>
	{
		lazy_static! { static ref coordinate_regex : Regex = Regex::new(r"(\d+?),\s+(\d+)").unwrap(); }
		let caps = coordinate_regex.captures(line).unwrap();

		return Ok(Coordinate
		{
			x : caps.get(1).unwrap().as_str().parse::<i32>().unwrap(),
			y : caps.get(2).unwrap().as_str().parse::<i32>().unwrap()
		});
	}

	fn distance(self : &Coordinate, x : i32, y : i32) -> i32
	{
		return (x - self.x).abs() + (y - self.y).abs();
	}
}

impl fmt::Display for Coordinate
{
	fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
		write!(f, "({}, {})", self.x, self.y)
	}
}

fn main() -> Result<(), std::io::Error>
{
	// Parse the input file
	let input_file_path : String = env::args().nth(1).unwrap();
	let input_file : File = File::open(input_file_path)?;
	let buffered_input = BufReader::new(input_file);

	let mut coordinates : Vec<Coordinate> = Vec::new();
	let mut bounds = Coordinate { x: 0, y: 0 };
	for line in buffered_input.lines()
	{
		let coordinate : Coordinate = Coordinate::new(&line?).unwrap();
		bounds.x = cmp::max(bounds.x, coordinate.x);
		bounds.y = cmp::max(bounds.y, coordinate.y);
		coordinates.push(coordinate);
	}

	// Parse the total distance cap (for part 2)
	let total_distance_cap : i32 = env::args().nth(2).unwrap().parse::<i32>().unwrap();

	// Iterate every (x, y) position in the visible area of our grid
	let mut coordinate_areas : Vec<i32> = vec![0; coordinates.len()];
	let mut safe_region_size : i32 = 0;
	for y in 0..bounds.y+1
	{
		for x in 0..bounds.x+1
		{
			// Determine which coordinate this position is closest to, if any (part 1)
			// Also determine the total distance to all coordinates (part 2)
			let mut closest_coordinate_index : usize = INVALID_INDEX;
			let mut closest_coordinate_dist : i32 = std::i32::MAX;
			let mut total_distance : i32 = 0;
			for (index, coordinate) in coordinates.iter().enumerate()
			{
				let dist = coordinate.distance(x, y);

				if dist < closest_coordinate_dist
				{
					closest_coordinate_index = index;
					closest_coordinate_dist = dist;
				}
				else if dist == closest_coordinate_dist
				{
					closest_coordinate_index = INVALID_INDEX;
				}

				total_distance += dist;
			}

			// If a closest coordinate is found update the total area that coordinate is closest to (part 1)
			if closest_coordinate_index != INVALID_INDEX
			{
				if x == 0 || y == 0 || x == bounds.x || y == bounds.y
				{
					// If this position is a boundary the coordinate's total area is invalid/infinite
					coordinate_areas[closest_coordinate_index] = INVALID_AREA;
				}

				if coordinate_areas[closest_coordinate_index] != INVALID_AREA
				{
					coordinate_areas[closest_coordinate_index] += 1;
				}
			}

			// If the total distance to all coordinates is less than the parsed cap, add this position to the safe region area size (part 2)
			if total_distance < total_distance_cap
			{
				safe_region_size += 1;
			}
		}
	}

	let largest_area = coordinate_areas.iter().filter(|&&area| area != INVALID_AREA).max().unwrap();
	println!("(Part 1) The size of the largest area that isn't infinite is: {}", largest_area);
	println!("(Part 2) The size of the 'safe' region of locations with a total distance from all cordinates < {}: {}", total_distance_cap, safe_region_size);

	return Ok(());
}
