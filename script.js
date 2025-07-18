function calculateBreakeven() {
    // Get input values from the HTML fields
    const fixedCostsInput = document.getElementById('fixedCosts');
    const pricePerUnitInput = document.getElementById('pricePerUnit');
    const variableCostsPerUnitInput = document.getElementById('variableCostsPerUnit');

    const breakevenUnitsSpan = document.getElementById('breakevenUnits');
    const breakevenRevenueSpan = document.getElementById('breakevenRevenue');
    const errorMessageSpan = document.getElementById('errorMessage');

    // Clear previous error message and results
    errorMessageSpan.textContent = '';
    breakevenUnitsSpan.textContent = '';
    breakevenRevenueSpan.textContent = '';

    // Convert input values to numbers
    const fixedCosts = parseFloat(fixedCostsInput.value);
    const pricePerUnit = parseFloat(pricePerUnitInput.value);
    const variableCostsPerUnit = parseFloat(variableCostsPerUnitInput.value);

    // Input validation
    if (isNaN(fixedCosts) || fixedCosts < 0) {
        errorMessageSpan.textContent = 'Please enter a valid non-negative number for Fixed Costs.';
        fixedCostsInput.focus();
        return;
    }
    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
        errorMessageSpan.textContent = 'Please enter a valid positive number for Selling Price Per Unit.';
        pricePerUnitInput.focus();
        return;
    }
    if (isNaN(variableCostsPerUnit) || variableCostsPerUnit < 0) {
        errorMessageSpan.textContent = 'Please enter a valid non-negative number for Variable Costs Per Unit.';
        variableCostsPerUnitInput.focus();
        return;
    }

    // Calculate Contribution Margin Per Unit
    const contributionMarginPerUnit = pricePerUnit - variableCostsPerUnit;

    // Check for valid contribution margin
    if (contributionMarginPerUnit <= 0) {
        errorMessageSpan.textContent = 'Selling Price Per Unit must be greater than Variable Costs Per Unit to have a positive contribution margin.';
        pricePerUnitInput.focus(); // Suggest fixing price
        return;
    }

    // Calculate Breakeven Point in Units
    const breakevenUnits = fixedCosts / contributionMarginPerUnit;

    // Calculate Breakeven Point in Revenue
    const breakevenRevenue = breakevenUnits * pricePerUnit;

    // Display the results, formatted to two decimal places
    breakevenUnitsSpan.textContent = breakevenUnits.toFixed(2);
    breakevenRevenueSpan.textContent = breakevenRevenue.toFixed(2);
}