module.exports = function (grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		jasmine: {
			src: 'dist/artisanstack.js',
			options: {
				vendor: ['node_modules/jasmine-ajax/lib/mock-ajax.js'],
				specs: ['specs/*-spec.js','specs/3rd-party/*-spec.js'],
				template: require('grunt-template-jasmine-istanbul'),
				templateOptions: {
					coverage: 'coverage/coverage.json',
					report: {
						type: 'lcov',
						options: {
							dir: 'coverage'
						}
					},
					thresholds: {
						lines: 80,
						statements: 80,
						branches: 80,
						functions: 80
					}
				}
			}
		},

		concat: {
			options: {
				separator: "\n\n"
			},
			dist: {
				src: [
					'src/_intro.js',
					'src/main.js',
					'src/umarkdown.js',
					'src/_outro.js'
				],
				dest: 'dist/<%= pkg.name.replace(".js", "") %>.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name.replace(".js", "") %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name.replace(".js", "") %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		jshint: {
			files: ['dist/artisanstack.js'],
			options: {
				globals: {
					console: true,
					module: true,
					document: true
				},
				jshintrc: '.jshintrc'
			}
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['concat', 'jshint', 'jasmine']
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('test', ['jshint', 'jasmine']);
	grunt.registerTask('default', ['concat', 'jshint', 'jasmine', 'uglify']);
  grunt.registerTask('build-skip-test', ['concat', 'jshint', 'uglify'])

};
