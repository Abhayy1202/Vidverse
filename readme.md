# VidVerse

VidVerse is a powerful backend system developed in Node.js, designed to facilitate a YouTube-like video streaming experience. It provides essential functionalities such as watch history tracking, video likes, comments, and video ownership management. Built with scalability and efficiency in mind, VidVerse uses MongoDB as its database for seamless data handling.

## DB Diagram
- https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj

## Features

- **Watch History**: Users can keep track of the videos they have watched.
- **Likes and Comments**: Engage with videos by liking them and leaving comments.
- **Video Ownership Management**: Creators can manage and maintain ownership of their uploaded videos.
- **Scalable and Efficient**: Built with Node.js and MongoDB for robust performance and scalability.

## Technologies Used

- **Node.js**: Backend server environment.
- **MongoDB**: NoSQL database for efficient data storage.
- **Express.js**: Web framework for Node.js.
- **Mongoose**: Elegant MongoDB object modeling for Node.js.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhayy1202/vidverse.git
2.Install dependencies:
    ```bash
    cd vidverse
    npm install
    
3.Set up environment variables:
  -Create a .env file in the root directory.
  -Add the following variables:
  ```bash
  PORT=3000
 CORS_ORIGIN=*

ACCESS_TOKEN_SECRET= (eg:'1655c0fc65a4a3bd64a8a36b6a863254891dd965fa1480')
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET= (eg:'cb600cec481f98b6750639f4243bba03e5fc9d44e46b5776')
REFRESH_TOKEN_EXPIRY=10d

CLOUD_NAME= <yourcloudname>
API_KEY= 
API_SECRET= 

MONGODB_URI=mongodb+srv://<your MongoDb URI>
```


