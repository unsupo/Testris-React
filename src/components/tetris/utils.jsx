export const clone = (obj) => JSON.parse(JSON.stringify(obj));

export const rotateMatrix = (matrix) => {
    return matrix[0].map((_, colIndex) =>
        matrix.map((row) => row[colIndex]).reverse()
    );
}