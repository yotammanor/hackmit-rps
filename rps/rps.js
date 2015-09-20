Moves = new Mongo.Collection("moves");

Scores = new Mongo.Collection("scores");

Rounds = new Mongo.Collection("rounds");


if (Meteor.isClient) {
  Template.body.helpers({
    // moves: [
    // {'user': 1},
    // {'user': 2},
    // ]
    moves_1: function() {
      return Moves.find({user: '1'}, {sort: {createdAt: -1}, limit: 1})
    },
    moves_2: function() {
      return Moves.find({user: '2'}, {sort: {createdAt: -1}, limit: 1});
    },
    user_1_score: function() {
      return Scores.findOne({_id: '1'}).score;
    },
    current_round: function(){
        return Rounds.find().count()
    },
    user_2_score: function() {
      return Scores.findOne({_id: '2'}).score;
    }
  });

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
      console.log('game starts!')
      resetScores()
    },
    "click #start-round": function(event){
      console.log('round starts!')
      // initiate countdown, remove all current moves from db.
      var round = Rounds.insert({
        createdAt: new Date(),
        status: 'pending',
      })



      // start animation
      start()

      // Open round for input
      Rounds.update({_id: round}, {$set: {status: 'open'}})
      console.log(Rounds.find({}, {sort: {createdAt: -1}, limit: 1}).fetch()[0]['status'])
    },
    "click #end-round": endRound
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
  Moves.remove({_id: '1'});
  Moves.remove({_id: '2'});

  // Set round to be closed.
  var open_rounds = Rounds.find({status: 'open'}, {sort: {createdAt: -1}, limit: 1})
  round_id = open_rounds.fetch()[0]._id
  Rounds.update({_id: round_id}, {$set: {status: 'closed'}})

  console.log(Rounds.find({}, {sort: {createdAt: -1}, limit: 1}).fetch()[0]['status']);

  if (gameOver()) {
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
  var maxMin = moveNums[moveName1] % 2 == moveNums[moveName2] % 2 ? min : max;
  return numMoves(maxMin(moveNums[moveName1], moveNums[moveName2]));
}
function gameOver() {
  // Tests if both players have score 3
  var user1Score = Scores.findOne({_id: '1'});
  var user2Score = Scores.findOne({_id: '2'});
  return (user1Score.score == 3 && user2Score.score == 3);
}

function endGame() {
  resetScores()
  Rounds.remove({})
};

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
    console.log(typeof currentRound);
    
    if (typeof currentRound === 'object' && currentRound['status'] == 'open') {


// check if the user already sent a move for this round (a.k.a. it exists in the mongoDB)
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

    Scores.insert({_id:'1', user: '1', score: 0})
    Scores.insert({_id:'2', user: '2', score: 0})
    resetScores()
  });
}
