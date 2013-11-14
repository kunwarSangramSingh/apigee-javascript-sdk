module.exports = function(grunt) {
  var tests = 'tests/**/*';
  var tasks = 'source/**/*.js';
  var samples = 'samples/**/*.*';
  var reportDir = 'report';
  // Project configuration.
  grunt.initConfig({
    //pkg: grunt.file.readJSON('package.json'),
    meta: {
      package: grunt.file.readJSON('package.json'),
      src: {
        main: 'source',
        lib: 'bower_components',
        test: 'tests',
        samples: 'samples'
      },
      bin: {
        main: 'build/',
        coverage: 'reports/coverage'
      }
    },
    clean: ['build', 'tmp', 'report', 'instrument'],
    bumpup: 'package.json',
    watch : {
      files : [ tasks, tests, samples ],
      tasks : ['default']
    },
    //build
    copy: {
      app: {
        files: [{
          expand: true,
          cwd: '<%= meta.src.main %>',
          src: ['**/*.js'],
          dest: 'build/source'
        }, {
          expand: true,
          cwd: '<%= meta.src.lib %>/usergrid-javascript-sdk',
          src: ['usergrid.js'],
          dest: 'build/source'
        }, {
          expand: true,
          cwd: '<%= meta.src.samples %>',
          src: ['**'],
          dest: 'build/samples'
        }, {
          expand: true,
          cwd: '<%= meta.src.test %>',
          src: ['**'],
          dest: 'build/tests'
        }]
      }
    },
    //testing tasks
    complexity: {
      generic: {
        src: ['<%= meta.bin.main %>/source/**/*.js'],
        options: {
          //jsLintXML: reportDir+'/jsLintReport.xml', // create XML JSLint-like report
          //checkstyleXML: reportDir+'/checkstyle.xml', // create checkstyle report
          errorsOnly: false, // show only maintainability errors                
          cyclomatic: 10,
          halstead: 40,
          maintainability: 100
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        //eqeqeq: true,
        eqnull: true,
        //browser: true,
        laxcomma: true,
        globals: {
          jQuery: true,
          require: true,
          window: true,
          document: true
        }
      },
      files: {
        src: ['Gruntfile.js', tasks]
      }
    },
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/tests/qunit/apigee_test.html'
          ],
          coverage: {
            src: ['source/**/*.js'],
            instrumentedFiles: 'build/instrument',
            htmlReport: reportDir + '/coverage',
            coberturaReport: reportDir
          }
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 3000,
          base: './'
        }
      },
      test: {
        options: {
          port: 8000,
          base: 'build'
        }
      }
    },
    instrument: {
      files: tasks,
      options: {
        basePath: 'instrument/'
      }
    },
    reloadTasks: {
      rootPath: 'instrument/source'
    },
    storeCoverage: {
      options: {
        dir: reportDir
      }
    },
    makeReport: {
      src: reportDir + '/**/*.json',
      options: {
        type: 'lcov',
        dir: reportDir,
        print: 'detail'
      }
    },
    bower: {
      install: {
        //targetDir:'<%= meta.bin.main %>/source'
         //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    },
    uglify: {
      my_target: {
        options: {
          banner: '/*! <%= meta.package.name %>@<%= meta.package.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          sourceMap: 'dist/apigee-source-map.js',
          'usergrid.js': {
          options: {
            mangle: false,
            compress: true,
            beautify: false
          }}
        },
        files: {
          'dist/apigee.min.js': ['build/source/usergrid.js','build/source/monitoring.js','build/source/apigee.js']
        }
      }
    }
  });
  //build
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //test
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-qunit-istanbul');
  grunt.loadNpmTasks('grunt-contrib-watch');  
  //release
  grunt.loadNpmTasks('grunt-bumpup');
  // Default task(s).
  grunt.registerTask('default', ['clean', 'copy', 'bower',
    //, 'validate', 'test', 'build'
    'uglify'
    ]);
  // test
  grunt.registerTask('validate', ['jshint', 'complexity']);
  grunt.registerTask('test', [
    'instrument',
    'reloadTasks',
    'connect:test',
    'qunit',
    'storeCoverage',
    'makeReport'
  ]);
  grunt.registerTask('dev', ['connect:server', 'watch']);
  grunt.registerTask('build', ['uglify']);
  // commit
  grunt.registerTask('commit', ['bumpup:build']);
  // Alias task for release
  grunt.registerTask('release', function(type) {
    type = type ? type : 'patch'; // Set the release type
    grunt.task.run('bumpup:' + type); // Bump up the version
  });

};
