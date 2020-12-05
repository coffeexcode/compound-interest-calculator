/*
{
    { state },
    values: [
        { 
            period: int, (day, month, year, etc.)
            additions: double,
            periodInterest: double,
            interestToDate: double,
        }
    ]
}
*/

/*
 * Create a list of data points based on the chosen investment options.
 * The output should be grouped by the compounding period.
 * We assume that the additions > compounding period
 * Rules:
 *  1. Interest is calculated at the beginning of the compounding period before additions are considered
 *      ex: If there is no initial value, the first compounded period will always be zero
 * 
 * Special cases: For when the deposit rate doesn't fit into the compounding period
 * daily, weekly, bi-weekly -> monthly, quarterly, semi-annually
 */
export function calculate(options) {
  // Check for special case
  if (getPeriodRank(options.regularDepositInterval) < 3 && options.compoundInterval === "monthly") {
    return annualizeInvestment(options);
  }

  // Check that addition is lte than compounding period
  if (
    getPeriodRank(options.regularDepositInterval) >
    getPeriodRank(options.compoundInterval)
  ) {
    return calculateCompoundingFasterThanDeposits(options);
  }

  // Basic conditions are met, go forward
  let points = [];

  let perYear =
    getTotalDataPoints(options.regularDepositInterval, options.timeframe) /
    options.timeframe;

  // Period-based totals
  let depositsPerPeriod = getAdditionsPercompoundInterval(
    options.regularDepositInterval,
    options.compoundInterval
  );
  let depositsThisPeriod = 0;
  let periodDeposit = 0;
  let periodInterest = 0;
  let currentPeriod = 1;

  // Totals
  let currentValue = options.initialInvestment;
  let totalInterest = 0;

  for (
    let i = 1;
    i <= getTotalDataPoints(options.regularDepositInterval, options.timeframe);
    i++
  ) {
    // Construct a default point
    let point = {
      depositNum: i,
      deposit: options.regularDepositAmount,
      periodNum: currentPeriod,
      periodDeposit: 0,
      periodInterest: 0,
      totalInterest: 0,
      totalInvested: i * options.regularDepositAmount,
      currentValue: 0,
    };

    // Defaults for depositing
    periodDeposit += options.regularDepositAmount;

    // Update deposits for this period
    depositsThisPeriod += 1;

    // If this is a compounding period, compound away
    if (depositsThisPeriod === depositsPerPeriod) {
      // Calculate interest based on last amount
      periodInterest +=
        (currentValue - periodDeposit + options.regularDepositAmount) *
        getInterestPerPeriod(options);
      totalInterest += periodInterest;

      // Set the data values accordingly
      point.periodDeposit = periodDeposit;
      point.periodInterest = periodInterest;
      point.totalInterest = totalInterest;

      // Update current value
      currentValue += options.regularDepositAmount + periodInterest;

      // Reset values
      periodDeposit = 0;
      periodInterest = 0;
      depositsThisPeriod = 0;

      // Update current period
      currentPeriod += 1;
    } else {
      // Hide the period number
      point.periodNum = -1;
      point.periodInterest = -1;
      point.periodDeposit = -1;

      // If it's not a compound period, we have partial interest to calculate
      periodInterest +=
        options.regularDepositAmount *
        (getInterestPerPeriod(options) *
          (depositsThisPeriod / depositsPerPeriod));

      // Add the current value
      currentValue += options.regularDepositAmount;
    }

    // Update year end
    if (i % perYear === 0) {
      point.isYearEnd = true;
    }

    point.currentValue = currentValue;

    points.push(point);
  }

  return points;
}

function calculateCompoundingFasterThanDeposits(options) {
  let points = [];

  let perYear =
    getTotalDataPoints(options.compoundInterval, options.timeframe) /
    options.timeframe;

  // Period-based totals
  let compoundsPerDeposit = getAdditionsPercompoundInterval(
    options.compoundInterval, options.regularDepositInterval
  );
  let compoundsSinceLastDeposit = 0;
  let currentDeposit = 1;

  // Totals
  let currentValue = options.initialInvestment;
  let totalInvested = options.initialInvestment;
  let totalInterest = 0;

  for (
    let i = 1;
    i <= getTotalDataPoints(options.compoundInterval, options.timeframe);
    i++
  ) {
    // Construct a default point
    let point = {
      depositNum: -1,
      deposit: -1,
      periodNum: i,
      periodDeposit: -1,
      periodInterest: 0,
      totalInterest: 0,
      totalInvested: totalInvested,
      currentValue: 0,
      isYearEnd: false,
    };

    // Complete a compound based on the current value
    point.periodInterest = currentValue * getInterestPerPeriod(options);
    totalInterest += point.periodInterest;
    point.totalInterest = totalInterest;

    // Update the compounds
    compoundsSinceLastDeposit += 1;

    // Update the current value
    currentValue += point.periodInterest;

    // Do an addition if called for
    if (compoundsSinceLastDeposit === compoundsPerDeposit) {
      point.depositNum = currentDeposit;

      // Add the deposit
      totalInvested += options.regularDepositAmount;

      point.deposit = options.regularDepositAmount;
      point.periodDeposit = options.regularDepositAmount;
      point.totalInvested = totalInvested;

      currentValue += options.regularDepositAmount;

      // Reset the trackers
      compoundsSinceLastDeposit = 0;
      currentDeposit += 1;
    }

    // Update the current value
    point.currentValue = currentValue;

    // Update year end
    if (i % perYear === 0) {
      point.isYearEnd = true;
    }

    points.push(point);
  }

  return points;
}

/**
 * 
 */
