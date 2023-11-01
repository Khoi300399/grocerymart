const { src, task, series, parallel, dest, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const pug = require("gulp-pug");
const plumber = require("gulp-plumber");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync").create();

const options = {
  views: {
    src: "app/views/*.pug",
    dest: "public",
  },
  styles: {
    src: "app/assets/scss/*.scss",
    dest: "public/styles",
  },
  scripts: {
    src: "app/scripts/**/*.js",
    dest: "public/scripts",
  },
  fonts: {
    src: "app/assets/fonts/**/*",
    dest: "public/fonts",
  },
  images: {
    src: "app/assets/images/**/*",
    dest: "public/images",
  },
  browserSync: {
    baseDir: "public",
  },
};

// Biên dịch Sass thành CSS
task("sassTask", function () {
  return src(options.styles.src, { sourcemaps: true })
    .pipe(
      plumber(function (err) {
        console.log("Sass Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(rename("style.css"))
    .pipe(dest(options.styles.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});

// Biên dịch Pug thành HTML
task("pugTask", function () {
  return src(options.views.src)
    .pipe(
      plumber(function (err) {
        console.log("Pug Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(pug({ pretty: true }))
    .pipe(dest(options.views.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});
// Nén file scripts thành file bundle
task("scriptTask", function () {
  return src(options.scripts.src)
    .pipe(
      plumber(function (err) {
        console.log("Script Task Error");
        console.log(err);
        this.emit("end");
      })
    )
    .pipe(rename("bundle.min.js"))
    .pipe(dest(options.scripts.dest))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});

// Clone images
task("imageTask", function () {
  return src(options.images.src).pipe(
    plumber(function (err) {
      console.log("Image Task Error");
      console.log(err);
      this.emit("end");
    }).pipe(dest(options.images.dest))
  );
});
// Clone fonts
task("fontTask", function () {
  return src(options.fonts.src).pipe(
    plumber(function (err) {
      console.log("Font Task Error");
      console.log(err);
      this.emit("end");
    }).pipe(dest(options.fonts.dest))
  );
});

// Tạo máy chủ phát triển cục bộ và tự động làm mới trình duyệt
task("browserSyncTask", function (done) {
  browserSync.init({
    server: {
      baseDir: options.browserSync.baseDir,
    },
    port: 3000,
  });
  done();
});

function watching() {
  watch(options.styles.src, series("sassTask")).on(
    "change",
    browserSync.reload
  );
  watch(options.views.src, series("pugTask")).on("change", browserSync.reload);
  watch(options.scripts.src, series("scriptTask")).on(
    "change",
    browserSync.reload
  );
  watch(options.images.src, series("imageTask")).on(
    "change",
    browserSync.reload
  );
  watch(options.images.src, series("fontTask")).on(
    "change",
    browserSync.reload
  );
}

// Tác vụ xây dựng chính
task(
  "build",
  parallel("pugTask", "scriptTask", "sassTask", "imageTask", "fontTask")
);

// Tác vụ mặc định
task("default", series("build", parallel(watching, "browserSyncTask")));
