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
var importedCasesPerDay = 10;
var importedCasesPerDayChangeFactor = 1.1;
const maxImportedCasesPerDay = 1000;
const maxImportedCases = 1500000;
var currentlyImportedCases = 0;
const tippingPointForImports = 225;
const importedCasesPerDayChangeFactorAfterTippingPoint = 0.8;

//number of infections (initial) per infected person
var r_0 = 2.3;

//model assumptions
var hospitalizationRate = 0.1
var seriousCasesRate = 0.5
var criticalCasesRate = 0.5
var icuRecoveryRate = 0.8 //0.6 => 2%, 0.8 => 1%
var icuDeathRate = 0.2
var criticalCaseNormalBedRecoveryRate = 0.5
var ciritcalCaseNormalBedDeathRate = 0.5
var deathRateForHospitalRequiringPatientsWithoutBed = 0.3

//health care system assumptions
var icu_capacity = 28000;
var normalBeds = 497000;

function init() {
    susceptible = population - allIncubated() - allInfectiuos() - immune - dead - allRecovering() - allHospital()
}

function advanceHospitals(stepNumber) {
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


function advanveInfectious(stepNumber) {
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
    hospitalBedCritical[0] = criticalFittingInNormalBed;
    dead += notFittingInICU - criticalFittingInNormalBed;

    //fill normal hospital hospital beds
    fittingInHospitalBed = Math.min(normalBeds - allHospitalBed(), requiringNormalHospitalBed);
    notFittingInHospitalBed = requiringNormalHospitalBed - fittingInHospitalBed;
    hospitalBedSerious[0] = fittingInHospitalBed;
    dyingToday += Math.round(notFittingInHospitalBed * deathRateForHospitalRequiringPatientsWithoutBed)
    dead += dyingToday;
    recovering[0] += (notFittingInHospitalBed - dyingToday);

    print(stepNumber + " " + notFittingInICU + " " + notFittingInHospitalBed)
}


function simulateStep(stepNumber) {
    oldDead = dead
        //advance one day in hospitals
    advanceHospitals(stepNumber);

    //advance one day in recovery
    immune += recovering.pop();
    recovering.unshift(0);

    //calculate newly infected
    infectedToday = Math.round(susceptible / population * r_0 / 3.0 * allInfectiuos());
    //print(infectedToday)

    //advance one day in infectious
    advanveInfectious(stepNumber);

    //advance one day in incubated and add newly infected
    infectiuos[0] = incubated.pop();
    incubated.unshift(infectedToday)

    //import cases
    if (maxImportedCases < currentlyImportedCases) {
        importedCasesPerDay = Math.min(maxImportedCasesPerDay, importedCasesPerDay *= importedCasesPerDayChangeFactor);
        currentlyImportedCases += importedCasesPerDay;
        if (stepNumber > tippingPointForImports) {
            importedCasesPerDayChangeFactor = importedCasesPerDayChangeFactorAfterTippingPoint;
        }
        incubated[2] += importedCasesPerDay
    }

    //calculate susceptible
    susceptible = population - allIncubated() - allInfectiuos() - immune - dead - allRecovering() - allHospital()

    printStats()
    print(dead - oldDead)
}

function simulate() {
    for (var i = 0; i < simulationTimeInDays; i++) {
        simulateStep(i)
    }
}

function printStats() {
    print("Dead: " + dead + "\tInfected: " + allInfected() + "\tSusceptible: " + susceptible + "\tImmune: " + immune)
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