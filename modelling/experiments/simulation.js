

//constants and initial values for our simulation
var simulationTimeInDays = 455;
var population = 83784000;

//popultion (all of the following should add up to approx. popultion)
var incubated = [1, 0, 0, 0, 0]
var infectiuos = [0, 0, 0]
var susceptible;
var immune = 0;
var dead = 0;
var recovering = [0, 0, 0]
var hospitalBedSerious = [0, 0, 0, 0, 0]
var hospitalBedCritical = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var icuBedWillDie = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var icuBedWillRecover = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

//imported cases
var importedCasesPerDay = 5;
var importedCasesPerDayChangeFactor = 1.2;
const maxImportedCasesPerDay = 2000;
const maxImportedCases = 750000;
var currentlyImportedCases = 0;
const tippingPointForImports = 225;
const importedCasesPerDayChangeFactorAfterTippingPoint = 0.8;

//number of infections (initial) per infected person
var r_0 = 2.3;
var initial_r_0 = 2.3;

//model assumptions
var hospitalizationRate = 0.05
var seriousCasesRate = 0.5
var criticalCasesRate = 0.5
var icuRecoveryRate = 0.6   //0.6 => 0.9% mortality if all are treated perfectly
var icuDeathRate = 0.4
var criticalCaseNormalBedRecoveryRate = 0.5
var ciritcalCaseNormalBedDeathRate = 0.5
var deathRateForHospitalRequiringPatientsWithoutBed = 0.5

//health care system assumptions
var icu_capacity = 28000;
var normalBeds = 497000;
var icuAvailability = 0.2;
var normalBedAvailability = 0.2;
var initialICUcapacity = 28000;
var initialNormalBedCapacity = 497000;

//statistics
var diedYesterday = 0;
var stepNumber = 0;
var publicAcceptance = 0.2;
var policeForce = 0.01;

//activities
var activities

function init(myActivities) {
  susceptible = population - allIncubated() - allInfectiuos() - immune - dead - allRecovering() - allHospital();
  activities = myActivities;
  stepNumber = 0;
}

function calculateActivityEffects() {

  //reset simulation parameters
  r_0 = initial_r_0;

  for (var activity of activities) {
    //is active?

    if (activity[1].hasOwnProperty("rEffect")) {
      r_0 += activity[1].rEffect;
    }
    if (activity[1].hasOwnProperty("acceptanceEffect")) {
      publicAcceptance += activity[1].acceptanceEffect;
    }
  }
}

function advanceActivations() {
  for (var activity of activities) {
    //advance activations
    if (activity[1].status == 4) {
      activity[1].activationAlreadyProgressed += 1;
      if (activity[1].activationAlreadyProgressed >= activity[1].activationDuration) {
        activity[1].status = 3;
        print("Fully Activated: " + activity[1].name)
      }
    }
  }
}

function advanceHospitals() {
  //calculate usable hospital and icu beds
  icu_capacity = initialICUcapacity * icuAvailability;
  normalBeds = initialNormalBedCapacity * normalBedAvailability;

  //advance serious cases
  immune += hospitalBedSerious.pop()
  hospitalBedSerious.unshift(0)

  //advance critical cases in normal hospital beds
  for (var i = 0; i < hospitalBedCritical.length; i++) {
    dyingToday = Math.round(hospitalBedCritical[i] / 28.0 * ciritcalCaseNormalBedDeathRate);
    hospitalBedCritical[i] = hospitalBedCritical[i] - dyingToday;

    dead += dyingToday;
  }
  immune += hospitalBedCritical.pop();
  hospitalBedCritical.unshift(0);

  //advance recovering patients in icu
  immune += icuBedWillRecover.pop();
  icuBedWillRecover.unshift(0);

  //advance dying patients in icu
  for (var i = 0; i < icuBedWillDie.length; i++) {
    dyingToday = Math.round(icuBedWillDie[i] / 28.0 * icuDeathRate);
    icuBedWillDie[i] = icuBedWillDie[i] - dyingToday;

    dead += dyingToday;
  }
  dead += icuBedWillDie.pop();
  icuBedWillDie.unshift(0);
}


