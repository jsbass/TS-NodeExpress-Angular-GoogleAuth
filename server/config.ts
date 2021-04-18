import path from 'path';
import fs from 'fs';
import process from 'process';
const file = path.join(__dirname, `config-${(process.env.ENVIRONMENT || 'dev')}.json`);

interface ConfigObject {
    serverPort: number;
    env: string;
    googleClientId: string;
    sessionSecrets: string[];
    db: {
        host: string,
        password: string,
        user: string
    }
}

let configValues: ConfigObject;

function loadSync(forceRefresh = false): ConfigObject {
    if(configValues === undefined || forceRefresh) {
        configValues = JSON.parse(fs.readFileSync(file, 'utf8'));
    }

    return configValues;
}

async function load(forceRefresh = false): Promise<ConfigObject> {
    return new Promise((resolve, reject) => {
        if(configValues === undefined || forceRefresh) {
            fs.readFile(file, 'utf8', (err: Error, data: string) => {
                try {
                    if (err) {
                        reject(err);
                    }
                    else {
                        configValues = JSON.parse(data);
                        resolve(configValues);
                    }
                }
                catch(e) {
                    reject(e);
                }
            });
        }
        else {
            resolve(configValues);
        }
    })
}

export {
    load,
    loadSync
}