export const dashesToCamelcase = (str) =>
    str
        .split("-")
        .map((s) => s[0].toUpperCase() + s.slice(1))
        .join("");

export const splitArrayIntoChunks = (inputArray, chunkSize) =>
    //from Andrei R, https://stackoverflow.com/a/37826698
    inputArray.reduce((resultArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

export const splitArray = (sourceArray, condition) => {
    let passArray = [];
    let failArray = [];

    sourceArray.forEach((item) => {
        if (condition(item)) {
            passArray.push(item);
        } else {
            failArray.push(item);
        }
    });

    return [passArray, failArray];
};
