const cachedImages = {};

export async function getImage(path: string) {
    if (cachedImages[path]) {
        return cachedImages[path];
    }

    return await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            cachedImages[path] = img;
            resolve(img);
        };
        img.onerror = reject;
        img.src = path;
    });
}
