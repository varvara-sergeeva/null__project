import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import browser from 'browser-sync';
import pug from 'gulp-pug';

// Styles
export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// PUG
//export const pug2html = () => {
//  return gulp.src('source/pug/pages/*.pug')
//  .pipe(pug({pretty: true}))
//  .pipe(gulp.dest('build'));
//}

// HTML
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('build'));
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(gulp.dest('build/js'));
}

// Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'));
}

// WebP
const createWebP = () => {
  return gulp.src(['source/img/*.{jpg,png}', '!sourse/img/favicons'])
  .pipe(squoosh({
    webp: {},
  }))
  .pipe(gulp.dest('build/img'));
}

// SVG
const svg = () => {
  return gulp.src(['source/img/*.svg', '!source/img/sprite/*.svg', '!sourse/img/favicons'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
  .pipe(svgo())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

// Copy
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

const copyFavicon = (done) => {
  gulp.src('source/img/favicons/*.svg')
  .pipe(gulp.dest('build/img/favicons'))
  done();
}

// Clean
const clean = () => {
  return del('build');
};

//Reload

const reload = (done) => {
  browser.reload();
  done();
}


// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/**/*.js', gulp.series(scripts, reload));
  gulp.watch('source/*.html', gulp.series(html, reload));
  //gulp.watch('source/**/*.pug', gulp.series(pug2html, reload));
}

// Build
export const build = gulp.series(
  clean,
  copy,
  copyFavicon,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebP
  ),
);

export default gulp.series(
  clean,
  copy,
  copyFavicon,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebP
  ),
  gulp.series(
    server,
    watcher
  )
);
