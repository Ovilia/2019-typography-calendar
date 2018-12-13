export default function (arr) {
    const len = arr.length;
    if (!len) {
        return null;
    }

    const id = Math.floor(Math.random() * len);
    return arr[id];
}
