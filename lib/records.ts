import fs from 'fs';
import path from 'path';

export interface GenerationRecord {
    timestamp: string; // ISO string
    productId: string;
    hasEnv: boolean;
    // base64 strings may be large; store only length or a short hash
    imageSizeKB?: number;
    copyTexts?: { styleA: string; styleB: string; styleC: string };
}

const recordsFile = path.join(process.cwd(), 'data', 'records.json');

function ensureFile() {
    const dir = path.dirname(recordsFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(recordsFile)) {
        fs.writeFileSync(recordsFile, JSON.stringify([]), 'utf8');
    }
}

export function getRecords(): GenerationRecord[] {
    ensureFile();
    const content = fs.readFileSync(recordsFile, 'utf8');
    try {
        return JSON.parse(content) as GenerationRecord[];
    } catch {
        return [];
    }
}

export function addRecord(record: GenerationRecord): void {
    ensureFile();
    const records = getRecords();
    records.push(record);
    fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2), 'utf8');
}
