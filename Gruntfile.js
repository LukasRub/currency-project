/**
 * Created by lukas on 14.10.9.
 */
module.exports = function(grunt) {

    // A very basic default task.
    grunt.registerTask('default', 'Log some stuff.', function() {
        grunt.log.write('Logging some stuff...').ok();
    });

};