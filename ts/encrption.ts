import CryptoJS, { enc } from 'crypto-js';
import { randomBytes } from 'crypto';

enum ALGO_NAME {
    BCRYPT = 'bcrypt',
    AES = 'aes'
}

type TEncryptionCon = {
    encryptionData: any | undefined;
    choice: number | undefined;
}

type TEncryptionOutput = {
    encryptedForm: string;
    choice: number;
    salt?: string;
    scrambleKey?: string;
}

type TScrambleParams = {
    decryptKey: string;
    salt: string;
}

type TCache = {
    fileName: string;
    type: string;
}

class Encryption {
    private readonly MIN = 1;
    private readonly MAX = 2;
    private encryptionAlgorithm: EncryptionAlgorithmChoice;
    private encryptionData: any;
    private algoChoice: any

    constructor(consOptions: TEncryptionCon) {
        this.algoChoice = Math.floor(Math.random() * (this.MAX - this.MIN + 1) + this.MIN);
        if (consOptions.choice) {
            this.algoChoice = consOptions.choice;
        }
        this.encryptionAlgorithm = new EncryptionAlgorithmChoice(this.algoChoice);
        this.encryptionData = consOptions.encryptionData;
    }

    encrypt(): boolean {
        try {
            const algorithm: EncryptionAlgorithm = this.encryptionAlgorithm.getAlgorithm();
            const salt = this.generateRandomString(15);

            algorithm.setEncryptionData(this.encryptionData);
            algorithm.setSalt(salt);
            const encryptedForm = algorithm.encryption();

            const output: TEncryptionOutput = {
                "choice": this.algoChoice,
                "encryptedForm": encryptedForm,
                "salt": salt
            }

            // TODO : Writing code to generate the decription key
            const decriptionKey = this.generateRandomString(15);

            const scrambleKey = this.scramble({
                "decryptKey": decriptionKey,
                "salt": salt
            });

            const afterScramble: TEncryptionOutput = {
                "choice": this.algoChoice,
                "encryptedForm": encryptedForm,
                "scrambleKey": scrambleKey
            }

            // forming the token
            const finalisedToken = `${afterScramble.encryptedForm}.${afterScramble.choice}.${afterScramble.scrambleKey}`;

            console.log("Encrypted successfullly");

            // TODO : Create a classes that handles storing this keys. e.g file storage, cache, db, etc.



        } catch (error) {
            console.log(error);
            return false;
        }
        return true;


    }

    decrypt(): boolean {
        // const algorithm: EncryptionAlgorithm = this.encryptionAlgorithm.getAlgorithm();
        // algorithm.setEncryptionData(this.encryptionData);
        return false;
    }

    scramble(params: TScrambleParams): string {
        // TODO : write the code to scramble the keys
        console.log("Scrambling the keys for the ");
        return `${params.decryptKey}.${params.salt}`;
    }

    generateRandomString(length): string {
        const buffer = randomBytes(length);
        return buffer.toString('base64').slice(0, length);
    }
}

interface IEncryptionAlgorithmChoice {
    hashCode: number;
    getAlgorithm(): EncryptionAlgorithm;
}

class EncryptionAlgorithmChoice implements IEncryptionAlgorithmChoice {
    hashCode: number;
    private readonly algorithms: Array<string>;
    constructor(choice: number) {
        this.algorithms = ['aes', 'algo2'];
        if (choice > 0) {
            this.hashCode = choice - 1;
        }
    }

    getAlgorithm(): EncryptionAlgorithm {
        const algoName: keyof typeof ALGO_NAME = this.algorithms[this.hashCode] as keyof typeof ALGO_NAME;
        return EncryptionAlgorithmFactory.getAlgorithm(algoName);
    }
}

class EncryptionAlgorithmFactory {
    static getAlgorithm(algorithmName: keyof typeof ALGO_NAME): EncryptionAlgorithm {
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
        return 'nothing';
    }
    decryption(): string {
        return 'nothing';
    }
    setEncryptionData(encryptionData: any): void { }
    setSalt(salt: string): void { }
}

class AesEncryption extends EncryptionAlgorithm {

    private salt: string;
    private encryptionData: any;
    constructor() {
        super();
    }

    setSalt(salt: string): void {
        this.salt = salt;
    }

    setEncryptionData(encryptionData: any): void {
        this.encryptionData = encryptionData;
    }

    encryption(): string {
        return CryptoJS.AES.encrypt(this.encryptionData, this.salt).toString();
    }

    decryption(): string {
        const decryptedBytes = CryptoJS.AES.decrypt(this.encryptionData, this.salt);
        return CryptoJS.enc.Utf8.stringify(decryptedBytes);
    }
}

class Cache {
    constructor(parameters: TCache) {

    }

    // async function createAndWriteFileStream(filePath: string, data: string) {
    //     return new Promise<void>((resolve, reject) => {
    //       const writeStream = createWriteStream(filePath);
      
    //       writeStream.on('error', (error) => {
    //         console.error(`Error writing to file: ${error}`);
    //         reject(error);
    //       });
      
    //       writeStream.on('finish', () => {
    //         console.log(`Data written to file: ${filePath}`);
    //         resolve();
    //       });
      
    //       writeStream.write(data);
    //       writeStream.end();
    //     });
    //   }
      
}