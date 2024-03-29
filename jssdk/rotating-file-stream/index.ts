// @ts-nocheck

"use strict";
import { exec } from "child_process";
import { createGzip } from "zlib";
import { Writable } from "stream";
import { access, constants, createReadStream, createWriteStream } from "fs";
import { mkdir, open, readFile, rename, stat, unlink, writeFile } from "fs/promises";
import { sep } from "path";
import { TextDecoder } from "util";
async function exists(filename) {
  return new Promise(resolve => access(filename, constants.F_OK, error => resolve(!error)));
}
export class RotatingFileStreamError extends Error {
  code = "RFS-TOO-MANY";
  constructor() {
    super("Too many destination file attempts");
  }
}
export class RotatingFileStream extends Writable {
  createGzip;
  exec;
  file;
  filename;
  finished;
  fsCreateReadStream;
  fsCreateWriteStream;
  fsOpen;
  fsReadFile;
  fsStat;
  fsUnlink;
  generator;
  initPromise;
  last;
  maxTimeout;
  next;
  options;
  prev;
  rotation;
  size;
  stdout;
  timeout;
  timeoutPromise;
  constructor(generator, options) {
    const { encoding, history, maxFiles, maxSize, path } = options;
    super({ decodeStrings: true, defaultEncoding: encoding });
    this.createGzip = createGzip;
    this.exec = exec;
    this.filename = path + generator(null);
    this.fsCreateReadStream = createReadStream;
    this.fsCreateWriteStream = createWriteStream;
    this.fsOpen = open;
    this.fsReadFile = readFile;
    this.fsStat = stat;
    this.fsUnlink = unlink;
    this.generator = generator;
    this.maxTimeout = 2147483640;
    this.options = options;
    this.stdout = process.stdout;
    if (maxFiles || maxSize)
      options.history = path + (history ? history : this.generator(null) + ".txt");
    this.on("close", () => (this.finished ? null : this.emit("finish")));
    this.on("finish", () => (this.finished = this.clear()));
    // In v15 was introduced the _constructor method to delay any _write(), _final() and _destroy() calls
    // Untill v16 will be not deprecated we still need this.initPromise
    // https://nodejs.org/api/stream.html#stream_writable_construct_callback
    (async () => {
      try {
        this.initPromise = this.init();
        await this.initPromise;
        delete this.initPromise;
      }
      catch (e) { }
    })();
  }
  _destroy(error, callback) {
    this.refinal(error, callback);
  }
  _final(callback) {
    this.refinal(undefined, callback);
  }
  _write(chunk, encoding, callback) {
    this.rewrite([{ chunk, encoding }], 0, callback);
  }
  _writev(chunks, callback) {
    this.rewrite(chunks, 0, callback);
  }
  async refinal(error, callback) {
    try {
      this.clear();
      if (this.initPromise)
        await this.initPromise;
      if (this.timeoutPromise)
        await this.timeoutPromise;
      await this.reclose();
    }
    catch (e) {
      return callback(error || e);
    }
    callback(error);
  }
  async rewrite(chunks, index, callback) {
    const { size, teeToStdout } = this.options;
    try {
      if (this.initPromise)
        await this.initPromise;
      for (let i = 0; i < chunks.length; ++i) {
        const { chunk } = chunks[i];
        this.size += chunk.length;
        if (this.timeoutPromise)
          await this.timeoutPromise;
        await this.file.write(chunk);
        if (teeToStdout && !this.stdout.destroyed)
          this.stdout.write(chunk);
        if (size && this.size >= size)
          await this.rotate();
      }
    }
    catch (e) {
      return callback(e);
    }
    callback();
  }
  async init() {
    const { immutable, initialRotation, interval, size } = this.options;
    // In v15 was introduced the _constructor method to delay any _write(), _final() and _destroy() calls
    // Once v16 will be deprecated we can restore only following line
    // if(immutable) return this.immutate(true);
    if (immutable)
      return new Promise((resolve, reject) => process.nextTick(() => this.immutate(true).then(resolve).catch(reject)));
    let stats;
    try {
      stats = await stat(this.filename);
    }
    catch (e) {
      if (e.code !== "ENOENT")
        throw e;
      return this.reopen(0);
    }
    if (!stats.isFile())
      throw new Error(`Can't write on: ${this.filename} (it is not a file)`);
    if (initialRotation) {
      this.intervalBounds(this.now());
      const prev = this.prev;
      this.intervalBounds(new Date(stats.mtime.getTime()));
      if (prev !== this.prev)
        return this.rotate();
    }
    this.size = stats.size;
    if (!size || stats.size < size)
      return this.reopen(stats.size);
    if (interval)
      this.intervalBounds(this.now());
    return this.rotate();
  }
  async makePath(name) {
    return mkdir(name.split(sep).slice(0, -1).join(sep), { recursive: true });
  }
  async reopen(size) {
    let file;
    try {
      file = await open(this.filename, "a", this.options.mode);
    }
    catch (e) {
      if (e.code !== "ENOENT")
        throw e;
      await this.makePath(this.filename);
      file = await open(this.filename, "a", this.options.mode);
    }
    this.file = file;
    this.size = size;
    this.interval();
    this.emit("open", this.filename);
  }
  async reclose() {
    const { file } = this;
    if (!file)
      return;
    delete this.file;
    return file.close();
  }
  now() {
    return new Date();
  }
  async rotate() {
    const { immutable, rotate } = this.options;
    this.size = 0;
    this.rotation = this.now();
    this.clear();
    this.emit("rotation");
    await this.reclose();
    if (rotate)
      return this.classical();
    if (immutable)
      return this.immutate(false);
    return this.move();
  }
  async findName() {
    const { interval, path, intervalBoundary } = this.options;
    for (let index = 1; index < 1000; ++index) {
      const filename = path + this.generator(interval && intervalBoundary ? new Date(this.prev) : this.rotation, index);
      if (!(await exists(filename)))
        return filename;
    }
    throw new RotatingFileStreamError();
  }
  async move() {
    const { compress } = this.options;
    const filename = await this.findName();
    await this.touch(filename);
    if (compress)
      await this.compress(filename);
    else
      await rename(this.filename, filename);
    return this.rotated(filename);
  }
  async touch(filename) {
    let file;
    try {
      file = await this.fsOpen(filename, "a");
    }
    catch (e) {
      if (e.code !== "ENOENT")
        throw e;
      await this.makePath(filename);
      file = await open(filename, "a");
    }
    await file.close();
    return this.unlink(filename);
  }
  async classical() {
    const { compress, path, rotate } = this.options;
    let rotatedName = "";
    for (let count = rotate; count > 0; --count) {
      const currName = path + this.generator(count);
      const prevName = count === 1 ? this.filename : path + this.generator(count - 1);
      if (!(await exists(prevName)))
        continue;
      if (!rotatedName)
        rotatedName = currName;
      if (count === 1 && compress)
        await this.compress(currName);
      else {
        try {
          await rename(prevName, currName);
        }
        catch (e) {
          if (e.code !== "ENOENT")
            throw e;
          await this.makePath(currName);
          await rename(prevName, currName);
        }
      }
    }
    return this.rotated(rotatedName);
  }
  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    return true;
  }
  intervalBoundsBig(now) {
    const year = now.getFullYear();
    let month = now.getMonth();
    let day = now.getDate();
    let hours = now.getHours();
    const { num, unit } = this.options.interval;
    if (unit === "M") {
      day = 1;
      hours = 0;
    }
    else if (unit === "d")
      hours = 0;
    else
      hours = parseInt((hours / num), 10) * num;
    this.prev = new Date(year, month, day, hours, 0, 0, 0).getTime();
    if (unit === "M")
      month += num;
    else if (unit === "d")
      day += num;
    else
      hours += num;
    this.next = new Date(year, month, day, hours, 0, 0, 0).getTime();
  }
  intervalBounds(now) {
    const unit = this.options.interval.unit;
    if (unit === "M" || unit === "d" || unit === "h")
      this.intervalBoundsBig(now);
    else {
      let period = 1000 * this.options.interval.num;
      if (unit === "m")
        period *= 60;
      this.prev = parseInt((now.getTime() / period), 10) * period;
      this.next = this.prev + period;
    }
    return new Date(this.prev);
  }
  interval() {
    if (!this.options.interval)
      return;
    this.intervalBounds(this.now());
    const set = async () => {
      const time = this.next - this.now().getTime();
      if (time <= 0) {
        try {
          this.timeoutPromise = this.rotate();
          await this.timeoutPromise;
          delete this.timeoutPromise;
        }
        catch (e) { }
      }
      else {
        this.timeout = setTimeout(set, time > this.maxTimeout ? this.maxTimeout : time);
        this.timeout.unref();
      }
    };
    set();
  }
  async compress(filename) {
    const { compress } = this.options;
    if (typeof compress === "function") {
      await new Promise((resolve, reject) => {
        this.exec(compress(this.filename, filename), (error, stdout, stderr) => {
          this.emit("external", stdout, stderr);
          error ? reject(error) : resolve();
        });
      });
    }
    else
      await this.gzip(filename);
    return this.unlink(this.filename);
  }
  async gzip(filename) {
    const { mode } = this.options;
    const options = mode ? { mode } : {};
    const inp = this.fsCreateReadStream(this.filename, {});
    const out = this.fsCreateWriteStream(filename, options);
    const zip = this.createGzip();
    return new Promise((resolve, reject) => {
      [inp, out, zip].map(stream => stream.once("error", reject));
      out.once("finish", resolve);
      inp.pipe(zip).pipe(out);
    });
  }
  async rotated(filename) {
    const { maxFiles, maxSize } = this.options;
    if (maxFiles || maxSize)
      await this.history(filename);
    this.emit("rotated", filename);
    return this.reopen(0);
  }
  async history(filename) {
    const { history, maxFiles, maxSize } = this.options;
    const res = [];
    let files = [filename];
    try {
      const content = await this.fsReadFile(history, "utf8");
      files = [...content.toString().split("\n"), filename];
    }
    catch (e) {
      if (e.code !== "ENOENT")
        throw e;
    }
    for (const file of files) {
      if (file) {
        try {
          const stats = await this.fsStat(file);
          if (stats.isFile()) {
            res.push({
              name: file,
              size: stats.size,
              time: stats.ctime.getTime()
            });
          }
          else
            this.emit("warning", new Error(`File '${file}' contained in history is not a regular file`));
        }
        catch (e) {
          if (e.code !== "ENOENT")
            throw e;
        }
      }
    }
    res.sort((a, b) => a.time - b.time);
    if (maxFiles) {
      while (res.length > maxFiles) {
        const file = res.shift();
        await this.unlink(file.name);
        this.emit("removed", file.name, true);
      }
    }
    if (maxSize) {
      while (res.reduce((size, file) => size + file.size, 0) > maxSize) {
        const file = res.shift();
        await this.unlink(file.name);
        this.emit("removed", file.name, false);
      }
    }
    await writeFile(history, res.map(e => e.name).join("\n") + "\n", "utf-8");
    this.emit("history");
  }
  async immutate(first) {
    const { size } = this.options;
    const now = this.now();
    for (let index = 1; index < 1000; ++index) {
      let fileSize = 0;
      let stats = undefined;
      this.filename = this.options.path + this.generator(now, index);
      try {
        stats = await this.fsStat(this.filename);
      }
      catch (e) {
        if (e.code !== "ENOENT")
          throw e;
      }
      if (stats) {
        fileSize = stats.size;
        if (!stats.isFile())
          throw new Error(`Can't write on: '${this.filename}' (it is not a file)`);
        if (size && fileSize >= size)
          continue;
      }
      if (first) {
        this.last = this.filename;
        return this.reopen(fileSize);
      }
      await this.rotated(this.last);
      this.last = this.filename;
      return;
    }
    throw new RotatingFileStreamError();
  }
  async unlink(filename) {
    try {
      await this.fsUnlink(filename);
    }
    catch (e) {
      if (e.code !== "ENOENT")
        throw e;
      this.emit("warning", e);
    }
  }
}
function buildNumberCheck(field) {
  return (type, options, value) => {
    const converted = parseInt(value, 10);
    if (type !== "number" || converted !== value || converted <= 0)
      throw new Error(`'${field}' option must be a positive integer number`);
  };
}
function buildStringCheck(field, check) {
  return (type, options, value) => {
    if (type !== "string")
      throw new Error(`Don't know how to handle 'options.${field}' type: ${type}`);
    options[field] = check(value);
  };
}
function checkMeasure(value, what, units) {
  const ret = {};
  ret.num = parseInt(value, 10);
  if (isNaN(ret.num))
    throw new Error(`Unknown 'options.${what}' format: ${value}`);
  if (ret.num <= 0)
    throw new Error(`A positive integer number is expected for 'options.${what}'`);
  ret.unit = value.replace(/^[ 0]*/g, "").substr((ret.num + "").length, 1);
  if (ret.unit.length === 0)
    throw new Error(`Missing unit for 'options.${what}'`);
  if (!units[ret.unit])
    throw new Error(`Unknown 'options.${what}' unit: ${ret.unit}`);
  return ret;
}
const intervalUnits = { M: true, d: true, h: true, m: true, s: true };
function checkIntervalUnit(ret, unit, amount) {
  if (parseInt((amount / ret.num), 10) * ret.num !== amount)
    throw new Error(`An integer divider of ${amount} is expected as ${unit} for 'options.interval'`);
}
function checkInterval(value) {
  const ret = checkMeasure(value, "interval", intervalUnits);
  switch (ret.unit) {
    case "h":
      checkIntervalUnit(ret, "hours", 24);
      break;
    case "m":
      checkIntervalUnit(ret, "minutes", 60);
      break;
    case "s":
      checkIntervalUnit(ret, "seconds", 60);
      break;
  }
  return ret;
}
const sizeUnits = { B: true, G: true, K: true, M: true };
function checkSize(value) {
  const ret = checkMeasure(value, "size", sizeUnits);
  if (ret.unit === "K")
    return ret.num * 1024;
  if (ret.unit === "M")
    return ret.num * 1048576;
  if (ret.unit === "G")
    return ret.num * 1073741824;
  return ret.num;
}
const checks = {
  encoding: (type, options, value) => new TextDecoder(value),
  immutable: () => { },
  initialRotation: () => { },
  interval: buildStringCheck("interval", checkInterval),
  intervalBoundary: () => { },
  maxFiles: buildNumberCheck("maxFiles"),
  maxSize: buildStringCheck("maxSize", checkSize),
  mode: () => { },
  omitExtension: () => { },
  rotate: buildNumberCheck("rotate"),
  size: buildStringCheck("size", checkSize),
  teeToStdout: () => { },
  compress: (type, options, value) => {
    if (!value)
      throw new Error("A value for 'options.compress' must be specified");
    if (type === "boolean")
      return (options.compress = (source, dest) => `cat ${source} | gzip -c9 > ${dest}`);
    if (type === "function")
      return;
    if (type !== "string")
      throw new Error(`Don't know how to handle 'options.compress' type: ${type}`);
    if (value !== "gzip")
      throw new Error(`Don't know how to handle compression method: ${value}`);
  },
  history: (type) => {
    if (type !== "string")
      throw new Error(`Don't know how to handle 'options.history' type: ${type}`);
  },
  path: (type, options, value) => {
    if (type !== "string")
      throw new Error(`Don't know how to handle 'options.path' type: ${type}`);
    if (value[value.length - 1] !== sep)
      options.path = value + sep;
  }
};
function checkOpts(options) {
  const ret = {};
  for (const opt in options) {
    const value = options[opt];
    const type = typeof value;
    if (!(opt in checks))
      throw new Error(`Unknown option: ${opt}`);
    ret[opt] = options[opt];
    checks[opt](type, ret, value);
  }
  if (!ret.path)
    ret.path = "";
  if (!ret.interval) {
    delete ret.immutable;
    delete ret.initialRotation;
    delete ret.intervalBoundary;
  }
  if (ret.rotate) {
    delete ret.history;
    delete ret.immutable;
    delete ret.maxFiles;
    delete ret.maxSize;
    delete ret.intervalBoundary;
  }
  if (ret.immutable)
    delete ret.compress;
  if (!ret.intervalBoundary)
    delete ret.initialRotation;
  return ret;
}
function createClassical(filename, compress, omitExtension) {
  return (index) => (index ? `${filename}.${index}${compress && !omitExtension ? ".gz" : ""}` : filename);
}
function createGenerator(filename, compress, omitExtension) {
  const pad = (num) => (num > 9 ? "" : "0") + num;
  return (time, index) => {
    if (!time)
      return filename;
    const month = time.getFullYear() + "" + pad(time.getMonth() + 1);
    const day = pad(time.getDate());
    const hour = pad(time.getHours());
    const minute = pad(time.getMinutes());
    return month + day + "-" + hour + minute + "-" + pad(index) + "-" + filename + (compress && !omitExtension ? ".gz" : "");
  };
}
export function createStream(filename, options) {
  if (typeof options === "undefined")
    options = {};
  else if (typeof options !== "object")
    throw new Error(`The "options" argument must be of type object. Received type ${typeof options}`);
  const opts = checkOpts(options);
  const { compress, omitExtension } = opts;
  let generator;
  if (typeof filename === "string")
    generator = options.rotate ? createClassical(filename, compress !== undefined, omitExtension) : createGenerator(filename, compress !== undefined, omitExtension);
  else if (typeof filename === "function")
    generator = filename;
  else
    throw new Error(`The "filename" argument must be one of type string or function. Received type ${typeof filename}`);
  return new RotatingFileStream(generator, opts);
}
