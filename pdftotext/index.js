const tempy = require('tempy');
const cp = require('child_process');
const fs = require('fs');
const util = require('util');
require('util.promisify').shim();

const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);
const execFile = util.promisify(cp.execFile);

function writePdf(context, req) {
    var bodyJson;
    try {
        bodyJson = JSON.parse(req.body);
    } catch(e) {
        // probably already parsed, treat it like it is
        bodyJson = req.body;
    }
    const fileBytes = Buffer.from(bodyJson.data, 'base64');
    const tempname = tempy.file();

    return writeFile(tempname, fileBytes)
        .then(err => {
            if(err) throw err;
            return execFile(context.executionContext.functionDirectory + `\\lib\\pdftotext.exe ${tempname} -`, {
                shell: true
            });
        })
        .then((stdout, stderr, error) => {
            context.res = {
                // status: 200, /* Defaults to 200 */
                body: {
                    "filename": "textfile",
                    "text": stdout.toString()
                }
            }
        })
        .catch((error) => {
            context.res = {
                status: 500,
                body: {
                    "filename": "Error generating text from submitted PDF data - \
                    are you sure you submitted a Base64-encoded PDF? Error: \r\n" + error
                }
            };
        })
        .then(() => {
            // just delete it and catch the exception if it fails
            // e.g. because it doesn't exist.
            return unlinkFile(tempname);
        })
        .catch(()=>{/*swallow if it doesn't exist*/});
}

module.exports = function (context, req) {
    // Validate the content is application/json and contains the expected information
    if (req.headers["content-type"] !== 'application/json') {
        example = {
            "filename": "A string filename",
            "data": "Base64-encoded PDF file"
        };
        context.res = {
            status: 415,
            body: {
                "message": "Content and Content-Type must be application/json."
            }
        };
        context.done();
        return;
    }
    // TODO: validate inputs a bit more strongly
    return writePdf(context, req);
};