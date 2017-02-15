const Jpex = require('../src').extend();

Jpex.register.factory('args', function (yargs) {
  return yargs.argv;
});

Jpex.register.factory('name', function (args, entry, path) {
  if (args.name){
    return args.name;
  }else{
    let basename = path.basename(entry);
    let dot = basename.lastIndexOf('.');
    return dot > -1 ? basename.substr(0, dot) : basename;
  }
});
Jpex.register.factory('entry', function (args, path) {
  if (!args.entry){
    throw new Error('No entry point defined');
  }
  return require.resolve(path.resolve(args.entry));
});
Jpex.register.factory('output', function (args, path) {
  if (!args.output){
    throw new Error('No output file defined');
  }
  return path.resolve(args.output);
});

Jpex.register.factory('minify', function (args, $resolve) {
  return function (content) {
    if (!args.minify){
      return content;
    }
    const uglify = $resolve('uglify-js');
    const opt = {
      fromString : true,
      mangle : {
        eval : true
      }
    };
    const result = uglify.minify(content, opt);
    return result.code;
  };
});

Jpex.register.factory('moduleWrapper', function (fs) {
  const wrapper = fs.readFileSync(__dirname + '/moduleWrapper.js', 'utf8');
  return function (index, content) {
    return wrapper.replace('<target>', index).replace('<content>', content);
  };
});
Jpex.register.factory('scriptWrapper', function (fs) {
  const wrapper = fs.readFileSync(__dirname + '/scriptWrapper.js', 'utf8');
  return function (name, scripts) {
    return wrapper.replace('<scripts>', scripts.join('\n')).replace('<name>', name);
  };
});

Jpex.register.factory('parseFile', function (fs, path, moduleWrapper) {
  return function parseFile(target, fileMap, contentArr) {
    const requireMatch = /require\(['"]([a-zA-Z0-9\-_\.\/\\]+)?['"]\)/g;
    let content = fs.readFileSync(target, 'utf8');

    let match;
    while (match = requireMatch.exec(content)){
      let moduleName = match[1];
      let fullMatch = match[0];

      let modulePath;
      if (moduleName[0] === '.'){
        modulePath = require.resolve(path.join(path.dirname(target), moduleName));
      }else if (path.isAbsolute(moduleName)){
        modulePath = require.resolve(moduleName);
      }else{
        modulePath = require.resolve(moduleName);
      }

      let index = match.index;

      if (fileMap[modulePath] === undefined){
        fileMap[modulePath] = fileMap.$$nextIndex++;
        parseFile(modulePath, fileMap, contentArr);
      }
      let moduleIndex = fileMap[modulePath];

      let newRequire = 'require(' + moduleIndex + ')';

      content = content.substr(0, index) + newRequire + content.substr(index + fullMatch.length);

      requireMatch.lastIndex = requireMatch.lastIndex - fullMatch.length + newRequire.length;
    }

    content = moduleWrapper(fileMap[target], content);

    contentArr.push(content);
  };
});
Jpex.register.factory('wrapScript', function (name, scriptWrapper) {
  return function (scripts) {
    return scriptWrapper(name, scripts);
  };
});
Jpex.register.factory('writeScript', function (output, fs, mkdirp, path) {
  return function (script) {
    mkdirp.sync(path.dirname(output));
    fs.writeFileSync(output, script, 'utf8');
  };
});

const Main = Jpex.extend(function (entry, parseFile, wrapScript, writeScript, minify) {
  const fileMap = {
    $$nextIndex : 1
  };
  fileMap[entry] = 0;
  let contentArr = [];
  parseFile(entry, fileMap, contentArr);

  const script = minify(wrapScript(contentArr));

  writeScript(script);
});

Main();
