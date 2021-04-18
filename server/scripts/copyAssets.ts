import fs from 'fs-extra';
import path from 'path';

function filter(src:string, dest:string) {
    if(src.endsWith('.ts')) {
        return false;
    }

    return true;
}

fs.copySync(path.join(__dirname, '..', 'src'), path.join(__dirname, '..', 'dist'), {
    filter
});