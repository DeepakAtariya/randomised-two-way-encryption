import CryptoJS, { enc } from "crypto-js";
import { randomBytes } from "crypto";
import { createReadStream, createWriteStream, unlink } from "fs";

enum ALGO_NAME {
    BCRYPT = "bcrypt",
    AES = "aes",
}

type TEncryptionCon = {
    encryptionData?: any | undefined;
    choice?: number | undefined;
    idetifier: string;
};

type TEncryptionOutput = {
    encryptedForm: string;
    choice: number;
    salt?: string;
    scrambleKey?: string;
};

type TScrambleParams = {
    decryptKey?: string;
    salt?: string;
    scrambleKey?: string;
};

type TCache = {
    fileName: string;
    filePath: string;
    type: string;
};

export default class Encryption {
    private readonly MIN = 1;
    private readonly MAX = 1;
    private filePath: string = './';
    private encryptionAlgorithmChoice: EncryptionAlgorithmChoice;
    private encryptionData?: any;
    private algoChoice?: number;
    // Patient Id
    private idetifier: string;
    private cache: Cache;

    constructor(consOptions: TEncryptionCon) {
        this.algoChoice = Math.floor(
            Math.random() * (this.MAX - this.MIN + 1) + this.MIN
        );
        if (consOptions.choice) {
            this.algoChoice = consOptions.choice;
            console.log("Algo choice is ", this.algoChoice);

        }
        this.encryptionAlgorithmChoice = new EncryptionAlgorithmChoice(this.algoChoice);
        this.encryptionData = consOptions.encryptionData;
        this.idetifier = consOptions.idetifier;
        this.cache = new Cache({
            fileName: this.idetifier,
            filePath: this.filePath,
            type: "file"
        });

    }

    encrypt(): boolean {
        try {
            const algorithm: EncryptionAlgorithm = this.encryptionAlgorithmChoice.getAlgorithm();
            const salt = this.generateRandomString(15);

            algorithm.setEncryptionData(this.encryptionData);
            algorithm.setSalt(salt);
            const encryptedForm = algorithm.encryption();

            const output: TEncryptionOutput = {
                choice: this.algoChoice as number,
                encryptedForm: encryptedForm,
                salt: salt,
            };

            console.log("output : ", output);


            // TODO : Writing code to generate the decription key
            const decriptionKey = this.generateRandomString(15);

            const scrambleKey = this.scramble({
                decryptKey: decriptionKey,
                salt: salt,
            }, true) as string;

            const afterScramble: TEncryptionOutput = {
                choice: this.algoChoice as number,
                encryptedForm: encryptedForm,
                scrambleKey: scrambleKey,
            };

            const fileName = `${this.idetifier}`;

            console.log("output : ", fileName);

            // forming the token
            const finalisedToken = `${afterScramble.encryptedForm}.${afterScramble.choice}.${afterScramble.scrambleKey}`;

            console.log("Encrypted successfullly: ", finalisedToken);

            // TODO : Create a classes that handles storing this keys. e.g file storage, cache, db, etc.
            this.cache.push(finalisedToken);
            console.log(`Data is pushed into : ${this.filePath}${fileName}`);

        } catch (error) {
            console.log(error);
            return false;
        }
        return true;
    }

    async decrypt(): Promise<string> {
        const decrypted: string = await this.cache.pop() as string;

        // splitting by dots
        const split = decrypted.split('.');

        const encryptedForm: string = split[0];
        const choice: number = parseInt(split[1]);
        const scrambleKey: string = split[2];

        const unscrambled = this.scramble({
            scrambleKey
        }, false) as Pick<TScrambleParams, 'decryptKey' | 'salt'>;

        // decryption process started 
        this.algoChoice = choice;
        this.encryptionAlgorithmChoice = new EncryptionAlgorithmChoice(this.algoChoice);
        const algorithm: EncryptionAlgorithm = this.encryptionAlgorithmChoice.getAlgorithm();
        algorithm.setEncryptionData(encryptedForm);
        algorithm.setSalt(unscrambled.salt as string);
        const decryptedForm: string = algorithm.decryption();

        console.log("data decrypted : ", decryptedForm);


        return decryptedForm;
    }

