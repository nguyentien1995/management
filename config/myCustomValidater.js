app.use(expressValidator({
 customValidators: {
    checkPersonName: function(name, isPerson) {
        return isPerson === true ? name != '' : true;
    },
    checkOrganisationName: function(name, isPerson) {
        return isPerson === false ? name != '' : true;
    }
 }
}));
moduel.exports =