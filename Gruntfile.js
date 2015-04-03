var grunt = require('grunt');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        cssmin: {
            production: {
                files: {
                    'dist/css/mr-image.min.css': ['src/css/mr-image.css'],
                    'misc/demo/css/mr-image.min.css': ['src/css/mr-image.css']
                }
            }
        },

        uglify: {
            production: {
                files: {
                    'dist/js/mr-image.min.js': [
                        'src/js/mr-image.js',
                        'src/js/mr-image-drawer.js',
                        'src/js/mr-image-selector.js'
                    ],
                    'misc/demo/js/mr-image.min.js': [
                        'src/js/mr-image.js',
                        'src/js/mr-image-drawer.js',
                        'src/js/mr-image-selector.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.loadNpmTasks('grunt-contrib-uglify') ;

    grunt.registerTask('default', ['cssmin', 'uglify']);
};

