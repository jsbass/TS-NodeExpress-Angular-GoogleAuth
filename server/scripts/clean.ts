import fs from 'fs';
import path from 'path';

fs.rmdirSync(path.join(__dirname, '../dist'), { recursive: true });