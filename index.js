const express = require('express');
const app = express();
app.use(express.json());

// Local variables to store data
let rooms = [];
let bookings = [];

// Create a Room
app.post('/rooms', (req, res) => {
  const { seats, amenities, price } = req.body;
  const roomId = rooms.length + 1;
  const room = {
    id: roomId,
    seats: seats,
    amenities: amenities,
    price: price
  };
  rooms.push(room);
  res.json(room);
});

// Book a Room
app.post('/bookings', (req, res) => {
  const { customerName, startTime, endTime, roomId } = req.body;

  // Check if the room is available for booking
  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }
  const isAlreadyBooked = bookings.some(b =>
    b.roomId === roomId &&
    b.date === req.body.date &&
    ((startTime >= b.startTime && startTime < b.endTime) || 
    (endTime > b.startTime && endTime <= b.endTime))
  );
  if (isAlreadyBooked) {
    return res.status(400).json({ message: 'Room is already booked for the specified time' });
  }

  const bookingId = bookings.length + 1;
  const booking = {
    id: bookingId,
    customerName: customerName,
    startTime: startTime,
    endTime: endTime,
    roomId: roomId,
    date: req.body.date,
    status: 'Booked'
  };
  bookings.push(booking);
  res.json(booking);
});

// List all Rooms with Booked Data
app.get('/rooms/bookings', (req, res) => {
  const roomBookings = bookings.map(booking => {
    const room = rooms.find(r => r.id === booking.roomId);
    return {
      roomName: room ? room.name : 'Unknown',
      bookedStatus: booking.status,
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  });
  res.json(roomBookings);
});

// List all Customers with Booked Data
app.get('/customers/bookings', (req, res) => {
  const customerBookings = bookings.map(booking => {
    const room = rooms.find(r => r.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: room ? room.name : 'Unknown',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  });
  res.json(customerBookings);
});

// List the number of times a customer has booked a room
app.get('/customers/:customerName/bookings', (req, res) => {
  const customerName = req.params.customerName;
  const customerBookings = bookings.filter(booking => booking.customerName === customerName);
  res.json(customerBookings);
});

// Start the server
const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
