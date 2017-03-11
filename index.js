/*!
 * Mongoose Timestamps Plugin
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * Original work Copyright(c) 2012 Brian Noguchi
 * MIT Licensed
 */

// <<<<<<< HEAD
// function timestampsPlugin(schema, options) {
//   var timeOptions = options || {};
//   if (timeOptions.updatedElement) {timeOptions.updatedElement.type = Date} else {timeOptions.updatedElement = {type: Date}}
//   if (timeOptions.createdElement) {timeOptions.createdElement.type = Date} else {timeOptions.createdElement = {type: Date}}
//   if (schema.path('_id')) {
//     schema.add({
//       updatedAt: timeOptions.updatedElement
//     });
//     schema.virtual('createdAt')
//       .get( function () {
//         if (this._createdAt) return this._createdAt;
//         return this._createdAt = this._id.getTimestamp();
//       });
//     schema.pre('save', function (next) {
//       if (this.isNew) {
//         this.updatedAt = this.createdAt;
//       } else {
//         this.updatedAt = new Date;
//       }
//       next();
//     });
//   } else {
//     schema.add({
//         createdAt: timeOptions.createdElement
//       , updatedAt: timeOptions.updatedElement
// =======
var defaults = require('defaults');

function timestampsPlugin(schema, options) {
    var updatedAt = 'updatedAt';
    var createdAt = 'createdAt';
    var updatedAtOpts = Date;
    var createdAtOpts = Date;
    var dataObj = {};

    if (typeof options === 'object') {
        if (options === null) {
            options = {createdAt: '_id'};
        }
        if (typeof options.updatedAt === 'string') {
           updatedAt = options.updatedAt;
        } else if (typeof options.updatedAt === 'object') {
            updatedAtOpts = defaults(options.updatedAt, {
                name: updatedAt,
                type: Date
            });
            updatedAt = updatedAtOpts.name;
        }

        if (typeof options.createdAt === 'string') {
            createdAt = options.createdAt;
        } else if (typeof options.createdAt === 'object') {
            createdAtOpts = defaults(options.createdAt, {
                name: createdAt,
                type: Date
            });
            createdAt = createdAtOpts.name;
        }
    }

    if (!schema.path(updatedAt) && updatedAt) {
        dataObj[updatedAt] = updatedAtOpts;
    }
    if (schema.path(createdAt)) {
        if (!schema.path(updatedAt) && updatedAt) {
            schema.add(dataObj);
        }
        if (createdAt === '_id') {
            schema.virtual('createdAt')
            .get( function () {
                if (this._createdAt) return this._createdAt;
                return this._createdAt = this._id.getTimestamp();
            });
        } else if (schema.virtual(createdAt).get) {
          schema.virtual(createdAt)
              .get( function () {
                  if (this["_" + createdAt]) return this["_" + createdAt];
                  return this["_" + createdAt] = this._id.getTimestamp();
              });
        }
        schema.pre('save', function(next) {
            if (this.isNew) {
                var newDate = new Date;
                if (createdAt && createdAt !== '_id') this[createdAt] = newDate;
                if (updatedAt) this[updatedAt] = newDate;
            } else if (this.isModified() && updatedAt) {
                this[updatedAt] = new Date;
            }
            next();
        });

    } else {
        if (createdAt) {
            dataObj[createdAt] = createdAtOpts;
        }
        if (dataObj[createdAt] || dataObj[updatedAt]) {
            schema.add(dataObj);
        }
        schema.pre('save', function(next) {
            if (!this[createdAt]) {
                var newDate = new Date;
                if (createdAt) this[createdAt] = newDate;
                if (updatedAt) this[updatedAt] = newDate;
            } else if (this.isModified() && updatedAt) {
                this[updatedAt] = new Date;
            }
            next();
        });
    }

    schema.pre('findOneAndUpdate', function(next) {
    if (this.op === 'findOneAndUpdate') {
        var newDate = new Date;
        this._update = this._update || {};
        if (createdAt && createdAt !== '_id') {
            if (this._update[createdAt]) {
              delete this._update[createdAt];
            }

            this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
            this._update['$setOnInsert'][createdAt] = newDate;
        }
        if (updatedAt) {
            this._update[updatedAt] = newDate;
        }
    }
    next();
    });

    schema.pre('update', function(next) {
    if (this.op === 'update') {
        var newDate = new Date;
        this._update = this._update || {};
        if (createdAt && createdAt !== '_id') {
            if (this._update[createdAt]) {
              delete this._update[createdAt];
            }

            this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
            this._update['$setOnInsert'][createdAt] = newDate;
        }
        if (updatedAt) {
            this._update[updatedAt] = newDate;
        }
    }
    next();
    });

    if(!schema.methods.hasOwnProperty('touch') && updatedAt)
    schema.methods.touch = function(callback){
        this[updatedAt] = new Date;
        this.save(callback);
    }

}

module.exports = timestampsPlugin;
