module.exports = get_date;

function get_date(){
  var today = new Date();
  var options = {
    weekday : "long",
    day : "numeric",
    month : "long"
  };
  return today.toLocaleDateString("en-US",options);
}
