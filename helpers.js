import fs from 'fs';

export function readdirAsync(path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export function statAsync(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export function unlinkAsync(path) {
    return new Promise((resolve, reject) => {
        fs.unlink(path, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
