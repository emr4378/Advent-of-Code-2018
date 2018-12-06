# https://adventofcode.com/2018/day/4
import datetime
import enum
import re
import sys

class EventType(enum.Enum):
	ShiftStart = 'begins shift'
	AwakeStart = 'wakes up'
	AsleepStart = 'falls asleep'

class EventEntry:
	def __init__(self, entryString):
		regexMatch = re.match( r'\[(.*?)\](?:\s+?Guard #(\d+)?)?\s+?(.*)', entryString)
		self.timestamp = datetime.datetime.strptime(regexMatch.group(1), "%Y-%m-%d %H:%M")

		if EventType.ShiftStart.value in regexMatch.group(3):
			self.type = EventType.ShiftStart
			self.guardId = int(regexMatch.group(2))
		elif EventType.AwakeStart.value in regexMatch.group(3):
			self.type = EventType.AwakeStart
			self.guardId = -1
		elif EventType.AsleepStart.value in regexMatch.group(3):
			self.type = EventType.AsleepStart
			self.guardId = -1

	def __repr__(self):
		return "{0}{1}{2}".format(
			datetime.datetime.strftime(self.timestamp, "[%Y-%m-%d %H:%M] "),
			"Guard #{0} ".format(self.guardId) if self.type == EventType.ShiftStart else "",
			self.type.value)

class SleepTally:
	def __init__(self):
		self.totalMinutes = 0
		self.perMinute = [0] * 60

	def __repr__(self):
		return "Total: {0} [{1} : {0}]".format(
			self.totalMinutes,
			self.getMostOftenAsleepMinute(),
			self.getMostOftenAsleepMinuteValue())

	def getMostOftenAsleepMinute(self):
		return self.perMinute.index(self.getMostOftenAsleepMinuteValue())

	def getMostOftenAsleepMinuteValue(self):
		return max(self.perMinute)

# Make sure a input file path gets passed in
if (len(sys.argv) != 2):
	print('Error: 1 argument expected - path to input file')
	exit(1)

# Read in all guard events from the input file
eventEntries = []
with open(sys.argv[1], 'r') as inputFilePointer:
	for inputLine in iter(inputFilePointer.readline, ''):
		eventEntry = EventEntry(inputLine)
		assert inputLine.strip() == str(eventEntry)
		eventEntries.append(eventEntry)

# Sort the events chronologically
eventEntries.sort(key=lambda eventEntry: eventEntry.timestamp)

# Process the sorted events to populate a SleepTally for each guard
guardSleepTallyMap = {}
currentGuardId = -1;
currentGuardSleepStart = -1
for eventEntry in eventEntries:
	if eventEntry.type == EventType.ShiftStart:
		assert currentGuardSleepStart == -1
		currentGuardId = eventEntry.guardId
		if currentGuardId not in guardSleepTallyMap:
			guardSleepTallyMap[currentGuardId] = SleepTally();
	elif eventEntry.type == EventType.AsleepStart:
		assert currentGuardId != -1
		assert currentGuardSleepStart == -1
		currentGuardSleepStart = eventEntry.timestamp.minute
	elif eventEntry.type == EventType.AwakeStart:
		assert currentGuardId != -1
		assert currentGuardSleepStart != -1
		for x in range(currentGuardSleepStart, eventEntry.timestamp.minute):
			temp = guardSleepTallyMap[currentGuardId]
			guardSleepTallyMap[currentGuardId].totalMinutes += 1
			guardSleepTallyMap[currentGuardId].perMinute[x] += 1
		currentGuardSleepStart = -1

# Sort the guards by how much time they spend asleep (Strategy 1 - Sleepiest Guard)
guardSleepTallies = sorted(guardSleepTallyMap.items(), key=lambda kv: kv[1].totalMinutes, reverse=True)
part1GuardId = guardSleepTallies[0][0]
part1Minute = guardSleepTallies[0][1].getMostOftenAsleepMinute()
print("(Part 1.1) The ID of the guard with the most minutes asleep is:", part1GuardId)
print("(Part 1.2) The minute that guard is most often asleep is:", part1Minute)
print("> (Part 1) Multiplied: ", (part1GuardId * part1Minute))

# Sort the guards by how often they're asleep on the same minute (Strategy 2 - Sleepiest Minute)
guardSleepTallies = sorted(guardSleepTallyMap.items(), key=lambda kv: kv[1].getMostOftenAsleepMinuteValue(), reverse=True)
part2GuardId = guardSleepTallies[0][0]
part2Minute = guardSleepTallies[0][1].getMostOftenAsleepMinute()
print("(Part 2.1) The ID of the guard most frequency asleep at the same minute is:", part2GuardId)
print("(Part 2.2) The minute that guard is most frequency asleep at is: ", part2Minute)
print("> (Part 2) Multiplied: ", (part2GuardId * part2Minute))