function annualizeInvestment(options) {
  let points = [];

  let months = 13;

  let depositsPerPeriod = 0;

  if (options.regularDepositInterval === "daily") {
    depositsPerPeriod = 28;
  } else if (options.regularDepositInterval === "weekly") {
    depositsPerPeriod = 4;
  } else depositsPerPeriod = 2;

  let perYear = months * depositsPerPeriod;
  let annualizedPeriodInterest = options.interestRate / 13 / 100.0;

  // Period-based totals
  let depositsThisPeriod = 0;
  let periodDeposit = 0;
  let periodInterest = 0;
  let currentPeriod = 1;

  // Totals
  let currentValue = options.initialInvestment;
  let totalInterest = 0;

  for (let i = 1; i <= options.timeframe * perYear; i++) {
    // Construct a default point
    let point = {
      depositNum: i,
      deposit: options.regularDepositAmount,
      periodNum: currentPeriod,
      periodDeposit: 0,
      periodInterest: 0,
      totalInterest: 0,
      totalInvested: i * options.regularDepositAmount,
      currentValue: 0,
    };

    // Defaults for depositing
    periodDeposit += options.regularDepositAmount;

    // Update deposits for this period
    depositsThisPeriod += 1;

    // If this is a compounding period, compound away
    if (depositsThisPeriod === depositsPerPeriod) {
      // Calculate interest based on last amount
      periodInterest += (currentValue - periodDeposit + options.regularDepositAmount) * annualizedPeriodInterest;
      totalInterest += periodInterest;

      // Set the data values accordingly
      point.periodDeposit = periodDeposit;
      point.periodInterest = periodInterest;
      point.totalInterest = totalInterest;

      // Update current value
      currentValue += options.regularDepositAmount + periodInterest;

      // Reset values
      periodDeposit = 0;
      periodInterest = 0;
      depositsThisPeriod = 0;

      // Update current period
      currentPeriod += 1;
    } else {
      // Hide the period number
      point.periodNum = -1;
      point.periodInterest = -1;
      point.periodDeposit = -1;

      // If it's not a compound period, we have partial interest to calculate
      periodInterest +=
        options.regularDepositAmount *
        (getInterestPerPeriod(options) *
          (depositsThisPeriod / depositsPerPeriod));

      // Add the current value
      currentValue += options.regularDepositAmount;
    }

    // Update year end
    if (i % perYear === 0) {
      point.isYearEnd = true;
    }

    point.currentValue = currentValue;

    points.push(point);
  }

  return points;
}

function getInterestPerPeriod(options) {
  switch (options.compoundInterval) {
    case "daily":
      return options.interestRate / 365 / 100.0;
    case "weekly":
      return options.interestRate / 52 / 100.0;
    case "bi-weekly":
      return options.interestRate / 26 / 100.0;
    case "monthly":
      return options.interestRate / 12 / 100.0;
    case "quarterly":
      return options.interestRate / 4 / 100.0;
    case "semi-annually":
      return options.interestRate / 2 / 100.0;
    case "yearly":
      return options.interestRate / 100;
    default: return -1;
  }
}

function getTotalDataPoints(additionPeriod, timeline) {
  switch (additionPeriod) {
    case "daily":
      return 365 * timeline;
    case "weekly":
      return 52 * timeline;
    case "bi-weekly":
      return 26 * timeline;
    case "monthly":
      return 12 * timeline;
    case "quarterly":
      return 4 * timeline;
    case "semi-annually":
      return 2 * timeline;
    case "yearly":
      return timeline;
    default: return -1;
  }
}

function getAdditionsPercompoundInterval(additionPeriod, compoundInterval) {
  switch (additionPeriod) {
    case "daily": {
      switch (compoundInterval) {
        case "daily":
          return 1;
        case "weekly":
          return 7;
        case "bi-weekly":
          return 14;
        case "monthly:":
          return 30;
        case "quarterly":
          return 91;
        case "semi-annualy":
          return 182;
        case "yearly":
          return 365;
        default: return -1;
      }
    }
    case "weekly": {
      switch (compoundInterval) {
        case "weekly":
          return 1;
        case "bi-weekly":
          return 2;
        case "monthly":
          return 4;
        case "quarterly":
          return 13;
        case "semi-annually":
          return 26;
        case "yearly":
          return 52;
        default: return -1;
      }
    }
    case "bi-weekly": {
      switch (compoundInterval) {
        case "bi-weekly": return 1;
        case "monthly": return 2;
        case "quarterly": return 6;
        case "semi-annually": return 13;
        case "annually": return 26;
        default: return -1;
      }
    }
    case "monthly": {
      switch (compoundInterval) {
        case "monthly":
          return 1;
        case "quarterly":
          return 3;
        case "semi-annually":
          return 6;
        case "yearly":
          return 12;
        default: return -1;
      }
    }
    case "quarterly": {
      switch (compoundInterval) {
        case "quarterly":
          return 1;
        case "semi-annually":
          return 2;
        case "yearly":
          return 4;
        default: return -1;
      }
    }
    case "semi-annually": {
      switch (compoundInterval) {
        case "semi-annually":
          return 1;
        case "yearly":
          return 2;
        default: return -1;
      }
    }
    case "yearly": {
      switch (compoundInterval) {
        case "yearly":
          return 1;
        default: return -1;
      }
    }
    default: return -1;
  }
}

function getPeriodRank(period) {
  switch (period) {
    case "daily":
      return 0;
    case "weekly":
      return 1;
    case "bi-weekly":
      return 2;
    case "monthly":
      return 3;
    case "quarterly":
      return 4;
    case "semi-annually":
      return 5;
    case "yearly":
      return 6;
    default: return -1;
  }
}
