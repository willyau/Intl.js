

var LIBS = {
        fs:     require('fs'),
        path:   require('path'),
        spawn:  require('child_process').spawn
    },
    LIB_PATH = __dirname + '/../src/intl.js',
    TEST_DIR = __dirname + '/test262/pages';


// returns Error if test threw one
function runTest(testPath, cb) {
    var test,
        err = '',
        content = 'var IntlPolyfill = require("' + LIB_PATH + '");\n';

    content += LIBS.fs.readFileSync(LIBS.path.resolve(TEST_DIR, testPath)).toString();
    content += '\nrunner();';

    test = LIBS.spawn(process.execPath, process.execArgv.concat('-e', content));

    test.stderr.on('data', function (data) {
        err += data;
    });

    test.on('exit', function (c) {
        err = (err.match(/^\w*Error:.*$/m) || [err]).pop();

        cb(c ? err : undefined);
    });
}

function listTests() {
    var tests = [],
        todo = [ '.' ],
        stat,
        doing,
        path;

    while (todo.length) {
        /*jshint loopfunc:true*/
        doing = todo.shift();
        path = LIBS.path.resolve(TEST_DIR, doing);
        stat = LIBS.fs.statSync(path);
        if (stat.isFile()) {
            tests.push(doing);
            continue;
        }
        if (stat.isDirectory()) {
            todo = todo.concat(LIBS.fs.readdirSync(path).map(function(a) {
                return LIBS.path.join(doing, a);
            }));
        }
    }
    return tests;
}


function main() {
    var tests,
        passCount = 0,
        failCount = 0;

    tests = listTests();
    tests.sort();

    nextTest(tests.shift());

    function nextTest(testPath) {
        var name,
            err;

        name = LIBS.path.basename(testPath, LIBS.path.extname(testPath));
        err = runTest(testPath, testComplete.bind(null, name));
    }

    function testComplete (name, err) {
        if (err) {
            console.log(name, '-- FAILED', err);
            failCount++;
        } else {
            console.log(name);
            passCount++;
        }

        if (!tests.length) {
            console.log('total ' + (tests.length) + ' -- passed ' + passCount + ' -- failed ' + failCount);
            process.exit(failCount ? 1 : 0);
        }
        else
            nextTest(tests.shift());
    }
}
main();



