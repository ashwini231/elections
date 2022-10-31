// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Election {
    // Model a Candidate
    struct Candidate {
        uint id;
        string name;
        string partyname;
        string constituency;
        uint voteCount;
    }

    struct Constituency{
        uint id;
        string constituency;
    }
    struct VoterList{
        string voterID;
        string name;
        string dob;
        string aadhar;
        string constituency;
        string phone;
        string password;
        string email;
        bool verified;
        bool registered;
        uint voted;
        string voteDate;
    }
    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store Candidates
    // Fetch Candidate
    mapping(uint => Candidate) public candidates;
    mapping(uint => Constituency) public constituencies;
    mapping(string => VoterList) public voterlist;
    // Store Candidates Count
    uint public constituencyCount;
    uint public candidatesCount;
    uint public voterListCount;

    string public startdate;
    string public enddate;
  

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );

    constructor () {
        addVoterList("YCV0164822", "Ashwini M S", "23/04/2001", "390051307206", "101");
        addVoterList("YBT0674825", "Thrishya R", "26/07/1999", "870051407316", "101");
        addVoterList("GRY0878526", "Monika R", "13/11/2002", "407316870051", "102");
    }
    
    function addCandidate (string memory _name, string memory _partyname, string memory _constituency) public {
        
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name,_partyname, _constituency,0);
    }
     function addConstituency (uint _id, string memory _constituency) public {
        constituencyCount ++;
        constituencies[constituencyCount] = Constituency(_id,_constituency);
    }
    function addVoterList (string memory _voterID, string memory _name, string memory _dob,string memory _aadhar,string memory _constituency) public {
        voterListCount ++;
        voterlist[_voterID] = VoterList(_voterID,_name,_dob,_aadhar,_constituency,"","","",false,false,0,"");
    }
    function verifyVoter(string memory _voterID1, string memory _name1, string memory _dob1,string memory _aadhar1) public{
        require(keccak256(abi.encodePacked(voterlist[_voterID1].voterID))==keccak256(abi.encodePacked(_voterID1)));
        require(keccak256(abi.encodePacked(voterlist[_voterID1].name))==keccak256(abi.encodePacked(_name1)));
        require(keccak256(abi.encodePacked(voterlist[_voterID1].dob))==keccak256(abi.encodePacked(_dob1)));
        require(keccak256(abi.encodePacked(voterlist[_voterID1].aadhar))==keccak256(abi.encodePacked(_aadhar1)));
        require(voterlist[_voterID1].verified==false);
        voterlist[_voterID1].verified=true;
    }

    function registerVoter(string memory _voterid, string memory _phone, string memory _password,string memory _email) public {
        require(keccak256(abi.encodePacked(""))!=keccak256(abi.encodePacked(_voterid)));
        require(keccak256(abi.encodePacked(""))!=keccak256(abi.encodePacked(_password)));
        require(keccak256(abi.encodePacked(""))!=keccak256(abi.encodePacked(_email)));
        require(keccak256(abi.encodePacked(""))!=keccak256(abi.encodePacked(_phone)));
        require(voterlist[_voterid].registered==false);
        voterlist[_voterid].email=_email;
        voterlist[_voterid].phone=_phone;
        voterlist[_voterid].password=_password;
        voterlist[_voterid].registered=true;
    }

    function voterLogin(string memory _voterID, string memory _password) public{
        require(keccak256(abi.encodePacked(voterlist[_voterID].voterID))==keccak256(abi.encodePacked(_voterID)));
        require(keccak256(abi.encodePacked(voterlist[_voterID].password))==keccak256(abi.encodePacked(_password)));  
        require(voterlist[_voterID].verified==true);
        require(voterlist[_voterID].registered==true);
    }

    function setDate(string memory _startDate, string memory _endDate) public{
        startdate=_startDate;
        enddate=_endDate;
    }
    function vote (uint _candidateId,string memory _voterid,string memory _date) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        require(voterlist[_voterid].voted==0);
        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;
        voterlist[_voterid].voted=1;
        voterlist[_voterid].voteDate=_date;
        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
