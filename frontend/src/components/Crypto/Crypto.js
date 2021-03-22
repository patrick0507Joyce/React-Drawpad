const crypto = require("crypto")

const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(process.env.REACT_APP_CRYPTO_ALGORITHM,
        process.env.REACT_APP_CRYPTO_KEY, iv);
    
    const encrypted = cipher.update(text);
    //alternative:
    //Buffer.concat([cipher.update(text), cipher.final()]);
    cipher.final();
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(process.env.REACT_APP_CRYPTO_ALGORITHM,
        process.env.REACT_APP_CRYPTO_KEY, Buffer.from(hash.iv, 'hex'));
    
    const decrypted = decipher.update(Buffer.from(hash.content, 'hex'));
    //alternative:
    //Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    decipher.final();
    return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt
}