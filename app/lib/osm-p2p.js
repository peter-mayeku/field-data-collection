const levelup = require("levelup");
const asyncstorage = require("asyncstorage-down");
const hyperlog = require("hyperlog");
const osmdb = require("osm-p2p-db");
const eos = require("end-of-stream");

const createStore = require("./asyncstorage-chunk-store");
const convert = require("./convert-geojson-osmp2p");

function osmp2p() {
  const logdb = levelup("db", { db: asyncstorage });
  const log = hyperlog(logdb, { valueEncoding: "json" });

  var db = osmdb({
    log: log,
    db: levelup("index", { db: asyncstorage }),
    store: createStore(1024, "chunks")
  });

  return {
    ready: ready,
    create: create,
    put: put,
    del: del,
    createObservation: createObservation,
    putObservation: putObservation,
    delObservation: delObservation,
    query: query,
    replicate: replicate
  };

  function ready(cb) {
    osm.ready(cb);
  }

  function create(geojson, opts, cb) {
    var doc = convert.toOSM(geojson);
    osm.create(doc, opts, callback);
  }

  function put(id, geojson, opts, cb) {
    var doc = convert.toOSM(geojson);
    osm.put(id, doc, opts, callback);
  }

  function del(id, opts, cb) {
    osm.del(id, opts, cb);
  }

  function createObservation(geojson, opts, cb) {
    var doc = convert.toOSM(geojson, "observation");
    osm.create(doc, opts, callback);
  }

  function putObservation(id, geojson, opts, cb) {
    var doc = convert.toOSM(geojson, "observation");
    osm.put(id, doc, opts, callback);
  }

  function delObservation(id, opts, cb) {
    osm.del(id, opts, cb);
  }

  function query(q, opts, cb) {
    return osm.query(q, opts, cb);
  }

  function replicate(opts) {
    return osm.log.replicate(opts);
  }

  function sync(transportStream, opts, callback) {
    if (typeof opts === "function") {
      callback = opts;
      opts = null;
    }

    var osmStream = replicate(opts);

    eos(osmStream, onend);
    eos(transportStream, onend);

    let pending = 2;
    function onend(err) {
      pending--;
      if (err) return callback(err);
      if (pending === 0) return callback();
    }

    return osmStream.pipe(transportStream).pipe(osmStream);
  }
}

export default osmp2p;