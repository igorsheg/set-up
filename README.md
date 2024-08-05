<p align="center">
  <img src="https://github.com/igorsheg/set-up/blob/main/web/public/icon-app.png?raw=true" alt="Set Up! Logo" width="200">
</p>

<p align="center">
  <strong>Set Up!</strong>
</p>

<p align="center">
  <i>An Open Source Real-Time Multiplayer Card Game</i>
</p>

## About

Set Up! is an open-source implementation of a fast-paced, real-time multiplayer card game. This project showcases the integration of a React frontend with a Rust backend, demonstrating high-performance web game development techniques.

## Development Setup

1. Set up environment variables:
   ```
   cp .env.example .env
   ```

2. Set up and build the frontend:

   ```
   cd web
   yarn install
   yarn build
   cd ..
   ```

3. Set up and run the Rust backend:

   ```
   cargo run
   ```

4. Start playing at `http://localhost:8080` (or your configured port)

## Project Structure

- `/web`: React frontend
- `/src`: Rust backend
- `/docs`: Additional documentation

## Contributing

Contributions are welcome! Whether it's bug fixes, feature additions, or documentation improvements, feel free to fork the repository and submit a pull request.

## Open Source

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as per the license terms.

## Support

For bug reports or feature requests, please open an issue on the GitHub repository.

---

Explore the code, contribute, and happy coding!
