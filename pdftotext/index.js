const tempy = require('tempy');
const cp = require('child_process');
const fs = require('fs');
const util = require('util');
require('util.promisify').shim();

const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);
const execFile = util.promisify(cp.execFile);

function writePdf(context, req) {
    // TODO: validate inputs a bit more strongly
    context.log("TestResult:", {
        isBuffer: Buffer.isBuffer(req.body),
        length: req.body.length
    });

    var bodyJson = JSON.parse(req.body);
    var name = bodyJson.filename;
    var data = bodyJson.data;

    var fileBytes = Buffer.from(data, 'base64');

    const tempname = tempy.file();
    return writeFile(tempname, fileBytes)
        .then(err => {
            return execFile(context.executionContext.functionDirectory + `\\lib\\pdftotext.exe ${tempname} -`, {
                shell: true
            });
        })
        .then((stdout, stderr, error) => {
            context.log(stdout);
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    "filename": "textfile",
                    "text": error.toString()
                }
            }
        })
        .catch((error) => {
            context.res = {
                status: 500,
                body: {
                    "filename": "Error generating text from submitted PDF data - \
                    are you sure you submitted a Base64-encoded PDF? Error: \r\n" + execFile
                }
            };
        })
        .then((ab) => {
            // just delete it and catch the exception if it fails
            // e.g. because it doesn't exist.
            return unlinkFile(tempname);
        })
        .catch(()=>{/*swallow if it doesn't exist*/});
}

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    return writePdf(context, req);
};