    scramble(params: TScrambleParams, scramble: boolean): string | Pick<TScrambleParams, 'decryptKey' | 'salt'> {
        if (scramble) {
            // TODO : write the code to scramble the keys
            console.log("Scrambling the keys for the ");
            return `${params.decryptKey}.${params.salt}` as string;
        } else {
            // TODO : write the code to unscramble
            // spilting by dots
            const split = params?.scrambleKey?.split('.');
            if (!split) throw new Error("No scramble key found");
            const decryptKey = split[0];
            const salt = split[1];
            return { decryptKey, salt } as Pick<TScrambleParams, 'decryptKey' | 'salt'>;
        }
    }

    generateRandomString(length: number): string {
        const buffer = randomBytes(length);
        return buffer.toString("base64").slice(0, length);
    }
}

interface IEncryptionAlgorithmChoice {
    hashCode: number;
    getAlgorithm(): EncryptionAlgorithm;
}

class EncryptionAlgorithmChoice implements IEncryptionAlgorithmChoice {
    hashCode: number = -1;
    private readonly algorithms: Array<string>;
    constructor(choice: number) {
        this.algorithms = ["aes", "algo2"];
        if (choice > 0) {
            this.hashCode = choice - 1;
        }
    }

    getAlgorithm(): EncryptionAlgorithm {
        const algoName: keyof typeof ALGO_NAME = this.algorithms[
            this.hashCode
        ] as keyof typeof ALGO_NAME;
        return EncryptionAlgorithmFactory.getAlgorithm(algoName);
    }
}

class EncryptionAlgorithmFactory {
    static getAlgorithm(
        algorithmName: keyof typeof ALGO_NAME
    ): EncryptionAlgorithm {
        switch (algorithmName) {
            case ALGO_NAME.AES as string:
                return new AesEncryption();
            default:
                throw new Error("Unsupported algorithm");
        }
    }
}

class EncryptionAlgorithm {
    encryption(): string {
        return "nothing";
    }
    decryption(): string {
        return "nothing";
    }
    setEncryptionData(encryptionData: any): void { }
    setSalt(salt: string): void { }
}

class AesEncryption extends EncryptionAlgorithm {
    private salt: string | undefined = undefined;
    private encryptionData: any = undefined;
    constructor() {
        super();

    }

    setSalt(salt: string): void {
        this.salt = salt as string;
    }

    setEncryptionData(encryptionData: any): void {
        this.encryptionData = encryptionData;
    }

    encryption(): string {
        return CryptoJS.AES.encrypt(this.encryptionData, this.salt as string).toString();
    }

    decryption(): string {
        const decryptedBytes = CryptoJS.AES.decrypt(this.encryptionData, this.salt as string);
        return CryptoJS.enc.Utf8.stringify(decryptedBytes);
    }
}

class Cache {
    private fileName: string | undefined = undefined;
    private filePath: string | undefined = undefined;
    constructor(parameters: TCache) {
        switch (parameters.type) {
            case "file":
                this.fileName = parameters.fileName;
                this.filePath = parameters.filePath;
                break;
            default:
                new Error("Unsupported cache type");
                break;
        }
    }

    async push(data: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const writeStream = createWriteStream(`${this.filePath}${this.fileName}`);

            writeStream.on("error", (error) => {
                console.error(`Error writing to file: ${error}`);
                reject(error);
            });

            writeStream.on("finish", () => {
                console.log(`Data written to file: ${this.filePath}${this.fileName}`);
                resolve();
            });

            writeStream.write(data);
            writeStream.end();
        });
    }

    async pop(): Promise<string | undefined> {
        let data: string = '';
        await new Promise<void>((resolve, reject) => {
            const readStream = createReadStream(`${this.filePath}${this.fileName}`, {
                encoding: "utf8",
            });

            // let output: string | undefined = undefined;
            readStream.on("data", (chunk) => {
                // output = chunk as string;
                console.log("Received chunk:", chunk);

                data = chunk as string;
            });

            readStream.on("end", () => {
                console.log("No more data.");
                unlink(`${this.filePath}${this.fileName}`, (err) => {
                    if (err) {
                        console.error(
                            `An error occurred while deleting the file: ${err.message}`
                        );
                        return '';
                    }
                    console.log(
                        `File deleted successfully: ${this.filePath}${this.fileName}`
                    );
                });
                resolve();
            });

            readStream.on("error", (err) => {
                console.error("An error occurred:", err.message);
                reject();
            });
        });

        return data;

    }
}
