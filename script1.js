// Ensure React and ReactDOM are globally available from the UMD bundles loaded in index1.html
const { useState } = React;

// Main App component for the Breakeven Calculator
const App = () => {
    // State variables for time period toggle (month or year)
    const [timePeriod, setTimePeriod] = useState('month');

    // State variables for detailed fixed costs inputs
    const [minOperationalStaffCosts, setMinOperationalStaffCosts] = useState('');
    const [managerPayrollCosts, setManagerPayrollCosts] = useState('');
    const [administrationCosts, setAdministrationCosts] = useState('');
    const [marketingCosts, setMarketingCosts] = useState('');
    const [repairsMaintenanceCosts, setRepairsMaintenanceCosts] = useState('');
    const [rentCosts, setRentCosts] = useState('');
    const [insuranceCosts, setInsuranceCosts] = useState('');
    const [utilitiesCosts, setUtilitiesCosts] = useState('');

    // State variables for sales input type and values
    const [salesInputType, setSalesInputType] = useState('perGuest'); // 'perGuest' or 'numGuests'
    const [avgSalePricePerGuest, setAvgSalePricePerGuest] = useState('');
    const [avgNumGuests, setAvgNumGuests] = useState('');

    // State variables for percentage-based variable costs
    const [costOfSalesPercent, setCostOfSalesPercent] = useState('');
    const [directExpensesPercent, setDirectExpensesPercent] = useState('');
    const [payrollPercent, setPayrollPercent] = useState('');

    // State variables for calculation result and error messages
    const [breakevenPoint, setBreakevenPoint] = useState(null);
    const [breakevenOutputType, setBreakevenOutputType] = useState(''); // 'guests' or 'revenuePerGuest'
    const [breakevenTotalRevenue, setBreakevenTotalRevenue] = useState(null);
    const [breakevenWeeklyRevenue, setBreakevenWeeklyRevenue] = useState(null);
    const [error, setError] = useState('');

    /**
     * Helper function to parse a string to a float, defaulting to 0 if invalid.
     * @param {string} value The string value to parse.
     * @returns {number} The parsed float or 0.
     */
    const parseNumber = (value) => parseFloat(value || 0);

    /**
     * Handles the calculation of the breakeven point.
     * It validates inputs, sums up detailed fixed costs, calculates selling price and variable cost,
     * performs the breakeven calculation, and updates the state.
     */
    const calculateBreakeven = () => {
        // Clear previous errors and results
        setError('');
        setBreakevenPoint(null);
        setBreakevenOutputType('');
        setBreakevenTotalRevenue(null);
        setBreakevenWeeklyRevenue(null);

        // --- 1. Calculate Total Fixed Costs ---
        const fc_minOperationalStaff = parseNumber(minOperationalStaffCosts);
        const fc_managerPayroll = parseNumber(managerPayrollCosts);
        const fc_administration = parseNumber(administrationCosts);
        const fc_marketing = parseNumber(marketingCosts);
        const fc_repairsMaintenance = parseNumber(repairsMaintenanceCosts);
        const fc_rent = parseNumber(rentCosts);
        const fc_insurance = parseNumber(insuranceCosts);
        const fc_utilities = parseNumber(utilitiesCosts);

        const totalFixedCosts =
            fc_minOperationalStaff +
            fc_managerPayroll +
            fc_administration +
            fc_marketing +
            fc_repairsMaintenance +
            fc_rent +
            fc_insurance +
            fc_utilities;

        // Validate total fixed costs
        if (totalFixedCosts < 0) {
            setError('Total Fixed Costs cannot be negative.');
            return;
        }

        // --- 2. Calculate Total Variable Cost Percentage ---
        const vc_costOfSales = parseNumber(costOfSalesPercent);
        const vc_directExpenses = parseNumber(directExpensesPercent);
        const vc_payroll = parseNumber(payrollPercent);

        // Validate percentages
        if (isNaN(vc_costOfSales) || vc_costOfSales < 0 || vc_costOfSales > 100 ||
            isNaN(vc_directExpenses) || vc_directExpenses < 0 || vc_directExpenses > 100 ||
            isNaN(vc_payroll) || vc_payroll < 0 || vc_payroll > 100) {
            setError('Please enter valid percentages (0-100) for all Variable Cost fields.');
            return;
        }

        const totalVariableCostPercent = vc_costOfSales + vc_directExpenses + vc_payroll;

        if (totalVariableCostPercent >= 100) {
            setError('Total Variable Costs Percentage must be less than 100% of the Selling Price for a breakeven point to exist.');
            return;
        }

        // --- 3. Perform Breakeven Calculation based on Sales Input Type ---
        let calculatedBreakevenPoint = 0;
        let calculatedBreakevenTotalRevenue = 0;

        if (salesInputType === 'perGuest') {
            // Calculate Breakeven Guests
            const sp = parseNumber(avgSalePricePerGuest);
            if (isNaN(sp) || sp <= 0) {
                setError('Please enter a valid positive number for Average Sale Price Per Guest.');
                return;
            }

            const vc = sp * (totalVariableCostPercent / 100);
            const contributionMargin = sp - vc;

            if (contributionMargin <= 0) {
                setError('Selling Price Per Guest must be greater than Variable Cost Per Guest to achieve a breakeven point.');
                return;
            }

            calculatedBreakevenPoint = totalFixedCosts / contributionMargin;
            calculatedBreakevenTotalRevenue = calculatedBreakevenPoint * sp;

            setBreakevenPoint(calculatedBreakevenPoint.toFixed(2));
            setBreakevenOutputType('guests'); // Changed from 'units' to 'guests'

        } else { // salesInputType === 'numGuests'
            // Calculate Breakeven Average Revenue Per Guest
            const numGuests = parseNumber(avgNumGuests);

            if (isNaN(numGuests) || numGuests <= 0) {
                setError(`Please enter a valid positive number for Average Number of Guests (${timePeriod === 'month' ? 'monthly' : 'annually'}).`);
                return;
            }

            // Formula: Breakeven Avg Revenue Per Guest = Fixed Costs / (Avg Num Guests * (1 - Total Variable Cost Percent / 100))
            const denominator = numGuests * (1 - (totalVariableCostPercent / 100));

            if (denominator <= 0) {
                 setError('Cannot calculate breakeven average revenue. Ensure average number of guests is positive and total variable costs are less than 100%.');
                 return;
            }

            calculatedBreakevenPoint = totalFixedCosts / denominator;
            calculatedBreakevenTotalRevenue = calculatedBreakevenPoint * numGuests;

            setBreakevenPoint(calculatedBreakevenPoint.toFixed(2));
            setBreakevenOutputType('revenuePerGuest');
        }

        setBreakevenTotalRevenue(calculatedBreakevenTotalRevenue.toFixed(2));

        // Calculate weekly revenue based on the selected time period
        if (timePeriod === 'month') {
            // Assuming 4.33 weeks in a month
            setBreakevenWeeklyRevenue((calculatedBreakevenTotalRevenue / 4.33).toFixed(2));
        } else { // timePeriod === 'year'
            // Assuming 52 weeks in a year
            setBreakevenWeeklyRevenue((calculatedBreakevenTotalRevenue / 52).toFixed(2));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4 font-inter">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
                    Hospitality Breakeven Calculator
                </h1>

                {/* Time Period Toggle */}
                <div className="mb-6 flex justify-center space-x-4">
                    <button
                        className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
                            timePeriod === 'month'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setTimePeriod('month')}
                    >
                        Per Month
                    </button>
                    <button
                        className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
                            timePeriod === 'year'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setTimePeriod('year')}
                    >
                        Per Year
                    </button>
                </div>

                {/* Detailed Fixed Costs Input Section */}
                <div className="space-y-6 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        Fixed Costs (overhead costs that remain constant regardless of volume of business)
                    </h2>
                    <div className="space-y-4">
                        {/* Input field for Minimum Operational Staff Costs */}
                        <div>
                            <label htmlFor="minOperationalStaffCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Min. Operational Staff Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="minOperationalStaffCosts"
                                value={minOperationalStaffCosts}
                                onChange={(e) => setMinOperationalStaffCosts(e.target.value)}
                                placeholder={`e.g., 10000 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Manager Payroll Costs */}
                        <div>
                            <label htmlFor="managerPayrollCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Manager Payroll Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="managerPayrollCosts"
                                value={managerPayrollCosts}
                                onChange={(e) => setManagerPayrollCosts(e.target.value)}
                                placeholder={`e.g., 5000 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Administration Costs */}
                        <div>
                            <label htmlFor="administrationCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Administration Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="administrationCosts"
                                value={administrationCosts}
                                onChange={(e) => setAdministrationCosts(e.target.value)}
                                placeholder={`e.g., 1000 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Marketing Costs */}
                        <div>
                            <label htmlFor="marketingCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Marketing Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="marketingCosts"
                                value={marketingCosts}
                                onChange={(e) => setMarketingCosts(e.target.value)}
                                placeholder={`e.g., 2000 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                />
                        </div>

                        {/* Input field for Repairs & Maintenance Costs */}
                        <div>
                            <label htmlFor="repairsMaintenanceCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Repairs & Maintenance Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="repairsMaintenanceCosts"
                                value={repairsMaintenanceCosts}
                                onChange={(e) => setRepairsMaintenanceCosts(e.target.value)}
                                placeholder={`e.g., 1500 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Rent Costs */}
                        <div>
                            <label htmlFor="rentCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Rent Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="rentCosts"
                                value={rentCosts}
                                onChange={(e) => setRentCosts(e.target.value)}
                                placeholder={`e.g., 8000 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Insurance Costs */}
                        <div>
                            <label htmlFor="insuranceCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Insurance Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="insuranceCosts"
                                value={insuranceCosts}
                                onChange={(e) => setInsuranceCosts(e.target.value)}
                                placeholder={`e.g., 500 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Utilities Costs */}
                        <div>
                            <label htmlFor="utilitiesCosts" className="block text-sm font-medium text-gray-700 mb-1">
                                Utilities Costs ({timePeriod === 'month' ? 'monthly' : 'annually'}) ($)
                            </label>
                            <input
                                type="number"
                                id="utilitiesCosts"
                                value={utilitiesCosts}
                                onChange={(e) => setUtilitiesCosts(e.target.value)}
                                placeholder={`e.g., 1200 (${timePeriod})`}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Sales Input Section */}
                <div className="space-y-6 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Sales Input</h2>
                    <div className="flex justify-center space-x-4 mb-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio h-4 w-4 text-blue-600"
                                name="salesInputType"
                                value="perGuest"
                                checked={salesInputType === 'perGuest'}
                                onChange={() => setSalesInputType('perGuest')}
                            />
                            <span className="ml-2 text-gray-700">Avg. Sale Price Per Guest</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio h-4 w-4 text-blue-600"
                                name="salesInputType"
                                value="numGuests"
                                checked={salesInputType === 'numGuests'}
                                onChange={() => setSalesInputType('numGuests')}
                            />
                            <span className="ml-2 text-gray-700">Avg. Number of Guests</span>
                        </label>
                    </div>

                    {salesInputType === 'perGuest' ? (
                        <div>
                            <label htmlFor="avgSalePricePerGuest" className="block text-sm font-medium text-gray-700 mb-1">
                                Average Sale Price Per Guest ($)
                            </label>
                            <input
                                type="number"
                                id="avgSalePricePerGuest"
                                value={avgSalePricePerGuest}
                                onChange={(e) => setAvgSalePricePerGuest(e.target.value)}
                                placeholder="e.g., 150"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="avgNumGuests" className="block text-sm font-medium text-gray-700 mb-1">
                                    Average Number of Guests ({timePeriod === 'month' ? 'monthly' : 'annually'})
                                </label>
                                <input
                                    type="number"
                                    id="avgNumGuests"
                                    value={avgNumGuests}
                                    onChange={(e) => setAvgNumGuests(e.target.value)}
                                    placeholder={`e.g., 1000 (${timePeriod})`}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Variable Costs Input Section (Percentages) */}
                <div className="space-y-6 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        Variable Costs (as percentages of selling price)
                    </h2>
                    <div className="space-y-4">
                        {/* Input field for Cost of Sales % */}
                        <div>
                            <label htmlFor="costOfSalesPercent" className="block text-sm font-medium text-gray-700 mb-1">
                                Cost of Sales (Raw Materials) (%)
                            </label>
                            <input
                                type="number"
                                id="costOfSalesPercent"
                                value={costOfSalesPercent}
                                onChange={(e) => setCostOfSalesPercent(e.target.value)}
                                placeholder="e.g., 20"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Direct Expenses % */}
                        <div>
                            <label htmlFor="directExpensesPercent" className="block text-sm font-medium text-gray-700 mb-1">
                                Direct Expenses (Cleaning, etc.) (%)
                            </label>
                            <input
                                type="number"
                                id="directExpensesPercent"
                                value={directExpensesPercent}
                                onChange={(e) => setDirectExpensesPercent(e.target.value)}
                                placeholder="e.g., 5"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                        {/* Input field for Payroll (other staff) % */}
                        <div>
                            <label htmlFor="payrollPercent" className="block text-sm font-medium text-gray-700 mb-1">
                                Payroll (Other Staff) (%)
                            </label>
                            <input
                                type="number"
                                id="payrollPercent"
                                value={payrollPercent}
                                onChange={(e) => setPayrollPercent(e.target.value)}
                                placeholder="e.g., 15"
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Calculate button */}
                <button
                    onClick={calculateBreakeven}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 shadow-md transform hover:scale-105"
                >
                    Calculate Breakeven Point
                </button>

                {/* Display error messages */}
                {error && (
                    <div className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {/* Display the calculated breakeven point */}
                {breakevenPoint !== null && !error && (
                    <div className="mt-8 p-6 bg-green-50 rounded-xl shadow-inner text-center">
                        <h2 className="text-xl font-semibold text-green-800 mb-2">Breakeven Point:</h2>
                        <p className="text-4xl font-bold text-green-700">
                            {breakevenPoint} {breakevenOutputType === 'guests' ? 'Guests' : '($ Average Revenue Per Guest)'}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 mb-4">
                            {breakevenOutputType === 'guests'
                                ? `(You need to serve this many guests to cover all your costs for the ${timePeriod}.)`
                                : `(You need to achieve this average revenue per guest to cover all your costs for the ${timePeriod}.)`}
                        </p>

                        <h3 className="text-xl font-semibold text-green-800 mb-2">Required Revenue:</h3>
                        <p className="text-3xl font-bold text-green-700 mb-2">
                            ${breakevenTotalRevenue} ({timePeriod === 'month' ? 'Monthly' : 'Annually'})
                        </p>
                        <p className="text-3xl font-bold text-green-700">
                            ${breakevenWeeklyRevenue} (Weekly)
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            (This is the total revenue you need to generate to reach breakeven.)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Event listener to launch the app when the button is clicked
document.getElementById('launchButton').addEventListener('click', () => {
    document.getElementById('launcher-section').style.display = 'none';
    const appContainer = document.getElementById('app-container');
    appContainer.style.display = 'block';
    // Use ReactDOM.render for React 18 in a non-module environment
    ReactDOM.render(<App />, appContainer);
});
