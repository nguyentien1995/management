function getErr(onErr){
    var errLog = $('#errLog');
    var html = "";
    html += "<p>Reason: " + onErr.reason + "</p>";
    var errType = onErr.errType;
    if(errType == 3) {
        // conflict data
        html += "<p>" + onErr.message + "</p>";
    } else if(errType == 2) {
        // database error
        html += "<p>" + onErr.message + "</p>";
    } else if(errType == 1) {
        // data not meet requirement
        $.each(onErr.message, function(index, value){
            html += index + 1 + ". " + value.msg + "<br>";
        })
    }
    errLog.html(html);
}