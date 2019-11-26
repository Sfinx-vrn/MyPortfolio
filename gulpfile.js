// Выбор установленной версии Gulp
var gulpversion = '4';

// Подключение пакетов
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var cleanCSS = require('gulp-clean-css');
var pug = require('gulp-pug');
var include = require('gulp-include');
var minify = require('gulp-babel-minify');
var del = require('del');
var runSequence = require('run-sequence');
var notify = require('gulp-notify');

// Очистка папки продакшен-сборки
gulp.task('clean:build', function() {
	return del('./build');
});

// Static Server + watching sass/html&others files
if (gulpversion == 3) {
	gulp.task('mainserver', function () {
		browserSync.init({
			server: { baseDir: './build/' },
			// tunnel: true
		});
		gulp.watch('src/pug/**/*.pug', ['pug']);
		gulp.watch('src/sass/**/*.sass', ['sass']);
		gulp.watch('src/fonts/**/*.*', ['copy:fonts']);
		gulp.watch('src/js/**/*.*', ['js:build']);
		// gulp.watch('src/libs/**/*.*', ['copy:libs']);
		gulp.watch('src/img/**/*.*', ['copy:img']);
	});
}
if (gulpversion == 4) {
	gulp.task('mainserver', function () {
		browserSync.init({
			server: { baseDir: './build/' },
			// tunnel: true
		});
		gulp.watch('src/pug/**/*.pug', gulp.parallel('pug'));
		gulp.watch('src/sass/**/*.sass', gulp.parallel('sass'));
		gulp.watch('src/fonts/**/*.*', gulp.parallel('copy:fonts'));
		gulp.watch('src/js/**/*.*', gulp.parallel('js:build'));
		// gulp.watch('src/libs/**/*.*', gulp.parallel('copy:libs'));
		gulp.watch('src/img/**/*.*', gulp.parallel('copy:img'));
	});
}

gulp.task('copy:libs', function () {
	return gulp.src('./src/libs/**/*.*')
		.pipe(gulp.dest('./build/libs/'))
		.pipe(browserSync.stream());
});

gulp.task('copy:img', function () {
	return gulp.src('./src/img/**/*.*')
		.pipe(gulp.dest('./build/img/'))
		.pipe(browserSync.stream());
});

gulp.task('copy:fonts', function () {
	return gulp.src('./src/fonts/**/*.*')
		.pipe(gulp.dest('./build/fonts/'))
		.pipe(browserSync.stream());
});

// Compile sass into CSS & auto-inject into browsers
// Создаем sass задание
// gulp.src - путь по которому лежит scss-файл который мы будем компилировать
// gulp.dest - путь в который мы будем генерить нашу css-ку
// plumber() - не выбрасывать из компилятора если есть ошибки
// errLogToConsole: true - выводить номер строки в которой допущена ошибка
gulp.task('sass', function () {
	return gulp.src('src/sass/main.sass')
		.pipe(sourcemaps.init())
		.pipe(plumber({ errorHandler: notify.onError(
			function(err) {
				return {
					title: 'SASS-Styles Error',
					message: err.message
				};
			}
		) }))
		.pipe(sass({errLogToConsole: true}))
		.pipe(autoprefixer({overrideBrowserslist: ['last 6 versions'] }))
		.pipe(cleanCSS({ level: { 1: { specialComments: 0 } } }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.stream());
	//.pipe(notify('Done! Master Sfinx :)'));
});

// Компиляция PUG в html
gulp.task('pug', function() {
	return gulp.src('src/pug/pages/**/*.pug')
		.pipe(plumber({
			errorHandler: notify.onError(
				function (err) {
					return {title: 'PUG Error',	message: err.message};
				}
			)
		}))
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest('build/'))
		.pipe(browserSync.stream());
});

// Сборка JS с послед. минификацией и построением .map
gulp.task('js:build', function () {
	return gulp.src('src/js/main.js') //Найдем наш main файл
	.pipe(plumber({
		errorHandler: notify.onError(
			function (err) {
				return {title: 'JS Error', message: err.message};
			}
			)
		}))
		// .pipe(sourcemaps.init())
		.pipe(include()) //Собираем файл результирующий main.js из частей
		.pipe(minify()) //Сожмем js
		// .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('build/js')) //Кладем готовый файл в build
		.pipe(browserSync.stream());
});

// Запуск задачи по умолчанию с _последовательным_ выполнением задач
// для разных версий Gulp
if (gulpversion == 3) {
	gulp.task('default', function(callback) {
			runSequence(
				'clean:build',
				['sass', 'pug', 'js:build', 'copy:img', 'copy:fonts'],
				'mainserver',
				callback
			);
	});
}

if (gulpversion == 4) {
	gulp.task('default', gulp.series('clean:build', gulp.parallel('sass', 'pug', 'js:build', 'copy:img', 'copy:fonts'), 'mainserver'));
}