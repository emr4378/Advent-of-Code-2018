# https://adventofcode.com/2018/day/7
import copy
import operator
import re
import sys

class Step:
	def __init__(self, id):
		self.id = id;
		self.dependencies = set(); # these must be finished before this step can begin
		self.referencers = set(); # this step must finish before these can begin
		self.duration = ord(id) - ord('A') + 1;
		self.worker = [None];

	def __repr__(self):
		return '{0}: [{1}]'.format(self.id, ''.join(sorted(map(lambda step : step.id, self.dependencies))));

class Worker:
	def __init__(self):
		self.step = [None];
		self.timeToComplete = 0;

	def isAssignedStep(self):
		return self.step != [None];

	def assignStep(self, step, baseExecutionTime):
		assert(not self.isAssignedStep());
		self.step = step;
		self.step.worker = self;
		self.timeToComplete = baseExecutionTime + self.step.duration;

	def unassignStep(self):
		assert(self.isAssignedStep());
		step = self.step;
		self.timeToComplete = 0;
		self.step.worker = [None];
		self.step = [None];
		return step;

	def isStepComplete(self):
		return self.isAssignedStep() and self.timeToComplete == 0;

	def work(self):
		assert(self.isAssignedStep());
		self.timeToComplete = max(self.timeToComplete - 1, 0);

	def __repr__(self):
		if self.isAssignedStep():
			return '{0} ({1}s)'.format(self.step.id, self.timeToComplete);
		else:
			return '--';

# Filters and sorts the given stepCache so only startable steps are returned in alphabetical order.
def getStartableSteps(stepCache):
	startableSteps = filter(lambda step : step.worker == [None] and len(step.dependencies) == 0, stepCache.values());
	startableSteps = sorted(startableSteps, key=lambda step : step.id);
	return startableSteps;

# Continuously loops over the given stepCache, assigning each startable step to a worker (up to the given workerCount)
# as the step's dependencies are resolved. Returns the order the steps were completed (stepCompletionOrder) and 
# the total time it would take to complete all steps (executionTimeTotal).
def completeSteps(stepCache, workerCount, baseExecutionTime):
	workers = [ Worker() for i in range(workerCount) ];
	stepCompletionOrder = '';
	executionTimeTotal = 0;
	startableSteps = getStartableSteps(stepCache);

	while len(stepCache) > 0:
		for workerIndex, worker in enumerate(workers):
			if worker.isAssignedStep():
				worker.work();
				if worker.isStepComplete():
					step = worker.unassignStep();
					stepCompletionOrder += step.id;
					for referencer in step.referencers:
						referencer.dependencies.remove(step);
					stepCache.pop(step.id);
					startableSteps = getStartableSteps(stepCache);

			if not worker.isAssignedStep() and startableSteps:
				worker.assignStep(startableSteps[0], baseExecutionTime);
				startableSteps = getStartableSteps(stepCache);

		if len(stepCache) > 0:
			executionTimeTotal += 1;

	return { 'stepCompletionOrder' : stepCompletionOrder, 'executionTimeTotal' : executionTimeTotal };

# Make sure a the necessary parameters get passed in
if (len(sys.argv) != 4):
	print('Error: 3 arguments expected - path to input file, total number of workers, and base step duration (in seconds)')
	exit(1)

inputFilePath = sys.argv[1];
workerCount = int(sys.argv[2]);
baseStepDuration = int(sys.argv[3]);

# Read in all steps from the input file, populating the stepCache and each step's dependencies/referencers
stepCache = {}
def getOrCreateStep(stepId):
	if stepId not in stepCache:
		stepCache[stepId] = Step(stepId);
	return stepCache[stepId];

with open(inputFilePath, 'r') as inputFilePointer:
	for inputLine in iter(inputFilePointer.readline, ''):
		regexMatch = re.match(r'Step (\w+?) must be finished before step (\w+?) can begin.', inputLine);
		dependency = getOrCreateStep(regexMatch.group(1)); # this must be finished
		referencer = getOrCreateStep(regexMatch.group(2)); # before this can begin
		referencer.dependencies.add(dependency);
		dependency.referencers.add(referencer);

# Run 'completeSteps' with different parameters to get the answers to both parts.
part1answer = completeSteps(copy.deepcopy(stepCache), 1, 0);
part2answer = completeSteps(copy.deepcopy(stepCache), workerCount, baseStepDuration);

print('(Part 1) The order the steps will be completed is with 1 worker is:', part1answer['stepCompletionOrder']);
print('(Part 2) The time (in seconds) it will take to complete all steps with {0} workers and {1}s base duration is: {2}'.format(
	workerCount,
	baseStepDuration,
	part2answer['executionTimeTotal']));
