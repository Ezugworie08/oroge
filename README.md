# Oroge

Welcome to the Oroge! This repository contains an Express API built using Node.js. The API provides endpoints to retrieve log files and read the last N lines of a log file using Node streaming API. It also includes utility functions for directory traversal and log file reading.

## Features

- List log files in a directory.
- Read the last N lines of a specific log file.
- Utility functions for directory traversal and log file reading with back pressure handling.
- Error handling and graceful shutdown.
- TODO: Comprehensive logging using Winston.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:

   ```bash
   git https://github.com/Ezugworie08/oroge.git
   cd oroge
   ```
2. Install the dependencies

   ```bash
   npm install
   ``` 

### Running the API

To start the API server, run the following command

```bash
npm start
```

The API will be available at `http://localhost:3000`. 

## API Endpoints

- `GET /logFiles`: Get a list of log files in the respective logs directory (`/var/logs` for unix or `C:\\logs` for windows and `./test/data` as backup). 
      This endpoint will return a list of objects containing relative paths to the log files and their corresponding URL encoded counterparts. 
      PLEASE provide the URL encoded paths to the next API endpoint below.
- `GET /logFile`: Get the last N lines of a log file. 
    - Query parameters:
        - `filepath`: The path to the log file (URL encoded).
        - `limit`(optional): The number of lines to return. Defaults to ten (10).
        - `q`(optional): Search query to filter lines. Defaults to an empty string. 
- `GET /health`: Get health statistics of API server.
   
## Testing

The project includes tests for both the API and the utility functions. 

To run the tests: 
```bash
npm test
```

## Contributing

Contributions are welcome! If you find a bug or want to add a new feature, please open an issue or submit a pull request. 


## License

This project is licensed under the MIT license

