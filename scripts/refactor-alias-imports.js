const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const SCAN_DIRS = ['src'];
const DRY_RUN = !process.argv.includes('--write');

function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else if (file.match(/\.(ts|js)$/)) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

try {
    let allFiles = [];
    SCAN_DIRS.forEach((dir) => {
        const dirPath = path.join(PROJECT_ROOT, dir);
        allFiles = getAllFiles(dirPath, allFiles);
    });

    let changeCount = 0;
    let fileChangeCount = 0;

    console.log(`🔍 Scanning files in: ${SCAN_DIRS.join(', ')}...`);
    if (DRY_RUN) {
        console.log("ℹ️ Running in DRY RUN mode. Use '--write' flag to apply changes.\n");
    }

    allFiles.forEach((file) => {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;
        const fileDir = path.dirname(file);

        const regex = /(from\s+|import\s+)(['"])(\.{1,2}\/[^'"]+|src\/[^'"]+)\2/g;
        let fileReplacements = 0;

        content = content.replace(regex, (match, prefix, quote, importPath) => {
            let absolutePath;
            if (importPath.startsWith('src/')) {
                absolutePath = path.join(PROJECT_ROOT, importPath);
            } else {
                absolutePath = path.resolve(fileDir, importPath);
            }

            if (!absolutePath.startsWith(PROJECT_ROOT)) {
                return match;
            }

            let relativeToProject = path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/');

            let newImport = match;
            if (relativeToProject.startsWith('src/')) {
                newImport = '@/' + relativeToProject.substring(4);
            }

            if (importPath !== newImport) {
                changeCount++;
                fileReplacements++;
                return `${prefix}${quote}${newImport}${quote}`;
            }

            return match;
        });

        if (content !== originalContent) {
            fileChangeCount++;
            if (!DRY_RUN) {
                fs.writeFileSync(file, content, 'utf8');
                console.log(`✅ Updated: ${path.relative(PROJECT_ROOT, file)} (${fileReplacements} replacements)`);
            } else {
                console.log(`[DRY RUN] ${path.relative(PROJECT_ROOT, file)} (${fileReplacements} replacements)`);
            }
        }
    });

    console.log(`\n🎉 Finished. Total replacements: ${changeCount} across ${fileChangeCount} files.`);
} catch (e) {
    console.error('❌ Error running script:', e);
    process.exit(1);
}
