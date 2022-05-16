const sumAll = function(num1, num2) {
    if (typeof num1 != 'number' || typeof num2 != 'number' || num1 <0 || num2<0) {
        return 'ERROR';
    }
    
    let start, end;
    if (num1 < num2) {
        start = num1;
        end = num2;
    } else if (num1 > num2) {
        start = num2;
        end = num1;
    } else {
        return num1;
    }

    let total = 0;
    for (let i = start; i <= end; i++) {
        total += i;
    }
    return total;
};

// Do not edit below this line
module.exports = sumAll;