function advanveInfectious() {
  advancingInfectious = infectiuos.pop();
  infectiuos.unshift(0);
  recovering[0] = Math.round(advancingInfectious * (1.0 - hospitalizationRate));

  requiringIntensiveCare = Math.round(advancingInfectious * hospitalizationRate * criticalCasesRate);
  requiringNormalHospitalBed = Math.round(advancingInfectious * hospitalizationRate * seriousCasesRate);

  //fill icu first
  fittingInICU = Math.min((icu_capacity - allICU()), requiringIntensiveCare);
  notFittingInICU = requiringIntensiveCare - fittingInICU;
  icuBedWillRecover[0] = Math.round(fittingInICU * icuRecoveryRate);
  icuBedWillDie[0] = Math.round(fittingInICU * icuDeathRate);
  criticalFittingInNormalBed = Math.min(normalBeds - allHospitalBed(), notFittingInICU);
  if (criticalFittingInNormalBed == notFittingInICU ) {       //we can care for all patients, though not ideally
    hospitalBedCritical[0] = criticalFittingInNormalBed;
  } else {                                                    //we'll have to empty our normal beds to make room for critical patients
    //serious, but not critical cases first
    missingCapacity = notFittingInICU - criticalFittingInNormalBed;
    i = 0;
    while (missingCapacity > 0 && arraySum(hospitalBedSerious) > 0) {
      pulledFromBed = hospitalBedSerious[hospitalBedSerious.length - 1 - i];
      hospitalBedSerious[hospitalBedSerious.length - 1 - i] = 0;
      criticalFittingInNormalBed += pulledFromBed;
      missingCapacity = notFittingInICU - criticalFittingInNormalBed;
      dead += Math.round(pulledFromBed * deathRateForHospitalRequiringPatientsWithoutBed);
      recovering[0] += Math.round(pulledFromBed * (1.0 - deathRateForHospitalRequiringPatientsWithoutBed));
      i += 1;
    }

    i = 0;
    while (missingCapacity > 0 && i < 14) {
      pulledFromBed = hospitalBedCritical[hospitalBedCritical.length - 1 - i];
      hospitalBedCritical[hospitalBedCritical.length - 1 - i] = 0;
      dyingToday = Math.round(pulledFromBed * i * 0.05 * ciritcalCaseNormalBedDeathRate);
      dead += dyingToday
      recovering[0] += pulledFromBed - dyingToday;
      criticalFittingInNormalBed += pulledFromBed;
      missingCapacity = notFittingInICU - criticalFittingInNormalBed;
      i += 1
    }

    hospitalBedCritical[0] = criticalFittingInNormalBed;

    //pull from icu beds
    i = 0;
    while (missingCapacity > 0 && i < 14) {
      pulledFromBedWillDie = icuBedWillDie[icuBedWillDie.length - 1 - i];
      pulledFromBedWouldHaveRecovered = icuBedWillRecover[icuBedWillRecover.length - 1 - i];
      nowFittingInICUBed = pulledFromBedWillDie + pulledFromBedWouldHaveRecovered;
      missingCapacity = notFittingInICU - criticalFittingInNormalBed - nowFittingInICUBed;
      dead += pulledFromBedWillDie;
      dyingToday = Math.min(Math.round(pulledFromBedWouldHaveRecovered * i * 0.067), pulledFromBedWouldHaveRecovered);
      dead += dyingToday;
      recovering[0] += pulledFromBedWouldHaveRecovered - dyingToday;
      i += 1;
    }

    dead += Math.round(missingCapacity * 0.95);
    recovering[0] += Math.round(missingCapacity * 0.05);
  }

  //fill normal hospital hospital beds
  fittingInHospitalBed = Math.min(normalBeds - allHospitalBed(), requiringNormalHospitalBed);
  notFittingInHospitalBed = requiringNormalHospitalBed - fittingInHospitalBed;
  hospitalBedSerious[0] += fittingInHospitalBed;
  dyingToday += Math.round(notFittingInHospitalBed * deathRateForHospitalRequiringPatientsWithoutBed)
  dead += dyingToday;
  recovering[0] += (notFittingInHospitalBed - dyingToday);

}


function simulateStep() {
  oldDead = dead

  //calculate effects by measures taken
  calculateActivityEffects();

  //advance one day in hospitals
  advanceHospitals();

  //advance one day in recovery
  immune += recovering.pop();
  recovering.unshift(0);

  //calculate newly infected
  infectedToday = Math.round(susceptible / population * r_0 / 3.0 * allInfectiuos());

  //advance one day in infectious
  advanveInfectious();

  //advance one day in incubated and add newly infected
  infectiuos[0] = incubated.pop();
  incubated.unshift(infectedToday)

  //import cases
  if (maxImportedCases > currentlyImportedCases) {
    importedCasesPerDay = Math.floor(Math.min(maxImportedCasesPerDay, importedCasesPerDay *= importedCasesPerDayChangeFactor));

    currentlyImportedCases += importedCasesPerDay;
    if (stepNumber > tippingPointForImports) {
      importedCasesPerDayChangeFactor = importedCasesPerDayChangeFactorAfterTippingPoint;
    }
    incubated[2] += importedCasesPerDay
  }

  //calculate susceptible
  susceptible = population - allIncubated() - allInfectiuos() - immune - dead - allRecovering() - allHospital()

  diedYesterday = dead - oldDead;

  advanceActivations();

  printStats()
}

function simulate() {
  for (var i = 0; i < simulationTimeInDays; i++) {
    stepNumber = i;
    simulateStep()
  }
}

function printStats() {
  print(stepNumber + ": Died: " + diedYesterday + "\tDead: " + dead + "\tInfected: " + allInfected() + "\tSusceptible: " + susceptible + "\tImmune: " + immune + "\tImported: " + currentlyImportedCases)
}

function allIncubated() {
  var sum = 0
  for (var i = 0; i < incubated.length; i++) {
    sum += incubated[i]
  }
  return sum
}

function allInfectiuos() {
  var sum = 0
  for (var i = 0; i < infectiuos.length; i++) {
    sum += infectiuos[i]
  }
  return sum
}

function allRecovering() {
  var sum = 0
  for (var i = 0; i < recovering.length; i++) {
    sum += recovering[i]
  }
  return sum
}

function arraySum(array) {
  const reducer = (a, b) => a + b;
  var result = array.reduce(reducer, 0);
  return result
}

function allInfected() {
  return allHospital() + allIncubated() + allInfectiuos() + allRecovering();
}

function allHospitalBedSerious() {
  return arraySum(hospitalBedSerious)
}

function allHospitalBedCritical() {
  return arraySum(hospitalBedCritical)
}

function allHospitalBed() {
  return allHospitalBedSerious() + allHospitalBedCritical();
}

function allicuBedWillDie() {
  return arraySum(icuBedWillDie)
}

function allicuBedWillRecover() {
  return arraySum(icuBedWillRecover)
}

function allICU() {
  return allicuBedWillDie() + allicuBedWillRecover()
}

function allHospital() {
  return allICU() + allHospitalBed()
}

//writes (debug) text to the console for now
function print(text) {
  console.log(text);
}
