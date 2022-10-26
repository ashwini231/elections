var loginconst;

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;

    var voterid=$('#voterid').val();
    $("#loader").hide();
    $("#content").hide();
    $("#content1").show();
    $("#content2").show();
    $("#contentResult").show();
    $("#votepage").show();
    $("#voterregistration").hide();
    $("#text").hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
   
      return electionInstance.constituencyCount();
    }).then(function(constituencyCount) {
      var constituencyList = $("#constituencyList");
      constituencyList.empty();

      var constituencySelect = $('#constituencySelect');
      constituencySelect.empty();

      var loginconstituencySelect = $('#loginconstituencySelect');
      loginconstituencySelect.empty();

      for (var i = 1; i <= constituencyCount; i++) {
        electionInstance.constituencies(i).then(function(constituencies) {
          var cid = constituencies[0];
          var cname = constituencies[1];

          // Render constituencies list
          var constituenciesTemplate = "<tr><th>" + cid + "</th><td>" + cname + "</td></tr>"
          constituencyList.append(constituenciesTemplate);

          // Render constituencies ballot option
          var constituenciesOption = "<option value='" + cid + "' >" + cid +" - "+cname + "</ option>"
          constituencySelect.append(constituenciesOption);

          loginconstituencySelect.append(constituenciesOption);
        });
      }

      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesAll = $("#candidatesAll");
      candidatesAll.empty();

      var Results = $("#Results");
      Results.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {       
      
          var id = candidate[0];
          var name = candidate[1];
          var partyname = candidate[2];
          var consti = candidate[3];
          var voteCount=candidate[4];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + partyname + "</td><td>" + consti +"</td></tr>"

          if(consti=='101'){
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);  
          }

          candidatesAll.append(candidateTemplate);
          var candidateTemplate1 = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + partyname + "</td><td>"+voteCount+"</td></tr>"
          Results.append(candidateTemplate1);

          
        });
      }

      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
    
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#table").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  addCandidate: function() {
    var cname=$('#cname').val();
    var partyname=$('#partyname').val();
    var constituency=$('#constituencySelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addCandidate(cname, partyname,constituency,{ from: App.account });
    }).then(function(result) {
      $("#content1").show();
      location.replace("addCandidates.html")
    }).catch(function(err) {
      console.error(err);
    });
  },

  addConstituency: function() {
    var cid=$('#cid').val();
    var constname=$('#constituencyname').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.addConstituency(cid,constname,{ from: App.account });
    }).then(function(result) {
      location.replace("addConstituency.html")
    }).catch(function(err) {
      console.error(err);
    });
  },

  verifyVoter: function(){
    var voterid=$('#voterid').val();
    var vname=$('#vname').val();
    var dob=$('#dob').val();
    var aadharid=$('#aadharid').val();
    var vconstituency=$('#constituencySelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.verifyVoter(voterid,vname,dob,aadharid,vconstituency,{ from: App.account });
    }).then(function(result) {
      $("#voterverification").hide();
      $("#voterregistration").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  registerVoter: function() {
    var voterid=$('#voterid').val();
    var phone=$('#phone').val();
    var password=$('#password').val();
    var email=$('#email').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.registerVoter(voterid,phone, password,email,{ from: App.account });
    }).then(function(result) {
      $("#voterregistration").hide();
      $('#text').show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  voterLogin: function() {
    var loginvoterid=$('#loginvoterid').val();
    var loginpassword=$('#loginpassword').val();
    var loginconstituency=$('#loginconstituencySelect').val();
    loginconst=loginconstituency;
    
    App.contracts.Election.deployed().then(function(instance) {
      return instance.voterLogin(loginvoterid, loginpassword,loginconstituency,{ from: App.account });
    }).then(function(result) {
      $("#voterLoginForm").hide();
      App.ConstList();
    }).catch(function(err) {
      console.error(err);
    });
  },

  ConstList: function() {
    App.contracts.Election.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {       
      
          var id = candidate[0];
          var name = candidate[1];
          var partyname = candidate[2];
          var constituency = candidate[3];
          // Render candidate Result  

          if(loginconst==constituency){
            var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + partyname + "</td><td>" + consti +"</td></tr>"
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption = "<option value='" + id + "' >" + name + "</ option>"
            candidatesSelect.append(candidateOption);  
          } 
        });
      }
    });
  }

};



$(function() {
  $(window).load(function() {
    App.init();
  });
});
