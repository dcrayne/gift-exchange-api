var restify = require('restify');
var config  = require(process.cwd() + '/config');
var controllers = require(config.controllersPath);
var nodemailerSettings = require(config.nodemailerSettings);
var lib = require(config.libDirectory);

// see https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
// for a description of REST protocols

// TODO: break this into modules for each element of CRUD handling

module.exports = function(server) {
  require('./preHandlers.js')(server, restify);
  require('./postHandlers.js')(server, restify);


  // *** Create ***

  server.post('/users', function(req, res, next) {
    controllers.user.create( req.params.firstName
                           , req.params.lastName
                           , req.params.email
                           , req.params.password
                           )
      .done(function(result) {
        res.send(201, '/users/' + result.lastID);

      }, function(err) {
        if (err.errno === 19) // conflict
          res.send(409, 'user already exists');

        else
          res.send(404, 'cannot create user');

      });

    return next();
  });

  server.post('/events', function(req, res, next) {
    controllers.event.create( req.params.name
                           , req.params.description
                           , req.params.adminId
                           , req.params.maxGiftPrice
                           , req.params.street
                           , req.params.city
                           , req.params.state
                           , req.params.zipcode
                           , req.params.dateOccurs
                           , req.params.dateCreated
                           )
      .done(function(result) {
        res.send(201, '/events/' + result.lastID);

      }, function(err) {
        if (err.errno === 19) // conflict
          res.send(409, 'event already exists');

        else 
          res.send(404, 'cannot create event');

      });

    return next();
  });

  // add a user to event
  server.post('/events/:eventId/users/:userId', function(req, res, next) {
    controllers.event.addUser(req.params.eventId, req.params.userId) 
      .done(function(result) {
        res.send(200, 'successfully added user to event');

      }, function(err) {
        console.log('eid' + req.params.eventId + ' uid: ' + req.params.userId);
        console.log(err);

        res.send(404, 'cannot add user to event');

      });

    return next();
  });


  // *** Retrieve ***

  server.get('/users', function(req, res, next) {
    controllers.user.retrieveAll()
      .done(function(results) {
        res.send(200, results);

      }, function(err) {
        res.send(404, 'could not retrieve users');

      });

    return next();
  });

  server.get('/users/:id', function(req, res, next) {
    controllers.user.retrieveById(req.params.id)
      .done(function(result) {
        res.send(200, result);
      
      }, function(err) {
        res.send(404, 'could not retrieve user ' + req.params.id);

      });

    return next();
  });

  server.get('/events', function(req, res, next) {
    controllers.event.retrieveAll()
      .done(function(results) {
        res.send(200, results);

        }, function(err) {
          res.send(404, 'could not retrieve events');

        });

    return next();
  });

  server.get('/events/:id', function(req, res, next) {
    controllers.event.retrieveById(req.params.id)
      .done(function(result) {
        res.send(200, result);

        }, function(err) {
          res.send(404, 'could not retrieve event');

        });

    return next();
  });

  server.get('/events/:id/users', function(req, res, next) {
    controllers.event.retrieveEventUsers(req.params.id)
      .done(function(results) {
        res.send(200, results);

        }, function(err) {
          res.send(404, 'could not retrieve event users');

        });

    return next();
  });


  // *** Update / Replace ***

  // NOTE: if user password is null, then password update is omitted

  server.put('/users/:id', function(req, res, next) {
    controllers.user.updateAll( 
                             req.params.id
                           , req.params.firstName
                           , req.params.lastName
                           , req.params.email
                           , req.params.password
                           )
      .done(function(result) {
        res.send(204); // success - no content

      }, function(err) {
        res.send(404, 'cannot update event');

      });

    return next();
  });


  // The following is needed to process preflight requests; see:
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
  server.opts(/.*/, function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 
              req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", 
              req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
  });

  server.put('/events/:id', function(req, res, next) {
    controllers.event.updateAll( 
                             req.params.id
                           , req.params.name
                           , req.params.description
                           , req.params.adminId
                           , req.params.maxGiftPrice
                           , req.params.street
                           , req.params.city
                           , req.params.state
                           , req.params.zipcode
                           , req.params.dateOccurs
                           , req.params.dateCreated
                           )
      .done(function(result) {
        res.send(204, 'success');

      }, function(err) {
        res.send(404, 'cannot update event');

      });

    return next();
  });


  server.put('/events/:id', function(req, res, next) {
    console.log('test');
    console.log(req.params.name);
    controllers.event.updateAll( 
                             req.params.id
                           , req.params.name
                           , req.params.description
                           , req.params.adminId
                           , req.params.maxGiftPrice
                           , req.params.street
                           , req.params.city
                           , req.params.state
                           , req.params.zipcode
                           , req.params.dateOccurs
                           , req.params.dateCreated
                           )
      .done(function(result) {
        res.send(204); // success - no content

      }, function(err) {
        res.send(404, 'cannot update event');

      });

    return next();
  });


  // *** Update / Modify ***
  server.patch('/users/:id', function(req, res, next) {
    // TODO: implement these using update* methods in user controller.
    //       Maybe loop through each property in req.params, and use 
    //       a new method in the user controller which updates based on 
    //       property names rather than db field names.
  });

  server.patch('/events/:id', function(req, res, next) {
    // TODO: implement these using update* methods in event controller.
  });


  // *** Delete ***

  server.del('/users/:id', function(req, res, next) {
    controllers.user.deleteById(req.params.id)
      .done(function(result) {
        res.send(204); // success - no content

      }, function(err) {
        res.send(404, 'cannot delete user');

      });

    return next();
  });

  server.del('/events/:id', function(req, res, next) {
    controllers.event.deleteById(req.params.id)
      .done(function(result) {
        res.send(204); // success - no content

      }, function(err) {
        res.send(404, 'cannot delete event');

      });

    return next();
  });


  // *** Actions ***

  server.post('/events/:id/randomize', function(req, res, next) {

    let shuffle = require('knuth-shuffle').knuthShuffle;
    let userArray = [];

    controllers.event.retrieveEventUsers(req.params.id)
      .then(function(result) {
        return lib.randomPairGenerator.generateWithoutExclusions(result);
      })

      .then(function(result) {
//        console.log(result);
        res.send(200, result);
        return controllers.event.setGiverReceiverPairs(req.params.id, result);
      })
      
      .then(function(result) {
        return controllers.event.updateRandomizedFlag(req.params.id, true);
      })

      .then(function(result) {
        res.send(200, 'successfully randomized');
      })

      .catch(function(err) {
        res.send(404, 'could not retrieve event users');
      });

    return next();
  });

  server.post('/events/:id/sendmsgs', function(req, res, next) {
    // TODO: notify client if a message was not delivered

    controllers.event.hasBeenRandomized(req.params.id)
      .then(function(result) {
        // expects result to be of form [{'randomized'} : <0 or 1>]
        // convert result to a boolean
        return isRandomized = !!+result[0]['randomized'];
      })

      .then(function(result) {
        if (result === false)
          res.send(404, 'event users have not been randomized');

        return controllers.event.retrieveRandomizedPairs(req.params.id);
      })

      .then(function(result) {
//        console.log(result);
        lib.resultMailer.sendMessages(result); 
//        sendMessages(result);
        res.send(200, result);
      })

      .catch(function(err) {
        console.log(err);
        res.send(404, 'could not send messages');
      });

    return next();
  });
  
  // send a single user their recipient
  server.post('/events/:eventId/sendmsgs/:giverId', function(req, res, next) {
    controllers.event.hasBeenRandomized(req.params.eventId)
      .then(function(result) {
        // expects result to be of form [{'randomized'} : <0 or 1>]
        // convert result to a boolean
        return isRandomized = !!+result[0]['randomized'];
      })

      .then(function(result) {
        if (result === false)
          res.send(404, 'event users have not been randomized');

        return controllers.event.retrieveRandomizedPair(
                                  req.params.eventId, req.params.giverId);
      })

      .then(function(result) {
        console.log(result);
        console.log('before sendMessages');
        sendMessages(result);
        res.send(200, result);
      })

      .catch(function(err) {
        console.log(err);
        res.send(404, 'could not send message');
      });

    return next();
  });

}
