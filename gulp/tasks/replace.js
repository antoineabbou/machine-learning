const gulp = require('gulp');

const $ = require('../plugins');
const conf = require('../conf').replace;

gulp.task('replaceHtml', () => {
  return gulp.src(conf.html.src)
    .pipe($.replace(/(src="\/machine-learning\/js\/)([a-z0-9]*)(\.js")/g, '$1$2.min$3'))
    .pipe($.replace(/(href="\/machine-learning\/css\/)([a-z0-9]*)(\.css")/g, '$1$2.min$3'))
    .pipe(gulp.dest(conf.html.dest));
});
