Moves = new Mongo.Collection("moves");

Scores = new Mongo.Collection("scores");

Rounds = new Mongo.Collection("rounds");

Winnings = new Mongo.Collection('Winnings');

var THRESHOLD =  1;

if (Meteor.isClient) {
  Template.body.helpers({

    move_1: function() {
      var move_one =  Moves.find({user: '1'})
      if (typeof move_one === 'undefined') {
        return [{
          "move": "loading",
        },]
      }
      return move_one
    },
    move_2: function() {

      var move_two =  Moves.find({user: '2'})
      if (typeof move_two === 'undefined') {
        return null
      }
      return move_two
    },
    user_1_score: function() {
      var user_score = Scores.findOne({_id: '1'})
      return typeof user_score === 'object' ? user_score.score : 0;
    },
    user_2_score: function() {
      var user_score = Scores.findOne({_id: '2'})
      return typeof user_score === 'object' ? user_score.score : 0;
    },
    current_round: function(){
      return Rounds.find().count()
    },
    game_over: function() {
      return gameOver();
    },
    winner: function() {
      var winning = Winnings.find({})

      if (typeof winning === 'undefined') {
       return null
     }
     return winning;
   }});

  Template.body.events({
    "click #add-event": function (event){

      Moves.insert({
        _id: '1',
        move: 'rock',
        user: '1',
        createdAt: new Date()
      })
    },
    "click #start-game": function(event){
      console.log('game restarts!')
      document.getElementById('user1').innerHTML = '';
      document.getElementById('user2').innerHTML = '';
      document.getElementById('countdown').innerHTML = '';
      Meteor.call('resetDB')

    },
    "click #start-round": function(event){
      console.log('round starts!')
      if (Rounds.find({'status': 'open'}).count() == 0){
        // initiate countdown, remove all current moves from db.
        var round = Rounds.insert({
          createdAt: new Date(),
          status: 'pending',
        })
         // start animation
         start()

          // Open round for input
          Rounds.update({_id: round}, {$set: {status: 'open'}})
        } else {
          console.log('round is already open, close first')
        };
      },
      "click #end-round": endRound
    });


Template.move_obj.events({
  "click #start-round": function function_name (events) {
    countdown()
  }
})
}

function endRound() {
  // close round, assess round results.

  user_1_move = Moves.findOne({user: '1'})
  user_2_move = Moves.findOne({user: '2'})

  // Add a point to winning player,
  var move = getRoundWinner(user_1_move, user_2_move);
  if (move) {
    var user = move.user;
    var userScore = Scores.findOne({_id: user});
    Scores.update({_id: user}, {$set: {score: userScore.score + 1}});
  }

  // Delete old moves.
  Meteor.setTimeout(function(){
    Moves.remove({_id: '1'});
    Moves.remove({_id: '2'});
  }, 3000)

  // Set round to be closed.
  var open_rounds = Rounds.find({status: 'open'}, {sort: {createdAt: -1}, limit: 1})
  round_id = open_rounds.fetch()[0]._id
  Rounds.update({_id: round_id}, {$set: {status: 'closed'}})

  console.log(Rounds.find({}, {sort: {createdAt: -1}, limit: 1}).fetch()[0]['status']);

  var isGameOver = gameOver();
  console.log(isGameOver);
  if (gameOver()) {
    console.log('here game over')
    endGame();
  }
}

function getRoundWinner(move1, move2) {
  if (move1.move == move2.move) {
    // tie
    return null;
  }
  return getWinningMove(move1.move, move2.move) == move1.move ? move1 : move2;
}

function getWinningMove(moveName1, moveName2) {
  var moveNums = {rock: 1, paper: 2, scissors: 3};
  var numMoves = {1: "rock", 2: "paper", 3: "scissors"};
  var maxMin = moveNums[moveName1] % 2 == moveNums[moveName2] % 2 ? Math.min : Math.max;
  return numMoves[maxMin(moveNums[moveName1], moveNums[moveName2])];
}
function gameOver() {
  // Tests if both players have score 3
  var user1Score = Scores.findOne({_id: '1'});
  var user2Score = Scores.findOne({_id: '2'});
  var isGameOver = user1Score.score >= THRESHOLD || user2Score.score >= THRESHOLD
  return typeof isGameOver === 'boolean' ? isGameOver : false;
}

function endGame() {
  var user1Score = Scores.findOne({_id: '1'});
  var user2Score = Scores.findOne({_id: '2'});

  var winner =  user1Score.score > user2Score.score ? user1Score.user : user2Score.user;
  Winnings.insert({
    _id: '1',
    createdAt: new Date(),
    winner: winner,
  })

  console.log(Winnings.findOne({_id: '1'}))

  Meteor.setTimeout(function(){
    console.log('game has ended')
    resetScores()
    resetRounds()
    Winnings.remove({_id: '1'})
  }, 8000)

};


function resetRounds() {
  Rounds.remove({})
}

function resetScores() {
  // Set scores to zero
  Scores.update({_id: '1'}, {$set: {score: 0}});
  Scores.update({_id: '2'}, {$set: {score: 0}});
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
        action: onPost,
      },
    }
  });

  function onPost() {
    var params;
    if (this.bodyParams.hasOwnProperty('user')) {
      params = this.bodyParams;
    } else {
      params = this.queryParams;
    }

    var currentRound = Rounds.find({}, {sort: {createdAt: -1}, limit: 1}).fetch()[0];
    
    if (typeof currentRound === 'object' && currentRound['status'] == 'open') {

      var moves_for_user = Moves.find({user: params.user}).count();

       // check if the user already sent a move for this round (a.k.a. it exists in the mongoDB)
       if (moves_for_user > 0){
        return {'status': "failure", "reason": 'you alrady played your move!'}
      }
      var a = Moves.insert({
        _id: params.user,
        user: params.user,
        move: params.move,
        createdAt: new Date()
      });

      if (Moves.findOne({_id: '1'}) && Moves.findOne({_id: '2'})) {
        endRound();
      }
      return {"status": 'success', "data": a}
    } else {
      return {'status': "failure", 'reason': 'round is not open.'}
    }
  }

  Meteor.startup(function () {
    // code to run on server at startup

    Moves.remove({});
    Scores.remove({});
    Rounds.remove({});
    Winnings.remove({});

    Scores.insert({_id:'1', user: '1', score: 0})
    Scores.insert({_id:'2', user: '2', score: 0})
    resetScores();

    return Meteor.methods({

      resetDB: function() {

        Moves.remove({});
        Scores.remove({});
        Rounds.remove({});
        Winnings.remove({});

        Scores.insert({_id:'1', user: '1', score: 0})
        Scores.insert({_id:'2', user: '2', score: 0})
        resetScores()
      }

    });
  });
}
