Moves = new Mongo.Collection("moves");

Scores = new Mongo.Collection("scores")

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
    },
    user_1_score: function() {
      return Scores.findOne({user: '1'}).score;
    }

  });

  Template.body.events({
    "click #add-event": function (event){

      Moves.insert({
        move: 'rock',
        user: '1',
        createdAt: new Date()
      })
    },
    "click #start-game": function(event){
      console.log('game starts!')
      resetScores()
    },
    "click #start-round": function(event){
      console.log('round starts!')
      var user = Moves.findOne({user: '1'})
      Moves.update({user: user.user}, {$set: {score: user.score + 1}})
    },

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
  Api.addCollection(Moves, {
    routeOptions: {
      authRequired: false
    },
    endpoints: {
      post: {
        authRequired: false,
        action: function () {

          var params 
          if (this.bodyParams.hasOwnProperty('user')) {
            params = this.bodyParams;
          } else {
            params = this.queryParams;
          }

          var a = Moves.insert({
            user: params.user,
            move: params.move,
            createdAt: new Date()
          })
          return {"status": 'success', "data": a}
        }
      },
    }
  });


  // // Maps to: /api/moves/:id
  // Api.addRoute('moves/:id', {authRequired: false}, {
  //   // get: function () {
  //   //   return Moves.findOne(this.urlParams.id);
  //   // },
  //   // delete: {
  //   //   roleRequired: ['author', 'admin'],
  //   //   action: function () {
  //   //     if (Moves.remove(this.urlParams.id)) {
  //   //       return {status: 'success', data: {message: 'Article removed'}};
  //   //     }
  //   //     return {
  //   //       statusCode: 404,
  //   //       body: {status: 'fail', message: 'Article not found'}
  //   //     };
  //   //   }
  //   // },
  //   get: function () {
  //     return Moves.find({}, {sort: {createdAt: -1}})
  //   },
  //   post: {
  //     action: function() {
  //       Moves.insert({
  //         move: this.urlParams.move,
  //         user: this.urlParams.user,
  //         createdAt: new Date()
  //       })
  //       return {status: 'success', data: Moves.find({user: this.urlParams.user}, {sort: {createdAt: -1}, limit:1})};
  //     }
  //   }
  // });

function resetScores() {
  Scores.remove({});

  Scores.insert({
    id: '1',
    user: '1',
    score: '0'
  })

  Scores.insert({
    id: '1',
    user: '1',
    score: '0'
  })
}

Meteor.startup(function () {
    // code to run on server at startup
    resetScores()
  });
}

