// ########
/**
 * @deprecated only used by rpg classes
 * @returns {Callback}
 */
function Callback(a, b, c) {
  a["function"] ? (this.that = a.that, this["function"] = a["function"], this.parameters = [a.parameter]) : (this["function"] = b, this.that = a, this.parameters = [c]);
  this.OneParameter = !0;
  if (3 < arguments.length) {
    this.OneParameter = !1;
    for (var d = 3; d < arguments.length; d++) {
      this.parameters.push(arguments[d]);
    }
  }
}
Callback.prototype.Call = function() {
  this.OneParameter ? this["function"].call(this.that, this.parameters[0]) : this["function"].apply(this.that, this.parameters);
};
// ++++++++

// ########################################################
/**
 * @deprecated description
 * @returns {Queue}
 */
function Queue() {
  this.vals = [];
}
Queue.prototype.Enqueue = function(a) {
  return this.vals.push(a);
};
Queue.prototype.Dequeue = function() {
  return this.vals.shift();
};
Queue.prototype.isEmpty = function() {
  return 0 >= this.vals.length ? !0 : !1;
};
// ########################################################