import { customAlphabet } from "nanoid";

export default (host: string) => {
    const nanoid = customAlphabet("1234567890abcdefg", 7);
    const shortCode = nanoid();
    const shortUrl = `${host}/shorturl/${shortCode}`
    return {
        shortCode,
        shortUrl,
    }
}