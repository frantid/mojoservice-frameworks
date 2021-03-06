/*jslint debug: true, white: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */

/*global console, global, IMPORTS, palmGetResource, MojoLoader, include */

var require = IMPORTS.require;

function fetchGlobalOrRequire(name) {
	return global[name] ? global[name] : require(name);
}

var fs = fetchGlobalOrRequire('fs');
var webos = fetchGlobalOrRequire('webos');

var exports = {};
var loadall;

function fileExists(filename) {
	try {
		fs.statSync(filename);
	} catch (e) {
//		console.log("fileExists(): error: " + JSON.stringify(e));
		return false;
	}
	return true;
}

function loadManifest() {
	var manifest = JSON.parse(fs.readFileSync("manifest.json")),
		i,
		entry,
		files = manifest.files.javascript;

	// console.log("manifest: " + JSON.stringify(manifest));
	loadall = true;

	for (i = 0; i < files.length; ++i) {
		// console.log("include(" + files[i] + ")");
		entry = "javascript/" + files[i];
		console.log("Loading source: " + entry);
		webos.include(entry);
	}

	IMPORTS.require = IMPORTS.require || require;
}

function loadSources() {
	var sources = JSON.parse(fs.readFileSync("sources.json")),
		i,
		file,
		libname;

	for (i = 0; i < sources.length; ++i) {
		file = sources[i];
		if (file.source) {
			console.log("Loading source: " + file.source);
			webos.include(file.source);
		} else if (file.library) {
			console.log("Loading library: " + JSON.stringify(file));
			libname = MojoLoader.builtinLibName(file.library.name, file.library.version);
			if (!global[libname]) {
				IMPORTS[file.library.name] = MojoLoader.require(file.library)[file.library.name];
			}
			else
			{
				IMPORTS[file.library.name] = global[libname];
			}
		} else {
			console.log("Unknown element: " + JSON.stringify(file));
		}
	}

	IMPORTS.require = IMPORTS.require || require;
}

if (!loadall) {
	loadall = true;

	if (fileExists("sources.json")) {
		loadSources();
	} else if (fileExists("manifest.json")) {
		loadManifest();
	} else {
		console.error("Failed to specify either sources.json or manifest.json!");
	}
}
