Moves = new Mongo.Collection("moves");


if (Meteor.isClient) {


  Template.body.helpers({
    // moves: [
    // {'user': 1},
    // {'user': 2},
    // ]
    moves_1: function() {
      var moves_1 = Moves.find({user: '1'}, {sort: {createdAt: -1}, limit: 1});
      return [moves_1.fetch()[0]];
    },
    moves_2: function() {
      return Moves.find({user: '2'}, {sort: {createdAt: -1}, limit: 1});
    }

  });

  Template.body.events({
    "click #add-event": function (event){

      Moves.insert({
        move: 'rock',
        user: '1',
        createdAt: new Date()
      })
    }
  })
}

if (Meteor.isServer) {

  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  // Generates: GET, POST on /api/items and GET, PUT, DELETE on
  // /api/moves/:id for the Moves collection
  Api.addCollection(Moves);

  // Generates: POST on /api/users and GET, DELETE /api/users/:id for
  // Meteor.users collection
  Api.addCollection(Meteor.users, {
    excludedEndpoints: ['getAll', 'put'],
    routeOptions: {
      authRequired: false
    },
    endpoints: {
      post: {
        authRequired: false
      },
      delete: {
        roleRequired: 'admin'
      }
    }
  });

  // // Maps to: /api/moves/:id
  // Api.addRoute('moves/:id', {authRequired: false}, {
  //   get: function () {
  //     return Moves.findOne(this.urlParams.id);
  //   },
  //   delete: {
  //     roleRequired: ['author', 'admin'],
  //     action: function () {
  //       if (Moves.remove(this.urlParams.id)) {
  //         return {status: 'success', data: {message: 'Article removed'}};
  //       }
  //       return {
  //         statusCode: 404,
  //         body: {status: 'fail', message: 'Article not found'}
  //       };
  //     }
  //   }
  // });


  Meteor.startup(function () {
    // code to run on server at startup
  });
}
