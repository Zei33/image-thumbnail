export const streamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        const buffers = [];
        stream.on("data", (data) => {
            buffers.push(data);
        });

        stream.on("end", () => {
            resolve(Buffer.concat(buffers));
        });

        stream.on("error", (error) => reject(error));
    });
};

export const removeUndefined = (dimensions) => {
    Object.keys(dimensions).forEach(key => dimensions[key] === undefined && delete dimensions[key]);
    return dimensions;
};