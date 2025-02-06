pragma solidity ^0.8.0;

contract HotelRoom {
   
   
    //variables
    address payable public owner;
    uint256 public constant roomPrice = 2 wei;
    uint256 public constant bookingDuration = 1 days;
    
    //enum
    enum Statuses{
        Available, Rented
    }

    // Struct
    struct Room {
        uint256 roomNumber;
        string title;
        Statuses status;
        uint256 rentedUntil;
    }

    // mapping
   mapping(uint256 => Room) public rooms;

    //event
   event CheckIn(address indexed _client, uint256 _value, uint256 roomNumber, uint256 rentedUntil);
   event CheckOut(uint256 roomNumber);
   event Refund(uint256 _roomNumber);

    //constructor
   constructor() {
    owner = payable(msg.sender);
    rooms[1] = Room(1,"Deluxe Room", Statuses.Available,0);
    rooms[2] = Room(2,"Standart Room",Statuses.Available,0);
    }
    
    //modifier
    modifier onlyAvailable(uint256 _roomNumber) {
        require(rooms[_roomNumber].status == Statuses.Available, "room is not available");
        _;
    }
   
   modifier costs(uint256 _amount) {
    require(msg.value== _amount,"insufficient funds");
     _;
    }
   
    //execute func
   function checkIn(uint256 _roomNumber) external payable onlyAvailable(_roomNumber) costs(roomPrice){
    rooms[_roomNumber].status = Statuses.Rented;
    rooms[_roomNumber].rentedUntil=block.timestamp + bookingDuration;

    emit CheckIn(msg.sender, msg.value, _roomNumber, rooms[_roomNumber].rentedUntil);
   }
    
    function checkOut(uint256 _roomNumber) external {
        require(block.timestamp>= rooms[_roomNumber].rentedUntil,"room is rented already");

        rooms[_roomNumber].status = Statuses.Available;
        rooms[_roomNumber].rentedUntil = 0;
        
        emit CheckOut(_roomNumber);
    }
    
   event Refund(address indexed _client, uint256 roomNumber);
    
    function refund(uint256 _roomNumber) external {
        require(rooms[_roomNumber].status == Statuses.Rented, "Room is rented already");
        rooms[_roomNumber].status = Statuses.Available;
        rooms[_roomNumber].rentedUntil = 0;
        
        emit Refund(msg.sender, _roomNumber); // use the new event 'Refund' here
    
        payable(msg.sender).transfer(roomPrice);
    }
    
    // QUERY FUNC
    function getRoomStatus(uint256 _roomNumber) external view returns(Statuses){
        return rooms[_roomNumber].status;
    }
}
