// https://adventofcode.com/2018/day/5
use std::env;
use std::fs::File;
use std::io::prelude::*;

// Iterates every unit of the input polymer, adding each to reacted_polymer.
// If the last unit added to the reacted_polymer matches the opposite of the
// current unit (e.g. 'a' opposite is 'A'), a reaction occurs and pops
// the last unit off of the reacted_polymer.
// 
// Returns the length of the reacted_polymer.
fn react(polymer : &[u8], unit_to_ignore : u8) -> usize
{
	let mut reacted_polymer : Vec<u8> = Vec::new();
	for &current_unit in polymer
	{
		let opposite_unit : u8 = match current_unit.is_ascii_uppercase()
		{
			true => current_unit.to_ascii_lowercase(),
			false => current_unit.to_ascii_uppercase()
		};

		if current_unit != unit_to_ignore && opposite_unit != unit_to_ignore
		{
			if reacted_polymer.last() == Some(&opposite_unit)
			{
				reacted_polymer.pop();
			}
			else
			{
				reacted_polymer.push(current_unit);
			}
		}
	}
	return reacted_polymer.len();
}

fn main() -> Result<(), std::io::Error>
{
	// Parse the input polymer.
	let input_file_path : String = env::args().nth(1).unwrap();
	let mut input_file : File = File::open(input_file_path)?;
	let mut input : String = String::new();

	input_file.read_to_string(&mut input)?;

	let polymer : &[u8] = input.trim().as_bytes();

	// (Part 1) Perform the full polymer reaction.
	let full_polymer_reaction_length : usize = react(&polymer, 0);
	println!("(Part 1) The number of units remaining in the fully reacted polymer is: {}", full_polymer_reaction_length);

	// (Part 2) Perform a reaction for each ignored unit [a-z], keeping track of which results in the shortest reacted polymer.
	let mut min_polymer_reaction_length : usize = full_polymer_reaction_length;
	for unit_to_ignore in (0..26).map(|unit| unit + 'a' as u8)
	{
		let polymer_reaction_length  : usize = react(&polymer, unit_to_ignore);
		if polymer_reaction_length < min_polymer_reaction_length
		{
			min_polymer_reaction_length = polymer_reaction_length;
		}
	}
	println!("(Part 2) The length of the shortest polymer that can be produced is: {}", min_polymer_reaction_length);

	Ok(())
}
