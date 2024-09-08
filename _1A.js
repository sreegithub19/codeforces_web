function _1A(input) {
    // Split the input string by spaces and convert to numbers
    const [n, m, a] = input.split(' ').map(Number);

    // Check for valid numbers
    if (isNaN(n) || isNaN(m) || isNaN(a)) {
        throw new Error('Invalid input format: All values must be numbers.');
    }

    // Use Math.ceil to perform calculations
    const x = Math.ceil;
    return x(n / a) * x(m / a);
}

module.exports = { _1A };
